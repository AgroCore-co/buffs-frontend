"use client";

import { useState } from "react";
import { Droplets, CheckCircle2, XCircle, PackageSearch } from "lucide-react";
import Container from "@/components/ui/Container";
import Badge from "@/components/ui/Badge";
import {
  DataTable,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/DataTable";
import { usePropriedadeStore } from "@/stores/propriedade.store";
import { useColetas } from "@/hooks/useColeta";
import { ColetaModal } from "@/components/proprietario/coleta/ColetaModal";
import type { Coleta } from "@/services/coleta.service";

// ── helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  const datePart = dateStr.split(" ")[0].split("T")[0];
  const [y, m, d] = datePart.split("-");
  return `${d}/${m}/${y}`;
}

function formatVolume(val?: string | number | null) {
  if (val === undefined || val === null) return "—";
  return `${parseFloat(String(val)).toLocaleString("pt-BR")} L`;
}

const LIMIT = 10;

// ── page ──────────────────────────────────────────────────────────────────────

export default function ColetaPage() {
  const { activeId } = usePropriedadeStore();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Coleta | null>(null);

  const { data, isLoading } = useColetas(activeId ?? undefined, page, LIMIT);
  const coletas = data?.data ?? [];
  const meta = data?.meta;
  const totalItems = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <Container className="p-5">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#404040] flex items-center gap-2">
              <Droplets size={22} className="text-[#ce7d0a]" />
              Coletas da Indústria
            </h1>
            <p className="text-sm text-[#404040]/60 mt-0.5">
              Monitoramento da produção de leite de búfalas.
            </p>
          </div>
        </div>
      </Container>

      {/* ── Tabela ─────────────────────────────────────────────────── */}
      <Container className="p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <div>
            <h2 className="text-base font-bold text-[#404040]">
              Registro de Coletas
            </h2>
            <p className="text-sm text-[#404040]/60">
              {activeId ? (
                <>
                  {isLoading ? "Carregando..." : <strong>{totalItems} coletas registradas</strong>}
                </>
              ) : (
                "Selecione uma propriedade para ver as coletas."
              )}
            </p>
          </div>
        </div>

        <DataTable
          isEmpty={!isLoading && coletas.length === 0}
          emptyState={
            <TableEmptyState
              icon={PackageSearch}
              title={
                activeId
                  ? "Nenhuma coleta encontrada"
                  : "Nenhuma propriedade selecionada"
              }
              description={
                activeId
                  ? "Não há coletas registradas para esta propriedade."
                  : "Selecione uma propriedade no seletor do cabeçalho."
              }
            />
          }
          pagination={
            totalPages > 1
              ? { page, totalPages, onPageChange: setPage }
              : undefined
          }
        >
          <TableHeader>
            <TableHead>Data da Coleta</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Observação</TableHead>
            <TableHead>Status</TableHead>
          </TableHeader>

          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-zinc-100 rounded animate-pulse w-20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : coletas.map((coleta) => (
                  <TableRow
                    key={coleta.id_coleta ?? coleta.id}
                    onClick={() => setSelected(coleta)}
                  >
                    <TableCell>
                      <span className="font-medium text-gray-700">
                        {formatDate(coleta.dt_coleta)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-700">
                        {coleta.nome_empresa || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-gray-800">
                        {formatVolume(coleta.quantidade)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {coleta.observacao ? (
                        <span
                          className="text-sm text-gray-600 max-w-[200px] block truncate"
                          title={coleta.observacao}
                        >
                          {coleta.observacao}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {coleta.resultado_teste ? (
                          <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                        ) : (
                          <XCircle size={14} className="text-red-500 shrink-0" />
                        )}
                        <Badge type={coleta.resultado_teste ? "active" : "inactive"}>
                          {coleta.resultado_teste ? "Aprovado" : "Reprovado"}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </DataTable>

        {!isLoading && coletas.length > 0 && (
          <p className="text-xs text-gray-500 mt-3">
            Mostrando {Math.min(LIMIT, totalItems)} de {totalItems} registros
          </p>
        )}
      </Container>

      <ColetaModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        data={selected}
      />
    </div>
  );
}
