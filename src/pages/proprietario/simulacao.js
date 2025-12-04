'use client';
// Dados para Top 5 Búfalas e Touros (copiados do controle-reproducao)
const topBufalas = [
  {
    rank: 1,
    nome: 'Hera',
    brinco: 'IZ-012',
    idade: '6a 2m',
    raca: 'Murrah',
    status: 'Apta (Pós-Parto)',
    score: 100,
  },
  {
    rank: 2,
    nome: 'Buffs 01',
    brinco: 'BFF-001',
    idade: '2a 7m',
    raca: 'Murrah',
    status: 'Apta (Novilha)',
    score: 97,
  },
  {
    rank: 3,
    nome: 'Buffs 02',
    brinco: 'BR54321',
    idade: '2a 7m',
    raca: 'Murrah',
    status: 'Apta (Novilha)',
    score: 97,
  },
  {
    rank: 4,
    nome: 'Buffs 03',
    brinco: 'BR54321',
    idade: '2a 7m',
    raca: 'Murrah',
    status: 'Apta (Novilha)',
    score: 97,
  },
  {
    rank: 5,
    nome: 'Liriope',
    brinco: 'IZ-039',
    idade: '2a 11m',
    raca: 'Murrah',
    status: 'Apta (Novilha)',
    score: 97,
  },
];

const topTouros = [
  {
    rank: 1,
    nome: 'Corona da UPD',
    brinco: 'BUFF-017',
    idade: '9a 11m',
    raca: 'Murrah',
    status: '-',
    score: 100,
  },
  {
    rank: 2,
    nome: 'P. Loures',
    brinco: 'BUFF-019',
    idade: '9a 11m',
    raca: 'Murrah',
    status: '-',
    score: 100,
  },
  {
    rank: 3,
    nome: 'Pingo',
    brinco: 'BUFF-032',
    idade: '6a 11m',
    raca: 'Murrah',
    status: '-',
    score: 100,
  },
  {
    rank: 4,
    nome: 'Zeus',
    brinco: 'IZ-001',
    idade: '11a 7m',
    raca: 'Murrah',
    status: '-',
    score: 100,
  },
  {
    rank: 5,
    nome: 'Ares',
    brinco: 'IZ-053',
    idade: '3a 8m',
    raca: 'Murrah',
    status: '-',
    score: 100,
  },
];
// (Removido 'use client' duplicado)
import React, { useState } from 'react';
import Head from 'next/head';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import Loading from '@/components/loading/Loading';
import DashboardContainer from '@/components/ui/DashboardContainer';
import Button from '@/components/ui/Button';
import {
  FiGitMerge,
  FiSearch,
  FiCheckCircle,
  FiAlertTriangle,
  FiCpu,
  FiRotateCcw,
  FiList,
} from 'react-icons/fi';
import MetricCard from '@/components/ui/MetricCard';
import Badge from '@/components/ui/Badge';

// --- DADOS MOCKADOS ---

const listaTouros = [
  { id: 1, nome: 'Cronos', brinco: 'BUFF-007', raca: 'Murrah', score: 98 },
  { id: 2, nome: 'Tífon', brinco: 'BUFF-009', raca: 'Murrah', score: 95 },
  { id: 3, nome: 'Zeus', brinco: 'IZ-001', raca: 'Murrah', score: 100 },
  {
    id: 4,
    nome: 'Corona da UPD',
    brinco: 'BUFF-017',
    raca: 'Murrah',
    score: 99,
  },
  { id: 5, nome: 'Ares', brinco: 'IZ-053', raca: 'Murrah', score: 96 },
];

const listaMatrizes = [
  {
    id: 1,
    nome: 'Pérola',
    brinco: 'BUFF-001',
    raca: 'Murrah',
    lactacao: 'Alta',
  },
  { id: 2, nome: 'Mel', brinco: 'BUFF-002', raca: 'Murrah', lactacao: 'Média' },
  { id: 3, nome: 'Gaya', brinco: 'BUFF-003', raca: 'Murrah', lactacao: 'Alta' },
  { id: 4, nome: 'JADE', brinco: 'BUFF-004', raca: 'Murrah', lactacao: 'Alta' },
  {
    id: 5,
    nome: 'Estrela',
    brinco: 'IZ-002',
    raca: 'Murrah',
    lactacao: 'Média',
  },
];

