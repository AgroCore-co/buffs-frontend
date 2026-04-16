"use client";

import { useTranslations } from 'next-intl';
import ProducaoLeiteChart from "@/components/proprietario/dashboard/ProducaoLeiteChart";
import TopBufalasChart from "@/components/proprietario/dashboard/TopBufalasChart";
import Container from "@/components/ui/Container";
import MetricCard from "@/components/ui/MetricCard";
import { Layers, Target, Heart, Users, Truck, CheckCircle, XCircle } from "lucide-react";

// Mock de dados para o gráfico de top búfalas
const mockTopBufalas = [
  { name: "Estrela", leite: 14.5 },
  { name: "Morena", leite: 12.8 },
  { name: "Preta", leite: 11.2 },
  { name: "Mimosa", leite: 10.5 },
  { name: "Fumaça", leite: 9.7 }
];

// Mock de dados para o gráfico de produção mensal
const mockProducaoLeite = [
  { name: "Jan", producao: 1200 },
  { name: "Fev", producao: 1150 },
  { name: "Mar", producao: 1300 },
  { name: "Abr", producao: 1250 },
  { name: "Mai", producao: 1400 },
  { name: "Jun", producao: 1350 },
  { name: "Jul", producao: 1450 },
  { name: "Ago", producao: 1500 },
  { name: "Set", producao: 1480 },
  { name: "Out", producao: 1550 },
  { name: "Nov", producao: 1600 },
  { name: "Dez", producao: 1700 },
];

// Mock de dados para Principais Indústrias
const mockIndustrias = [
  { id: 1, nome: "Laticínio Vale do Ribeira" },
  { id: 2, nome: "Laticínios Fazenda Bela" },
  { id: 3, nome: "Cooperativa Leiteira Sul" }
];

// Mock de dados para Últimas Entregas
const mockColetas = [
  { id: 1, nome_empresa: "Laticínio Vale do Ribeira", dt_coleta: "2026-04-15", quantidade: 450.5, resultado_teste: true },
  { id: 2, nome_empresa: "Laticínios Fazenda Bela", dt_coleta: "2026-04-14", quantidade: 380.0, resultado_teste: true },
  { id: 3, nome_empresa: "Cooperativa Leiteira Sul", dt_coleta: "2026-04-12", quantidade: 410.2, resultado_teste: false }
];

export default function DashboardPageProprietario() {
  const t = useTranslations('Dashboard');

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Container>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#404040]">{t('greeting', { name: 'Vinicius' })}</h1>
          <p className="text-sm text-[#404040]/60 mt-1">
            {t('welcome')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title={t('totalBuffalos')}
            value="117"
            subtitle={t('totalBuffalosDesc')}
            icon={<Layers className="w-4 h-4" />}
          />
          <MetricCard
            title={t('males')}
            value="37"
            subtitle={t('malesDesc', { percent: '27' })}
            icon={<Target className="w-4 h-4" />}
          />
          <MetricCard
            title={t('females')}
            value="80"
            subtitle={t('femalesDesc', { percent: '59' })}
            icon={<Heart className="w-4 h-4" />}
          />
          <MetricCard
            title={t('team')}
            value="1"
            subtitle={t('teamDesc')}
            icon={<Users className="w-4 h-4" />}
          />
        </div>
      </Container>
      
      {/* Container Grid para os gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProducaoLeiteChart data={mockProducaoLeite} />
        <TopBufalasChart data={mockTopBufalas} />
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
            {mockIndustrias.map((industria, index) => (
              <div
                key={industria.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-amber-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                  {index + 1}
                </div>
                <p className="font-semibold text-gray-800">
                  {industria.nome}
                </p>
              </div>
            ))}
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
            {mockColetas.map((coleta) => {
              // Formatação simples de data para o mock
              const [ano, mes, dia] = coleta.dt_coleta.split('-');
              const dataFormatada = `${dia}/${mes}/${ano}`;
              const isApproved = coleta.resultado_teste;

              return (
                <div
                  key={coleta.id}
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
                        {coleta.nome_empresa}
                      </p>
                      <p className="text-xs text-gray-500">
                        {dataFormatada}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800 text-sm">
                      {coleta.quantidade.toLocaleString('pt-BR')} L
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
            })}
          </div>
        </Container>

      </div>
    </div>
  );
}