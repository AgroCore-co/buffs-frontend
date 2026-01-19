import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiTrash2, FiEdit3 } from 'react-icons/fi';

/**
 * Componente de mapa para desenhar polígonos de piquetes
 * @param {Object} initialPolygon - GeoJSON Polygon inicial (para edição)
 * @param {function} onPolygonChange - Callback (polygon, areaM2) quando polígono muda
 * @param {string} grupoColor - Cor do polígono baseada no grupo
 * @param {Array} existingLotes - Lotes existentes para exibir como referência
 * @param {string} currentLoteId - ID do lote atual (para não exibir ele mesmo como existente)
 */
export default function MapaDesenhoLeaflet({
  initialPolygon = null,
  onPolygonChange,
  grupoColor = '#ce7d0a',
  existingLotes = [],
  currentLoteId = null,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawnLayerRef = useRef(null);
  const existingLayerRef = useRef(null); // Camada para piquetes existentes
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const polygonRef = useRef(null);
  const isLockedRef = useRef(false); // Ref para evitar stale closure

  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [points, setPoints] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Centro padrão
  const defaultCenter = [-24.7046, -47.9876];

  // Sincroniza ref com estado
  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

  // 1. Carregar Leaflet via CDN dinamicamente
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => setLeafletLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Calcula área do polígono em m²
  const calculateArea = useCallback((coords) => {
    if (!coords || coords.length < 3) return 0;

    const toRadians = (deg) => (deg * Math.PI) / 180;
    const earthRadius = 6371000;

    let area = 0;
    const n = coords.length;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const lat1 = toRadians(coords[i][0]);
      const lat2 = toRadians(coords[j][0]);
      const lng1 = toRadians(coords[i][1]);
      const lng2 = toRadians(coords[j][1]);

      area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }

    area = Math.abs((area * earthRadius * earthRadius) / 2);
    return Math.round(area);
  }, []);

  // Converte pontos Leaflet para GeoJSON
  const toGeoJSON = useCallback((pts) => {
    if (pts.length < 3) return null;

    const coordinates = pts.map((p) => [p.lng, p.lat]);
    coordinates.push([pts[0].lng, pts[0].lat]);

    return {
      type: 'Polygon',
      coordinates: [coordinates],
    };
  }, []);

  // Atualiza callback do pai
  const updateParent = useCallback(
    (pts, complete) => {
      if (complete && pts.length >= 3) {
        const geoJSON = toGeoJSON(pts);
        const latLngs = pts.map((p) => [p.lat, p.lng]);
        const area = calculateArea(latLngs);
        onPolygonChange?.(geoJSON, area);
      } else {
        onPolygonChange?.(null, 0);
      }
    },
    [toGeoJSON, calculateArea, onPolygonChange]
  );

  // 2. Inicializar Mapa
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || mapInstanceRef.current)
      return;

    const L = window.L;
    const map = L.map(mapContainerRef.current, {
      doubleClickZoom: false,
    });
    mapInstanceRef.current = map;

    // Camada de Satélite
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19,
      }
    ).addTo(map);

    // Camada de Labels
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
      {
        subdomains: 'abcd',
        maxZoom: 19,
        opacity: 0.8,
      }
    ).addTo(map);

    // Layer group para desenho
    drawnLayerRef.current = L.layerGroup().addTo(map);

    // Layer group para piquetes existentes (referência)
    existingLayerRef.current = L.layerGroup().addTo(map);

    // Handler de clique - usa ref para evitar stale closure
    const handleClick = (e) => {
      if (isLockedRef.current) return;

      setPoints((prev) => [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }]);
      setIsComplete(false);
    };

    map.on('click', handleClick);

    // Calcular bounds de todos os piquetes existentes
    const allLatLngs = [];
    existingLotes
      .filter((l) => l.id_lote !== currentLoteId)
      .forEach((lote) => {
        if (lote.geo_mapa?.coordinates?.[0]) {
          lote.geo_mapa.coordinates[0].forEach((coord) => {
            allLatLngs.push([coord[1], coord[0]]);
          });
        }
      });

    // Se tem polígono inicial, centraliza nele
    if (initialPolygon?.coordinates?.[0]?.length > 0) {
      const coords = initialPolygon.coordinates[0];
      const latLngs = coords.map((c) => [c[1], c[0]]);

      // Adiciona o polígono atual aos bounds
      latLngs.forEach((ll) => allLatLngs.push(ll));

      const bounds = L.latLngBounds(
        allLatLngs.length > 0 ? allLatLngs : latLngs
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });

      // Carrega pontos iniciais
      const initialPoints = coords.slice(0, -1).map((c) => ({
        lat: c[1],
        lng: c[0],
      }));
      setPoints(initialPoints);
      setIsComplete(true);
      setIsLocked(true);
      isLockedRef.current = true;
    } else if (allLatLngs.length > 0) {
      // Centraliza em todos os piquetes existentes
      const bounds = L.latLngBounds(allLatLngs);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
      setIsLocked(false);
      isLockedRef.current = false;
    } else {
      map.setView(defaultCenter, 16);
      setIsLocked(false);
      isLockedRef.current = false;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off('click', handleClick);
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafletLoaded]);

  // 2.5. Desenhar piquetes existentes como referência
  useEffect(() => {
    if (!leafletLoaded || !existingLayerRef.current) return;

    const L = window.L;
    existingLayerRef.current.clearLayers();

    // Filtra o lote atual (se estiver editando) e desenha os outros
    existingLotes
      .filter((lote) => lote.id_lote !== currentLoteId)
      .forEach((lote) => {
        if (!lote.geo_mapa?.coordinates?.[0]) return;

        const latLngs = lote.geo_mapa.coordinates[0].map((c) => [c[1], c[0]]);
        const cor = lote.grupo?.color || '#94a3b8';

        // Polígono semi-transparente
        const polygon = L.polygon(latLngs, {
          color: cor,
          fillColor: cor,
          fillOpacity: 0.2,
          weight: 2,
          dashArray: '5, 5',
        }).addTo(existingLayerRef.current);

        // Tooltip com nome do piquete
        polygon.bindTooltip(lote.nome_lote, {
          permanent: false,
          direction: 'center',
          className:
            'bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-medium',
        });
      });
  }, [leafletLoaded, existingLotes, currentLoteId]);

  // 3. Atualizar desenho quando pontos mudam
  useEffect(() => {
    if (!leafletLoaded || !drawnLayerRef.current) return;

    const L = window.L;
    drawnLayerRef.current.clearLayers();
    markersRef.current = [];

    if (points.length === 0) return;

    // Adiciona marcadores se não está bloqueado
    if (!isLocked) {
      points.forEach((pt, idx) => {
        const marker = L.circleMarker([pt.lat, pt.lng], {
          radius: 8,
          fillColor: grupoColor,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        }).addTo(drawnLayerRef.current);

        marker.bindTooltip(`Ponto ${idx + 1}`, {
          permanent: false,
          direction: 'top',
        });

        markersRef.current.push(marker);
      });
    }

    // Desenha polígono/linha
    const latLngs = points.map((p) => [p.lat, p.lng]);

    if ((isComplete || isLocked) && points.length >= 3) {
      polygonRef.current = L.polygon(latLngs, {
        color: grupoColor,
        fillColor: grupoColor,
        fillOpacity: isLocked ? 0.4 : 0.2,
        weight: 3,
      }).addTo(drawnLayerRef.current);
    } else if (points.length >= 2) {
      polylineRef.current = L.polyline(latLngs, {
        color: grupoColor,
        weight: 3,
        dashArray: '10, 10',
      }).addTo(drawnLayerRef.current);
    }

    // Atualiza o pai quando está completo e bloqueado
    if (isComplete && isLocked) {
      updateParent(points, true);
    }
  }, [points, isComplete, isLocked, leafletLoaded, grupoColor, updateParent]);

  // Finaliza o polígono e bloqueia
  const handleComplete = () => {
    if (points.length >= 3) {
      setIsComplete(true);
      setIsLocked(true);
      isLockedRef.current = true;
      updateParent(points, true);
    }
  };

  // Desbloqueia para edição (mantém pontos)
  const handleEnableEdit = () => {
    setIsLocked(false);
    setIsComplete(false);
    isLockedRef.current = false;
  };

  // Limpa tudo
  const handleClear = () => {
    setPoints([]);
    setIsComplete(false);
    setIsLocked(false);
    isLockedRef.current = false;
    updateParent([], false);
  };

  if (!leafletLoaded) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#ce7d0a] rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Carregando mapa...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Mapa */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Controles */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 z-[1000]">
        {/* Botão de finalizar */}
        {!isLocked && points.length >= 3 && (
          <button
            type="button"
            onClick={handleComplete}
            className="px-3 py-2 bg-green-500 text-white text-sm font-medium rounded-lg shadow-lg hover:bg-green-600 transition-colors"
          >
            ✓ Finalizar Desenho
          </button>
        )}

        {/* Botão de editar */}
        {isLocked && (
          <button
            type="button"
            onClick={handleEnableEdit}
            className="px-3 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg shadow-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
          >
            <FiEdit3 className="w-4 h-4" />
            Editar Desenho
          </button>
        )}

        {/* Botão de limpar */}
        {!isLocked && points.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-lg shadow-lg hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <FiTrash2 className="w-4 h-4" />
            Limpar
          </button>
        )}
      </div>

      {/* Instruções */}
      {!isLocked && (
        <div className="absolute bottom-3 left-3 right-3 z-[1000]">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg text-sm text-slate-600">
            {points.length === 0 && (
              <span>👆 Clique no mapa para adicionar o primeiro ponto</span>
            )}
            {points.length === 1 && (
              <span>
                👆 Continue clicando para desenhar - {points.length} ponto
              </span>
            )}
            {points.length === 2 && (
              <span>👆 Adicione mais 1 ponto para formar um polígono</span>
            )}
            {points.length >= 3 && (
              <span>
                ✅ {points.length} pontos - Clique em &quot;Finalizar
                Desenho&quot; para confirmar
              </span>
            )}
          </div>
        </div>
      )}

      {/* Badge de status quando bloqueado */}
      {isLocked && (
        <div className="absolute bottom-3 left-3 z-[1000]">
          <div className="bg-green-500 text-white rounded-lg px-4 py-2 shadow-lg text-sm font-medium flex items-center gap-2">
            ✅ Área definida ({points.length} pontos)
          </div>
        </div>
      )}
    </div>
  );
}
