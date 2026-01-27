import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Map as MapIcon } from 'lucide-react';

export default function MapaGrupoLeaflet({ todosLotes, grupo, idLoteAtual }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({});
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Carregar Leaflet
  useEffect(() => {
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

  // Calcular Centro do Mapa (baseado em todos os lotes)
  const centroMapa = useMemo(() => {
    if (!todosLotes || todosLotes.length === 0) return [-24.7046, -47.9876];
    let latSum = 0,
      lngSum = 0,
      count = 0;
    todosLotes.forEach((l) => {
      const geo = l.geoMapa || l.geo_mapa;
      if (geo?.coordinates?.[0]) {
        geo.coordinates[0].forEach((coord) => {
          lngSum += coord[0];
          latSum += coord[1];
          count++;
        });
      }
    });
    return count > 0 ? [latSum / count, lngSum / count] : [-24.7046, -47.9876];
  }, [todosLotes]);

  // Inicializar Mapa
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || mapInstanceRef.current)
      return;
    const L = window.L;
    const map = L.map(mapContainerRef.current);
    mapInstanceRef.current = map;
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19,
      }
    ).addTo(map);
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
      {
        subdomains: 'abcd',
        maxZoom: 19,
        opacity: 0.8,
      }
    ).addTo(map);
    const allLatLngs = [];
    todosLotes.forEach((lote) => {
      const geo = lote.geoMapa || lote.geo_mapa;
      if (geo?.coordinates?.[0]) {
        geo.coordinates[0].forEach((coord) => {
          allLatLngs.push([coord[1], coord[0]]);
        });
      }
    });
    if (allLatLngs.length > 0) {
      const bounds = L.latLngBounds(allLatLngs);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
    } else {
      map.setView(centroMapa, 16);
    }
    const updateZoomClasses = () => {
      const currentZoom = Math.round(map.getZoom());
      const container = map.getContainer();
      container.classList.remove(
        'z-hide',
        'z-15',
        'z-16',
        'z-17',
        'z-18',
        'z-19'
      );
      if (currentZoom < 15) {
        container.classList.add('z-hide');
      } else if (currentZoom === 15) {
        container.classList.add('z-15');
      } else if (currentZoom === 16) {
        container.classList.add('z-16');
      } else if (currentZoom === 17) {
        container.classList.add('z-17');
      } else if (currentZoom === 18) {
        container.classList.add('z-18');
      } else {
        container.classList.add('z-19');
      }
    };
    map.on('zoomend', updateZoomClasses);
    updateZoomClasses();
  }, [leafletLoaded, centroMapa, todosLotes]);

  // Renderizar Polígonos com destaque
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletLoaded || !todosLotes) return;
    const L = window.L;
    const map = mapInstanceRef.current;
    Object.values(layersRef.current).forEach((layer) => map.removeLayer(layer));
    layersRef.current = {};
    todosLotes.forEach((lote, idx) => {
      const geo = lote.geoMapa || lote.geo_mapa;
      const nomeLote = lote.nomeLote || lote.nome_lote;
      const idLote = lote.idLote || lote.id_lote;
      const loteIdGrupo = lote.idGrupo || lote.id_grupo;
      const grupoIdGrupo = grupo.idGrupo || grupo.id_grupo;

      if (!geo?.coordinates?.[0] || geo.coordinates[0].length === 0) return;

      const latLngs = geo.coordinates[0].map((c) => [c[1], c[0]]);
      const isLoteAtual = idLoteAtual && idLote === idLoteAtual;
      const pertenceAoGrupo = loteIdGrupo === grupoIdGrupo;

      // Estilo para lote atual (destaque laranja)
      // Estilo para lotes do grupo (cor do grupo)
      // Estilo para lotes de outros grupos (cinza tracejado)
      const polygon = L.polygon(latLngs, {
        color: isLoteAtual
          ? '#f59e42'
          : pertenceAoGrupo
            ? grupo.color
            : '#94a3b8',
        weight: isLoteAtual ? 5 : pertenceAoGrupo ? 2 : 1,
        fillColor: isLoteAtual
          ? '#fbbf24'
          : pertenceAoGrupo
            ? grupo.color
            : '#cbd5e1',
        fillOpacity: isLoteAtual ? 0.85 : pertenceAoGrupo ? 0.7 : 0.4,
        dashArray: pertenceAoGrupo || isLoteAtual ? null : '4, 4',
      }).addTo(map);

      // Tooltip apenas para lotes do grupo ou lote atual
      if (pertenceAoGrupo || isLoteAtual) {
        const match = nomeLote.match(/\d+/);
        const nomeAbreviado = match ? `P${parseInt(match[0])}` : `P${idx + 1}`;
        polygon.bindTooltip(
          `<div class=\"label-piquete font-sans font-bold text-xs\" style=\"text-shadow: 2px 2px 8px rgba(0,0,0,0.95); color: #fff;\">${nomeAbreviado}</div>`,
          {
            permanent: true,
            direction: 'center',
            className:
              'bg-transparent border-0 shadow-none leaflet-tooltip-custom',
          }
        );
      }
      layersRef.current[idLote] = polygon;
    });
  }, [leafletLoaded, todosLotes, grupo, idLoteAtual]);

  if (!leafletLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-900 text-white">
        <div className="animate-pulse flex flex-col items-center">
          <MapIcon className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-sm">Carregando mapa...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <style>{`
        .leaflet-tooltip-custom {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .leaflet-tooltip-custom::before {
          display: none !important;
        }
        .leaflet-tooltip-custom .label-piquete {
          transition: font-size 0.3s ease-out;
          font-weight: 800;
          letter-spacing: -1px;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          white-space: nowrap;
          text-align: center;
        }
        .z-hide .leaflet-tooltip { display: none !important; }
        .z-15 .leaflet-tooltip-custom .label-piquete { font-size: 14px !important; }
        .z-16 .leaflet-tooltip-custom .label-piquete { font-size: 18px !important; }
        .z-17 .leaflet-tooltip-custom .label-piquete { font-size: 24px !important; }
        .z-18 .leaflet-tooltip-custom .label-piquete { font-size: 32px !important; }
        .z-19 .leaflet-tooltip-custom .label-piquete { font-size: 48px !important; }
      `}</style>
      <div ref={mapContainerRef} className="absolute inset-0 bg-slate-900" />
      {/* Legenda */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur px-4 py-2.5 rounded-lg shadow-lg text-xs">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-4 h-4 rounded bg-amber-400"
            style={{ border: '2px solid #f59e42' }}
          ></span>
          <span className="font-semibold text-slate-800">
            Localização Atual
          </span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-4 h-4 rounded"
            style={{ backgroundColor: grupo.color, opacity: 0.7 }}
          ></span>
          <span className="font-semibold text-slate-800">
            {grupo.nomeGrupo || grupo.nome_grupo}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <span
            className="w-4 h-4 rounded bg-slate-300"
            style={{ opacity: 0.4, border: '1px dashed #94a3b8' }}
          ></span>
          <span>Outros grupos</span>
        </div>
      </div>
    </div>
  );
}
