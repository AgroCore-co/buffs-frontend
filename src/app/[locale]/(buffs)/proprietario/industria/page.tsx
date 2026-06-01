"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Factory,
  Plus,
  Building2,
  User,
  Phone,
  Calendar,
  Search,
  PackageSearch,
} from "lucide-react";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
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
import { useLaticiniosByPropriedade } from "@/hooks/useColeta";
import { IndustriaFormModal } from "@/components/proprietario/industria/IndustriaFormModal";
import { IndustriaDetalheModal } from "@/components/proprietario/industria/IndustriaDetalheModal";
import type { Laticinio } from "@/services/coleta.service";

// ── helpers ───────────────────────────────────────────────────────────────────

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function IndustriaPage() {
  const t = useTranslations("Proprietario.industria");
  const { activeId } = usePropriedadeStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [isCriarOpen, setIsCriarOpen] = useState(false);
  const [selectedDetalhe, setSelectedDetalhe] = useState<Laticinio | null>(null);
  const [selectedEditar, setSelectedEditar] = useState<Laticinio | null>(null);

  const { data: laticinios = [], isLoading } = useLaticiniosByPropriedade(
    activeId ?? undefined,
  );

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return laticinios;
    return laticinios.filter(
      (item) =>
        item.nome.toLowerCase().includes(term) ||
        item.representante?.toLowerCase().includes(term),
    );
  }, [laticinios, searchTerm]);

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <Container className="p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#404040] flex items-center gap-2">
              <Factory size={22} className="text-[#ce7d0a]" />
              {t("title")}
            </h1>
            <p className="text-sm text-[#404040]/60 mt-0.5">{t("subtitle")}</p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            className="font-bold shadow-sm shrink-0"
            onClick={() => setIsCriarOpen(true)}
          >
            {t("newIndustry")}
          </Button>
        </div>
      </Container>

      {/* ── Lista ──────────────────────────────────────────────────── */}
      <Container className="p-5">
        {/* Busca */}
        <div className="relative mb-5">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffcf78]/50 focus:border-[#ffcf78] bg-gray-50 transition-all"
          />
        </div>

        <DataTable
          isEmpty={!isLoading && filtered.length === 0}
          emptyState={
            <TableEmptyState
              icon={PackageSearch}
              title={
                !activeId
                  ? t("empty.noProperty")
                  : searchTerm
                    ? t("empty.notFound")
                    : t("empty.none")
              }
              description={
                !activeId
                  ? t("empty.noPropertyDesc")
                  : searchTerm
                    ? t("empty.notFoundDesc")
                    : t("empty.noneDesc")
              }
              action={
                !searchTerm && activeId ? (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={() => setIsCriarOpen(true)}
                  >
                    {t("newIndustry")}
                  </Button>
                ) : undefined
              }
            />
          }
        >
          <TableHeader>
            <TableHead>{t("headers.name")}</TableHead>
            <TableHead>{t("headers.representative")}</TableHead>
            <TableHead>{t("headers.contact")}</TableHead>
            <TableHead>{t("headers.observation")}</TableHead>
            <TableHead>{t("headers.registeredAt")}</TableHead>
          </TableHeader>

          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-zinc-100 rounded animate-pulse w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : filtered.map((item) => (
                  <TableRow
                    key={item.id_industria ?? item.id}
                    onClick={() => setSelectedDetalhe(item)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="bg-[#ffcf78]/20 p-1.5 rounded-full text-[#ce7d0a] shrink-0">
                          <Building2 size={13} />
                        </div>
                        <span className="font-bold text-gray-800 text-sm">
                          {item.nome}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-gray-700 text-sm">
                        <User size={13} className="text-gray-400 shrink-0" />
                        {item.representante || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-gray-700 text-sm">
                        <Phone size={13} className="text-gray-400 shrink-0" />
                        {item.contato || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.observacao ? (
                        <span
                          className="text-sm text-gray-500 max-w-[200px] block truncate"
                          title={item.observacao}
                        >
                          {item.observacao}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                        <Calendar size={13} className="text-gray-400 shrink-0" />
                        {formatDate(item.created_at ?? item.createdAt)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </DataTable>

        {!isLoading && filtered.length > 0 && (
          <p className="text-xs text-gray-500 mt-3">
            {t("showing", { count: filtered.length })}
          </p>
        )}
      </Container>

      {/* ── Modais ─────────────────────────────────────────────────── */}
      <IndustriaFormModal
        isOpen={isCriarOpen}
        onClose={() => setIsCriarOpen(false)}
      />

      <IndustriaFormModal
        isOpen={!!selectedEditar}
        onClose={() => setSelectedEditar(null)}
        data={selectedEditar}
      />

      <IndustriaDetalheModal
        isOpen={!!selectedDetalhe}
        onClose={() => setSelectedDetalhe(null)}
        data={selectedDetalhe}
        idPropriedade={activeId ?? undefined}
        onEdit={(industria) => {
          setSelectedDetalhe(null);
          setSelectedEditar(industria);
        }}
      />
    </div>
  );
}
