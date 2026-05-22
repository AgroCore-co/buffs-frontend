"use client";

import { useState, useCallback } from "react";
import { useRouter } from "@/i18n/routing";

import Badge from "@/components/ui/Badge";
import Container from "@/components/ui/Container";
import MaturidadeChart from "@/components/proprietario/rebanho/MaturidadeChart";
import RacaChart from "@/components/proprietario/rebanho/RacaChart";
import SexoChart from "@/components/proprietario/rebanho/SexoChart";
import { BufalosFilterBar } from "@/components/proprietario/rebanho/BufalosFilterBar";
import {
  DataTable,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/DataTable";
import MetricCard from "@/components/ui/MetricCard";
import { useBufalosbyPropriedade, useBufalosFilterAvancado } from "@/hooks/useBufalos";
import { useDashboardGeral } from "@/hooks/useDashboard";
import { Bufalo, FiltroAvancadoParams } from "@/services/bufalos.service";
import { usePropriedadeStore } from "@/stores/propriedade.store";

import { Database, Venus, Mars, Droplets } from "lucide-react";

interface BufaloListItem extends Bufalo {
  raca?: { nome?: string | null } | null;
  grupo?: { nomeGrupo?: string | null } | null;
  nomeRaca?: string | null;
}

export default function RebanhoPage() {
  const router = useRouter();
  const { activeId, activePropriedade } = usePropriedadeStore();
  const [page, setPage] = useState(1);
  const [prevActiveId, setPrevActiveId] = useState(activeId);
  const [filtroParams, setFiltroParams] = useState<FiltroAvancadoParams>({});
  const [hasFilters, setHasFilters] = useState(false);
  const limit = 10;

  if (prevActiveId !== activeId) {
    setPrevActiveId(activeId);
    setPage(1);
  }

  const handleFilterChange = useCallback((params: FiltroAvancadoParams, active: boolean) => {
    setFiltroParams(params);
    setHasFilters(active);
    setPage(1);
  }, []);

  const { data: dashboardData, isLoading: isLoadingDashboard } = useDashboardGeral(activeId ?? "", {
    enabled: !!activeId,
  });

  const { data: allBufalos, isLoading: isLoadingAll } = useBufalosbyPropriedade(
    activeId ?? "",
    page,
    limit,
    { enabled: !!activeId && !hasFilters },
  );

  const { data: filteredBufalos, isLoading: isLoadingFiltered } = useBufalosFilterAvancado(
    activeId ?? "",
    { ...filtroParams, page, limit },
    { enabled: !!activeId && hasFilters },
  );

  const bufalosResponse = hasFilters ? filteredBufalos : allBufalos;
  const isLoadingBufalos = hasFilters ? isLoadingFiltered : isLoadingAll;

  const totalFemeas = dashboardData?.qtdFemeasAtivas ?? 0;
  const totalMachos = dashboardData?.qtdMachoAtivos ?? 0;
  const totalAtivos = totalFemeas + totalMachos;
  const totalLactando = dashboardData?.qtdBufalasLactando ?? 0;
  const hasActivePropriedade = !!activeId;
  const maturidadeData = [
    {
      name: "Bezerros",
      value: dashboardData?.qtdBufalosBezerro ?? 0,
      color: "#CE7D0A",
    },
    {
      name: "Novilhas",
      value: dashboardData?.qtdBufalosNovilha ?? 0,
      color: "#F2B84D",
    },
    {
      name: "Vacas",
      value: dashboardData?.qtdBufalosVaca ?? 0,
      color: "#FFCF78",
    },
    {
      name: "Touros",
      value: dashboardData?.qtdBufalosTouro ?? 0,
      color: "#A16207",
    },
  ];
  const sexoData = {
    femeas: totalFemeas,
    machos: totalMachos,
  };
  const racaData = dashboardData?.bufalosPorRaca ?? [];
  const bufalos = (bufalosResponse?.data ?? []) as BufaloListItem[];
  const meta = bufalosResponse?.meta ?? {
    page,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    total: 0,
  };

  const formatValue = (value: number) => {
    if (!hasActivePropriedade) return "0";
    if (isLoadingDashboard) return "...";
    return value.toString();
  };

  const formatPercent = (value: number, total: number) => {
    if (!hasActivePropriedade) return "Selecione uma propriedade";
    if (isLoadingDashboard) return "Carregando...";
    if (total <= 0) return "0% do rebanho";
    const percent = Math.round((value / total) * 100);
    return `${percent}% do rebanho`;
  };

  const formatSexo = (sexo?: string) => (sexo === "F" ? "Fêmea" : sexo === "M" ? "Macho" : "—");

  const formatMaturidade = (nivel?: string) => {
    const map: Record<string, string> = {
      B: "Bezerro",
      N: "Novilha",
      V: "Vaca",
      T: "Touro",
    };
    return nivel ? map[nivel] || nivel : "—";
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Header com métricas */}
      <Container className="p-5">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#404040]">
              Gestão do Rebanho{activePropriedade?.nome ? ` - ${activePropriedade.nome}` : ""}
            </h1>
            <p className="text-sm text-[#404040]/60 mt-1">
              Gerencie seu rebanho de búfalos, registre informações zootécnicas
              e sanitárias.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
            <MetricCard
              title="Total do Rebanho"
              value={formatValue(totalAtivos)}
              subtitle="Búfalos ativos (Machos + Fêmeas)"
              icon={<Database className="w-4 h-4" />}
            />

            <MetricCard
              title="Fêmeas"
              value={formatValue(totalFemeas)}
              subtitle={formatPercent(totalFemeas, totalAtivos)}
              icon={<Venus className="w-4 h-4" />}
            />

            <MetricCard
              title="Machos"
              value={formatValue(totalMachos)}
              subtitle={formatPercent(totalMachos, totalAtivos)}
              icon={<Mars className="w-4 h-4" />}
            />

            <MetricCard
              title="Vacas Produtoras"
              value={formatValue(totalLactando)}
              subtitle="Em lactação"
              icon={<Droplets className="w-4 h-4" />}
            />
          </div>
        </div>
      </Container>

      {/* CORREÇÃO: Alterado lg:grid-cols-2 para lg:grid-cols-3 e xl:grid-cols-3 para colocar os 3 na mesma linha */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MaturidadeChart
          data={maturidadeData}
          isLoading={isLoadingDashboard}
          hasActivePropriedade={hasActivePropriedade}
        />
        <SexoChart
          data={sexoData}
          isLoading={isLoadingDashboard}
          hasActivePropriedade={hasActivePropriedade}
        />
        <RacaChart
          data={racaData}
          isLoading={isLoadingDashboard}
          hasActivePropriedade={hasActivePropriedade}
        />


        
      </div>

      <Container className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Búfalos da Propriedade</h2>
            {!isLoadingBufalos && hasActivePropriedade && (
              <p className="text-xs text-zinc-500 mt-0.5">
                {meta.total.toLocaleString("pt-BR")} animal{meta.total !== 1 ? "is" : ""} no total
              </p>
            )}
          </div>
        </div>

        <BufalosFilterBar onFilterChange={handleFilterChange} className="mb-4" />

        {isLoadingBufalos ? (
          <div className="w-full min-h-[240px] flex items-center justify-center border border-zinc-200 rounded-xl bg-zinc-50/50">
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
              <span className="text-sm font-medium">Carregando búfalos...</span>
            </div>
          </div>
        ) : (
          <DataTable
            isEmpty={bufalos.length === 0}
            pagination={
              hasActivePropriedade
                ? {
                    page: meta.page,
                    totalPages: meta.totalPages,
                    hasNextPage: meta.hasNextPage,
                    hasPrevPage: meta.hasPrevPage,
                    onPageChange: setPage,
                  }
                : undefined
            }
            emptyState={
              <TableEmptyState
                icon={Database}
                title={hasActivePropriedade ? "Nenhum búfalo encontrado" : "Selecione uma propriedade"}
                description={
                  hasActivePropriedade
                    ? "Não há búfalos cadastrados para esta propriedade."
                    : "Escolha uma propriedade para visualizar o rebanho."
                }
              />
            }
          >
            <TableHeader>
              <TableHead>Nome</TableHead>
              <TableHead>Brinco</TableHead>
              <TableHead>Sexo</TableHead>
              <TableHead>Maturidade</TableHead>
              <TableHead>Raça</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Nascimento</TableHead>
              <TableHead align="right">Status</TableHead>
            </TableHeader>
            <TableBody>
              {bufalos.map((bufalo) => (
                <TableRow key={bufalo.idBufalo} onClick={() => router.push(`/proprietario/rebanho/${bufalo.idBufalo}`)}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-zinc-900">{bufalo.nome}</span>
                      <span className="text-xs text-zinc-500 mt-0.5">
                        {bufalo.categoria || "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-700">{bufalo.brinco}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-700">{formatSexo(bufalo.sexo)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-700">{formatMaturidade(bufalo.nivelMaturidade)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-700">
                      {bufalo.nomeRaca || bufalo.raca?.nome || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-700">
                      {bufalo.grupo?.nomeGrupo || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-700">{formatDate(bufalo.dtNascimento)}</span>
                  </TableCell>
                  <TableCell align="right">
                    <Badge type={bufalo.status ? "active" : "inactive"}>
                      {bufalo.status ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DataTable>
        )}
      </Container>
    </div>
  );
}