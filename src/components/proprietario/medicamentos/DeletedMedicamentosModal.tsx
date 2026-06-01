"use client";

import React, { useMemo } from "react";
import { toast } from "sonner";
import { RotateCcw, Pill, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useMedicamentos, useMedicamentosDeleted } from "@/hooks/useMedicamentos";
import { getTipoInfo, type Medicacao } from "@/services/medicamentos.service";

interface RowProps {
  medicamento: Medicacao;
  onRestore: (id: string) => void;
  isRestoring: boolean;
  restoringId: string | null;
}

function MedicamentoRow({ medicamento, onRestore, isRestoring, restoringId }: RowProps) {
  const isThis = isRestoring && restoringId === medicamento.idMedicacao;
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-zinc-50 last:border-0 hover:bg-zinc-50/60 transition-colors">
      <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
        <Pill className="w-4 h-4 text-zinc-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-700 truncate">{medicamento.medicacao ?? "—"}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-zinc-400">{getTipoInfo(medicamento.tipoTratamento).label}</span>
          {medicamento.descricao && (
            <>
              <span className="text-zinc-300 text-xs">·</span>
              <span className="text-xs text-zinc-400 truncate">{medicamento.descricao}</span>
            </>
          )}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        isLoading={isThis}
        disabled={isRestoring}
        onClick={() => onRestore(medicamento.idMedicacao)}
        className="flex-shrink-0"
      >
        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
        Restaurar
      </Button>
    </div>
  );
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  idPropriedade: string;
}

export function DeletedMedicamentosModal({ isOpen, onClose, idPropriedade }: Props) {
  const [restoringId, setRestoringId] = React.useState<string | null>(null);
  const { data: todos = [], isLoading } = useMedicamentosDeleted({ enabled: isOpen });
  const { restoreMedicamento, isRestoringMedicamento } = useMedicamentos();

  const deletados = useMemo(
    () => todos.filter(m => !!m.deletedAt && (!m.idPropriedade || m.idPropriedade === idPropriedade)),
    [todos, idPropriedade],
  );

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    try {
      await restoreMedicamento(id);
      toast.success("Medicação restaurada com sucesso.");
    } catch {
      toast.error("Erro ao restaurar medicação.");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Medicações Removidas"
      description="Medicações removidas desta propriedade. Restaure qualquer uma para reativá-la."
      size="lg"
    >
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-40 gap-2 text-zinc-400">
          <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
          <span className="text-sm">Carregando medicações...</span>
        </div>
      )}

      {!isLoading && deletados.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-500">Nenhuma medicação removida</p>
            <p className="text-xs text-zinc-400 mt-0.5">Não há medicações removidas nesta propriedade.</p>
          </div>
        </div>
      )}

      {!isLoading && deletados.length > 0 && (
        <div className="-mx-6 -mt-2">
          <div className="px-6 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <p className="text-xs text-amber-700 font-medium">
              {deletados.length} medicação{deletados.length !== 1 ? "ões" : ""} removida{deletados.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="divide-y divide-zinc-50">
            {deletados.map(m => (
              <MedicamentoRow
                key={m.idMedicacao}
                medicamento={m}
                onRestore={handleRestore}
                isRestoring={isRestoringMedicamento}
                restoringId={restoringId}
              />
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
