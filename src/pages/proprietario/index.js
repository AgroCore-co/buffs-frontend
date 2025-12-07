import React from 'react';
import Head from 'next/head';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import Loading from '@/components/loading/Loading';
import DashboardContainer from '@/components/ui/DashboardContainer';
import MetricCard from '@/components/ui/MetricCard';
import ProducaoLeiteChart from '@/components/proprietario/dashboard/ProducaoLeiteChart';
import TopBufalasChart from '@/components/proprietario/dashboard/TopBufalasChart';
import {
  FiLayers,
  FiActivity,
  FiUsers,
  FiUser,
  FiTruck,
  FiAlertCircle,
  FiInfo,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';

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

  const topIndustrias = [
    { nome: 'Buffs Laticinio', volume: 2850, entregas: 12 },
    { nome: 'Laticinio Valle', volume: 1920, entregas: 8 },
    { nome: 'Laticinio São Jorge', volume: 1450, entregas: 6 },
    { nome: 'Cooperativa Leite Bom', volume: 890, entregas: 4 },
  ];

  const ultimasEntregas = [
    {
      data: '2025-12-03',
      industria: 'Buffs Laticinio',
      quantidade: '245 L',
      status: 'Aprovado',
    },
    {
      data: '2025-12-02',
      industria: 'Laticinio Valle',
      quantidade: '180 L',
      status: 'Aprovado',
    },
    {
      data: '2025-12-01',
      industria: 'Buffs Laticinio',
      quantidade: '220 L',
      status: 'Aprovado',
    },
    {
      data: '2025-11-30',
      industria: 'Laticinio Valle',
      quantidade: '195 L',
      status: 'Reprovado',
    },
    {
      data: '2025-11-29',
      industria: 'Buffs Laticinio',
      quantidade: '260 L',
      status: 'Aprovado',
    },
  ];

  const alertas = [
    {
      tipo: 'urgente',
      mensagem: 'Vacina de brucelose vence em 3 dias - 5 búfalos',
      data: 'Hoje',
    },
    {
      tipo: 'aviso',
      mensagem: 'Búfala "Luna" próxima do parto (previsão: 5 dias)',
      data: 'Hoje',
    },
    {
      tipo: 'info',
      mensagem: 'Relatório mensal de produção disponível',
      data: 'Ontem',
    },
    {
      tipo: 'urgente',
      mensagem: 'Reposição de sal mineral necessária - Grupo A',
      data: 'Ontem',
    },
  ];

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

        {/* Gráficos de Produção */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[450px]">
          <div className="lg:col-span-3 h-full">
            <ProducaoLeiteChart data={lactationData} />
          </div>
          <div className="lg:col-span-2 h-full">
            <TopBufalasChart data={topBuffalosData} />
          </div>
        </div>

        {/* Indústrias e Entregas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Indústrias */}
          <DashboardContainer>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#404040] border-l-4 border-[#ffcf78] pl-3">
                Principais Indústrias
              </h2>
              <FiTruck className="text-[#ce7d0a] text-xl" />
            </div>
            <div className="space-y-3">
              {topIndustrias.map((industria, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {industria.nome}
                      </p>
                      <p className="text-xs text-gray-500">
                        {industria.entregas} entregas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#ce7d0a]">
                      {industria.volume} L
                    </p>
                    <p className="text-xs text-gray-500">no mês</p>
                  </div>
                </div>
              ))}
            </div>
          </DashboardContainer>

          {/* Últimas Entregas */}
          <DashboardContainer>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#404040] border-l-4 border-[#ffcf78] pl-3">
                Últimas Entregas
              </h2>
              <FiCheckCircle className="text-[#ce7d0a] text-xl" />
            </div>
            <div className="space-y-2">
              {ultimasEntregas.map((entrega, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors rounded"
                >
                  <div className="flex items-center gap-3">
                    {entrega.status === 'Aprovado' ? (
                      <FiCheckCircle className="text-green-600 text-lg" />
                    ) : (
                      <FiXCircle className="text-red-600 text-lg" />
                    )}
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {entrega.industria}
                      </p>
                      <p className="text-xs text-gray-500">{entrega.data}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800 text-sm">
                      {entrega.quantidade}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        entrega.status === 'Aprovado'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {entrega.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </DashboardContainer>
        </div>

        {/* Alertas do Sistema */}
        <DashboardContainer>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#404040] border-l-4 border-[#ffcf78] pl-3">
              Notificações
            </h2>
            <span className="bg-[#ce7d0a] text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {alertas.length}
            </span>
          </div>
          <div className="space-y-2">
            {alertas.map((alerta, index) => {
              const iconMap = {
                urgente: <FiAlertCircle className="text-red-600" />,
                aviso: <FiAlertTriangle className="text-amber-600" />,
                info: <FiInfo className="text-blue-600" />,
              };
              const dotMap = {
                urgente: 'bg-red-500',
                aviso: 'bg-amber-500',
                info: 'bg-blue-500',
              };
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-amber-200 transition-all cursor-pointer"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotMap[alerta.tipo]}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-snug">
                      {alerta.mensagem}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{alerta.data}</p>
                  </div>
                  <div className="shrink-0">{iconMap[alerta.tipo]}</div>
                </div>
              );
            })}
          </div>
        </DashboardContainer>
      </div>
    </>
  );
}
