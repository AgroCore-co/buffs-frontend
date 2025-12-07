import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Map as MapIcon, MousePointer2 } from 'lucide-react';

export default function MapaRotativoLeaflet({ lotes = [] }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({});
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [loteSelecionado, setLoteSelecionado] = useState(null);

  // 1. Carregar Leaflet via CDN dinamicamente
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

  // 2. Calcular Centro do Mapa
  const centroMapa = useMemo(() => {
    if (!lotes || lotes.length === 0) return [-24.7046, -47.9876]; // Centro padrão

    let latSum = 0,
      lngSum = 0,
      count = 0;
    lotes.forEach((l) => {
      if (l.geo_mapa?.coordinates?.[0]) {
        l.geo_mapa.coordinates[0].forEach((coord) => {
          lngSum += coord[0];
          latSum += coord[1];
          count++;
        });
      }
    });
    return count > 0 ? [latSum / count, lngSum / count] : [-24.7046, -47.9876];
  }, [lotes]);

  // 4. Inicializar Mapa e Camadas
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || mapInstanceRef.current)
      return;

    const L = window.L;
    const map = L.map(mapContainerRef.current);
    mapInstanceRef.current = map;

    // Camada de Satélite (Esri World Imagery)
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri',
        maxZoom: 19,
      }
    ).addTo(map);

    // Camada de Labels (Opcional)
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
      {
        subdomains: 'abcd',
        maxZoom: 19,
        opacity: 0.8,
      }
    ).addTo(map);

    // Calcular bounds de todos os piquetes
    const allLatLngs = [];
    lotes.forEach((lote) => {
      if (lote.geo_mapa?.coordinates?.[0]) {
        lote.geo_mapa.coordinates[0].forEach((coord) => {
          allLatLngs.push([coord[1], coord[0]]);
        });
      }
    });
    if (allLatLngs.length > 0) {
      const bounds = L.latLngBounds(allLatLngs);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    } else {
      map.setView(centroMapa, 16);
    }

    // --- LÓGICA DE ZOOM E VISIBILIDADE ---
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
  }, [leafletLoaded, centroMapa, lotes]);

  // 5. Atualizar Polígonos
  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !leafletLoaded ||
      !lotes ||
      lotes.length === 0
    )
      return;

    const L = window.L;
    const map = mapInstanceRef.current;

    // Limpar camadas antigas
    Object.values(layersRef.current).forEach((layer) => map.removeLayer(layer));
    layersRef.current = {};

    lotes.forEach((lote, idx) => {
      // Validar se o lote tem dados geográficos válidos
      if (
        !lote.geo_mapa?.coordinates?.[0] ||
        lote.geo_mapa.coordinates[0].length === 0
      ) {
        console.warn(`Lote ${lote.nome_lote} não possui coordenadas válidas`);
        return;
      }

      // Lógica de Cores - Usar cor do grupo da API
      const cor = lote.grupo?.color || '#94a3b8'; // Cor do grupo ou cinza padrão
      const fillColor = cor;
      const borderColor = cor;
      const borderWidth = 2;

      const isSelected = loteSelecionado?.id_lote === lote.id_lote;

      // Converter GeoJSON [Lng, Lat] -> Leaflet [Lat, Lng]
      const latLngs = lote.geo_mapa.coordinates[0].map((c) => [c[1], c[0]]);

      const polygon = L.polygon(latLngs, {
        color: isSelected ? '#ffffff' : borderColor,
        weight: isSelected ? 4 : borderWidth,
        fillColor: fillColor,
        fillOpacity: isSelected ? 0.8 : 0.6,
      }).addTo(map);

      // Extrair número do nome do piquete (ex: "Piquete 01" -> "P1")
      const match = lote.nome_lote.match(/\d+/);
      const nomeAbreviado = match ? `P${parseInt(match[0])}` : `P${idx + 1}`;

      // Bind Tooltip
      polygon.bindTooltip(
        `
        <div class="label-piquete font-sans font-bold text-xs" style="text-shadow: 2px 2px 8px rgba(0,0,0,0.95); color: #fff;">
          ${nomeAbreviado}
        </div>
      `,
        {
          permanent: true,
          direction: 'center',
          className:
            'bg-transparent border-0 shadow-none leaflet-tooltip-custom',
        }
      );

      // Evento de Clique
      polygon.on('click', () => {
        setLoteSelecionado(lote);
      });

      layersRef.current[lote.id_lote] = polygon;
    });
  }, [leafletLoaded, loteSelecionado, lotes]);

  if (!leafletLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
        <div className="animate-pulse flex flex-col items-center">
          <MapIcon className="w-10 h-10 mb-2 opacity-50" />
          <span>A carregar Mapa de Satélite...</span>
        </div>
      </div>
    );
  }

  if (!lotes || lotes.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-100 text-slate-600">
        <div className="flex flex-col items-center">
          <MapIcon className="w-10 h-10 mb-2 opacity-30" />
          <span>Nenhum piquete cadastrado nesta propriedade</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full relative font-sans text-slate-900">
      {/* --- ESTILOS CSS DINÂMICOS CORRIGIDOS --- */}
      <style>{`
        /* Reset do Tooltip Padrão do Leaflet */
        .leaflet-tooltip-custom {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .leaflet-tooltip-custom::before {
          display: none !important;
        }

        /* Transição suave para o texto não "pular" */
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

        /* --- ESCALA GEOMÉTRICA DE ZOOM --- */
        /* Basicamente dobramos o tamanho da fonte a cada nível de zoom 
           para acompanhar o crescimento dos polígonos */

        /* ZOOM < 15: Oculto */
        .z-hide .leaflet-tooltip { display: none !important; }

        /* ZOOM 15: 14px */
        .z-15 .leaflet-tooltip-custom .label-piquete { font-size: 14px !important; }

        /* ZOOM 16: 18px */
        .z-16 .leaflet-tooltip-custom .label-piquete { font-size: 18px !important; }

        /* ZOOM 17: 24px */
        .z-17 .leaflet-tooltip-custom .label-piquete { font-size: 24px !important; }

        /* ZOOM 18: 32px */
        .z-18 .leaflet-tooltip-custom .label-piquete { font-size: 32px !important; }

        /* ZOOM 19+: 48px */
        .z-19 .leaflet-tooltip-custom .label-piquete { font-size: 48px !important; }

      `}</style>

      {/* MAPA CONTAINER */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 z-0 bg-slate-900"
      />

      {/* OVERLAY: Painel Flutuante (Direita) */}
      <div className="absolute top-4 right-4 z-[400] w-80 max-w-[90vw]">
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <MapIcon className="w-3 h-3" /> Gestão de Piquetes
            </span>
            {loteSelecionado && (
              <button
                onClick={() => setLoteSelecionado(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {loteSelecionado ? (
            <div className="p-5 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold text-slate-800 mb-1">
                {loteSelecionado.nome_lote}
              </h2>

              <div className="grid grid-cols-2 gap-3 mb-4 mt-4">
                <div className="bg-slate-100 p-2.5 rounded-lg">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">
                    Área
                  </p>
                  <p className="text-sm font-mono font-semibold text-slate-700">
                    {(loteSelecionado.area_m2 / 10000).toFixed(2)} ha
                  </p>
                </div>
                <div className="bg-slate-100 p-2.5 rounded-lg">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">
                    Grupo
                  </p>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: loteSelecionado.grupo.color }}
                  >
                    {loteSelecionado.grupo.nome_grupo}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <MousePointer2 className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Selecione um piquete</p>
              <p className="text-xs mt-1 opacity-60">
                Clique no mapa para interagir
              </p>
            </div>
          )}
        </div>
      </div>

      {/* OVERLAYS: Legenda de Grupos */}
      <div className="absolute bottom-6 left-6 z-[400]">
        {lotes && lotes.length > 0 && (
          <div className="bg-white/90 backdrop-blur px-4 py-2.5 rounded-full shadow-lg border border-slate-200 flex gap-3 text-xs font-medium text-slate-700">
            {Array.from(
              new Set(lotes.map((l) => l.grupo?.nome_grupo).filter(Boolean))
            ).map((nomeGrupo) => {
              const grupo = lotes.find(
                (l) => l.grupo?.nome_grupo === nomeGrupo
              )?.grupo;
              return (
                <div key={nomeGrupo} className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full border border-slate-300"
                    style={{ backgroundColor: grupo?.color || '#94a3b8' }}
                  ></span>
                  <span>{nomeGrupo}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