export default function SimulacaoPage() {
  const { loading } = useProtectedRoute(['PROPRIETARIO']);

  // States
  const [simulationState, setSimulationState] = useState('idle'); // idle, loading, done
  const [touroId, setTouroId] = useState('');
  const [matrizId, setMatrizId] = useState('');
  const [resultado, setResultado] = useState(null);

  if (loading) {
    return <Loading text="Carregando simulador genético..." />;
  }

  const handleSimulation = (e) => {
    e.preventDefault();
    if (!touroId || !matrizId) return;

    setSimulationState('loading');

    // Simulação de processamento e lógica randomica de resultado
    setTimeout(() => {
      const isRisky = Math.random() > 0.7;
      setResultado({
        compatibilidade: isRisky ? 'Média' : 'Alta',
        score: isRisky ? 75 : 94,
        producaoEstimada: isRisky ? '+2%' : '+14%',
        inbreeding: isRisky ? '6.25%' : '0.5%',
        risco: isRisky,
        mensagem: isRisky
          ? 'Atenção: Cruzamento com risco moderado de consanguinidade. Avalie a linhagem.'
          : 'Cruzamento altamente recomendado. Potencial para melhoria de úbere e produção de leite.',
      });
      setSimulationState('done');
    }, 1500);
  };

  const resetSimulation = () => {
    setSimulationState('idle');
    setResultado(null);
    setTouroId('');
    setMatrizId('');
  };

  return (
    <>
      <Head>
        <title>Simulador de Acasalamento | Buffs</title>
      </Head>

      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 pb-10">
        {/* --- HEADER --- */}
        <DashboardContainer>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#404040] mb-1 flex items-center gap-2">
                Simulador de Acasalamento
              </h1>
              <p className="text-[#404040]/70 text-sm">
                Ferramenta preditiva para análise de compatibilidade genética e
                estimativa de produção da progênie (F1).
              </p>
            </div>
            <div>
              <Button
                variant="secondary"
                size="medium"
                className="flex items-center gap-2"
                onClick={() => window.print()}
              >
                <FiList /> Exportar Relatório
              </Button>
            </div>
          </div>
        </DashboardContainer>

        {/* --- ÁREA DE SIMULAÇÃO --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna da Esquerda: Inputs */}
          <DashboardContainer className="lg:col-span-1 border-t-4 border-t-[#ffcf78]">
            <h2 className="text-lg font-bold text-[#404040] mb-4">
              Parâmetros do Cruzamento
            </h2>

            <form onSubmit={handleSimulation} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  1. Selecione o Reprodutor (Touro)
                </label>
                <select
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffcf78] text-gray-700 transition-shadow"
                  value={touroId}
                  onChange={(e) => {
                    setTouroId(e.target.value);
                    if (simulationState === 'done') setSimulationState('idle');
                  }}
                >
                  <option value="">Selecione...</option>
                  {listaTouros.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome} ({t.brinco}) - Score {t.score}
                    </option>
                  ))}
                </select>
                {touroId && (
                  <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded border border-green-100">
                    Reprodutor selecionado:{' '}
                    <strong>
                      {listaTouros.find((t) => t.id == touroId)?.nome}
                    </strong>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  2. Selecione a Matriz
                </label>
                <select
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffcf78] text-gray-700 transition-shadow"
                  value={matrizId}
                  onChange={(e) => {
                    setMatrizId(e.target.value);
                    if (simulationState === 'done') setSimulationState('idle');
                  }}
                >
                  <option value="">Selecione...</option>
                  {listaMatrizes.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome} ({m.brinco})
                    </option>
                  ))}
                </select>
                {matrizId && (
                  <div className="mt-2 text-xs text-blue-700 bg-blue-50 p-2 rounded border border-blue-100">
                    Matriz selecionada:{' '}
                    <strong>
                      {listaMatrizes.find((m) => m.id == matrizId)?.nome}
                    </strong>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  className="w-full h-[54px] text-lg font-bold shadow-md hover:shadow-lg transition-all"
                  disabled={
                    !touroId || !matrizId || simulationState === 'loading'
                  }
                >
                  {simulationState === 'loading'
                    ? 'Processando...'
                    : 'Executar Simulação'}
                </Button>

                {simulationState === 'done' && (
                  <button
                    type="button"
                    onClick={resetSimulation}
                    className="w-full mt-3 text-sm text-gray-500 hover:text-[#ce7d0a] flex items-center justify-center gap-1"
                  >
                    <FiRotateCcw /> Limpar simulação
                  </button>
                )}
              </div>
            </form>
          </DashboardContainer>

          {/* Coluna da Direita: Resultados */}
          <DashboardContainer className="lg:col-span-2 relative overflow-hidden min-h-[400px]">
            {/* Background Decorativo */}

            <h2 className="text-lg font-bold text-[#404040] mb-6">
              Resultado da Análise
            </h2>

            {simulationState === 'idle' && (
              <div className="flex flex-col items-center justify-center h-[300px] text-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4 shadow-sm">
                  <FiSearch size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">
                  Aguardando Dados
                </h3>
                <p className="text-gray-500 max-w-sm mt-2">
                  Selecione um touro e uma matriz no painel ao lado para
                  visualizar a previsão de acasalamento.
                </p>
              </div>
            )}

            {simulationState === 'loading' && (
              <div className="flex flex-col items-center justify-center h-[300px] text-center h-[300px]">
                <Loading text="Cruzando dados genéticos... Verificando pedigrees e coeficientes de endogamia." />
              </div>
            )}

            {simulationState === 'done' && resultado && (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                {/* Cabeçalho do Resultado */}
                <div
                  className={`p-6 rounded-xl border-l-8 shadow-sm mb-6 ${resultado.risco ? 'bg-amber-50 border-amber-500' : 'bg-green-50 border-green-500'}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-full ${resultado.risco ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}
                    >
                      {resultado.risco ? (
                        <FiAlertTriangle size={32} />
                      ) : (
                        <FiCheckCircle size={32} />
                      )}
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-bold ${resultado.risco ? 'text-amber-800' : 'text-green-800'}`}
                      >
                        {resultado.risco
                          ? 'Cuidado: Risco Moderado'
                          : 'Excelente Compatibilidade'}
                      </h3>
                      <Badge type={resultado.risco ? 'inactive' : 'active'}>
                        {resultado.risco
                          ? 'Risco Moderado'
                          : 'Compatibilidade Alta'}
                      </Badge>
                      <p
                        className={`mt-1 ${resultado.risco ? 'text-amber-700' : 'text-green-700'}`}
                      >
                        {resultado.mensagem}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cards de Métricas do Resultado usando MetricCard */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <MetricCard
                    title="Score F1 Previsto"
                    value={resultado.score}
                    subtitle="Média Alta"
                  />
                  <MetricCard
                    title="Prod. Leite Est."
                    value={resultado.producaoEstimada}
                    subtitle="Sobre a média da mãe"
                  />
                  <MetricCard
                    title="Inbreeding"
                    value={resultado.inbreeding}
                    subtitle="Coeficiente"
                  />
                </div>

                <div className="flex justify-end">
                  <Button variant="primary" size="medium">
                    Salvar Simulação
                  </Button>
                </div>
              </div>
            )}
          </DashboardContainer>
        </div>

        {/* --- TOP 5 BÚFALAS E TOUROS PARA SIMULAÇÃO --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Búfalas */}
          <DashboardContainer>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#404040] border-l-4 border-[#ffcf78] pl-3">
                Top 5 Búfalas para Simulação
              </h2>
              <p className="text-xs text-gray-500 mt-1 pl-4">
                Classificadas por prontidão, idade, histórico e período ideal.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {topBufalas.map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#ffcf78] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${item.rank === 1 ? 'bg-[#ce7d0a] text-white' : 'bg-gray-200 text-gray-600'}`}
                    >
                      {item.rank}º
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">
                        {item.nome}
                      </h4>
                      <div className="text-xs text-gray-500 flex gap-2">
                        <span>{item.brinco}</span>
                        <span>•</span>
                        <span>{item.idade}</span>
                        <span>•</span>
                        <span>{item.raca}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      {item.status}
                    </span>
                    <span className="text-xs font-bold text-[#ce7d0a]">
                      Score: {item.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </DashboardContainer>

          {/* Top 5 Touros */}
          <DashboardContainer>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#404040] border-l-4 border-[#ffcf78] pl-3">
                Top 5 Touros para Simulação
              </h2>
              <p className="text-xs text-gray-500 mt-1 pl-4">
                Classificados por idade, histórico, taxa de sucesso e genética.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {topTouros.map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#ffcf78] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${item.rank === 1 ? 'bg-[#ce7d0a] text-white' : 'bg-gray-200 text-gray-600'}`}
                    >
                      {item.rank}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">
                        {item.nome}
                      </h4>
                      <div className="text-xs text-gray-500 flex gap-2">
                        <span>{item.brinco}</span>
                        <span>•</span>
                        <span>{item.idade}</span>
                        <span>•</span>
                        <span>{item.raca}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-medium text-gray-500">
                      {item.status === '-' ? 'Ativo' : item.status}
                    </span>
                    <span className="text-xs font-bold text-[#ce7d0a]">
                      Score: {item.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </DashboardContainer>
        </div>
      </div>
    </>
  );
}
