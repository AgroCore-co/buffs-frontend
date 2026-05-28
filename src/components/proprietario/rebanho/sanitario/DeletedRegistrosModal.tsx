"use client";

import React, { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RotateCcw, Syringe, Calendar, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { dadosSanitariosService } from "@/services/dados-sanitarios.service";
import { useDadosSanitariosWithDeleted } from "@/hooks/useDadosSanitarios";
import type { DadoSanitario } from "@/services/dados-sanitarios.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

function getMedicacao(reg: DadoSanitario) {
  return reg.medicacoe ?? reg.medicacoes;
}

// ─── Linha do registro deletado ───────────────────────────────────────────────

interface RegistroRowProps {
  registro: DadoSanitario;
  onRestore: (id: string) => void;
  isRestoring: boolean;
  restoringId: string | null;
}

function RegistroRow({ registro, onRestore, isRestoring, restoringId }: RegistroRowProps) {
  const med = getMedicacao(registro);
  const isThisRestoring = isRestoring && restoringId === registro.idSanit;

  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-zinc-50 last:border-0 hover:bg-zinc-50/60 transition-colors">

      {/* Ícone */}
      <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
        <Syringe className="w-4 h-4 text-zinc-400" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-700 truncate">
          {med?.medicacao ?? registro.doenca}
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-zinc-400 capitalize">{registro.doenca}</span>
          <span className="text-zinc-300 text-xs">·</span>
          <span className="text-xs text-zinc-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(registro.dtAplicacao)}
          </span>
          <span className="text-zinc-300 text-xs">·</span>
          <span className="text-xs font-mono text-zinc-400">
            {registro.dosagem} {registro.unidadeMedida}
          </span>
        </div>
      </div>

      {/* Data de remoção */}
      <div className="text-right flex-shrink-0 hidden sm:block">
        <p className="text-[10px] text-zinc-400 uppercase tracking-wide font-bold">Removido em</p>
        <p className="text-xs text-red-400 font-medium">{formatDate(registro.deletedAt)}</p>
      </div>

      {/* Botão restaurar */}
      <Button
        variant="outline"
        size="sm"
        isLoading={isThisRestoring}
        disabled={isRestoring}
        onClick={() => onRestore(registro.idSanit)}
        className="flex-shrink-0"
      >
        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
        Restaurar
      </Button>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
  idBufalo: string;
  onMutated?: () => void;
}

export function DeletedRegistrosModal({ isOpen, onClose, idBufalo, onMutated }: Props) {
  const queryClient = useQueryClient();
  const [restoringId, setRestoringId] = React.useState<string | null>(null);

  const { data: todos = [], isLoading } = useDadosSanitariosWithDeleted();

  const deletados = useMemo(
    () => todos.filter(r => r.idBufalo === idBufalo && !!r.deletedAt),
    [todos, idBufalo],
  );

  const restoreMutation = useMutation({
    mutationFn: (id: string) => dadosSanitariosService.restore(id),
    onMutate: (id) => setRestoringId(id),
    onSuccess: () => {
      toast.success("Registro restaurado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["dados-sanitarios"] });
      onMutated?.();
      setRestoringId(null);
    },
    onError: () => {
      toast.error("Erro ao restaurar registro.");
      setRestoringId(null);
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registros Removidos"
      description="Registros sanitários removidos deste búfalo. Restaure qualquer um para reativá-lo."
      size="lg"
    >
      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-40 gap-2 text-zinc-400">
          <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
          <span className="text-sm">Carregando registros...</span>
        </div>
      )}

      {/* Vazio */}
      {!isLoading && deletados.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-500">Nenhum registro removido</p>
            <p className="text-xs text-zinc-400 mt-0.5">Este búfalo não possui registros sanitários removidos.</p>
          </div>
        </div>
      )}

      {/* Lista */}
      {!isLoading && deletados.length > 0 && (
        <div className="-mx-6 -mt-2">
          <div className="px-6 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <p className="text-xs text-amber-700 font-medium">
              {deletados.length} registro{deletados.length !== 1 ? "s" : ""} removido{deletados.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="divide-y divide-zinc-50">
            {deletados.map(reg => (
              <RegistroRow
                key={reg.idSanit}
                registro={reg}
                onRestore={id => restoreMutation.mutate(id)}
                isRestoring={restoreMutation.isPending}
                restoringId={restoringId}
              />
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
