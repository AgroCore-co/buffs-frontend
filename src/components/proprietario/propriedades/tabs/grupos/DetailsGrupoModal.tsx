"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import type { Map as LeafletMap } from "leaflet";
import { useMap } from "react-leaflet";

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
import { Modal } from "@/components/ui/Modal";
import { Button, IconButton } from "@/components/ui/Button";
import {
  Plus,
  Minus,
  Focus,
  MapPin,
  History,
  ArrowRightLeft,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Grupo } from "./types";
import { Lote } from "@/services/lotes.service";
import { Bufalo, BufaloPaginatedResponse } from "@/services/bufalos.service";
import { StatusGrupoResponse, HistoricoGrupoResponse, MovimentoHistoricoDetalhe } from "@/services/mov-lote.service";
import { DetailsGrupoHeader } from "./details/DetailsGrupoHeader";
import { DetailsGrupoTabs } from "./details/DetailsGrupoTabs";
import { DetailsGrupoFooter } from "./details/DetailsGrupoFooter";

interface MapBoundsFitterProps {
  bounds: [[number, number], [number, number]] | null;
}

function MapBoundsFitter({ bounds }: MapBoundsFitterProps) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [map, bounds]);
  return null;
}

interface AnimaisTabProps {
  bufalosData: BufaloPaginatedResponse | null;
  isLoadingBufalos: boolean;
  bufalosPage: number;
  onBufalosPageChange: (page: number) => void;
  searchQuery: string;
  onSearchChange: (v: string) => void;
}

