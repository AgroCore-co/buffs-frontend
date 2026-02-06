import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { usePropriedade } from '@/contexts/PropriedadeContext';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardService } from '@/services/dashboard.service';
import { laticinioService } from '@/services/laticinio.service';
import { coletaService } from '@/services/coleta.service';
import { apiCache, CACHE_TTL } from '@/lib/apiCache';
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
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';

export default function ProprietarioPage() {
  const { loading } = useProtectedRoute(['PROPRIETARIO']);
  const { propriedadeSelecionada } = usePropriedade();
  const { user } = useAuth();

  // Estados para dados da API
  const [dashboardStats, setDashboardStats] = useState(null);
  const [producaoMensal, setProducaoMensal] = useState([]);
  const [topBufalas, setTopBufalas] = useState([]);
  const [anoSelecionado, setAnoSelecionado] = useState(
    new Date().getFullYear()
  );
  const [industrias, setIndustrias] = useState([]);
  const [coletas, setColetas] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Identificar ID da propriedade (mesmo padrão das outras páginas)
  const idProp =
    propriedadeSelecionada?.id ||
    propriedadeSelecionada?.idPropriedade ||
    propriedadeSelecionada?.id_propriedade;

  // Buscar dados principais da API quando a propriedade estiver selecionada
  useEffect(() => {
    const fetchData = async () => {
      if (!idProp) {
        setLoadingData(false);
        return;
      }

      try {
        setLoadingData(true);
        const [statsRes, industriasRes, coletasRes, bufalasRes] =
          await Promise.all([
            dashboardService.getDashboardStats(idProp),
            laticinioService.getLaticiniosPorPropriedade(idProp),
            coletaService.getColetasPorPropriedade(idProp, 1, 5),
            apiCache.get(
              `/ordenhas/femeas/em-lactacao/${idProp}`,
              {},
              CACHE_TTL.MEDIUM
            ),
          ]);

        setDashboardStats(statsRes || {});
        setIndustrias(industriasRes || []);
        setColetas(coletasRes?.data || coletasRes || []);

        // Transformar dados das búfalas para o gráfico (top 5 por média diária)
        if (Array.isArray(bufalasRes) && bufalasRes.length > 0) {
          const top5 = bufalasRes
            .sort(
              (a, b) =>
                (b.producao_atual?.media_diaria || 0) -
                (a.producao_atual?.media_diaria || 0)
            )
            .slice(0, 5)
            .map((bufala) => ({
              name: `${bufala.nome} (${bufala.brinco})`,
              leite: Number(
                (bufala.producao_atual?.media_diaria || 0).toFixed(1)
              ),
            }));
          setTopBufalas(top5);
        } else {
          setTopBufalas([]);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [idProp]);

  // Buscar produção mensal separadamente (atualiza só o gráfico quando muda o ano)
  useEffect(() => {
    const fetchProducao = async () => {
      if (!idProp) return;

      try {
        const producaoRes = await dashboardService.getProducaoMensal(
          idProp,
          anoSelecionado
        );

        // Transformar série histórica para o formato do gráfico
        if (producaoRes?.serie_historica) {
          const chartData = producaoRes.serie_historica.map((item) => {
            // Formatar mês de "2025-01" para "01/25"
            const [ano, mes] = item.mes.split('-');
            return {
              name: `${mes}/${ano.slice(2)}`,
              producao: Math.round(item.total_litros || 0),
            };
          });
          setProducaoMensal(chartData);
        } else {
          setProducaoMensal([]);
        }
      } catch (error) {
        console.error('Erro ao carregar produção mensal:', error);
      }
    };

    fetchProducao();
  }, [idProp, anoSelecionado]);

  if (loading || loadingData) {
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
              Olá, {user?.nome?.split(' ')[0] || 'Usuário'}!
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
                (dashboardStats?.qtd_macho_ativos || 0) +
                (dashboardStats?.qtd_femeas_ativas || 0)
              }
              subtitle="Rebanho ativo registrado"
              icon={<FiLayers className="text-[#ce7d0a]" />}
            />
            <MetricCard
              title="Machos"
              value={dashboardStats?.qtd_macho_ativos || 0}
              subtitle={`${dashboardStats?.qtd_bufalos_registradas ? Math.round(((dashboardStats?.qtd_macho_ativos || 0) / dashboardStats.qtd_bufalos_registradas) * 100) : 0}% do rebanho`}
              icon={<FiUser className="text-[#ce7d0a]" />}
            />
            <MetricCard
              title="Fêmeas"
              value={dashboardStats?.qtd_femeas_ativas || 0}
              subtitle={`${dashboardStats?.qtd_bufalos_registradas ? Math.round(((dashboardStats?.qtd_femeas_ativas || 0) / dashboardStats.qtd_bufalos_registradas) * 100) : 0}% do rebanho`}
              icon={<FiActivity className="text-[#ce7d0a]" />}
            />
            <MetricCard
              title="Equipe"
              value={dashboardStats?.qtd_usuarios || 0}
              subtitle="Funcionários com acesso"
              icon={<FiUsers className="text-[#ce7d0a]" />}
            />
          </div>
        </DashboardContainer>

        {/* Gráficos de Produção */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[450px]">
          <div className="lg:col-span-3 h-full">
            <ProducaoLeiteChart
              data={producaoMensal}
              ano={anoSelecionado}
              onAnoChange={setAnoSelecionado}
            />
          </div>
          <div className="lg:col-span-2 h-full">
            <TopBufalasChart data={topBufalas} />
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
              {industrias.length > 0 ? (
                industrias.map((industria, index) => (
                  <div
                    key={industria.id || index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-amber-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="font-semibold text-gray-800">
                      {industria.nome || industria.razao_social || 'Sem nome'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  Nenhuma indústria cadastrada
                </p>
              )}
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
              {coletas.length > 0 ? (
                coletas.map((coleta, index) => {
                  // Formatar data
                  let dataFormatada = '-';
                  if (coleta.dt_coleta) {
                    const datePart = coleta.dt_coleta
                      .split(' ')[0]
                      .split('T')[0];
                    const [y, m, d] = datePart.split('-');
                    dataFormatada = `${d}/${m}/${y}`;
                  }

                  const isApproved = coleta.resultado_teste;

                  return (
                    <div
                      key={coleta.id || index}
                      className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors rounded"
                    >
                      <div className="flex items-center gap-3">
                        {isApproved ? (
                          <FiCheckCircle className="text-green-600 text-lg" />
                        ) : (
                          <FiXCircle className="text-red-600 text-lg" />
                        )}
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            {coleta.nome_empresa || 'Indústria'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {dataFormatada}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800 text-sm">
                          {parseFloat(coleta.quantidade || 0).toLocaleString(
                            'pt-BR'
                          )}{' '}
                          L
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            isApproved
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {isApproved ? 'Aprovado' : 'Reprovado'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  Nenhuma coleta registrada
                </p>
              )}
            </div>
          </DashboardContainer>
        </div>
      </div>
    </>
  );
}
