"use client";

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import Container from "@/components/ui/Container";
import MetricCard from "@/components/ui/MetricCard";
import ChartSkeleton from "@/components/ui/ChartSkeleton";

const ProducaoLeiteChart = dynamic(
  () => import("@/components/proprietario/dashboard/ProducaoLeiteChart"),
  { ssr: false, loading: () => <ChartSkeleton height={380} /> },
);
const TopBufalasChart = dynamic(
  () => import("@/components/proprietario/dashboard/TopBufalasChart"),
  { ssr: false, loading: () => <ChartSkeleton height={300} /> },
);
import { Layers, Target, Heart, Users, Truck, CheckCircle, XCircle } from "lucide-react";
import { useDashboardGeral, useDashboardLactacao, useDashboardProducaoMensal } from "@/hooks/useDashboard";
import { useLaticiniosByPropriedade, useColetas } from "@/hooks/useColeta";
import { usePropriedadeStore } from "@/stores/propriedade.store";
import { useAuth } from "@/hooks/useAuth";

const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatDate(d?: string | null) {
  if (!d) return '—';
  const datePart = d.split(' ')[0].split('T')[0];
  const [ano, mes, dia] = datePart.split('-');
  return `${dia}/${mes}/${ano}`;
}

export default function DashboardPageProprietario() {
  const t = useTranslations('Dashboard');
  const { activeId } = usePropriedadeStore();
  const { profile } = useAuth();

  const { data: geralData, isLoading } = useDashboardGeral(activeId ?? undefined, { enabled: !!activeId });
  const { data: producaoMensalData } = useDashboardProducaoMensal(activeId ?? undefined, undefined, { enabled: !!activeId });
  const { data: lactacaoData } = useDashboardLactacao(activeId ?? undefined, undefined, { enabled: !!activeId });
  const { data: laticinios = [] } = useLaticiniosByPropriedade(activeId ?? undefined);
  const { data: coletasData } = useColetas(activeId ?? undefined, 1, 3);

  const machos = geralData?.qtdMachoAtivos ?? 0;
  const femeas = geralData?.qtdFemeasAtivas ?? 0;
  const total = machos + femeas;
  const equipe = geralData?.qtdUsuarios ?? 0;
  const pctMachos = total > 0 ? Math.round((machos / total) * 100) : 0;
  const pctFemeas = total > 0 ? Math.round((femeas / total) * 100) : 0;

  const fmt = (v: number) => (!activeId ? '—' : isLoading ? '...' : v.toString());

  const producaoLeite = useMemo(() => {
    if (!producaoMensalData?.serieHistorica) return [];
    return producaoMensalData.serieHistorica.map((item) => {
      const mesIdx = Number(item.mes.split('-')[1]) - 1;
      return { name: MESES_ABREV[mesIdx] ?? item.mes, producao: item.totalLitros };
    });
  }, [producaoMensalData]);

  const topBufalas = useMemo(() => {
    if (!lactacaoData?.ciclos) return [];
    return [...lactacaoData.ciclos]
      .sort((a, b) => b.mediaLactacao - a.mediaLactacao)
      .slice(0, 5)
      .map((ciclo) => ({ name: ciclo.nomeBufala, leite: ciclo.mediaLactacao }));
  }, [lactacaoData]);

  const mainIndustrias = laticinios.slice(0, 3);
  const coletas = coletasData?.data ?? [];

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Container>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#404040]">{t('greeting', { name: profile?.nome?.split(' ')[0] ?? '' })}</h1>
          <p className="text-sm text-[#404040]/60 mt-1">
            {t('welcome')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title={t('totalBuffalos')}
            value={fmt(total)}
            subtitle={t('totalBuffalosDesc')}
            icon={<Layers className="w-4 h-4" />}
          />
          <MetricCard
            title={t('males')}
            value={fmt(machos)}
            subtitle={t('malesDesc', { percent: String(pctMachos) })}
            icon={<Target className="w-4 h-4" />}
          />
          <MetricCard
            title={t('females')}
            value={fmt(femeas)}
            subtitle={t('femalesDesc', { percent: String(pctFemeas) })}
            icon={<Heart className="w-4 h-4" />}
          />
          <MetricCard
            title={t('team')}
            value={fmt(equipe)}
            subtitle={t('teamDesc')}
            icon={<Users className="w-4 h-4" />}
          />
        </div>
      </Container>
      
      {/* Container Grid para os gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProducaoLeiteChart data={producaoLeite} />
        <TopBufalasChart data={topBufalas} />
      </div>

      {/* Indústrias e Entregas lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Principais Indústrias */}
        <Container>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#404040] border-l-4 border-[#ffcf78] pl-3">
              {t('mainIndustries')}
            </h2>
            <Truck className="text-[#ce7d0a] w-5 h-5" />
          </div>
          <div className="space-y-3">
            {mainIndustrias.length === 0 ? (
              <p className="text-sm text-gray-400">{t('noIndustries')}</p>
            ) : (
              mainIndustrias.map((industria, index) => (
                <div
                  key={industria.id_industria ?? industria.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                    {index + 1}
                  </div>
                  <p className="font-semibold text-gray-800">
                    {industria.nome}
                  </p>
                </div>
              ))
            )}
          </div>
        </Container>

        {/* Últimas Entregas */}
        <Container>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#404040] border-l-4 border-[#ffcf78] pl-3">
              {t('lastDeliveries')}
            </h2>
            <CheckCircle className="text-[#ce7d0a] w-5 h-5" />
          </div>
          <div className="space-y-2">
            {coletas.length === 0 ? (
              <p className="text-sm text-gray-400">{t('noDeliveries')}</p>
            ) : (
              coletas.map((coleta) => {
                const isApproved = coleta.resultado_teste;

                return (
                  <div
                    key={coleta.id_coleta ?? coleta.id}
                    className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors rounded"
                  >
                    <div className="flex items-center gap-3">
                      {isApproved ? (
                        <CheckCircle className="text-green-600 w-5 h-5" />
                      ) : (
                        <XCircle className="text-red-600 w-5 h-5" />
                      )}
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {coleta.nome_empresa ?? '—'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(coleta.dt_coleta)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800 text-sm">
                        {Number(coleta.quantidade).toLocaleString('pt-BR')} L
                      </p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          isApproved
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {isApproved ? t('approved') : t('rejected')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Container>

      </div>
    </div>
  );
}