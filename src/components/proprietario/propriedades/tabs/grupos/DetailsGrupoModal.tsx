"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Modal } from "@/components/ui/Modal";
import { Button, IconButton } from "@/components/ui/Button";
import TabNav from "@/components/ui/TabNav";
import {
  Plus,
  Minus,
  Focus,
  MapPin,
  AlertCircle,
  History,
  ArrowRightLeft,
  Search,
  Calendar,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Grupo } from "./types";

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

interface DetailsGrupoModalProps {
  isOpen: boolean;
  onClose: () => void;
  grupo: Grupo | null;
  statusGrupo: any;
  historicoGrupo: any;
  bufalosData: any;
  bufalosPage: number;
  onBufalosPageChange: (page: number) => void;
  lotes: any[];
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
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  const mapBounds = useMemo(() => {
    if (!lotes || lotes.length === 0) return null;

    const loteAtualId = statusGrupo?.localizacao_atual?.id_lote;
    let targetLotes = lotes.filter((l: any) => l.idLote === loteAtualId);

    if (targetLotes.length === 0) {
      targetLotes = lotes;
    }

    let minLat = Infinity,
      maxLat = -Infinity,
      minLng = Infinity,
      maxLng = -Infinity;

    targetLotes.forEach((lote: any) => {
      if (!lote.geoMapa || lote.geoMapa.type !== "Polygon") return;
      lote.geoMapa.coordinates[0].forEach((coord: number[]) => {
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
    return lotes?.find((l: any) => l.idLote === idLote)?.nomeLote || "Desconhecido";
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
          <TabNav
            tabs={[
              { key: "visao-geral", label: "Visão Geral" },
              { key: "mapa", label: "Localização no Mapa" },
              {
                key: "animais",
                label:
                  bufalosData?.meta?.total !== undefined
                    ? `Búfalos (${bufalosData.meta.total})`
                    : "Búfalos",
              },
              { key: "historico", label: "Movimentação" },
            ]}
            activeTab={activeDetailsTab}
            onTabChange={setActiveDetailsTab}
            className="mb-6"
          />

          {/* ABA: VISÃO GERAL */}
          {activeDetailsTab === "visao-geral" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
              <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-100 space-y-5">
                <div className="flex justify-between items-center border-b border-zinc-200/60 pb-4">
                  <span className="text-sm font-medium text-zinc-500">
                    Nome do Grupo
                  </span>
                  <span className="text-base font-semibold text-zinc-900">
                    {grupo.nomeGrupo}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-zinc-200/60 pb-4">
                  <span className="text-sm font-medium text-zinc-500">
                    Data de Criação
                  </span>
                  <span className="text-sm font-medium text-zinc-900">
                    {new Date(grupo.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-zinc-500">
                    Cor Identificadora
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-zinc-600 bg-white px-2 py-1 rounded border border-zinc-200">
                      {grupo.color.toUpperCase()}
                    </span>
                    <div
                      className="w-8 h-8 rounded-md shadow-sm border border-black/10"
                      style={{ backgroundColor: grupo.color }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <h4 className="text-sm font-semibold text-zinc-900 flex justify-between items-center">
                  Localização Atual
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMove}
                    className="text-blue-600 hover:text-blue-700 p-0 hover:bg-transparent"
                  >
                    Transferir Lote
                  </Button>
                </h4>

                {isLoadingStatus ? (
                  <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-6 flex items-center justify-center animate-pulse">
                    <span className="text-sm text-zinc-500">
                      Buscando status...
                    </span>
                  </div>
                ) : statusGrupo?.localizacao_atual ? (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h5 className="text-base font-bold text-blue-900">
                        {getLoteName(
                          statusGrupo.localizacao_atual.id_lote
                        )}
                      </h5>
                      <p className="text-sm text-blue-700 mt-1">
                        Alocado neste lote há{" "}
                        {statusGrupo.localizacao_atual.dias_no_local} dias
                        (desde{" "}
                        {new Date(
                          statusGrupo.localizacao_atual.desde
                        ).toLocaleDateString("pt-BR")}
                        ).
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveDetailsTab("mapa")}
                        className="mt-4 bg-white text-blue-700 hover:bg-blue-50"
                      >
                        Ver no Mapa
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <span className="text-sm text-zinc-500 mb-3">
                      Este grupo não está alocado em nenhum lote atualmente.
                    </span>
                    <Button variant="outline" size="sm" onClick={onMove}>
                      Definir Localização
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-zinc-200 rounded-xl p-5 text-center shadow-sm">
                    <span className="block text-3xl font-bold text-zinc-900">
                      {isLoadingBufalos ? "-" : bufalosData?.meta?.total || 0}
                    </span>
                    <span className="text-sm text-zinc-500 mt-1 block">
                      Búfalos Vinculados
                    </span>
                  </div>
                  <div className="bg-white border border-zinc-200 rounded-xl p-5 text-center shadow-sm">
                    <span className="block text-3xl font-bold text-zinc-900">
                      {historicoGrupo?.total_movimentacoes || 0}
                    </span>
                    <span className="text-sm text-zinc-500 mt-1 block">
                      Movimentações no Total
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
                    {statusGrupo?.localizacao_atual
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
                    <span className="text-zinc-900 font-bold">
                      {grupo.nomeGrupo}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-zinc-300 mx-1"></div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-zinc-300 shadow-sm" />
                    <span className="text-zinc-500 font-medium">
                      Outros Lotes
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-[60vh] min-h-[500px] w-full rounded-xl overflow-hidden border border-zinc-200 relative bg-zinc-100 shadow-inner">
                <div className="absolute bottom-6 right-6 z-[400] flex flex-col gap-3">
                  <button
                    onClick={() => {
                      if (mapInstance && mapBounds) {
                        mapInstance.fitBounds(mapBounds, {
                          padding: [40, 40],
                        });
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

                    {lotes?.map((lote: any, index: number) => {
                      if (
                        !lote.geoMapa ||
                        lote.geoMapa.type !== "Polygon" ||
                        !lote.geoMapa.coordinates
                      )
                        return null;

                      const positions = lote.geoMapa.coordinates[0].map(
                        (coord: number[]) =>
                          [coord[1], coord[0]] as [number, number]
                      );

                      const isCurrentGroup =
                        lote.idLote ===
                        statusGrupo?.localizacao_atual?.id_lote;

                      const polyColor = isCurrentGroup
                        ? grupo.color
                        : "#a1a1aa";
                      const fillOpacity = isCurrentGroup ? 0.6 : 0.2;
                      const weight = isCurrentGroup ? 3 : 1.5;

                      const matchNumero = (lote.nomeLote || "").match(/\d+/);
                      const shortName = matchNumero
                        ? `P${matchNumero[0]}`
                        : `P${index + 1}`;

                      return (
                        <Polygon
                          key={`modal-map-${lote.idLote}`}
                          positions={positions}
                          pathOptions={{
                            color: polyColor,
                            fillColor: polyColor,
                            fillOpacity: fillOpacity,
                            weight: weight,
                          }}
                        >
                          <Tooltip
                            permanent
                            direction="center"
                            className="piquete-label"
                          >
                            {shortName}
                          </Tooltip>
                        </Polygon>
                      );
                    })}
                  </MapContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center animate-pulse bg-zinc-200">
                    <span className="text-zinc-500 font-medium text-sm">
                      Carregando mapa satélite...
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ABA: ANIMAIS */}
          {activeDetailsTab === "animais" && (
            <div className="animate-in fade-in duration-200 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Buscar por brinco ou nome..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ce7d0a]"
                  />
                </div>
              </div>

              <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-sm">
                {isLoadingBufalos ? (
                  <div className="p-10 text-center text-zinc-500 text-sm animate-pulse">
                    Carregando búfalos...
                  </div>
                ) : !bufalosData?.data || bufalosData.data.length === 0 ? (
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
                            <th className="px-6 py-4 font-medium">
                              Categoria
                            </th>
                            <th className="px-6 py-4 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {bufalosData.data.map((bufalo: any) => (
                            <tr
                              key={bufalo.idBufalo}
                              className="hover:bg-zinc-50 transition-colors"
                            >
                              <td className="px-6 py-4 font-medium text-zinc-900">
                                {bufalo.brinco}
                              </td>
                              <td className="px-6 py-4 text-zinc-600">
                                {bufalo.nome || "-"}
                              </td>
                              <td className="px-6 py-4 text-zinc-600">
                                {bufalo.sexo === "M" ? "Macho" : "Fêmea"}
                              </td>
                              <td className="px-6 py-4 text-zinc-600">
                                {bufalo.categoria || "-"}
                              </td>
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
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {bufalosData.meta && bufalosData.meta.totalPages > 1 && (
                      <div className="flex items-center justify-between p-4 border-t border-zinc-200 bg-zinc-50">
                        <span className="text-sm text-zinc-500">
                          Página{" "}
                          <span className="font-medium text-zinc-900">
                            {bufalosPage}
                          </span>{" "}
                          de{" "}
                          <span className="font-medium text-zinc-900">
                            {bufalosData.meta.totalPages}
                          </span>
                        </span>
                        <div className="flex items-center gap-2">
                          <IconButton
                            onClick={() =>
                              onBufalosPageChange(Math.max(1, bufalosPage - 1))
                            }
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onMove}
                    icon={ArrowRightLeft}
                  >
                    Transferir Grupo
                  </Button>
                </div>

                {isLoadingHistorico ? (
                  <div className="py-10 text-center text-zinc-500 text-sm animate-pulse">
                    Carregando histórico...
                  </div>
                ) : !historicoGrupo?.historico ||
                  historicoGrupo.historico.length === 0 ? (
                  <div className="py-10 text-center text-zinc-500 text-sm">
                    Nenhuma movimentação registrada para este grupo.
                  </div>
                ) : (
                  <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent">
                    {historicoGrupo.historico.map((mov: any, index: number) => {
                      const isCurrent =
                        mov.status === "Atual" || index === 0;

                      return (
                        <div
                          key={mov.id_movimento}
                          className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${
                            isCurrent ? "is-active" : ""
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center w-12 h-12 rounded-full border border-white shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${
                              isCurrent
                                ? "bg-blue-100 text-blue-600"
                                : "bg-zinc-100 text-zinc-500"
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
                                  ? `Entrada no ${getLoteName(
                                      mov.id_lote_atual
                                    )}`
                                  : `Saída para o ${getLoteName(
                                      mov.id_lote_atual
                                    )}`}
                              </div>
                              <time className="font-mono text-xs text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
                                {new Date(mov.dt_entrada).toLocaleDateString(
                                  "pt-BR"
                                )}
                              </time>
                            </div>
                            <div className="text-sm text-zinc-600">
                              {isCurrent ? (
                                `Lote anterior: ${getLoteName(
                                  mov.id_lote_anterior
                                )}`
                              ) : (
                                `Permaneceu por ${mov.dias_permanencia} dias. Origem: ${getLoteName(
                                  mov.id_lote_anterior
                                )}`
                              )}
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

          {/* BOTÕES DE AÇÃO DO MODAL DE DETALHES */}
          <div className="pt-5 mt-8 border-t border-zinc-100 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Grupo
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={onEdit}
              className="px-6"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar Grupo
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
