"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Pill, Syringe, Layers, Plus, Trash2, Pencil } from "lucide-react";

import Container from "@/components/ui/Container";
import MetricCard from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  DataTable,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/DataTable";
import { useMedicamentosByPropriedade, useMedicamentos } from "@/hooks/useMedicamentos";
import {
  isVacina,
  getTipoInfo,
  type Medicacao,
} from "@/services/medicamentos.service";
import { usePropriedadeStore } from "@/stores/propriedade.store";
import { MedicamentoFormModal } from "@/components/proprietario/medicamentos/MedicamentoFormModal";
import { DeletedMedicamentosModal } from "@/components/proprietario/medicamentos/DeletedMedicamentosModal";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

export default function MedicamentosPage() {
  const t = useTranslations('MedicamentosPage');
  const { activeId, activePropriedade } = usePropriedadeStore();
  const hasActive = !!activeId;

  const [tipoFiltro, setTipoFiltro] = useState<string>("TODOS");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Medicacao | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [toDelete, setToDelete] = useState<Medicacao | null>(null);

  const { data: medicamentos = [], isLoading } = useMedicamentosByPropriedade(activeId ?? "", {
    enabled: hasActive,
  });
  const { deleteMedicamento, isDeletingMedicamento } = useMedicamentos();

  // Chips de filtro derivados dos tipos realmente presentes nos dados
  // (cobre tipos legados fora do enum: "Tratamento", "Curativo", "Anticoccidiano"...).
  const tiposPresentes = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of medicamentos) {
      const info = getTipoInfo(m.tipoTratamento);
      if (!map.has(info.key)) map.set(info.key, info.label);
    }
    return Array.from(map, ([key, label]) => ({ key, label })).sort((a, b) =>
      a.label.localeCompare(b.label, "pt-BR"),
    );
  }, [medicamentos]);

  const filtrados = useMemo(() => {
    if (tipoFiltro === "TODOS") return medicamentos;
    return medicamentos.filter(m => getTipoInfo(m.tipoTratamento).key === tipoFiltro);
  }, [medicamentos, tipoFiltro]);

  const totalMed   = medicamentos.length;
  const totalVacinas = useMemo(() => medicamentos.filter(isVacina).length, [medicamentos]);
  const tiposDistintos = tiposPresentes.length;
  const filtroLabel = tiposPresentes.find(tp => tp.key === tipoFiltro)?.label;

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (m: Medicacao) => { setEditing(m); setFormOpen(true); };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteMedicamento(toDelete.idMedicacao);
      toast.success(t('toast.deleteSuccess'));
      setToDelete(null);
    } catch {
      toast.error(t('toast.deleteError'));
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Header com métricas */}
      <Container className="p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-[#404040]">
                {t('title')}{activePropriedade?.nome ? ` - ${activePropriedade.nome}` : ""}
              </h1>
              <p className="text-sm text-[#404040]/60 mt-1">
                {t('subtitle')}
              </p>
            </div>
            {hasActive && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowDeleted(true)} className="text-zinc-400 hover:text-zinc-700">
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  {t('viewDeleted')}
                </Button>
                <Button variant="primary" size="sm" onClick={openCreate}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  {t('newMedication')}
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <MetricCard
              title={t('metrics.total')}
              value={!hasActive ? "0" : isLoading ? "..." : String(totalMed)}
              subtitle={t('metrics.totalDesc')}
              icon={<Pill className="w-4 h-4" />}
            />
            <MetricCard
              title={t('metrics.vaccines')}
              value={!hasActive ? "0" : isLoading ? "..." : String(totalVacinas)}
              subtitle={t('metrics.vaccinesDesc')}
              icon={<Syringe className="w-4 h-4" />}
            />
            <MetricCard
              title={t('metrics.distinctTypes')}
              value={!hasActive ? "0" : isLoading ? "..." : String(tiposDistintos)}
              subtitle={t('metrics.distinctTypesDesc')}
              icon={<Layers className="w-4 h-4" />}
            />
          </div>
        </div>
      </Container>

      <Container className="p-5">
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">{t('table.title')}</h2>
            {!isLoading && hasActive && (
              <p className="text-xs text-zinc-500 mt-0.5">
                {t('table.count', { count: filtrados.length })}
                {tipoFiltro !== "TODOS" && filtroLabel ? ` · ${filtroLabel}` : ""}
              </p>
            )}
          </div>

          {/* Filtro por tipo */}
          {hasActive && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <FilterChip active={tipoFiltro === "TODOS"} onClick={() => setTipoFiltro("TODOS")}>
                {t('table.all')}
              </FilterChip>
              {tiposPresentes.map(tp => (
                <FilterChip key={tp.key} active={tipoFiltro === tp.key} onClick={() => setTipoFiltro(tp.key)}>
                  {tp.label}
                </FilterChip>
              ))}
            </div>
          )}
        </div>

        {isLoading && hasActive ? (
          <div className="w-full min-h-[240px] flex items-center justify-center border border-zinc-200 rounded-xl bg-zinc-50/50">
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
              <span className="text-sm font-medium">{t('table.loading')}</span>
            </div>
          </div>
        ) : (
          <DataTable
            isEmpty={filtrados.length === 0}
            emptyState={
              <TableEmptyState
                icon={Pill}
                title={hasActive ? t('table.emptyTitle') : t('table.emptyTitleNoProperty')}
                description={
                  hasActive
                    ? t('table.emptyDesc')
                    : t('table.emptyDescNoProperty')
                }
              />
            }
          >
            <TableHeader>
              <TableHead>{t('table.headers.medication')}</TableHead>
              <TableHead>{t('table.headers.type')}</TableHead>
              <TableHead>{t('table.headers.description')}</TableHead>
              <TableHead>{t('table.headers.createdAt')}</TableHead>
              <TableHead align="right">{t('table.headers.actions')}</TableHead>
            </TableHeader>
            <TableBody>
              {filtrados.map((m) => {
                const info = getTipoInfo(m.tipoTratamento);
                return (
                  <TableRow key={m.idMedicacao} onClick={() => openEdit(m)}>
                    <TableCell>
                      <span className="text-sm font-semibold text-zinc-900">{m.medicacao || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${info.badge}`}>
                        {info.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-zinc-600">{m.descricao || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-zinc-700">{formatDate(m.createdAt)}</span>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(m); }}
                          className="p-1.5 rounded-md text-zinc-400 hover:text-[#ce7d0a] hover:bg-zinc-100 transition-colors"
                          aria-label={t('edit')}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setToDelete(m); }}
                          className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label={t('remove')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </DataTable>
        )}
      </Container>

      {/* ── Modais ───────────────────────────────────────────────── */}
      {hasActive && (
        <>
          <MedicamentoFormModal
            isOpen={formOpen}
            onClose={() => setFormOpen(false)}
            idPropriedade={activeId!}
            medicamento={editing}
            onSaved={() => setFormOpen(false)}
          />

          <DeletedMedicamentosModal
            isOpen={showDeleted}
            onClose={() => setShowDeleted(false)}
            idPropriedade={activeId!}
          />
        </>
      )}

      <Modal isOpen={!!toDelete} onClose={() => setToDelete(null)} title={t('deleteModal.title')} size="sm">
        <div className="flex flex-col items-center text-center gap-5 py-2">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-zinc-900">{t('deleteModal.confirm')}</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              {t('deleteModal.description', { name: toDelete?.medicacao ?? '' })}
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => setToDelete(null)} disabled={isDeletingMedicamento}>
              {t('deleteModal.cancel')}
            </Button>
            <Button variant="danger" className="flex-1" isLoading={isDeletingMedicamento} onClick={handleConfirmDelete}>
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              {t('deleteModal.yesRemove')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active
          ? "bg-[#ffcf78] text-[#404040]"
          : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
      }`}
    >
      {children}
    </button>
  );
}
