"use client";

import Container from "@/components/ui/Container";
import MaturidadeChart from "@/components/proprietario/rebanho/MaturidadeChart";
import SexoChart from "@/components/proprietario/rebanho/SexoChart";
import MetricCard from "@/components/ui/MetricCard";
import { useDashboard } from "@/hooks/useDashboard";
import { usePropriedadeStore } from "@/stores/propriedade.store";

import {
  Database,
  Venus,
  Mars,
  Droplets,
} from "lucide-react";

export default function RebanhoPage() {
  const { activeId, activePropriedade } = usePropriedadeStore();
  const { getGeral } = useDashboard();

  const { data: dashboardData, isLoading: isLoadingDashboard } = getGeral(activeId ?? "", {
    enabled: !!activeId,
  });

  const totalFemeas = dashboardData?.qtd_femeas_ativas ?? 0;
  const totalMachos = dashboardData?.qtd_macho_ativos ?? 0;
  const totalAtivos = totalFemeas + totalMachos;
  const totalLactando = dashboardData?.qtd_bufalas_lactando ?? 0;
  const hasActivePropriedade = !!activeId;
  const maturidadeData = [
    {
      name: "Bezerros",
      value: dashboardData?.qtd_bufalos_bezerro ?? 0,
      color: "#CE7D0A",
    },
    {
      name: "Novilhas",
      value: dashboardData?.qtd_bufalos_novilha ?? 0,
      color: "#F2B84D",
    },
    {
      name: "Vacas",
      value: dashboardData?.qtd_bufalos_vaca ?? 0,
      color: "#FFCF78",
    },
    {
      name: "Touros",
      value: dashboardData?.qtd_bufalos_touro ?? 0,
      color: "#A16207",
    },
  ];
  const sexoData = {
    femeas: totalFemeas,
    machos: totalMachos,
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
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
      </div>
    </div>
  );
}