"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useGrupos, useGruposByPropriedade } from "@/hooks/useGrupos";
import { useLotesByPropriedade } from "@/hooks/useLotes";
import { Lote } from "@/services/lotes.service";
import { useMovLote, useMovLoteStatusByGrupo, useMovLoteHistoricoByGrupo } from "@/hooks/useMovLote";
import { useBufalosbyGrupo } from "@/hooks/useBufalos";
import { Button } from "@/components/ui/Button";

// Icones
import { Plus, Hash, Calendar } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";

// Modais externos
import { CreateEditGrupoModal } from "./grupos/CreateEditGrupoModal";
import { DeleteGrupoModal } from "./grupos/DeleteGrupoModal";
import { TransferirLoteModal } from "./grupos/TransferirLoteModal";
import { DetailsGrupoModal } from "./grupos/DetailsGrupoModal";
import { Grupo, GrupoFormData, GrupoMoveData } from "./grupos/types";

interface GruposTabProps {
  idPropriedade: string;
}

export default function GruposTab({ idPropriedade }: GruposTabProps) {
  const t = useTranslations("Proprietario.detalhes.grupos");
  const [page, setPage] = useState(1);
  const limit = 12;

  // Hooks de Mutações
  const {
    createGrupo,
    isCreatingGrupo,
    updateGrupo,
    isUpdatingGrupo,
    deleteGrupo,
    isDeletingGrupo,
  } = useGrupos();

  const { createMovLote, isCreatingMovLote } = useMovLote();

  // Queries
  const { data: response, isLoading } = useGruposByPropriedade(idPropriedade, page, limit);
  const grupos = response?.data || [];
  const meta = response?.meta || { totalPages: 1, hasNextPage: false, hasPrevPage: false };

  const { data: lotes, isLoading: isLoadingLotes } = useLotesByPropriedade(idPropriedade);

  // Estados dos Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  // Estados locais
  const [selectedGrupo, setSelectedGrupo] = useState<Grupo | null>(null);
  const [formData, setFormData] = useState<GrupoFormData>({
    nomeGrupo: "",
    color: "#000000",
  });

  // Estado da movimentação
  const [moveData, setMoveData] = useState<GrupoMoveData>({
    idLoteAtual: "",
    dtEntrada: new Date().toISOString().slice(0, 16),
  });

  // Estado de paginação dos Búfalos
  const [bufalosPage, setBufalosPage] = useState(1);

  // Consultas dinâmicas baseadas no grupo selecionado
  const { data: statusGrupo, isLoading: isLoadingStatus } = useMovLoteStatusByGrupo(
    selectedGrupo?.idGrupo,
    { enabled: !!selectedGrupo }
  );
  const { data: historicoGrupo, isLoading: isLoadingHistorico } =
    useMovLoteHistoricoByGrupo(selectedGrupo?.idGrupo, { enabled: !!isDetailsModalOpen });

  // Consulta dos búfalos do grupo selecionado
  const { data: bufalosData, isLoading: isLoadingBufalos } = useBufalosbyGrupo(
    selectedGrupo?.idGrupo,
    bufalosPage,
    10,
    { enabled: !!selectedGrupo }
  );

  // Handlers de Modais
  const handleOpenCreate = () => {
    setSelectedGrupo(null);
    setFormData({ nomeGrupo: "", color: "#3b82f6" });
    setIsCreateModalOpen(true);
  };

  const handleOpenDetails = (grupo: Grupo) => {
    setSelectedGrupo(grupo);
    setBufalosPage(1);
    setIsDetailsModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (selectedGrupo) {
      setFormData({
        nomeGrupo: selectedGrupo.nomeGrupo,
        color: selectedGrupo.color,
      });
      setIsDetailsModalOpen(false);
      setIsEditModalOpen(true);
    }
  };

  const handleOpenDelete = () => {
    setIsDetailsModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleOpenMove = () => {
    setMoveData({
      idLoteAtual: "",
      dtEntrada: new Date().toISOString().slice(0, 16),
    });
    setIsDetailsModalOpen(false);
    setIsMoveModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsDetailsModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsMoveModalOpen(false);
    setSelectedGrupo(null);
  };

  // Submit Crud de Grupos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedGrupo && isEditModalOpen) {
        await updateGrupo({
          id: selectedGrupo.idGrupo,
          data: { ...formData, idPropriedade },
        });
      } else {
        await createGrupo({ ...formData, idPropriedade });
      }
      handleCloseModals();
    } catch (error) {
      void error;
    }
  };

  const handleDelete = async () => {
    if (!selectedGrupo) return;
    try {
      await deleteGrupo(selectedGrupo.idGrupo);
      handleCloseModals();
    } catch (error) {
      void error;
    }
  };

  // Submit Movimentação
  const handleMoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrupo || !moveData.idLoteAtual) return;

    try {
      await createMovLote({
        idPropriedade,
        idGrupo: selectedGrupo.idGrupo,
        idLoteAnterior: statusGrupo?.localizacaoAtual?.idLote || null,
        idLoteAtual: moveData.idLoteAtual,
        dtEntrada: new Date(moveData.dtEntrada).toISOString(),
      });
      setIsMoveModalOpen(false);
      setIsDetailsModalOpen(true);
    } catch (error) {
      void error;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center border border-zinc-200 rounded-xl bg-zinc-50/50">
        <div className="flex flex-col items-center gap-2 text-zinc-400">
          <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
          <span className="text-sm font-medium">{t("loading")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Listagem */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">
            {t("title")}
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            {t("subtitle")}
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          variant="primary"
          icon={Plus}
          className="shrink-0"
        >
          {t("newGroup")}
        </Button>
      </div>

      {grupos.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center p-12 border border-dashed border-zinc-300 rounded-xl bg-zinc-50/50 text-center">
          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
            <Hash className="w-6 h-6 text-zinc-400" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-1">
            {t("empty")}
          </h3>
          <p className="text-sm text-zinc-500 max-w-sm mb-4">
            {t("emptyDesc")}
          </p>
          <Button onClick={handleOpenCreate} variant="secondary">
            {t("createFirst")}
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
                  <h3
                    className="text-sm font-semibold text-zinc-900 line-clamp-1"
                    title={grupo.nomeGrupo}
                  >
                    {grupo.nomeGrupo}
                  </h3>
                  <span className="text-[11px] font-mono text-zinc-500 mt-0.5 block">
                    {grupo.color.toUpperCase()}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center text-[11px] text-zinc-500 gap-1.5">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {t("createdAt")}{" "}
                    {new Date(grupo.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {meta.totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
              hasPrevPage={meta.hasPrevPage}
              hasNextPage={meta.hasNextPage}
              className="pt-4 border-t border-zinc-200"
            />
          )}
        </>
      )}

      {/* MODAIS EXTERNOS */}
      <CreateEditGrupoModal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={handleCloseModals}
        onSubmit={handleSubmit}
        isLoading={isCreatingGrupo || isUpdatingGrupo}
        formData={formData}
        onFormChange={setFormData}
        isEdit={isEditModalOpen}
      />

      <DetailsGrupoModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModals}
        grupo={selectedGrupo}
        statusGrupo={statusGrupo ?? null}
        historicoGrupo={historicoGrupo ?? null}
        bufalosData={bufalosData ?? null}
        bufalosPage={bufalosPage}
        onBufalosPageChange={setBufalosPage}
        lotes={lotes || []}
        isLoadingStatus={isLoadingStatus}
        isLoadingHistorico={isLoadingHistorico}
        isLoadingBufalos={isLoadingBufalos}
        isLoadingLotes={isLoadingLotes}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onMove={handleOpenMove}
      />

      <DeleteGrupoModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleDelete}
        isLoading={isDeletingGrupo}
        grupo={selectedGrupo}
      />

      <TransferirLoteModal
        isOpen={isMoveModalOpen}
        onClose={() => {
          setIsMoveModalOpen(false);
          setIsDetailsModalOpen(true);
        }}
        onSubmit={handleMoveSubmit}
        isLoading={isCreatingMovLote}
        moveData={moveData}
        onMoveDataChange={setMoveData}
        lotes={lotes || []}
        grupoNome={selectedGrupo?.nomeGrupo}
        currentLoteName={
          statusGrupo?.localizacaoAtual
            ? lotes?.find(
                (l: Lote) =>
                  l.idLote === statusGrupo.localizacaoAtual.idLote
              )?.nomeLote || "Desconhecido"
            : "Sem alocação prévia"
        }
      />
    </div>
  );
}
