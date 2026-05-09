"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useGrupos } from "@/hooks/useGrupos";
import { useLotes } from "@/hooks/useLotes"; // Importado para pegar as coordenadas
import { Grupo } from "@/services/grupos.service";
import { Button, IconButton } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal"; 
import TabNav from "@/components/ui/TabNav";

// Icones
import { 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  Hash,
  X,
  Calendar,
  Info,
  Pencil,
  Users,
  Layers,
  MapPin,
  ArrowRightLeft,
  Search,
  History,
  Map as MapIcon // Icone pro mapa
} from "lucide-react";

// Componentes do Leaflet
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface GruposTabProps {
  idPropriedade: string;
}

// Componente auxiliar para ajustar os limites do mapa automaticamente
function MapBoundsFitter({ bounds }: { bounds: [[number, number], [number, number]] | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [map, bounds]);
  return null;
}

export default function GruposTab({ idPropriedade }: GruposTabProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Garante que a renderização do mapa (que precisa do window) só aconteça no client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ==========================================================================
  // ESTADOS E HOOKS
  // ==========================================================================
  const [page, setPage] = useState(1);
  const limit = 12;

  const { 
    getByPropriedade, 
    createGrupo, isCreatingGrupo,
    updateGrupo, isUpdatingGrupo,
    deleteGrupo, isDeletingGrupo 
  } = useGrupos();

  // Hook para buscar os lotes/piquetes (necessário para o mapa)
  const { getByPropriedade: getLotesByPropriedade } = useLotes();
  const { data: lotes, isLoading: isLoadingLotes } = getLotesByPropriedade(idPropriedade);

  const { data: response, isLoading } = getByPropriedade(idPropriedade, page, limit);
  const grupos = response?.data || [];
  const meta = response?.meta || { totalPages: 1, hasNextPage: false, hasPrevPage: false };

  // Estados dos Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedGrupo, setSelectedGrupo] = useState<Grupo | null>(null);

  // Estados do Formulário e Abas
  const [formData, setFormData] = useState({ nomeGrupo: "", color: "#000000" });
  const [activeDetailsTab, setActiveDetailsTab] = useState("visao-geral");

  // ==========================================================================
  // LÓGICA DO MAPA (BOUNDS E CENTRALIZAÇÃO)
  // ==========================================================================
  const mapBounds = useMemo(() => {
    if (!lotes || lotes.length === 0) return null;
    
    // Tenta focar apenas nos lotes que pertencem ao grupo selecionado
    let targetLotes = lotes.filter((l: any) => l.grupo?.idGrupo === selectedGrupo?.idGrupo);
    
    // Se o grupo não tiver lotes, exibe a propriedade inteira
    if (targetLotes.length === 0) {
      targetLotes = lotes;
    }

    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;

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
  }, [lotes, selectedGrupo]);

  const fallbackCenter: [number, number] = mapBounds ? mapBounds[0] : [-24.7366, -48.0673];

  // ==========================================================================
  // HANDLERS
  // ==========================================================================
  const handleOpenCreate = () => {
    setSelectedGrupo(null);
    setFormData({ nomeGrupo: "", color: "#3b82f6" });
    setIsCreateModalOpen(true);
  };

  const handleOpenDetails = (grupo: Grupo) => {
    setSelectedGrupo(grupo);
    setActiveDetailsTab("visao-geral"); 
    setIsDetailsModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (selectedGrupo) {
      setFormData({ nomeGrupo: selectedGrupo.nomeGrupo, color: selectedGrupo.color });
      setIsDetailsModalOpen(false); 
      setIsEditModalOpen(true);     
    }
  };

  const handleOpenDelete = () => {
    setIsDetailsModalOpen(false); 
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsDetailsModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedGrupo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedGrupo && isEditModalOpen) {
        await updateGrupo({ 
          id: selectedGrupo.idGrupo, 
          data: { ...formData, idPropriedade } 
        });
      } else {
        await createGrupo({ ...formData, idPropriedade });
      }
      handleCloseModals();
    } catch (error) {
      console.error("Erro ao salvar grupo:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedGrupo) return;
    try {
      await deleteGrupo(selectedGrupo.idGrupo);
      handleCloseModals();
    } catch (error) {
      console.error("Erro ao excluir grupo:", error);
    }
  };

  // ==========================================================================
  // RENDERIZAÇÃO
  // ==========================================================================
  if (isLoading) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center border border-zinc-200 rounded-xl bg-zinc-50/50">
        <div className="flex flex-col items-center gap-2 text-zinc-400">
          <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
          <span className="text-sm font-medium">Carregando grupos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER DA TAB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">Grupos de Manejo</h2>
          <p className="text-sm text-zinc-500 mt-1">Gerencie as divisões e categorias do rebanho nesta propriedade.</p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" icon={Plus} className="shrink-0">
          Novo Grupo
        </Button>
      </div>

      {/* CONTEÚDO DOS CARDS */}
      {grupos.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center p-12 border border-dashed border-zinc-300 rounded-xl bg-zinc-50/50 text-center">
          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
            <Hash className="w-6 h-6 text-zinc-400" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-1">Nenhum grupo encontrado</h3>
          <p className="text-sm text-zinc-500 max-w-sm mb-4">
            Você ainda não tem grupos cadastrados para esta propriedade. Crie o primeiro grupo para organizar seu rebanho.
          </p>
          <Button onClick={handleOpenCreate} variant="secondary">
            Criar meu primeiro grupo
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {grupos.map((grupo: Grupo) => (
              <div 
                key={grupo.idGrupo} 
                onClick={() => handleOpenDetails(grupo)}
                className="bg-white border border-zinc-200 rounded-lg p-3.5 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all group flex flex-col h-full cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2.5">
                  <div 
                    className="w-6 h-6 rounded-md shadow-sm border border-black/10" 
                    style={{ backgroundColor: grupo.color }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-zinc-900 line-clamp-1" title={grupo.nomeGrupo}>
                    {grupo.nomeGrupo}
                  </h3>
                  <span className="text-[11px] font-mono text-zinc-500 mt-0.5 block">
                    {grupo.color.toUpperCase()}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center text-[11px] text-zinc-500 gap-1.5">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Criado em {new Date(grupo.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
              <span className="text-sm text-zinc-500">
                Página <span className="font-medium text-zinc-900">{page}</span> de <span className="font-medium text-zinc-900">{meta.totalPages}</span>
              </span>
              <div className="flex items-center gap-2">
                <IconButton onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!meta.hasPrevPage} variant="outline" icon={ChevronLeft} />
                <IconButton onClick={() => setPage((p) => p + 1)} disabled={!meta.hasNextPage} variant="outline" icon={ChevronRight} />
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================== */}
      {/* MODAL CRIAR GRUPO */}
      {/* ========================================================================== */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
        title="Novo Grupo"
        description="Crie uma nova divisão para o seu rebanho."
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Nome do Grupo</label>
            <input type="text" required placeholder="Ex: Recria, Secagem, etc." value={formData.nomeGrupo} onChange={(e) => setFormData({ ...formData, nomeGrupo: e.target.value })} className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Cor de Identificação</label>
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-zinc-300 shadow-sm shrink-0 cursor-pointer focus-within:ring-2 focus-within:ring-[#ce7d0a]">
                <input type="color" required value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
              </div>
              <input type="text" value={formData.color.toUpperCase()} onChange={(e) => setFormData({ ...formData, color: e.target.value })} pattern="^#[0-9A-Fa-f]{6}$" placeholder="#000000" className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm font-mono text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent transition-all" />
            </div>
          </div>
          <div className="pt-5 mt-6 flex items-center justify-end gap-2 border-t border-zinc-100">
            <Button type="button" variant="outline" onClick={handleCloseModals}>Cancelar</Button>
            <Button type="submit" variant="primary" isLoading={isCreatingGrupo}>Criar grupo</Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================== */}
      {/* MODAL DETALHES DO GRUPO COM ABAS (TAMANHO XL) */}
      {/* ========================================================================== */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModals}
        title={`Grupo: ${selectedGrupo?.nomeGrupo}`}
        description="Informações, animais e localização do grupo de manejo."
        size="xl" 
      >
        {selectedGrupo && (
          <div className="flex flex-col mt-2">
            
            <TabNav
              tabs={[
                { key: "visao-geral", label: "Visão Geral" },
                { key: "mapa", label: "Localização no Mapa" }, // <--- NOVA ABA DE MAPA AQUI
                { key: "animais", label: "Búfalos (24)" },
                { key: "historico", label: "Movimentação" }
              ]}
              activeTab={activeDetailsTab}
              onTabChange={setActiveDetailsTab}
              className="mb-6"
            />

            {/* CONTEÚDO DA ABA: VISÃO GERAL */}
            {activeDetailsTab === "visao-geral" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
                <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-100 space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-200/60 pb-3">
                    <span className="text-sm font-medium text-zinc-500">Nome do Grupo</span>
                    <span className="text-base font-semibold text-zinc-900">{selectedGrupo.nomeGrupo}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-zinc-200/60 pb-3">
                    <span className="text-sm font-medium text-zinc-500">Data de Criação</span>
                    <span className="text-sm font-medium text-zinc-900">
                      {new Date(selectedGrupo.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-zinc-500">Cor Identificadora</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-zinc-600 bg-white px-2 py-1 rounded border border-zinc-200">
                        {selectedGrupo.color.toUpperCase()}
                      </span>
                      <div 
                        className="w-6 h-6 rounded-md shadow-sm border border-black/10" 
                        style={{ backgroundColor: selectedGrupo.color }} 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-zinc-900">Localização Atual</h4>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-blue-900">Piquete Central 02</h5>
                      <p className="text-xs text-blue-700 mt-1">Este grupo está alocado neste lote desde 12/05/2026.</p>
                      <Button variant="outline" size="sm" onClick={() => setActiveDetailsTab("mapa")} className="mt-3 bg-white text-blue-700 hover:bg-blue-50">
                        Ver no Mapa
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border border-zinc-200 rounded-xl p-4 text-center">
                      <span className="block text-2xl font-bold text-zinc-900">24</span>
                      <span className="text-xs text-zinc-500">Búfalos Vinculados</span>
                    </div>
                    <div className="bg-white border border-zinc-200 rounded-xl p-4 text-center">
                      <span className="block text-2xl font-bold text-zinc-900">3</span>
                      <span className="text-xs text-zinc-500">Movimentações no Mês</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CONTEÚDO DA ABA: MAPA (Highlight do Grupo) */}
            {activeDetailsTab === "mapa" && (
              <div className="animate-in fade-in duration-200 flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-zinc-600">
                    <MapIcon className="w-4 h-4" />
                    <span>Áreas em destaque indicam a alocação atual do grupo.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedGrupo.color }} />
                    <span className="text-zinc-900 font-medium">{selectedGrupo.nomeGrupo}</span>
                    <span className="w-3 h-3 rounded-full bg-zinc-300 ml-3" />
                    <span className="text-zinc-500">Outros Grupos</span>
                  </div>
                </div>

                <div className="h-[400px] w-full rounded-xl overflow-hidden border border-zinc-200 relative bg-zinc-100">
                  {isMounted && !isLoadingLotes ? (
                    <MapContainer 
                      center={fallbackCenter} 
                      zoom={15} 
                      style={{ height: '100%', width: '100%', zIndex: 10 }}
                      scrollWheelZoom={true}
                      zoomControl={true}
                    >
                      <MapBoundsFitter bounds={mapBounds} />
                      
                      <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                      />

                      {lotes?.map((lote: any, index: number) => {
                        if (!lote.geoMapa || lote.geoMapa.type !== "Polygon" || !lote.geoMapa.coordinates) return null;

                        const positions = lote.geoMapa.coordinates[0].map(
                          (coord: number[]) => [coord[1], coord[0]] as [number, number]
                        );

                        // Lógica de Highlight: Colorido se for do grupo, cinza se não for
                        const isCurrentGroup = lote.grupo?.idGrupo === selectedGrupo.idGrupo;
                        const polyColor = isCurrentGroup ? selectedGrupo.color : '#a1a1aa'; // cinza para inativos
                        const fillOpacity = isCurrentGroup ? 0.6 : 0.2;
                        const weight = isCurrentGroup ? 3 : 1;

                        const matchNumero = (lote.nomeLote || '').match(/\d+/);
                        const shortName = matchNumero ? `P${matchNumero[0]}` : `P${index + 1}`;

                        return (
                          <Polygon 
                            key={`modal-map-${lote.idLote}`}
                            positions={positions} 
                            pathOptions={{ 
                              color: isCurrentGroup ? '#ffffff' : polyColor, // borda branca se ativo
                              fillColor: polyColor, 
                              fillOpacity: fillOpacity, 
                              weight: weight,
                            }}
                          >
                            <Tooltip permanent direction="center" className="bg-transparent border-0 shadow-none text-white font-bold text-xs" style={{ textShadow: '0px 0px 4px rgba(0,0,0,0.8)' }}>
                              {shortName}
                            </Tooltip>
                          </Polygon>
                        );
                      })}
                    </MapContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center animate-pulse bg-zinc-200">
                      <span className="text-zinc-500 font-medium text-sm">Carregando mapa...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CONTEÚDO DA ABA: ANIMAIS */}
            {activeDetailsTab === "animais" && (
              <div className="animate-in fade-in duration-200 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar por brinco ou nome..." 
                      className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ce7d0a]"
                    />
                  </div>
                  <Button variant="primary" icon={ArrowRightLeft}>
                    Mover Animais (Transferir)
                  </Button>
                </div>

                <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-zinc-500 bg-zinc-50 border-b border-zinc-200 uppercase">
                      <tr>
                        <th className="px-4 py-3 font-medium">Brinco</th>
                        <th className="px-4 py-3 font-medium">Nome</th>
                        <th className="px-4 py-3 font-medium">Categoria</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      <tr className="hover:bg-zinc-50">
                        <td className="px-4 py-3 font-medium text-zinc-900">1042</td>
                        <td className="px-4 py-3 text-zinc-600">Estrela</td>
                        <td className="px-4 py-3 text-zinc-600">Novilha</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Ativo</span></td>
                      </tr>
                      <tr className="hover:bg-zinc-50">
                        <td className="px-4 py-3 font-medium text-zinc-900">1043</td>
                        <td className="px-4 py-3 text-zinc-600">Trovão</td>
                        <td className="px-4 py-3 text-zinc-600">Bezerro</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Ativo</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CONTEÚDO DA ABA: HISTÓRICO DE LOTES */}
            {activeDetailsTab === "historico" && (
              <div className="animate-in fade-in duration-200">
                <div className="bg-white border border-zinc-200 rounded-xl p-6">
                  <h4 className="text-sm font-semibold text-zinc-900 mb-6 flex items-center gap-2">
                    <History className="w-4 h-4 text-zinc-500" />
                    Últimas movimentações
                  </h4>
                  
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent">
                    
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-zinc-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-sm text-zinc-900">Entrada no Piquete Central 02</div>
                          <time className="font-mono text-xs text-zinc-500">12/05/2026</time>
                        </div>
                        <div className="text-xs text-zinc-500">Transferido por: João Silva. Motivo: Rotação de pastagem.</div>
                      </div>
                    </div>

                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-zinc-100 text-zinc-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <ArrowRightLeft className="w-4 h-4" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-zinc-200 bg-zinc-50 shadow-sm">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-sm text-zinc-900">Saída do Piquete Fundo 01</div>
                          <time className="font-mono text-xs text-zinc-500">12/05/2026</time>
                        </div>
                        <div className="text-xs text-zinc-500">Permanência: 15 dias. Lote de destino: Piquete Central 02.</div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* BOTÕES DE AÇÃO: EXCLUIR E EDITAR */}
            <div className="pt-4 mt-8 border-t border-zinc-100 flex items-center justify-between">
              <Button type="button" variant="ghost" onClick={handleOpenDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2">
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Grupo
              </Button>
              
              <Button type="button" variant="primary" onClick={handleOpenEdit}>
                <Pencil className="w-4 h-4 mr-2" />
                Editar Grupo
              </Button>
            </div>

          </div>
        )}
      </Modal>

      {/* ========================================================================== */}
      {/* MODAL EDITAR GRUPO (FORMULÁRIO EXTERNO) */}
      {/* ========================================================================== */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        title="Editar Grupo"
        description="Altere o nome e a cor de identificação do grupo."
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Nome do Grupo</label>
            <input type="text" required value={formData.nomeGrupo} onChange={(e) => setFormData({ ...formData, nomeGrupo: e.target.value })} className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Nova Cor de Identificação</label>
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-zinc-300 shadow-sm shrink-0 cursor-pointer focus-within:ring-2 focus-within:ring-[#ce7d0a]">
                <input type="color" required value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
              </div>
              <input type="text" value={formData.color.toUpperCase()} onChange={(e) => setFormData({ ...formData, color: e.target.value })} pattern="^#[0-9A-Fa-f]{6}$" className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm font-mono text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent transition-all" />
            </div>
          </div>
          <div className="pt-5 mt-6 border-t border-zinc-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => { setIsEditModalOpen(false); setIsDetailsModalOpen(true); }}>
              Voltar
            </Button>
            <Button type="submit" variant="primary" isLoading={isUpdatingGrupo}>
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================== */}
      {/* MODAL EXCLUIR */}
      {/* ========================================================================== */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        size="sm"
      >
        {selectedGrupo && (
          <div className="text-center p-2">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">Excluir grupo?</h3>
            <p className="text-sm text-zinc-500 mb-6">
              Tem certeza que deseja excluir o grupo <span className="font-semibold text-zinc-700">{selectedGrupo.nomeGrupo}</span>? Esta ação pode afetar o histórico de lotes associados a ele.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={handleDelete} variant="danger" isLoading={isDeletingGrupo} className="w-full">
                Sim, excluir grupo
              </Button>
              <Button onClick={handleCloseModals} disabled={isDeletingGrupo} variant="outline" className="w-full">
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}