"use client";

import { useState } from "react";
import {
  GitMerge,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Dna,
  Gauge,
  TrendingUp,
  Sparkles,
  Users,
} from "lucide-react";

import Container from "@/components/ui/Container";
import MetricCard from "@/components/ui/MetricCard";
import Badge from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { usePropriedadeStore } from "@/stores/propriedade.store";
import {
  useRecomendacoesFemeas,
  useRecomendacoesMachos,
  useSimularAcasalamento,
} from "@/hooks/useCobertura";
import type { ResultadoSimulacao } from "@/services/cobertura.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAge(months: number | null): string {
  if (!months) return "N/A";
  const y = Math.floor(months / 12);
  const m = months % 12;
  return y > 0 ? `${y}a ${m}m` : `${m}m`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function get(obj: any, ...keys: string[]): unknown {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k];
  }
  return undefined;
}

function normalizeResultado(raw: ResultadoSimulacao) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as any;

  const consanguinidade = Number(get(r, 'consanguinidade_prole', 'consanguinidadeProle') ?? 0);
  const parentesco = Number(get(r, 'parentesco_pais', 'parentescoPais') ?? 0);
  const nivelParentesco = (get(r, 'nivel_parentesco', 'nivelParentesco') as string | null) ?? null;
  const risco = (get(r, 'risco_consanguinidade', 'riscoConsanguinidade') as string | null) ?? null;

  const d = r.detalhes ?? r.detalhes ?? {};
  const detalhes = {
    e_meio_irmao: Boolean(get(d, 'e_meio_irmao', 'eMeioIrmao') ?? false),
    tem_parentesco_direto: Boolean(get(d, 'tem_parentesco_direto', 'temParentescoDireto') ?? false),
    tipo_parentesco_direto: (get(d, 'tipo_parentesco_direto', 'tipoParentescoDireto') as string | null) ?? null,
    coeficiente_decimal: Number(get(d, 'coeficiente_decimal', 'coeficienteDecimal') ?? 0),
  };

  const p = r.predicao_producao_femea ?? r.predicaoProducaoFemea ?? null;
  const predicaoLitros = p ? (Number(get(p, 'predicao_litros', 'predicaoLitros') ?? 0) || null) : null;
  const producaoMedia = p ? (Number(get(p, 'producao_media_propriedade', 'producaoMediaPropriedade') ?? 0) || null) : null;
  const percentualVsMedia = p ? (get(p, 'percentual_vs_media', 'percentualVsMedia') as number | null) ?? null : null;
  const classificacao = p ? (get(p, 'classificacao_potencial', 'classificacaoPotencial') as string | null) ?? null : null;

  const riscoAlto = risco === "Alto" || risco === "Crítico";
  const riscoModerado = risco === "Moderado";
  const temRisco = riscoAlto || riscoModerado;

  const variacaoProducao =
    percentualVsMedia !== null && percentualVsMedia !== undefined
      ? `${percentualVsMedia > 0 ? "+" : ""}${Number(percentualVsMedia).toFixed(1)}%`
      : "N/A";

  return {
    consanguinidade,
    parentesco,
    nivelParentesco,
    risco,
    recomendacao: raw.recomendacao,
    detalhes,
    predicaoLitros: predicaoLitros && predicaoLitros > 50 ? predicaoLitros / 1000 : predicaoLitros,
    producaoMedia: producaoMedia && producaoMedia > 50 ? producaoMedia / 1000 : producaoMedia,
    percentualVsMedia,
    classificacao,
    variacaoProducao,
    temRisco,
    riscoAlto,
    riscoModerado,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SimulacaoPage() {
  const { activeId } = usePropriedadeStore();

  const [touroId, setTouroId] = useState("");
  const [matrizId, setMatrizId] = useState("");
  const [resultado, setResultado] = useState<ReturnType<typeof normalizeResultado> | null>(null);
  const [simulationDone, setSimulationDone] = useState(false);

  const { data: listaTouros = [], isLoading: loadingTouros } =
    useRecomendacoesMachos(activeId ?? undefined);
  const { data: listaMatrizes = [], isLoading: loadingMatrizes } =
    useRecomendacoesFemeas(activeId ?? undefined);
  const loadingBufalos = loadingTouros || loadingMatrizes;

  const { mutate: simular, isPending } = useSimularAcasalamento();

  const handleSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!touroId || !matrizId) return;

    simular(
      { idMacho: touroId, idFemea: matrizId },
      {
        onSuccess: (data) => {
          setResultado(normalizeResultado(data));
          setSimulationDone(true);
        },
        onError: () => {
          setResultado({
            consanguinidade: 0,
            parentesco: 0,
            nivelParentesco: null,
            risco: "Alto",
            recomendacao: "Erro ao realizar simulação. Tente novamente.",
            detalhes: {
              e_meio_irmao: false,
              tem_parentesco_direto: false,
              tipo_parentesco_direto: null,
              coeficiente_decimal: 0,
            },
            predicaoLitros: null,
            producaoMedia: null,
            percentualVsMedia: null,
            classificacao: null,
            variacaoProducao: "N/A",
            temRisco: true,
            riscoAlto: true,
            riscoModerado: false,
          });
          setSimulationDone(true);
        },
      },
    );
  };

  const resetSimulation = () => {
    setSimulationDone(false);
    setResultado(null);
    setTouroId("");
    setMatrizId("");
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <Container className="p-5">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#404040] flex items-center gap-2">
              <Dna size={22} className="text-[#ce7d0a]" />
              Simulador de Acasalamento
            </h1>
            <p className="text-sm text-[#404040]/60 mt-0.5">
              Ferramenta preditiva para análise de compatibilidade genética e estimativa de
              produção da progênie (F1).
            </p>
          </div>
        </div>
      </Container>

      {/* ── Simulação ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna de inputs */}
        <Container className="lg:col-span-1 border-t-4 border-t-[#ffcf78] p-5">
          <h2 className="text-base font-bold text-[#404040] mb-4">
            Parâmetros do Cruzamento
          </h2>

          <form onSubmit={handleSimulation} className="flex flex-col gap-5">
            {/* Touro */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                1. Selecione o Reprodutor (Touro)
              </label>
              <select
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffcf78] text-gray-700 transition-shadow text-sm"
                value={touroId}
                onChange={(e) => {
                  setTouroId(e.target.value);
                  if (simulationDone) setSimulationDone(false);
                }}
              >
                <option value="">Selecione...</option>
                {listaTouros.map((t) => (
                  <option key={t.idBufalo} value={t.idBufalo}>
                    {t.nome} ({t.brinco}) — Score {t.score}
                  </option>
                ))}
              </select>
              {touroId && (
                <p className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded border border-green-100">
                  Reprodutor:{" "}
                  <strong>
                    {listaTouros.find((t) => t.idBufalo === touroId)?.nome}
                  </strong>
                </p>
              )}
            </div>

            {/* Matriz */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                2. Selecione a Matriz
              </label>
              <select
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffcf78] text-gray-700 transition-shadow text-sm"
                value={matrizId}
                onChange={(e) => {
                  setMatrizId(e.target.value);
                  if (simulationDone) setSimulationDone(false);
                }}
              >
                <option value="">Selecione...</option>
                {listaMatrizes.map((m) => (
                  <option key={m.idBufalo} value={m.idBufalo}>
                    {m.nome} ({m.brinco})
                  </option>
                ))}
              </select>
              {matrizId && (
                <p className="mt-2 text-xs text-blue-700 bg-blue-50 p-2 rounded border border-blue-100">
                  Matriz:{" "}
                  <strong>
                    {listaMatrizes.find((m) => m.idBufalo === matrizId)?.nome}
                  </strong>
                </p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={!touroId || !matrizId || isPending}
                isLoading={isPending}
              >
                {isPending ? "Processando..." : "Executar Simulação"}
              </Button>

              {simulationDone && (
                <button
                  type="button"
                  onClick={resetSimulation}
                  className="w-full mt-3 text-sm text-gray-500 hover:text-[#ce7d0a] flex items-center justify-center gap-1 transition-colors"
                >
                  <RotateCcw size={14} />
                  Limpar simulação
                </button>
              )}
            </div>
          </form>
        </Container>

        {/* Coluna de resultados */}
        <Container className="lg:col-span-2 p-5 min-h-[420px]">
          <h2 className="text-base font-bold text-[#404040] mb-5">
            Resultado da Análise
          </h2>

          {/* Idle */}
          {!simulationDone && !isPending && (
            <div className="flex flex-col items-center justify-center h-[300px] text-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-base font-semibold text-gray-700">
                Aguardando Dados
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mt-2">
                Selecione um touro e uma matriz no painel ao lado para visualizar
                a previsão de acasalamento.
              </p>
            </div>
          )}

          {/* Loading */}
          {isPending && (
            <div className="flex flex-col items-center justify-center h-[300px] gap-4">
              <div className="w-10 h-10 border-4 border-[#ffcf78] border-t-[#ce7d0a] rounded-full animate-spin" />
              <p className="text-sm text-gray-500 text-center max-w-xs">
                Cruzando dados genéticos... Verificando pedigrees e coeficientes
                de endogamia.
              </p>
            </div>
          )}

          {/* Resultado */}
          {simulationDone && resultado && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              {/* Banner de risco */}
              <div
                className={`p-5 rounded-xl border-l-8 mb-5 ${
                  resultado.riscoAlto
                    ? "bg-red-50 border-red-500"
                    : resultado.riscoModerado
                      ? "bg-amber-50 border-amber-500"
                      : "bg-green-50 border-green-500"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2.5 rounded-full ${
                      resultado.riscoAlto
                        ? "bg-red-100 text-red-600"
                        : resultado.riscoModerado
                          ? "bg-amber-100 text-amber-600"
                          : "bg-green-100 text-green-600"
                    }`}
                  >
                    {resultado.temRisco ? (
                      <AlertTriangle size={28} />
                    ) : (
                      <CheckCircle2 size={28} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3
                        className={`text-lg font-bold ${
                          resultado.riscoAlto
                            ? "text-red-800"
                            : resultado.riscoModerado
                              ? "text-amber-800"
                              : "text-green-800"
                        }`}
                      >
                        {resultado.riscoAlto
                          ? "Risco Alto de Consanguinidade"
                          : resultado.riscoModerado
                            ? "Risco Moderado"
                            : "Excelente Compatibilidade"}
                      </h3>
                      <Badge type={resultado.temRisco ? "inactive" : "active"}>
                        {resultado.risco ?? "Baixo"}
                      </Badge>
                    </div>
                    <p
                      className={`text-sm ${
                        resultado.riscoAlto
                          ? "text-red-700"
                          : resultado.riscoModerado
                            ? "text-amber-700"
                            : "text-green-700"
                      }`}
                    >
                      {resultado.recomendacao}
                    </p>
                    {resultado.nivelParentesco && (
                      <p className="text-xs text-gray-600 mt-1">
                        <strong>Parentesco:</strong> {resultado.nivelParentesco}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Métricas */}
              {(() => {
                const temParentescoProximo =
                  resultado.detalhes.e_meio_irmao ||
                  resultado.detalhes.tem_parentesco_direto;

                return (
                  <div
                    className={`grid grid-cols-1 sm:grid-cols-2 ${temParentescoProximo ? "lg:grid-cols-2" : "lg:grid-cols-4"} gap-3 mb-5`}
                  >
                    <MetricCard
                      title="Consanguinidade Prole"
                      value={`${resultado.consanguinidade}%`}
                      subtitle="Coeficiente de endogamia"
                      icon={<Dna size={14} className="text-[#ce7d0a]" />}
                    />
                    {!temParentescoProximo && (
                      <>
                        <MetricCard
                          title="Produção Prevista"
                          value={
                            resultado.predicaoLitros
                              ? `${resultado.predicaoLitros.toFixed(1)} L`
                              : "N/A"
                          }
                          subtitle="Litros/dia estimado"
                          icon={<Gauge size={14} className="text-[#ce7d0a]" />}
                        />
                        <MetricCard
                          title="Variação da Média"
                          value={resultado.variacaoProducao}
                          subtitle={
                            resultado.producaoMedia
                              ? `Média atual: ${resultado.producaoMedia.toFixed(1)} L/dia`
                              : "Comparativo"
                          }
                          icon={<TrendingUp size={14} className="text-[#ce7d0a]" />}
                        />
                        <MetricCard
                          title="Potencial"
                          value={resultado.classificacao ?? "N/A"}
                          subtitle="Classificação genética"
                          icon={<Sparkles size={14} className="text-[#ce7d0a]" />}
                        />
                      </>
                    )}
                    {temParentescoProximo && (
                      <MetricCard
                        title="Nível de Risco"
                        value={resultado.risco ?? "Alto"}
                        subtitle="Cruzamento não recomendado"
                        icon={<AlertTriangle size={14} className="text-[#ce7d0a]" />}
                      />
                    )}
                  </div>
                );
              })()}

              {/* Análise de parentesco */}
              <div
                className={`rounded-xl p-5 border ${
                  resultado.riscoAlto
                    ? "bg-red-50/50 border-red-200"
                    : resultado.riscoModerado
                      ? "bg-amber-50/50 border-amber-200"
                      : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <GitMerge
                    size={18}
                    className={
                      resultado.riscoAlto
                        ? "text-red-500"
                        : resultado.riscoModerado
                          ? "text-amber-500"
                          : "text-gray-500"
                    }
                  />
                  <h4 className="font-semibold text-gray-700 text-sm">
                    Análise de Parentesco
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                      Coeficiente de Parentesco
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        resultado.parentesco > 6.25
                          ? "text-red-600"
                          : resultado.parentesco > 0
                            ? "text-amber-600"
                            : "text-green-600"
                      }`}
                    >
                      {resultado.parentesco}%
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Entre os pais selecionados
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                      Relação Identificada
                    </p>
                    {resultado.detalhes.e_meio_irmao ? (
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-400" />
                        <p className="text-base font-semibold text-amber-700">
                          Meio-irmãos
                        </p>
                      </div>
                    ) : resultado.detalhes.tem_parentesco_direto ? (
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-400" />
                        <p className="text-base font-semibold text-red-700">
                          {resultado.detalhes.tipo_parentesco_direto}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-400" />
                        <p className="text-base font-semibold text-green-700">
                          Sem parentesco próximo
                        </p>
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1">
                      Base no pedigree disponível
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                      Endogamia da Prole
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        resultado.consanguinidade > 6.25
                          ? "text-red-600"
                          : resultado.consanguinidade > 0
                            ? "text-amber-600"
                            : "text-green-600"
                      }`}
                    >
                      {resultado.consanguinidade}%
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {resultado.consanguinidade > 6.25
                        ? "Risco de depressão endogâmica"
                        : resultado.consanguinidade > 0
                          ? "Monitorar nas próximas gerações"
                          : "Excelente diversidade genética"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Container>
      </div>

      {/* ── Top 5 recomendados ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Matrizes */}
        <Container className="p-5">
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#404040] border-l-4 border-[#ffcf78] pl-3">
              Top 5 Matrizes Recomendadas
            </h2>
            <p className="text-xs text-gray-500 mt-1 pl-4">
              Classificadas por prontidão, idade, histórico e período ideal.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {loadingBufalos ? (
              <div className="flex items-center justify-center py-8 gap-3">
                <div className="w-5 h-5 border-2 border-[#ffcf78] border-t-[#ce7d0a] rounded-full animate-spin" />
                <span className="text-sm text-gray-500">Carregando matrizes...</span>
              </div>
            ) : listaMatrizes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
                <Users size={32} />
                <p className="text-sm">Nenhuma matriz encontrada para esta propriedade.</p>
              </div>
            ) : (
              listaMatrizes.slice(0, 5).map((item, index) => (
                <button
                  key={item.idBufalo}
                  type="button"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#ffcf78] transition-colors text-left w-full"
                  onClick={() => {
                    setMatrizId(item.idBufalo);
                    if (simulationDone) setSimulationDone(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        index === 0
                          ? "bg-[#ce7d0a] text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {index + 1}º
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{item.nome}</p>
                      <div className="text-xs text-gray-500 flex gap-1.5 flex-wrap">
                        <span>{item.brinco}</span>
                        <span>•</span>
                        <span>{formatAge(item.idadeMeses)}</span>
                        <span>•</span>
                        <span>{item.raca ?? "N/A"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      {item.dados_reprodutivos?.status ?? "Apta"}
                    </span>
                    <span className="text-xs font-bold text-[#ce7d0a]">
                      Score: {item.score}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </Container>

        {/* Top 5 Touros */}
        <Container className="p-5">
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#404040] border-l-4 border-[#ffcf78] pl-3">
              Top 5 Touros Recomendados
            </h2>
            <p className="text-xs text-gray-500 mt-1 pl-4">
              Classificados por idade, histórico, taxa de sucesso e genética.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {loadingBufalos ? (
              <div className="flex items-center justify-center py-8 gap-3">
                <div className="w-5 h-5 border-2 border-[#ffcf78] border-t-[#ce7d0a] rounded-full animate-spin" />
                <span className="text-sm text-gray-500">Carregando touros...</span>
              </div>
            ) : listaTouros.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
                <Users size={32} />
                <p className="text-sm">Nenhum touro encontrado para esta propriedade.</p>
              </div>
            ) : (
              listaTouros.slice(0, 5).map((item, index) => (
                <button
                  key={item.idBufalo}
                  type="button"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#ffcf78] transition-colors text-left w-full"
                  onClick={() => {
                    setTouroId(item.idBufalo);
                    if (simulationDone) setSimulationDone(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        index === 0
                          ? "bg-[#ce7d0a] text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {index + 1}º
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{item.nome}</p>
                      <div className="text-xs text-gray-500 flex gap-1.5 flex-wrap">
                        <span>{item.brinco}</span>
                        <span>•</span>
                        <span>{formatAge(item.idadeMeses)}</span>
                        <span>•</span>
                        <span>{item.raca ?? "N/A"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      Ativo
                    </span>
                    <span className="text-xs font-bold text-[#ce7d0a]">
                      Score: {item.score}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </Container>
      </div>
    </div>
  );
}
