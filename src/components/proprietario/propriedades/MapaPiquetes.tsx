"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { DetalhesLoteModal } from "@/components/proprietario/propriedades/DetalhesLoteModal";
import { useLotesByPropriedade } from "@/hooks/useLotes";
import { Lote } from "@/services/lotes.service";
import dynamic from "next/dynamic";
import type { Map as LeafletMap } from "leaflet";
import {
  Map as MapIcon,
  X,
  Maximize,
  Hash,
  Users,
  Activity,
  Info,
  Plus,
  Minus,
  Focus
} from "lucide-react";
import { useMapEvents } from "react-leaflet";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Polygon = dynamic(
  () => import("react-leaflet").then((m) => m.Polygon),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("react-leaflet").then((m) => m.Tooltip),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((m) => m.CircleMarker),
  { ssr: false }
);

// Componente auxiliar para escutar os eventos de zoom do mapa
function MapEventsHandler({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  return null;
}

interface MapaPiquetesProps {
  idPropriedade: string;
}

export default function MapaPiquetes({ idPropriedade }: MapaPiquetesProps) {
  const t = useTranslations("Proprietario.propriedades.map");
  const [isMounted, setIsMounted] = useState(false);
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null); 
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
  
  const [zoomLevel, setZoomLevel] = useState(15);
  
  // Limites de Zoom Ajustados
  const ZOOM_MOSTRAR_PIQUETES = 16; // A partir do 16, mostra P1, P2...
  const ZOOM_MOSTRAR_GRUPOS = 15;   // Até o 15, mostra o nome do Grupo
  const ZOOM_ESCONDER_TUDO = 14;    // No 13 e abaixo (ou seja, < 14), esconde os grupos

  const { data: lotes, isLoading } = useLotesByPropriedade(idPropriedade);
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);

  useEffect(() => {
    void import("leaflet/dist/leaflet.css");
    setIsMounted(true);
  }, []);

  // Calcula o centro geográfico dos grupos
  const gruposData = useMemo(() => {
    if (!lotes || lotes.length === 0) return [];

    const mapGrupos = new Map();

    lotes.forEach((lote) => {
      if (!lote.grupo || !lote.geoMapa || lote.geoMapa.type !== "Polygon") return;

      const gId = lote.grupo.idGrupo;
      if (!mapGrupos.has(gId)) {
        mapGrupos.set(gId, {
          nome: lote.grupo.nomeGrupo,
          color: lote.grupo.color,
          latSum: 0,
          lngSum: 0,
          pointsCount: 0,
        });
      }

      const gData = mapGrupos.get(gId);
      (lote.geoMapa.coordinates as number[][][])[0].forEach((coord: number[]) => {
        gData.latSum += coord[1];
        gData.lngSum += coord[0];
        gData.pointsCount += 1;
      });
    });

    return Array.from(mapGrupos.values()).map(g => ({
      nome: g.nome,
      color: g.color,
      center: [g.latSum / g.pointsCount, g.lngSum / g.pointsCount] as [number, number]
    }));
  }, [lotes]);

  // Calcula o "Bounding Box" (área limite) que envolve TODOS os piquetes
  const mapBounds = useMemo(() => {
    if (!lotes || lotes.length === 0) return null;
    
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    lotes.forEach((lote) => {
      if (!lote.geoMapa || lote.geoMapa.type !== "Polygon") return;
      (lote.geoMapa.coordinates as number[][][])[0].forEach((coord: number[]) => {
        const lat = coord[1];
        const lng = coord[0];
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
      });
    });

    if (minLat === Infinity) return null;
    
    // Formato de bounds do Leaflet: [[Sul, Oeste], [Norte, Leste]]
    return [
      [minLat, minLng],
      [maxLat, maxLng]
    ] as [[number, number], [number, number]];
  }, [lotes]);

  // Quando o mapa carregar e calcularmos os limites, faz um enquadramento automático
  useEffect(() => {
    if (mapInstance && mapBounds) {
      mapInstance.fitBounds(mapBounds, { padding: [40, 40] });
    }
  }, [mapInstance, mapBounds]);

  if (!isMounted || isLoading) {
    return (
      <div className="w-full h-[calc(100vh-360px)] min-h-[300px] bg-zinc-100 rounded-xl border border-zinc-200 animate-pulse flex items-center justify-center">
        <span className="text-zinc-400 font-medium text-sm">{t("loading")}</span>
      </div>
    );
  }

  // Fallback de segurança para renderizar o MapContainer antes do fitBounds atuar
  const fallbackCenter: [number, number] = mapBounds ? mapBounds[0] : [-24.7366, -48.0673];

  return (
    <div className="bg-white p-1 rounded-xl border border-zinc-200 shadow-sm flex flex-col h-[calc(100vh-360px)] min-h-[400px] overflow-hidden relative font-sans">
      
      {/* HEADER ESQUERDO */}
      <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-sm border border-zinc-200 pointer-events-none">
        <h3 className="text-sm font-semibold text-zinc-800 flex items-center gap-2">
          <MapIcon className="w-4 h-4 text-emerald-600" />
          {t("title")}
        </h3>
        <p className="text-xs text-zinc-500 mt-1 font-medium">
          {lotes?.length || 0} {t("plots")} {gruposData.length} {t("groups")}
        </p>
      </div>

      {/* CONTROLES PERSONALIZADOS DO MAPA (INFERIOR DIREITO) */}
      <div className="absolute bottom-6 right-6 z-[400] flex flex-col gap-3">
        {/* Badge do Zoom Atual */}
        <div 
          className="bg-zinc-900 text-zinc-100 text-[10px] font-bold px-2 py-1.5 rounded-lg text-center shadow-lg border border-zinc-800 tracking-widest cursor-default select-none"
          title={t("zoomLevel")}
        >
          {t("zoom")} {Math.round(zoomLevel)}
        </div>

        {/* Botão de Centralizar (Enquadra todos os piquetes) */}
        <button
          onClick={() => {
            if (mapInstance && mapBounds) {
              mapInstance.fitBounds(mapBounds, { padding: [40, 40] });
            }
          }}
          className="w-10 h-10 bg-white flex items-center justify-center rounded-xl shadow-lg border border-zinc-200 text-zinc-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all focus:outline-none"
          title={t("fitAll")}
        >
          <Focus className="w-5 h-5" />
        </button>

        {/* Botões de Aproximar/Afastar */}
        <div className="flex flex-col bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden divide-y divide-zinc-100">
          <button
            onClick={() => mapInstance?.zoomIn()}
            className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors focus:outline-none"
            title={t("zoomIn")}
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => mapInstance?.zoomOut()}
            className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors focus:outline-none"
            title={t("zoomOut")}
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PAINEL DIREITO (DETALHES DO PIQUETE) */}
      {selectedLote && (
        <div className="absolute top-4 right-4 z-[400] w-80 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-zinc-200 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-zinc-800 flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full shadow-sm" 
                style={{ backgroundColor: selectedLote.grupo?.color || '#ce7d0a' }}
              />
              {selectedLote.nomeLote}
            </h4>
            <button 
              onClick={() => setSelectedLote(null)}
              className="text-zinc-400 hover:text-zinc-600 transition-colors p-1 rounded-md hover:bg-zinc-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm text-zinc-600 bg-zinc-50/80 p-2.5 rounded-lg border border-zinc-100">
              <Hash className="w-4 h-4 text-zinc-400" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">{t("group")}</span>
                <span className="font-semibold text-zinc-700">{selectedLote.grupo?.nomeGrupo || t("noGroup")}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-3 text-sm text-zinc-600 bg-zinc-50/80 p-2.5 rounded-lg border border-zinc-100">
                <Activity className={`w-4 h-4 ${selectedLote.status === 'ativo' ? 'text-emerald-500' : 'text-zinc-400'}`} />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">{t("status")}</span>
                  <span className="font-semibold text-zinc-700 capitalize">{selectedLote.status || t("na")}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-zinc-600 bg-zinc-50/80 p-2.5 rounded-lg border border-zinc-100">
                <Users className="w-4 h-4 text-zinc-400" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">{t("capacity")}</span>
                  <span className="font-semibold text-zinc-700">
                    {selectedLote.qtdMax ? `${selectedLote.qtdMax} cbç` : t("na")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-zinc-600 bg-zinc-50/80 p-2.5 rounded-lg border border-zinc-100">
              <Maximize className="w-4 h-4 text-zinc-400" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">{t("plotArea")}</span>
                <span className="font-semibold text-zinc-700">
                  {selectedLote.areaM2
                    ? `${Number(selectedLote.areaM2).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} m²`
                    : t("na")}
                </span>
              </div>
            </div>

            {selectedLote.descricao && selectedLote.descricao !== selectedLote.nomeLote && (
              <div className="flex gap-3 text-sm text-zinc-600 bg-zinc-50/80 p-2.5 rounded-lg border border-zinc-100 items-start">
                <Info className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">{t("notes")}</span>
                  <span className="font-medium text-zinc-600 text-xs mt-0.5">{selectedLote.descricao}</span>
                </div>
              </div>
            )}
            
            <button
              onClick={() => setIsDetalhesModalOpen(true)}
              className="w-full mt-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold py-2.5 rounded-lg transition-all shadow-sm"
            >
              {t("viewDetails")}
            </button>
          </div>
        </div>
      )}

      {/* ESTILOS LEAFLET */}
      <style>{`
        .leaflet-tooltip.piquete-label {
          background-color: transparent !important; 
          border: none !important;
          box-shadow: none !important;
          color: #ffffff;
          font-family: inherit;
          font-weight: 800;
          font-size: 14px;
          text-shadow: 
            -1px -1px 2px rgba(0,0,0,0.8),
             1px -1px 2px rgba(0,0,0,0.8),
            -1px  1px 2px rgba(0,0,0,0.8),
             1px  1px 2px rgba(0,0,0,0.8);
          direction: center;
        }
        .leaflet-tooltip.piquete-label::before { display: none; }

        .leaflet-tooltip.grupo-badge {
          background-color: rgba(24, 24, 27, 0.85) !important;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 99px !important;
          color: white;
          font-family: inherit;
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 6px 14px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15) !important;
          direction: center;
          transition: all 0.3s ease;
        }
        .leaflet-tooltip.grupo-badge::before { display: none; }

        .leaflet-interactive {
          transition: fill-opacity 0.2s ease, stroke-width 0.2s ease;
        }
      `}</style>

      <MapContainer 
        center={fallbackCenter} 
        zoom={15} 
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem', zIndex: 10 }}
        scrollWheelZoom={true}
        zoomControl={false}
        ref={setMapInstance}
      >
        <MapEventsHandler onZoomChange={setZoomLevel} />

        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
        />

        {lotes?.map((lote, index: number) => {
          if (!lote.geoMapa || lote.geoMapa.type !== "Polygon" || !lote.geoMapa.coordinates) return null;

          const positions = (lote.geoMapa.coordinates as number[][][])[0].map(
            (coord: number[]) => [coord[1], coord[0]] as [number, number]
          );

          const polyColor = lote.grupo?.color || '#ce7d0a';
          const isSelected = selectedLote?.idLote === lote.idLote;

          const matchNumero = (lote.nomeLote || '').match(/\d+/);
          const shortName = matchNumero ? `P${matchNumero[0]}` : `P${index + 1}`;

          return (
            <Polygon 
              key={lote.idLote}
              positions={positions} 
              eventHandlers={{
                click: () => setSelectedLote(lote)
              }}
              pathOptions={{ 
                color: polyColor, 
                fillColor: polyColor, 
                fillOpacity: isSelected ? 0.6 : 0.25, 
                weight: isSelected ? 3 : 1.5,
              }}
            >
              {zoomLevel >= ZOOM_MOSTRAR_PIQUETES && (
                <Tooltip permanent direction="center" className="piquete-label">
                  {shortName}
                </Tooltip>
              )}
            </Polygon>
          );
        })}

        {zoomLevel <= ZOOM_MOSTRAR_GRUPOS && zoomLevel >= ZOOM_ESCONDER_TUDO && gruposData.map((grupo, idx) => (
          <CircleMarker 
            key={`g-label-${idx}`}
            center={grupo.center} 
            radius={0} 
            stroke={false} 
            fill={false}
          >
            <Tooltip permanent direction="center" className="grupo-badge">
              <div className="flex items-center gap-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: grupo.color }}
                />
                {grupo.nome}
              </div>
            </Tooltip>
          </CircleMarker>
        ))}

      </MapContainer>

      <DetalhesLoteModal
        isOpen={isDetalhesModalOpen}
        onClose={() => setIsDetalhesModalOpen(false)}
        lote={selectedLote}
      />
    </div>
  );
}