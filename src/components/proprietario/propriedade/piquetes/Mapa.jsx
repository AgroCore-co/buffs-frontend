import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Tractor, 
  Map as MapIcon, 
  Info, 
  MousePointer2,
  Layers
} from 'lucide-react';

// --- DADOS REAIS DO SEU JSON ---
const DADOS_JSON = [
  {
    "id_lote": "pqt-jac-01",
    "tipo_lote": null,
    "nome_lote": "Piquete 01",
    "geo_mapa": {
      "type": "Polygon",
      "coordinates": [[
        [-48.05248, -24.74382],
        [-48.05088, -24.74382],
        [-48.05088, -24.74501],
        [-48.05248, -24.74501],
        [-48.05248, -24.74382]
      ]]
    },
    "area_m2": 20000,
    "grupo": { "color": "#fe5d5d", "nome_grupo": "Recria" }
  },
  {
    "id_lote": "pqt-jac-02",
    "tipo_lote": null,
    "nome_lote": "Piquete 02",
    "geo_mapa": {
      "type": "Polygon",
      "coordinates": [[
        [-48.05086, -24.74382],
        [-48.04926, -24.74382],
        [-48.04926, -24.74501],
        [-48.05086, -24.74501],
        [-48.05086, -24.74382]
      ]]
    },
    "area_m2": 20000,
    "grupo": { "color": "#fe5d5d", "nome_grupo": "Recria" }
  },
  {
    "id_lote": "pqt-jac-03",
    "tipo_lote": null,
    "nome_lote": "Piquete 03",
    "geo_mapa": {
      "type": "Polygon",
      "coordinates": [[
        [-48.04924, -24.74382],
        [-48.04764, -24.74382],
        [-48.04764, -24.74501],
        [-48.04924, -24.74501],
        [-48.04924, -24.74382]
      ]]
    },
    "area_m2": 20000,
    "grupo": { "color": "#fe5d5d", "nome_grupo": "Recria" }
  },
  {
    "id_lote": "pqt-jac-04",
    "tipo_lote": null,
    "nome_lote": "Piquete 04",
    "geo_mapa": {
      "type": "Polygon",
      "coordinates": [[
        [-48.04762, -24.74382],
        [-48.04602, -24.74382],
        [-48.04602, -24.74501],
        [-48.04762, -24.74501],
        [-48.04762, -24.74382]
      ]]
    },
    "area_m2": 20000,
    "grupo": { "color": "#fe5d5d", "nome_grupo": "Recria" }
  },
  {
    "id_lote": "pqt-jac-05",
    "tipo_lote": null,
    "nome_lote": "Piquete 05",
    "geo_mapa": {
      "type": "Polygon",
      "coordinates": [[
        [-48.04600, -24.74382],
        [-48.04440, -24.74382],
        [-48.04440, -24.74501],
        [-48.04600, -24.74501],
        [-48.04600, -24.74382]
      ]]
    },
    "area_m2": 20000,
    "grupo": { "color": "#fe5d5d", "nome_grupo": "Recria" }
  },
  {
    "id_lote": "pqt-jac-06",
    "tipo_lote": null,
    "nome_lote": "Piquete 06",
    "geo_mapa": {
      "type": "Polygon",
      "coordinates": [[
        [-48.05248, -24.74503],
        [-48.05088, -24.74503],
        [-48.05088, -24.74622],
        [-48.05248, -24.74622],
        [-48.05248, -24.74503]
      ]]
    },
    "area_m2": 20000,
    "grupo": { "color": "#7cc77c", "nome_grupo": "Engorda" }
  },
  {
    "id_lote": "pqt-jac-07",
    "tipo_lote": null,
    "nome_lote": "Piquete 07",
    "geo_mapa": {
      "type": "Polygon",
      "coordinates": [[
        [-48.05086, -24.74503],
        [-48.04926, -24.74503],
        [-48.04926, -24.74622],
        [-48.05086, -24.74622],
        [-48.05086, -24.74503]
      ]]
    },
    "area_m2": 20000,
    "grupo": { "color": "#7cc77c", "nome_grupo": "Engorda" }
  },
  {
    "id_lote": "pqt-jac-08",
    "tipo_lote": null,
    "nome_lote": "Piquete 08",
    "geo_mapa": {
      "type": "Polygon",
      "coordinates": [[
        [-48.04924, -24.74503],
        [-48.04764, -24.74503],
        [-48.04764, -24.74622],
        [-48.04924, -24.74622],
        [-48.04924, -24.74503]
      ]]
    },
    "area_m2": 20000,
    "grupo": { "color": "#7cc77c", "nome_grupo": "Engorda" }
  },
  {
    "id_lote": "pqt-jac-09",
    "tipo_lote": null,
    "nome_lote": "Piquete 09",
    "geo_mapa": {
      "type": "Polygon",
      "coordinates": [[
        [-48.04762, -24.74503],
        [-48.04602, -24.74503],
        [-48.04602, -24.74622],
        [-48.04762, -24.74622],
        [-48.04762, -24.74503]
      ]]
    },
    "area_m2": 20000,
    "grupo": { "color": "#7cc77c", "nome_grupo": "Engorda" }
  },
  {
    "id_lote": "pqt-jac-10",
    "tipo_lote": null,
    "nome_lote": "Piquete 10",
    "geo_mapa": {
      "type": "Polygon",
      "coordinates": [[
        [-48.04600, -24.74503],
        [-48.04440, -24.74503],
        [-48.04440, -24.74622],
        [-48.04600, -24.74622],
        [-48.04600, -24.74503]
      ]]
    },
    "area_m2": 20000,
    "grupo": { "color": "#7cc77c", "nome_grupo": "Engorda" }
  }
];