function AnimaisTab({
  bufalosData,
  isLoadingBufalos,
  bufalosPage,
  onBufalosPageChange,
  searchQuery,
  onSearchChange,
}: AnimaisTabProps) {
  const q = searchQuery.trim().toLowerCase();
  const allRows = bufalosData?.data ?? [];
  const filtered = q
    ? allRows.filter(
        (b: Bufalo) =>
          b.brinco?.toLowerCase().includes(q) ||
          b.nome?.toLowerCase().includes(q)
      )
    : allRows;

  return (
    <div className="animate-in fade-in duration-200 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por brinco ou nome..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ce7d0a]"
          />
        </div>
      </div>

      <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-sm">
        {isLoadingBufalos ? (
          <div className="p-10 text-center text-zinc-500 text-sm animate-pulse">
            Carregando búfalos...
          </div>
        ) : allRows.length === 0 ? (
          <div className="p-10 text-center text-zinc-500 text-sm">
            Nenhum búfalo encontrado neste grupo.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-zinc-500 bg-zinc-50 border-b border-zinc-200 uppercase">
                  <tr>
                    <th className="px-6 py-4 font-medium">Brinco</th>
                    <th className="px-6 py-4 font-medium">Nome</th>
                    <th className="px-6 py-4 font-medium">Sexo</th>
                    <th className="px-6 py-4 font-medium">Categoria</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-zinc-500 text-sm">
                        Nenhum resultado para &ldquo;{searchQuery}&rdquo;.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((bufalo: Bufalo) => (
                      <tr key={bufalo.idBufalo} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-zinc-900">{bufalo.brinco}</td>
                        <td className="px-6 py-4 text-zinc-600">{bufalo.nome || "-"}</td>
                        <td className="px-6 py-4 text-zinc-600">
                          {bufalo.sexo === "M" ? "Macho" : "Fêmea"}
                        </td>
                        <td className="px-6 py-4 text-zinc-600">{bufalo.categoria || "-"}</td>
                        <td className="px-6 py-4">
                          {bufalo.status ? (
                            <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                              Ativo
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">
                              Inativo
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {bufalosData?.meta && bufalosData.meta.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-zinc-200 bg-zinc-50">
                <span className="text-sm text-zinc-500">
                  Página{" "}
                  <span className="font-medium text-zinc-900">{bufalosPage}</span>{" "}
                  de{" "}
                  <span className="font-medium text-zinc-900">{bufalosData.meta.totalPages}</span>
                </span>
                <div className="flex items-center gap-2">
                  <IconButton
                    onClick={() => onBufalosPageChange(Math.max(1, bufalosPage - 1))}
                    disabled={!bufalosData.meta.hasPrevPage}
                    variant="outline"
                    icon={ChevronLeft}
                    aria-label="Página anterior"
                  />
                  <IconButton
                    onClick={() => onBufalosPageChange(bufalosPage + 1)}
                    disabled={!bufalosData.meta.hasNextPage}
                    variant="outline"
                    icon={ChevronRight}
                    aria-label="Próxima página"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface DetailsGrupoModalProps {
  isOpen: boolean;
  onClose: () => void;
  grupo: Grupo | null;
  statusGrupo: StatusGrupoResponse | null;
  historicoGrupo: HistoricoGrupoResponse | null;
  bufalosData: BufaloPaginatedResponse | null;
  bufalosPage: number;
  onBufalosPageChange: (page: number) => void;
  lotes: Lote[];
  isLoadingStatus: boolean;
  isLoadingHistorico: boolean;
  isLoadingBufalos: boolean;
  isLoadingLotes: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMove: () => void;
}

export function DetailsGrupoModal({
  isOpen,
  onClose,
  grupo,
  statusGrupo,
  historicoGrupo,
  bufalosData,
  bufalosPage,
  onBufalosPageChange,
  lotes,
  isLoadingStatus,
  isLoadingHistorico,
  isLoadingBufalos,
  isLoadingLotes,
  onEdit,
  onDelete,
  onMove,
}: DetailsGrupoModalProps) {
  const [activeDetailsTab, setActiveDetailsTab] = useState("visao-geral");
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    void import("leaflet/dist/leaflet.css");
  }, []);

  const mapBounds = useMemo(() => {
    if (!lotes || lotes.length === 0) return null;

    const loteAtualId = statusGrupo?.localizacaoAtual?.idLote;

    // Prioridade: todos os lotes do grupo → lote atual → todos os lotes
    let targetLotes = lotes.filter((l: Lote) => l.grupo?.idGrupo === grupo?.idGrupo);
    if (targetLotes.length === 0) {
      targetLotes = lotes.filter((l: Lote) => l.idLote === loteAtualId);
    }
    if (targetLotes.length === 0) {
      targetLotes = lotes;
    }

    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;

    targetLotes.forEach((lote: Lote) => {
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
    return [[minLat, minLng], [maxLat, maxLng]] as [[number, number], [number, number]];
  }, [lotes, statusGrupo]);

  const fallbackCenter: [number, number] = mapBounds ? mapBounds[0] : [-24.7366, -48.0673];

  const getLoteName = (idLote?: string | null) => {
    if (!idLote) return "Desconhecido";
    return lotes?.find((l: Lote) => l.idLote === idLote)?.nomeLote || "Desconhecido";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Grupo: ${grupo?.nomeGrupo}`}
      description="Informações, animais e localização do grupo de manejo."
      size="4xl"
    >
      {grupo && (
        <div className="flex flex-col mt-2">
          <DetailsGrupoTabs
            activeTab={activeDetailsTab}
            onTabChange={setActiveDetailsTab}
            bufalosData={bufalosData}
            className="mb-6"
          />

          {/* ABA: VISÃO GERAL */}
          {activeDetailsTab === "visao-geral" && (
            <DetailsGrupoHeader
              grupo={grupo}
              statusGrupo={statusGrupo}
              isLoadingStatus={isLoadingStatus}
              isLoadingBufalos={isLoadingBufalos}
              bufalosData={bufalosData}
              historicoGrupo={historicoGrupo}
              lotes={lotes}
              onMove={onMove}
              onNavigateToMap={() => setActiveDetailsTab("mapa")}
            />
          )}

          {/* ABA: MAPA */}
          {activeDetailsTab === "mapa" && (
            <div className="animate-in fade-in duration-200 flex flex-col gap-4">
              <style>{`
                .leaflet-tooltip.piquete-label {
                  background-color: transparent !important;
                  border: none !important;
                  box-shadow: none !important;
                  color: #ffffff;
                  font-family: inherit;
                  font-weight: 800;
                  font-size: 16px;
                  text-shadow:
                    -1px -1px 2px rgba(0,0,0,0.8),
                     1px -1px 2px rgba(0,0,0,0.8),
                    -1px  1px 2px rgba(0,0,0,0.8),
                     1px  1px 2px rgba(0,0,0,0.8);
                  direction: center;
                }
                .leaflet-tooltip.piquete-label::before { display: none; }
                .leaflet-interactive {
                  transition: fill-opacity 0.2s ease, stroke-width 0.2s ease;
                }
              `}</style>

              <div className="flex items-center justify-between text-sm bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                <div className="flex items-center gap-2 text-zinc-600">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium">
                    {statusGrupo?.localizacaoAtual
                      ? "A área em destaque indica a alocação atual do grupo."
                      : "O grupo não possui alocação. Mostrando todos os lotes."}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-sm"
                      style={{ backgroundColor: grupo.color }}
                    />
                    <span className="text-zinc-900 font-bold">{grupo.nomeGrupo}</span>
                  </div>
                  <div className="h-4 w-px bg-zinc-300 mx-1"></div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-zinc-300 shadow-sm" />
                    <span className="text-zinc-500 font-medium">Outros Lotes</span>
                  </div>
                </div>
              </div>

              <div className="h-[60vh] min-h-[500px] w-full rounded-xl overflow-hidden border border-zinc-200 relative bg-zinc-100 shadow-inner">
                <div className="absolute bottom-6 right-6 z-[400] flex flex-col gap-3">
                  <button
                    onClick={() => {
                      if (mapInstance && mapBounds) {
                        mapInstance.fitBounds(mapBounds, { padding: [40, 40] });
                      }
                    }}
                    className="w-10 h-10 bg-white flex items-center justify-center rounded-xl shadow-lg border border-zinc-200 text-zinc-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all focus:outline-none"
                    title="Enquadrar piquete(s)"
                  >
                    <Focus className="w-5 h-5" />
                  </button>
                  <div className="flex flex-col bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden divide-y divide-zinc-100">
                    <button
                      onClick={() => mapInstance?.zoomIn()}
                      className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors focus:outline-none"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => mapInstance?.zoomOut()}
                      className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors focus:outline-none"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {!isLoadingLotes ? (
                  <MapContainer
                    center={fallbackCenter}
                    zoom={15}
                    style={{ height: "100%", width: "100%", zIndex: 10 }}
                    scrollWheelZoom={true}
                    zoomControl={false}
                    ref={setMapInstance}
                  >
                    <MapBoundsFitter bounds={mapBounds} />
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                    />

                    {lotes?.map((lote: Lote, index: number) => {
                      if (!lote.geoMapa || lote.geoMapa.type !== "Polygon" || !lote.geoMapa.coordinates)
                        return null;

                      const positions = (lote.geoMapa.coordinates as number[][][])[0].map(
                        (coord: number[]) => [coord[1], coord[0]] as [number, number]
                      );

                      const isCurrentLote = lote.idLote === statusGrupo?.localizacaoAtual?.idLote;
                      const isSameGroup = lote.grupo?.idGrupo === grupo?.idGrupo;

                      const strokeColor = isSameGroup ? grupo.color : "#a1a1aa";
                      const fillColor = isCurrentLote ? "#ffffff" : isSameGroup ? grupo.color : "#a1a1aa";
                      const fillOpacity = isCurrentLote ? 0.75 : isSameGroup ? 0.25 : 0.12;
                      const weight = isCurrentLote ? 3 : isSameGroup ? 1.5 : 1;

                      const matchNumero = (lote.nomeLote || "").match(/\d+/);
                      const shortName = matchNumero ? `P${matchNumero[0]}` : `P${index + 1}`;

                      return (
                        <Polygon
                          key={`modal-map-${lote.idLote}`}
                          positions={positions}
                          pathOptions={{ color: strokeColor, fillColor, fillOpacity, weight }}
                        >
                          <Tooltip permanent direction="center" className="piquete-label">
                            {shortName}
                          </Tooltip>
                        </Polygon>
                      );
                    })}
                  </MapContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center animate-pulse bg-zinc-200">
                    <span className="text-zinc-500 font-medium text-sm">Carregando mapa satélite...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ABA: ANIMAIS */}
          {activeDetailsTab === "animais" && (
            <AnimaisTab
              bufalosData={bufalosData}
              isLoadingBufalos={isLoadingBufalos}
              bufalosPage={bufalosPage}
              onBufalosPageChange={onBufalosPageChange}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {/* ABA: HISTÓRICO DE LOTES */}
          {activeDetailsTab === "historico" && (
            <div className="animate-in fade-in duration-200">
              <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-zinc-500" />
                    Últimas movimentações
                  </h4>
                  <Button variant="outline" size="sm" onClick={onMove} icon={ArrowRightLeft}>
                    Transferir Grupo
                  </Button>
                </div>

                {isLoadingHistorico ? (
                  <div className="py-10 text-center text-zinc-500 text-sm animate-pulse">
                    Carregando histórico...
                  </div>
                ) : !historicoGrupo?.historico || historicoGrupo.historico.length === 0 ? (
                  <div className="py-10 text-center text-zinc-500 text-sm">
                    Nenhuma movimentação registrada para este grupo.
                  </div>
                ) : (
                  <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent">
                    {historicoGrupo.historico.map((mov: MovimentoHistoricoDetalhe, index: number) => {
                      const isCurrent = mov.status === "Atual" || index === 0;

                      return (
                        <div
                          key={mov.idMovimento}
                          className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${
                            isCurrent ? "is-active" : ""
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center w-12 h-12 rounded-full border border-white shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${
                              isCurrent ? "bg-blue-100 text-blue-600" : "bg-zinc-100 text-zinc-500"
                            }`}
                          >
                            {isCurrent ? (
                              <MapPin className="w-5 h-5" />
                            ) : (
                              <ArrowRightLeft className="w-5 h-5" />
                            )}
                          </div>
                          <div
                            className={`w-[calc(100%-4.5rem)] md:w-[calc(50%-3rem)] p-5 rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow ${
                              isCurrent ? "bg-white" : "bg-zinc-50"
                            }`}
                          >
                            <div className="flex items-center justify-between space-x-2 mb-2">
                              <div className="font-bold text-sm text-zinc-900">
                                {isCurrent
                                  ? `Entrada no ${getLoteName(mov.idLoteAtual)}`
                                  : `Saída para o ${getLoteName(mov.idLoteAtual)}`}
                              </div>
                              <time className="font-mono text-xs text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
                                {new Date(mov.dtEntrada).toLocaleDateString("pt-BR")}
                              </time>
                            </div>
                            <div className="text-sm text-zinc-600">
                              {isCurrent
                                ? `Lote anterior: ${getLoteName(mov.idLoteAnterior)}`
                                : `Permaneceu por ${mov.diasPermanencia} dias. Origem: ${getLoteName(mov.idLoteAnterior)}`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <DetailsGrupoFooter onDelete={onDelete} onEdit={onEdit} />
        </div>
      )}
    </Modal>
  );
}
