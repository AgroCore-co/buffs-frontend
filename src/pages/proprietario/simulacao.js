'use client';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { usePropriedade } from '@/contexts/PropriedadeContext';
import coberturaService from '@/services/cobertura.service';
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

export default function SimulacaoPage() {
  const { loading } = useProtectedRoute(['PROPRIETARIO']);
  const { propriedadeSelecionada } = usePropriedade();

  // States
  const [simulationState, setSimulationState] = useState('idle'); // idle, loading, done
  const [touroId, setTouroId] = useState('');
  const [matrizId, setMatrizId] = useState('');
  const [resultado, setResultado] = useState(null);

  // Estados para listas de búfalos da API
  const [listaTouros, setListaTouros] = useState([]);
  const [listaMatrizes, setListaMatrizes] = useState([]);
  const [loadingBufalos, setLoadingBufalos] = useState(false);

  // Buscar recomendações quando a propriedade mudar
  useEffect(() => {
    const fetchRecomendacoes = async () => {
      const idPropriedade =
        propriedadeSelecionada?.idPropriedade ||
        propriedadeSelecionada?.id_propriedade;

      if (!idPropriedade) {
        setListaTouros([]);
        setListaMatrizes([]);
        return;
      }

      setLoadingBufalos(true);
      try {
        // Buscar recomendações de machos e fêmeas em paralelo
        const [resMachos, resFemeas] = await Promise.all([
          coberturaService.getRecomendacoesMachos(idPropriedade),
          coberturaService.getRecomendacoesFemeas(idPropriedade),
        ]);

        // Formatar dados dos machos (touros)
        const touros = resMachos.map((bufalo) => ({
          id: bufalo.idBufalo,
          nome: bufalo.nome,
          brinco: bufalo.brinco,
          raca: bufalo.raca || 'N/A',
          score: bufalo.score || 0,
          idadeMeses: bufalo.idadeMeses,
          dados_reprodutivos: bufalo.dados_reprodutivos,
          motivos: bufalo.motivos,
        }));

        // Formatar dados das fêmeas (matrizes)
        const matrizes = resFemeas.map((bufalo) => ({
          id: bufalo.idBufalo,
          nome: bufalo.nome,
          brinco: bufalo.brinco,
          raca: bufalo.raca || 'N/A',
          score: bufalo.score || 0,
          idadeMeses: bufalo.idadeMeses,
          status: bufalo.dados_reprodutivos?.status || 'N/A',
          dados_reprodutivos: bufalo.dados_reprodutivos,
          motivos: bufalo.motivos,
        }));

        setListaTouros(touros);
        setListaMatrizes(matrizes);
      } catch (error) {
        console.error('Erro ao buscar recomendações:', error);
        setListaTouros([]);
        setListaMatrizes([]);
      } finally {
        setLoadingBufalos(false);
      }
    };

    fetchRecomendacoes();
  }, [propriedadeSelecionada]);

  if (loading) {
    return <Loading text="Carregando simulador genético..." />;
  }

  const handleSimulation = async (e) => {
    e.preventDefault();
    if (!touroId || !matrizId) return;

    setSimulationState('loading');

    try {
      const response = await coberturaService.simularAcasalamento(
        touroId,
        matrizId
      );

      // Determinar se há risco baseado no risco de consanguinidade
      const riscoAlto =
        response.risco_consanguinidade === 'Alto' ||
        response.risco_consanguinidade === 'Crítico';
      const riscoModerado = response.risco_consanguinidade === 'Moderado';
      const temRisco = riscoAlto || riscoModerado;

      // Calcular variação de produção
      const predicao = response.predicao_producao_femea;
      const variacaoProducao = predicao?.percentual_vs_media
        ? `${predicao.percentual_vs_media > 0 ? '+' : ''}${predicao.percentual_vs_media.toFixed(1)}%`
        : 'N/A';

      setResultado({
        // Dados de consanguinidade
        consanguinidade_prole: response.consanguinidade_prole,
        parentesco_pais: response.parentesco_pais,
        nivel_parentesco: response.nivel_parentesco,
        risco_consanguinidade: response.risco_consanguinidade,
        recomendacao: response.recomendacao,
        detalhes: response.detalhes,
        // Dados de predição de produção (converter de ml para L se valor muito alto)
        predicao_litros:
          predicao?.predicao_litros > 50
            ? predicao?.predicao_litros / 1000
            : predicao?.predicao_litros,
        classificacao_potencial: predicao?.classificacao_potencial,
        percentual_vs_media: predicao?.percentual_vs_media,
        producao_media_propriedade:
          predicao?.producao_media_propriedade > 50
            ? predicao?.producao_media_propriedade / 1000
            : predicao?.producao_media_propriedade,
        // Dados para a UI
        risco: temRisco,
        riscoAlto,
        riscoModerado,
        inbreeding: `${response.consanguinidade_prole}%`,
        producaoEstimada: variacaoProducao,
        mensagem: response.recomendacao,
      });
      setSimulationState('done');
    } catch (error) {
      console.error('Erro na simulação:', error);
      setResultado({
        risco: true,
        riscoAlto: true,
        mensagem: 'Erro ao realizar simulação. Tente novamente.',
        inbreeding: 'N/A',
        producaoEstimada: 'N/A',
      });
      setSimulationState('done');
    }
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
                  className={`p-6 rounded-xl border-l-8 shadow-sm mb-6 ${
                    resultado.riscoAlto
                      ? 'bg-red-50 border-red-500'
                      : resultado.riscoModerado
                        ? 'bg-amber-50 border-amber-500'
                        : 'bg-green-50 border-green-500'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        resultado.riscoAlto
                          ? 'bg-red-100 text-red-600'
                          : resultado.riscoModerado
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {resultado.risco ? (
                        <FiAlertTriangle size={32} />
                      ) : (
                        <FiCheckCircle size={32} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`text-xl font-bold ${
                            resultado.riscoAlto
                              ? 'text-red-800'
                              : resultado.riscoModerado
                                ? 'text-amber-800'
                                : 'text-green-800'
                          }`}
                        >
                          {resultado.riscoAlto
                            ? 'Risco Alto de Consanguinidade'
                            : resultado.riscoModerado
                              ? 'Risco Moderado'
                              : 'Excelente Compatibilidade'}
                        </h3>
                        <Badge type={resultado.risco ? 'inactive' : 'active'}>
                          {resultado.risco_consanguinidade || 'Baixo'}
                        </Badge>
                      </div>
                      <p
                        className={`mt-2 ${
                          resultado.riscoAlto
                            ? 'text-red-700'
                            : resultado.riscoModerado
                              ? 'text-amber-700'
                              : 'text-green-700'
                        }`}
                      >
                        {resultado.mensagem}
                      </p>
                      {resultado.nivel_parentesco && (
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Parentesco:</strong>{' '}
                          {resultado.nivel_parentesco}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cards de Métricas do Resultado usando MetricCard */}
                {/* Verificar se há parentesco próximo para ocultar campos de produção */}
                {(() => {
                  const temParentescoProximo =
                    resultado.detalhes?.e_meio_irmao ||
                    resultado.detalhes?.tem_parentesco_direto;

                  return (
                    <div
                      className={`grid grid-cols-1 sm:grid-cols-2 ${temParentescoProximo ? 'lg:grid-cols-2' : 'lg:grid-cols-4'} gap-4 mb-6`}
                    >
                      <MetricCard
                        title="Consanguinidade Prole"
                        value={resultado.inbreeding}
                        subtitle="Coeficiente de endogamia"
                      />
                      {!temParentescoProximo && (
                        <>
                          <MetricCard
                            title="Produção Prevista"
                            value={
                              resultado.predicao_litros
                                ? `${resultado.predicao_litros.toFixed(1)} L`
                                : 'N/A'
                            }
                            subtitle="Litros/dia estimado"
                          />
                          <MetricCard
                            title="Variação da Média"
                            value={resultado.producaoEstimada}
                            subtitle={
                              resultado.producao_media_propriedade
                                ? `Média atual: ${resultado.producao_media_propriedade.toFixed(1)} L/dia`
                                : 'Comparativo'
                            }
                          />
                          <MetricCard
                            title="Potencial"
                            value={resultado.classificacao_potencial || 'N/A'}
                            subtitle="Classificação genética"
                          />
                        </>
                      )}
                      {temParentescoProximo && (
                        <MetricCard
                          title="Nível de Risco"
                          value={resultado.risco_consanguinidade || 'Alto'}
                          subtitle="Cruzamento não recomendado"
                        />
                      )}
                    </div>
                  );
                })()}

                {/* Detalhes adicionais */}
                {resultado.detalhes && (
                  <div
                    className={`rounded-xl p-5 mb-6 border ${
                      resultado.riscoAlto
                        ? 'bg-red-50/50 border-red-200'
                        : resultado.riscoModerado
                          ? 'bg-amber-50/50 border-amber-200'
                          : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <FiGitMerge
                        className={`${
                          resultado.riscoAlto
                            ? 'text-red-500'
                            : resultado.riscoModerado
                              ? 'text-amber-500'
                              : 'text-gray-500'
                        }`}
                        size={20}
                      />
                      <h4 className="font-semibold text-gray-700">
                        Análise de Parentesco
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Coeficiente de parentesco */}
                      <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Coeficiente de Parentesco
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            resultado.parentesco_pais > 6.25
                              ? 'text-red-600'
                              : resultado.parentesco_pais > 0
                                ? 'text-amber-600'
                                : 'text-green-600'
                          }`}
                        >
                          {resultado.parentesco_pais}%
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Entre os pais selecionados
                        </p>
                      </div>

                      {/* Tipo de relação */}
                      <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Relação Identificada
                        </p>
                        {resultado.detalhes.e_meio_irmao ? (
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                            <p className="text-lg font-semibold text-amber-700">
                              Meio-irmãos
                            </p>
                          </div>
                        ) : resultado.detalhes.tem_parentesco_direto ? (
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-400"></span>
                            <p className="text-lg font-semibold text-red-700">
                              {resultado.detalhes.tipo_parentesco_direto}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-green-400"></span>
                            <p className="text-lg font-semibold text-green-700">
                              Sem parentesco próximo
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Base no pedigree disponível
                        </p>
                      </div>

                      {/* Consanguinidade esperada na prole */}
                      <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Endogamia da Prole
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            resultado.consanguinidade_prole > 6.25
                              ? 'text-red-600'
                              : resultado.consanguinidade_prole > 0
                                ? 'text-amber-600'
                                : 'text-green-600'
                          }`}
                        >
                          {resultado.consanguinidade_prole}%
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {resultado.consanguinidade_prole > 6.25
                            ? 'Risco de depressão endogâmica'
                            : resultado.consanguinidade_prole > 0
                              ? 'Monitorar nas próximas gerações'
                              : 'Excelente diversidade genética'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DashboardContainer>
        </div>

        {/* --- TOP 5 BÚFALAS E TOUROS PARA SIMULAÇÃO --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Matrizes (Fêmeas) */}
          <DashboardContainer>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#404040] border-l-4 border-[#ffcf78] pl-3">
                Top 5 Matrizes Recomendadas
              </h2>
              <p className="text-xs text-gray-500 mt-1 pl-4">
                Classificadas por prontidão, idade, histórico e período ideal.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {loadingBufalos ? (
                <div className="flex items-center justify-center py-8">
                  <Loading text="Carregando matrizes..." />
                </div>
              ) : listaMatrizes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma matriz encontrada para esta propriedade.
                </div>
              ) : (
                listaMatrizes.slice(0, 5).map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#ffcf78] transition-colors cursor-pointer"
                    onClick={() => {
                      setMatrizId(item.id);
                      if (simulationState === 'done')
                        setSimulationState('idle');
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-[#ce7d0a] text-white' : 'bg-gray-200 text-gray-600'}`}
                      >
                        {index + 1}º
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">
                          {item.nome}
                        </h4>
                        <div className="text-xs text-gray-500 flex gap-2 flex-wrap">
                          <span>{item.brinco}</span>
                          <span>•</span>
                          <span>
                            {item.idadeMeses
                              ? `${Math.floor(item.idadeMeses / 12)}a ${item.idadeMeses % 12}m`
                              : 'N/A'}
                          </span>
                          <span>•</span>
                          <span>{item.raca}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        {item.status || 'Apta'}
                      </span>
                      <span className="text-xs font-bold text-[#ce7d0a]">
                        Score: {item.score}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DashboardContainer>

          {/* Top 5 Touros (Machos) */}
          <DashboardContainer>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#404040] border-l-4 border-[#ffcf78] pl-3">
                Top 5 Touros Recomendados
              </h2>
              <p className="text-xs text-gray-500 mt-1 pl-4">
                Classificados por idade, histórico, taxa de sucesso e genética.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {loadingBufalos ? (
                <div className="flex items-center justify-center py-8">
                  <Loading text="Carregando touros..." />
                </div>
              ) : listaTouros.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum touro encontrado para esta propriedade.
                </div>
              ) : (
                listaTouros.slice(0, 5).map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#ffcf78] transition-colors cursor-pointer"
                    onClick={() => {
                      setTouroId(item.id);
                      if (simulationState === 'done')
                        setSimulationState('idle');
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-[#ce7d0a] text-white' : 'bg-gray-200 text-gray-600'}`}
                      >
                        {index + 1}º
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">
                          {item.nome}
                        </h4>
                        <div className="text-xs text-gray-500 flex gap-2 flex-wrap">
                          <span>{item.brinco}</span>
                          <span>•</span>
                          <span>
                            {item.idadeMeses
                              ? `${Math.floor(item.idadeMeses / 12)}a ${item.idadeMeses % 12}m`
                              : 'N/A'}
                          </span>
                          <span>•</span>
                          <span>{item.raca}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        Ativo
                      </span>
                      <span className="text-xs font-bold text-[#ce7d0a]">
                        Score: {item.score}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DashboardContainer>
        </div>
      </div>
    </>
  );
}
