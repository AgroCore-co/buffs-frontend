"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FlaskConical, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import Container from "@/components/ui/Container";
import {
  DataTable,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { usePropriedadeStore } from "@/stores/propriedade.store";
import { useMaterialGeneticoByPropriedade, useMaterialGenetico } from "@/hooks/useMaterialGenetico";
import type { MaterialGenetico } from "@/services/material-genetico.service";
import { MaterialGeneticoDetailModal } from "@/components/proprietario/material-genetico/MaterialGeneticoDetailModal";
import { MaterialGeneticoFormModal } from "@/components/proprietario/material-genetico/MaterialGeneticoFormModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value?: string | null) {
  if (!value) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.slice(0, 10));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "—";
}

function tipoBadge(tipo?: string | null): string {
  if (tipo === "Sêmen") return "bg-blue-100 text-blue-800";
  if (tipo === "Embrião") return "bg-purple-100 text-purple-800";
  if (tipo === "Óvulo") return "bg-pink-100 text-pink-800";
  return "bg-zinc-100 text-zinc-700";
}

const TABLE_LIMIT = 10;

export default function MaterialGeneticoPage() {
  const t = useTranslations("MaterialGeneticoPage");
  const { activeId, activePropriedade } = usePropriedadeStore();
  const hasActive = !!activeId;

  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<MaterialGenetico | null>(null);
  const [editing, setEditing] = useState<MaterialGenetico | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data, isLoading } = useMaterialGeneticoByPropriedade(
    activeId ?? "",
    { page, limit: TABLE_LIMIT },
    { enabled: hasActive },
  );

  const { deleteMaterialGenetico, isDeleting } = useMaterialGenetico();

  const registros = data?.data ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const toastId = toast.loading(t("toast.deleting"));
    try {
      await deleteMaterialGenetico(id);
      toast.success(t("toast.deleteSuccess"), { id: toastId });
    } catch {
      toast.error(t("toast.deleteError"), { id: toastId });
    }
  };

  const handleEdit = (e: React.MouseEvent, registro: MaterialGenetico) => {
    e.stopPropagation();
    setEditing(registro);
    setIsFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* ── Header ────────────────────────────────────────────────── */}
      <Container className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#404040]">
              {t("title")}
              {activePropriedade?.nome ? ` - ${activePropriedade.nome}` : ""}
            </h1>
            <p className="text-sm text-[#404040]/60 mt-1">{t("subtitle")}</p>
          </div>
          {hasActive && (
            <Button
              variant="primary"
              onClick={() => {
                setEditing(null);
                setIsFormOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {t("actions.new")}
            </Button>
          )}
        </div>
      </Container>

      {/* ── Tabela ────────────────────────────────────────────────── */}
      <Container className="p-5">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-[#404040]">{t("table.title")}</h2>
          <p className="text-sm text-[#404040]/60 mt-1">{t("table.subtitle")}</p>
        </div>

        {isLoading && hasActive ? (
          <div className="w-full min-h-[240px] flex items-center justify-center border border-zinc-200 rounded-xl bg-zinc-50/50">
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
              <span className="text-sm font-medium">{t("table.loading")}</span>
            </div>
          </div>
        ) : (
          <DataTable
            isEmpty={registros.length === 0}
            pagination={
              total > 0
                ? {
                    page,
                    totalPages,
                    onPageChange: setPage,
                    hasPrevPage: meta?.hasPrevPage,
                    hasNextPage: meta?.hasNextPage,
                    total,
                    limit: TABLE_LIMIT,
                  }
                : undefined
            }
            emptyState={
              <TableEmptyState
                icon={FlaskConical}
                title={hasActive ? t("table.emptyTitle") : t("table.emptyTitleNoProperty")}
                description={
                  hasActive ? t("table.emptyDesc") : t("table.emptyDescNoProperty")
                }
              />
            }
          >
            <TableHeader>
              <TableHead>{t("table.headers.tipo")}</TableHead>
              <TableHead>{t("table.headers.origem")}</TableHead>
              <TableHead>{t("table.headers.fornecedorOuBufalo")}</TableHead>
              <TableHead>{t("table.headers.dataColeta")}</TableHead>
              <TableHead align="right">{t("table.headers.actions")}</TableHead>
            </TableHeader>
            <TableBody>
              {registros.map((r: MaterialGenetico) => (
                <TableRow key={r.idMaterial} onClick={() => setSelected(r)}>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${tipoBadge(r.tipo)}`}
                    >
                      {r.tipo ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-700">{r.origem ?? "—"}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-700">
                      {r.origem === "Compra" ? (r.fornecedor ?? "—") : (r.idBufaloOrigem ?? "—")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-600">{formatDate(r.dataColeta)}</span>
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => handleEdit(e, r)}
                        className="p-1.5 rounded-md text-zinc-500 hover:text-[#ce7d0a] hover:bg-zinc-100 transition-colors"
                        title={t("actions.edit")}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, r.idMaterial)}
                        disabled={isDeleting}
                        className="p-1.5 rounded-md text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title={t("actions.delete")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DataTable>
        )}

        {hasActive && !isLoading && total > 0 && (
          <p className="text-sm text-zinc-500 mt-4">
            {t("table.showing", {
              from: (page - 1) * TABLE_LIMIT + 1,
              to: Math.min(page * TABLE_LIMIT, total),
              total,
            })}
          </p>
        )}
      </Container>

      {/* ── Modais ────────────────────────────────────────────────── */}
      <MaterialGeneticoDetailModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        registro={selected}
      />

      <MaterialGeneticoFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditing(null);
        }}
        idPropriedade={activeId ?? ""}
        registro={editing}
        onSaved={() => setPage(1)}
      />
    </div>
  );
}