export default function MapaRotativoLeaflet() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({}); 
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [loteSelecionado, setLoteSelecionado] = useState(null);
  const [estadoManejo, setEstadoManejo] = useState({});

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

  // 2. Inicializar Estado de Maneio
  useEffect(() => {
    const estadoInicial = {};
    DADOS_JSON.forEach((lote, index) => {
      if (lote.nome_lote === "Piquete 01") {
        estadoInicial[lote.id_lote] = { status: 'ocupado', dias: 2 };
      } else {
        estadoInicial[lote.id_lote] = { status: 'descanso', dias: 15 + (index * 5) };
      }
    });
    setEstadoManejo(estadoInicial);
  }, []);

  // 3. Calcular Centro do Mapa
  const centroMapa = useMemo(() => {
    let latSum = 0, lngSum = 0, count = 0;
    DADOS_JSON.forEach(l => {
      l.geo_mapa.coordinates[0].forEach(coord => {
        lngSum += coord[0];
        latSum += coord[1];
        count++;
      });
    });
    return [latSum / count, lngSum / count];
  }, []);

  // 4. Inicializar Mapa e Camadas
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

    const L = window.L;
    const map = L.map(mapContainerRef.current);
    mapInstanceRef.current = map;

    // Camada de Satélite (Esri World Imagery)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri',
      maxZoom: 19
    }).addTo(map);

    // Camada de Labels (Opcional)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
      opacity: 0.8
    }).addTo(map);

    // Calcular bounds de todos os piquetes
    const allLatLngs = [];
    DADOS_JSON.forEach(lote => {
      lote.geo_mapa.coordinates[0].forEach(coord => {
        allLatLngs.push([coord[1], coord[0]]);
      });
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
      container.classList.remove('z-hide', 'z-15', 'z-16', 'z-17', 'z-18', 'z-19');
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

  }, [leafletLoaded, centroMapa]);

  // 5. Atualizar Polígonos
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletLoaded || Object.keys(estadoManejo).length === 0) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    // Limpar camadas antigas
    Object.values(layersRef.current).forEach(layer => map.removeLayer(layer));
    layersRef.current = {};

    DADOS_JSON.forEach((lote, idx) => {
      const estado = estadoManejo[lote.id_lote];

      // Lógica de Cores
      let cor = '#94a3b8';
      let fillColor = '#94a3b8';

      if (estado?.status === 'ocupado') {
        cor = '#3b82f6'; // Azul Borda
        fillColor = '#3b82f6';
      } else if (estado?.status === 'descanso') {
        cor = estado.dias > 25 ? '#22c55e' : '#eab308'; // Verde ou Amarelo
        fillColor = cor;
      }

      const isSelected = loteSelecionado?.id_lote === lote.id_lote;

      // Converter GeoJSON [Lng, Lat] -> Leaflet [Lat, Lng]
      const latLngs = lote.geo_mapa.coordinates[0].map(c => [c[1], c[0]]);

      const polygon = L.polygon(latLngs, {
        color: isSelected ? '#ffffff' : cor,
        weight: isSelected ? 3 : 2,
        fillColor: fillColor,
        fillOpacity: isSelected ? 0.8 : 0.5,
        dashArray: (estado?.status === 'descanso' && !isSelected) ? '5, 5' : null
      }).addTo(map);

      // Abreviação do nome: P1, P2, ...
      const nomeAbreviado = `P${idx + 1}`;

      // Bind Tooltip 
      polygon.bindTooltip(`
        <div class="label-piquete font-sans font-bold text-xs" style="text-shadow: 2px 2px 8px rgba(0,0,0,0.95); color: #fff;">
          ${nomeAbreviado}
        </div>
      `, {
        permanent: true,
        direction: "center",
        className: "bg-transparent border-0 shadow-none leaflet-tooltip-custom"
      });

      // Evento de Clique
      polygon.on('click', () => {
        setLoteSelecionado(lote);
      });

      layersRef.current[lote.id_lote] = polygon;
    });

  }, [leafletLoaded, estadoManejo, loteSelecionado]);

  // Função Lógica de Maneio
  const handleMoverGado = (idDestino) => {
    const novoEstado = { ...estadoManejo };
    const idOrigem = Object.keys(novoEstado).find(key => novoEstado[key].status === 'ocupado');
    
    if (idOrigem) novoEstado[idOrigem] = { status: 'descanso', dias: 0 };
    novoEstado[idDestino] = { status: 'ocupado', dias: 1 };
    
    setEstadoManejo(novoEstado);
    setLoteSelecionado(null);
  };

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
      <div ref={mapContainerRef} className="absolute inset-0 z-0 bg-slate-900" />

      {/* OVERLAY: Painel Flutuante (Direita) */}
      <div className="absolute top-4 right-4 z-[1000] w-80 max-w-[90vw]">
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300">
          
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <MapIcon className="w-3 h-3" /> Gestão de Piquetes
            </span>
            {loteSelecionado && (
              <button onClick={() => setLoteSelecionado(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            )}
          </div>

          {loteSelecionado ? (
            <div className="p-5 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold text-slate-800 mb-1">{loteSelecionado.nome_lote}</h2>
              
              <div className="grid grid-cols-2 gap-3 mb-4 mt-4">
                <div className="bg-slate-100 p-2.5 rounded-lg">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Área</p>
                  <p className="text-sm font-mono font-semibold text-slate-700">{(loteSelecionado.area_m2 / 10000).toFixed(2)} ha</p>
                </div>
                <div className="bg-slate-100 p-2.5 rounded-lg">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Grupo</p>
                  <p className="text-sm font-semibold" style={{ color: loteSelecionado.grupo.color }}>
                    {loteSelecionado.grupo.nome_grupo}
                  </p>
                </div>
              </div>

              <div className={`border rounded-lg p-3 mb-4 flex items-center justify-between ${
                estadoManejo[loteSelecionado.id_lote]?.status === 'ocupado' 
                  ? 'bg-blue-50 border-blue-200 text-blue-800' 
                  : 'bg-green-50 border-green-200 text-green-800'
              }`}>
                <div>
                  <p className="text-xs opacity-70 font-bold uppercase">Estado Atual</p>
                  <p className="font-bold capitalize">{estadoManejo[loteSelecionado.id_lote]?.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold leading-none">{estadoManejo[loteSelecionado.id_lote]?.dias}</p>
                  <p className="text-xs opacity-70 uppercase">Dias</p>
                </div>
              </div>

              {estadoManejo[loteSelecionado.id_lote]?.status !== 'ocupado' ? (
                <button 
                  onClick={() => handleMoverGado(loteSelecionado.id_lote)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Tractor className="w-4 h-4" /> Mover Gado Para Cá
                </button>
              ) : (
                <div className="text-xs text-center text-blue-600 bg-blue-50 p-2 rounded border border-blue-100 flex items-center justify-center gap-2">
                  <Info className="w-3 h-3" /> Piquete Ocupado
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <MousePointer2 className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Selecione um piquete</p>
              <p className="text-xs mt-1 opacity-60">Clique no mapa para interagir</p>
            </div>
          )}
        </div>
      </div>

      {/* OVERLAYS: Legenda */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-slate-200 flex gap-4 text-xs font-medium text-slate-700">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Ocupado</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500"></span> Pronto</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Descanso</div>
      </div>

    </div>
  );
}