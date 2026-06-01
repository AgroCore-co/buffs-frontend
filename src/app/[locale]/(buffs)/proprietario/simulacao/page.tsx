"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("Proprietario.simulacao");
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
            recomendacao: t("results.errorMessage"),
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
              {t("title")}
            </h1>
            <p className="text-sm text-[#404040]/60 mt-0.5">{t("subtitle")}</p>
          </div>
        </div>
      </Container>

      {/* ── Simulação ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna de inputs */}
        <Container className="lg:col-span-1 border-t-4 border-t-[#ffcf78] p-5">
          <h2 className="text-base font-bold text-[#404040] mb-4">
            {t("params.title")}
          </h2>

          <form onSubmit={handleSimulation} className="flex flex-col gap-5">
            {/* Touro */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("params.bullLabel")}
              </label>
              <select
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffcf78] text-gray-700 transition-shadow text-sm"
                value={touroId}
                onChange={(e) => {
                  setTouroId(e.target.value);
                  if (simulationDone) setSimulationDone(false);
                }}
              >
                <option value="">{t("params.selectPlaceholder")}</option>
                {listaTouros.map((item) => (
                  <option key={item.idBufalo} value={item.idBufalo}>
                    {item.nome} ({item.brinco}) — Score {item.score}
                  </option>
                ))}
              </select>
              {touroId && (
                <p className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded border border-green-100">
                  {t("params.selectedBull")}{" "}
                  <strong>
                    {listaTouros.find((item) => item.idBufalo === touroId)?.nome}
                  </strong>
                </p>
              )}
            </div>

            {/* Matriz */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("params.matrixLabel")}
              </label>
              <select
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffcf78] text-gray-700 transition-shadow text-sm"
                value={matrizId}
                onChange={(e) => {
                  setMatrizId(e.target.value);
                  if (simulationDone) setSimulationDone(false);
                }}
              >
                <option value="">{t("params.selectPlaceholder")}</option>
                {listaMatrizes.map((item) => (
                  <option key={item.idBufalo} value={item.idBufalo}>
                    {item.nome} ({item.brinco})
                  </option>
                ))}
              </select>
              {matrizId && (
                <p className="mt-2 text-xs text-blue-700 bg-blue-50 p-2 rounded border border-blue-100">
                  {t("params.selectedMatrix")}{" "}
                  <strong>
                    {listaMatrizes.find((item) => item.idBufalo === matrizId)?.nome}
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
                {isPending ? t("params.processing") : t("params.run")}
              </Button>

              {simulationDone && (
                <button
                  type="button"
                  onClick={resetSimulation}
                  className="w-full mt-3 text-sm text-gray-500 hover:text-[#ce7d0a] flex items-center justify-center gap-1 transition-colors"
                >
                  <RotateCcw size={14} />
                  {t("params.reset")}
                </button>
              )}
            </div>
          </form>
        </Container>

        {/* Coluna de resultados */}
        <Container className="lg:col-span-2 p-5 min-h-[420px]">
          <h2 className="text-base font-bold text-[#404040] mb-5">
            {t("results.title")}
          </h2>

          {/* Idle */}
          {!simulationDone && !isPending && (
            <div className="flex flex-col items-center justify-center h-[300px] text-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-base font-semibold text-gray-700">
                {t("results.idle")}
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mt-2">
                {t("results.idleDesc")}
              </p>
            </div>
          )}

          {/* Loading */}
          {isPending && (
            <div className="flex flex-col items-center justify-center h-[300px] gap-4">
              <div className="w-10 h-10 border-4 border-[#ffcf78] border-t-[#ce7d0a] rounded-full animate-spin" />
              <p className="text-sm text-gray-500 text-center max-w-xs">
                {t("results.loadingDesc")}
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
                          ? t("results.highRisk")
                          : resultado.riscoModerado
                            ? t("results.moderateRisk")
                            : t("results.goodCompatibility")}
                      </h3>
                      <Badge type={resultado.temRisco ? "inactive" : "active"}>
                        {resultado.risco ?? t("results.defaultRisk")}
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
                        <strong>{t("results.parentage")}</strong> {resultado.nivelParentesco}
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
                      title={t("results.metrics.inbreeding")}
                      value={`${resultado.consanguinidade}%`}
                      subtitle={t("results.metrics.inbreedingDesc")}
                      icon={<Dna size={14} className="text-[#ce7d0a]" />}
                    />
                    {!temParentescoProximo && (
                      <>
                        <MetricCard
                          title={t("results.metrics.predicted")}
                          value={
                            resultado.predicaoLitros
                              ? `${resultado.predicaoLitros.toFixed(1)} L`
                              : "N/A"
                          }
                          subtitle={t("results.metrics.predictedDesc")}
                          icon={<Gauge size={14} className="text-[#ce7d0a]" />}
                        />
                        <MetricCard
                          title={t("results.metrics.variation")}
                          value={resultado.variacaoProducao}
                          subtitle={
                            resultado.producaoMedia
                              ? t("results.metrics.avgDesc", { avg: resultado.producaoMedia.toFixed(1) })
                              : t("results.metrics.variationDesc")
                          }
                          icon={<TrendingUp size={14} className="text-[#ce7d0a]" />}
                        />
                        <MetricCard
                          title={t("results.metrics.potential")}
                          value={resultado.classificacao ?? "N/A"}
                          subtitle={t("results.metrics.potentialDesc")}
                          icon={<Sparkles size={14} className="text-[#ce7d0a]" />}
                        />
                      </>
                    )}
                    {temParentescoProximo && (
                      <MetricCard
                        title={t("results.metrics.riskLevel")}
                        value={resultado.risco ?? t("results.defaultRisk")}
                        subtitle={t("results.metrics.riskLevelDesc")}
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
                    {t("results.analysis.title")}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                      {t("results.analysis.kinship")}
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
                      {t("results.analysis.kinshipDesc")}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                      {t("results.analysis.relation")}
                    </p>
                    {resultado.detalhes.e_meio_irmao ? (
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-400" />
                        <p className="text-base font-semibold text-amber-700">
                          {t("results.analysis.halfSiblings")}
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
                          {t("results.analysis.noRelation")}
                        </p>
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1">
                      {t("results.analysis.relationDesc")}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                      {t("results.analysis.offspring")}
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
                        ? t("results.analysis.highRiskDesc")
                        : resultado.consanguinidade > 0
                          ? t("results.analysis.moderateRiskDesc")
                          : t("results.analysis.noRiskDesc")}
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
              {t("top5.matrices.title")}
            </h2>
            <p className="text-xs text-gray-500 mt-1 pl-4">
              {t("top5.matrices.subtitle")}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {loadingBufalos ? (
              <div className="flex items-center justify-center py-8 gap-3">
                <div className="w-5 h-5 border-2 border-[#ffcf78] border-t-[#ce7d0a] rounded-full animate-spin" />
                <span className="text-sm text-gray-500">{t("top5.matrices.loading")}</span>
              </div>
            ) : listaMatrizes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
                <Users size={32} />
                <p className="text-sm">{t("top5.matrices.empty")}</p>
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
                      {item.dados_reprodutivos?.status ?? t("top5.matrices.defaultStatus")}
                    </span>
                    <span className="text-xs font-bold text-[#ce7d0a]">
                      {t("top5.score")} {item.score}
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
              {t("top5.bulls.title")}
            </h2>
            <p className="text-xs text-gray-500 mt-1 pl-4">
              {t("top5.bulls.subtitle")}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {loadingBufalos ? (
              <div className="flex items-center justify-center py-8 gap-3">
                <div className="w-5 h-5 border-2 border-[#ffcf78] border-t-[#ce7d0a] rounded-full animate-spin" />
                <span className="text-sm text-gray-500">{t("top5.bulls.loading")}</span>
              </div>
            ) : listaTouros.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
                <Users size={32} />
                <p className="text-sm">{t("top5.bulls.empty")}</p>
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
                      {t("top5.bulls.activeBadge")}
                    </span>
                    <span className="text-xs font-bold text-[#ce7d0a]">
                      {t("top5.score")} {item.score}
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
