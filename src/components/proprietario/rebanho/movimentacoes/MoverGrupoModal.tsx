"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArrowRightLeft, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useBufalos } from "@/hooks/useBufalos";
import { useGruposByPropriedade } from "@/hooks/useGrupos";
import type { Bufalo } from "@/services/bufalos.service";

const inputClass =
  "w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ce7d0a] focus:border-transparent";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  bufalo: Bufalo;
  /** Nome do grupo atual, para exibição. */
  grupoAtualNome?: string;
  onMoved?: () => void;
}

export function MoverGrupoModal({ isOpen, onClose, bufalo, grupoAtualNome, onMoved }: Props) {
  const t = useTranslations("Proprietario.rebanho.bufalo.movimentacoes.modal");
  const [idNovoGrupo, setIdNovoGrupo] = useState("");
  const [motivo, setMotivo] = useState("");

  const { moverGrupo, isMovendoGrupo } = useBufalos();
  const { data: gruposResp, isLoading: isLoadingGrupos } = useGruposByPropriedade(
    bufalo.idPropriedade,
    1,
    100,
    { enabled: isOpen },
  );

  // Grupos disponíveis (exceto o atual do animal).
  const grupos = useMemo(
    () => (gruposResp?.data ?? []).filter(g => g.idGrupo !== bufalo.idGrupo),
    [gruposResp, bufalo.idGrupo],
  );

  useEffect(() => {
    if (isOpen) {
      setIdNovoGrupo("");
      setMotivo("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idNovoGrupo) {
      toast.error(t("toast.errorNoGroup"));
      return;
    }
    try {
      await moverGrupo({
        idsBufalos: [bufalo.idBufalo],
        idNovoGrupo,
        ...(motivo.trim() && { motivo: motivo.trim() }),
      });
      toast.success(t("toast.success"));
      onMoved?.();
      onClose();
    } catch {
      toast.error(t("toast.error"));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("title")} size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Resumo do animal / grupo atual */}
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 border border-zinc-100 p-4">
          <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
            <ArrowRightLeft className="w-4 h-4 text-violet-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-800 truncate">{bufalo.nome}</p>
            <p className="text-xs text-zinc-500">
              {t("currentGroup")}: <span className="font-medium text-zinc-600">{grupoAtualNome ?? t("noGroup")}</span>
            </p>
          </div>
        </div>

        {/* Sem grupos disponíveis */}
        {!isLoadingGrupos && grupos.length === 0 && (
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              {t("noGroupsAvailable")}
            </p>
          </div>
        )}

        {/* Grupo de destino */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">{t("fields.targetGroup")}</label>
          <select
            required
            value={idNovoGrupo}
            onChange={e => setIdNovoGrupo(e.target.value)}
            disabled={isLoadingGrupos || grupos.length === 0}
            className={inputClass}
          >
            <option value="" disabled>
              {isLoadingGrupos ? t("fields.loadingGroups") : t("fields.selectGroup")}
            </option>
            {grupos.map(g => (
              <option key={g.idGrupo} value={g.idGrupo}>{g.nomeGrupo}</option>
            ))}
          </select>
        </div>

        {/* Motivo (opcional) */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">
            {t("fields.reason")} <span className="text-zinc-400 font-normal">{t("fields.optional")}</span>
          </label>
          <textarea
            rows={3}
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Ex: Transferência para grupo de lactação..."
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isMovendoGrupo}>
            {t("actions.cancel")}
          </Button>
          <Button type="submit" variant="primary" isLoading={isMovendoGrupo} disabled={grupos.length === 0}>
            <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" />
            {t("actions.move")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
