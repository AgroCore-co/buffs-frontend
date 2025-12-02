import React from 'react';
import Head from 'next/head';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import Loading from '@/components/loading/Loading';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import DashboardContainer from '@/components/ui/DashboardContainer';
import MetricCard from '@/components/ui/MetricCard';
import { FiLayers, FiActivity, FiUsers, FiUser } from 'react-icons/fi';

export default function ProprietarioPage() {
  const { loading } = useProtectedRoute(['PROPRIETARIO']);

  // --- DADOS MOCKADOS (ESTÁTICOS) PARA DESIGN ---
  const userName = 'Paulo Candiani';
  const dashboardStats = {
    qtd_macho_ativos: 15,
    qtd_femeas_ativas: 85,
    qtd_bufalos_registradas: 100,
    qtd_usuarios: 4,
  };
  const lactationData = [
    { name: '01/24', producao: 1200 },
    { name: '02/24', producao: 1350 },
    { name: '03/24', producao: 1400 },
    { name: '04/24', producao: 1100 },
    { name: '05/24', producao: 1600 },
    { name: '06/24', producao: 1800 },
  ];
  const topBuffalosData = [
    { name: 'Estrela (001)', leite: 12.5 },
    { name: 'Luna (042)', leite: 11.2 },
    { name: 'Mimosa (103)', leite: 10.8 },
    { name: 'Preta (055)', leite: 9.5 },
    { name: 'Malhada (020)', leite: 9.0 },
  ];
  const barColors = ['#FFCF78', '#CE7D0A', '#F2B84D', '#FCA90F', '#E6A23C'];

  if (loading) {
    return <Loading text="Carregando painel..." />;
  }

  // --- RENDERIZAÇÃO DO DASHBOARD ---
  return (
    <>
      <Head>
        <title>Dashboard | Buffs</title>
        <meta name="description" content="Dashboard da plataforma Buffs" />
      </Head>

      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
        <DashboardContainer>
          {/* Indicadores e header */}
          <div>
            <h1 className="text-2xl font-bold text-[#404040] mb-1">
              Olá, {userName}!
            </h1>
            <p className="text-[#404040]/70 text-sm">
              Bem-vindo ao dashboard da sua fazenda de búfalos. Aqui está o
              resumo de hoje.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total de Búfalos"
              value={
                dashboardStats.qtd_macho_ativos +
                dashboardStats.qtd_femeas_ativas
              }
              subtitle="Rebanho ativo registrado"
              icon={<FiLayers className="text-[#ce7d0a]" />}
            />
            <MetricCard
              title="Machos"
              value={dashboardStats.qtd_macho_ativos}
              subtitle={`${Math.round((dashboardStats.qtd_macho_ativos / dashboardStats.qtd_bufalos_registradas) * 100)}% do rebanho`}
              icon={<FiUser className="text-[#ce7d0a]" />}
            />
            <MetricCard
              title="Fêmeas"
              value={dashboardStats.qtd_femeas_ativas}
              subtitle={`${Math.round((dashboardStats.qtd_femeas_ativas / dashboardStats.qtd_bufalos_registradas) * 100)}% do rebanho`}
              icon={<FiActivity className="text-[#ce7d0a]" />}
            />
            <MetricCard
              title="Equipe"
              value={dashboardStats.qtd_usuarios}
              subtitle="Funcionários com acesso"
              icon={<FiUsers className="text-[#ce7d0a]" />}
            />
          </div>
        </DashboardContainer>
        <DashboardContainer>
          {/* Gráficos e outros conteúdos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Milk Production Chart */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-[#404040] border-l-4 border-[#ffcf78] pl-3">
                Produção de Leite Mensal
              </h2>
              <div className="w-full h-[300px] bg-[#f8fcfa] rounded-lg border border-[#ce7d0a]/5 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lactationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis
                      dataKey="name"
                      interval={0}
                      tick={{ fill: '#404040', fontSize: 12 }}
                      axisLine={{ stroke: '#ce7d0a', strokeOpacity: 0.2 }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#404040', fontSize: 12 }}
                      axisLine={{ stroke: '#ce7d0a', strokeOpacity: 0.2 }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderColor: '#ffcf78',
                        borderRadius: '8px',
                      }}
                      itemStyle={{ color: '#ce7d0a' }}
                      formatter={(value) => [`${value} L`, 'Produção']}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="producao"
                      stroke="#ce7d0a"
                      strokeWidth={3}
                      activeDot={{ r: 6, fill: '#ffcf78', stroke: '#ce7d0a' }}
                      name="Produção (L)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Buffaloes Chart */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-[#404040] border-l-4 border-[#ffcf78] pl-3">
                Top 5 Búfalas Produtoras
              </h2>
              <div className="w-full h-[300px] bg-[#f8fcfa] rounded-lg border border-[#ce7d0a]/5 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topBuffalosData}
                    layout="vertical"
                    margin={{ left: 20, right: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e5e5"
                      horizontal={false}
                    />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fill: '#404040', fontSize: 11, fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderColor: '#ffcf78',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`${value} L/dia`, 'Média']}
                    />
                    <Bar
                      dataKey="leite"
                      name="Leite (L/dia)"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    >
                      {topBuffalosData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={barColors[index % barColors.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </DashboardContainer>
      </div>
    </>
  );
}
