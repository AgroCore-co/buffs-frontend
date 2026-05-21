"use client";

import { useState } from "react";
import {
  useAlimentacaoDef,
  useAlimentacaoRegistro,
  useAlimentacaoDefByPropriedade,
  useAlimentacaoRegistroByPropriedade,
} from "@/hooks/useAlimentacao";
import { AlimentacaoRegistro, AlimentacaoDef } from "@/services/alimentacao.service";
import { useGruposByPropriedade } from "@/hooks/useGrupos";
import { AlertCircle } from "lucide-react";
import { AlimentacaoResumo } from "./alimentacao/AlimentacaoResumo";
import { AlimentacaoHistorico } from "./alimentacao/AlimentacaoHistorico";
import {
  AlimentacaoFormRegistro,
  AlimentacaoFormTipo,
  type RegistroFormData,
  type TipoFormData,
} from "./alimentacao/AlimentacaoForm";

interface AlimentacaoTabProps {
  idPropriedade: string;
}

type SubTab = "registros" | "tipos";

export default function AlimentacaoTab({ idPropriedade }: AlimentacaoTabProps) {
  const [activeTab, setActiveTab] = useState<SubTab>("registros");
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    createRegistro, isCreatingRegistro,
    updateRegistro, isUpdatingRegistro,
    deleteRegistro, isDeletingRegistro,
  } = useAlimentacaoRegistro();

  const {
    createDef, isCreatingDef,
    updateDef, isUpdatingDef,
    deleteDef, isDeletingDef,
  } = useAlimentacaoDef();

  const { data: resGrupos } = useGruposByPropriedade(idPropriedade, 1, 100);
  const { data: resTiposSelect } = useAlimentacaoDefByPropriedade(idPropriedade, 1, 100);

  const gruposList = resGrupos?.data || [];
  const tiposSelectList = resTiposSelect?.data || [];

  const { data: resRegistros, isLoading: loadReg } = useAlimentacaoRegistroByPropriedade(
    idPropriedade, page, limit, { enabled: activeTab === "registros" }
  );
  const { data: resTipos, isLoading: loadTipos } = useAlimentacaoDefByPropriedade(
    idPropriedade, page, limit, { enabled: activeTab === "tipos" }
  );

  const registros = resRegistros?.data || [];
  const metaRegistros = resRegistros?.meta || { totalPages: 1, hasNextPage: false, hasPrevPage: false, page: 1 };

  const tipos = resTipos?.data || [];
  const metaTipos = resTipos?.meta || { totalPages: 1, hasNextPage: false, hasPrevPage: false, page: 1 };

  const isLoading = activeTab === "registros" ? loadReg : loadTipos;

  // Modal open states
  const [isRegistroModalOpen, setIsRegistroModalOpen] = useState(false);
  const [isTipoModalOpen, setIsTipoModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected items per modal type
  const [selectedRegistro, setSelectedRegistro] = useState<AlimentacaoRegistro | null>(null);
  const [selectedTipo, setSelectedTipo] = useState<AlimentacaoDef | null>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<AlimentacaoRegistro | AlimentacaoDef | null>(null);

  const handleOpenRegistro = (item?: AlimentacaoRegistro) => {
    setSelectedRegistro(item || null);
    setIsRegistroModalOpen(true);
  };

  const handleOpenTipo = (item?: AlimentacaoDef) => {
    setSelectedTipo(item || null);
    setIsTipoModalOpen(true);
  };

  const handleOpenDelete = (item: AlimentacaoRegistro | AlimentacaoDef) => {
    setSelectedForDelete(item);
    setIsDeleteModalOpen(true);
  };

  const closeAllModals = () => {
    setIsRegistroModalOpen(false);
    setIsTipoModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedRegistro(null);
    setSelectedTipo(null);
    setSelectedForDelete(null);
  };

  const handleSubmitRegistro = async (data: RegistroFormData) => {
    try {
      const payload = { ...data, idPropriedade: idPropriedade, quantidade: Number(data.quantidade) };
      if (selectedRegistro) {
        await updateRegistro({ id: selectedRegistro.idRegistro, data: payload });
      } else {
        await createRegistro(payload);
      }
      closeAllModals();
    } catch {
      // error handled by mutation
    }
  };

  const handleSubmitTipo = async (data: TipoFormData) => {
    try {
      const payload = { ...data, idPropriedade: idPropriedade };
      if (selectedTipo) {
        await updateDef({ id: selectedTipo.idAlimentDef, data: payload });
      } else {
        await createDef(payload);
      }
      closeAllModals();
    } catch {
      // error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!selectedForDelete) return;
    try {
      if (activeTab === "registros") {
        await deleteRegistro((selectedForDelete as AlimentacaoRegistro).idRegistro);
      } else {
        await deleteDef((selectedForDelete as AlimentacaoDef).idAlimentDef);
      }
      closeAllModals();
    } catch {
      // error handled by mutation
    }
  };

  const handleNew = () => activeTab === "registros" ? handleOpenRegistro() : handleOpenTipo();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AlimentacaoResumo activeTab={activeTab} onNew={handleNew} />

      <AlimentacaoHistorico
        activeTab={activeTab}
        onTabChange={(tab) => { setActiveTab(tab); setPage(1); }}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        registros={registros}
        tipos={tipos}
        metaRegistros={metaRegistros}
        metaTipos={metaTipos}
        onEditRegistro={handleOpenRegistro}
        onEditTipo={handleOpenTipo}
        onDelete={handleOpenDelete}
        onNew={handleNew}
      />

      <AlimentacaoFormRegistro
        isOpen={isRegistroModalOpen}
        initialRegistro={selectedRegistro}
        gruposList={gruposList}
        tiposSelectList={tiposSelectList}
        isSubmitting={isCreatingRegistro || isUpdatingRegistro}
        onClose={closeAllModals}
        onSubmit={handleSubmitRegistro}
      />

      <AlimentacaoFormTipo
        isOpen={isTipoModalOpen}
        initialTipo={selectedTipo}
        isSubmitting={isCreatingDef || isUpdatingDef}
        onClose={closeAllModals}
        onSubmit={handleSubmitTipo}
      />

      {/* Modal de exclusão (partilhado entre registos e tipos) */}
      {isDeleteModalOpen && selectedForDelete && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">Confirmar Exclusão</h3>
            <p className="text-sm text-zinc-500 mb-6">
              Tem a certeza que deseja eliminar o {activeTab === "registros" ? "registo" : "alimento"}
              <span className="font-semibold text-zinc-700 block mt-1">
                {activeTab === "registros"
                  ? `${(selectedForDelete as AlimentacaoRegistro).alimentacaodef?.tipoAlimentacao} (${(selectedForDelete as AlimentacaoRegistro).quantidade}${(selectedForDelete as AlimentacaoRegistro).unidadeMedida})`
                  : (selectedForDelete as AlimentacaoDef).tipoAlimentacao}
              </span>
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleDelete}
                disabled={isDeletingRegistro || isDeletingDef}
                className="w-full py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {(isDeletingRegistro || isDeletingDef) && (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                Sim, excluir
              </button>
              <button
                onClick={closeAllModals}
                className="w-full py-2.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
