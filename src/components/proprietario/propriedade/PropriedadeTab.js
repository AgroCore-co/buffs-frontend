import MetricCard from "@/components/ui/MetricCard";
import DashboardContainer from "@/components/ui/DashboardContainer";

export default function PropriedadeTab({ dashboardStats }) {
  return (
    <DashboardContainer>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <MetricCard title="Machos ativos" value={dashboardStats.qtd_macho_ativos} subtitle="Animais do sexo masculino" />
        <MetricCard title="Fêmeas ativas" value={dashboardStats.qtd_femeas_ativas} subtitle="Animais do sexo feminino" />
        <MetricCard title="Lotes" value={dashboardStats.qtd_lotes} subtitle="Total de lotes" />
        <MetricCard title="Usuários" value={dashboardStats.qtd_usuarios} subtitle="Usuários vinculados" />
      </div>
    </DashboardContainer>
  );
}
