"use client";

import { useMemo, useState, useCallback } from "react";
import {
  Activity, Droplets, RefreshCw, TrendingUp, TrendingDown, AlertCircle,
  ChevronLeft, ChevronRight, BarChart3, Bell,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts";

import Container from "@/components/ui/Container";
import MetricCard from "@/components/ui/MetricCard";
import {
  DataTable, TableBody, TableCell, TableEmptyState, TableHead, TableHeader, TableRow,
} from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { usePropriedadeStore } from "@/stores/propriedade.store";
import { useDashboardProducaoMensal } from "@/hooks/useDashboard";
import { useEstatisticasLactacao, useFemeasEmLactacao } from "@/hooks/useLactacao";
import { useAlertasByPropriedade } from "@/hooks/useAlertas";
import type { FemeaEmLactacao } from "@/services/lactacao.service";
import { ResumoProducaoModal } from "@/components/proprietario/lactacao/ResumoProducaoModal";
import { AlertasProducaoModal } from "@/components/proprietario/lactacao/AlertasProducaoModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const CLASSIFICACAO_COLORS: Record<string, string> = {
  "Ótima": "bg-green-100 text-green-800",
  Boa: "bg-blue-100 text-blue-800",
  Mediana: "bg-yellow-100 text-yellow-800",
  Ruim: "bg-red-100 text-red-800",
};

function classificacaoColor(c?: string) {
  return CLASSIFICACAO_COLORS[c ?? ""] ?? "bg-zinc-100 text-zinc-700";
}

function prioridadeStyle(p: string): { border: string; bg: string; badge: string } {
  if (p === "ALTA") return { border: "border-l-red-500", bg: "bg-red-50", badge: "bg-red-100 text-red-700" };
  if (p === "MEDIA") return { border: "border-l-amber-500", bg: "bg-amber-50", badge: "bg-amber-100 text-amber-700" };
  return { border: "border-l-blue-500", bg: "bg-blue-50", badge: "bg-blue-100 text-blue-700" };
}

function shortDayBR(value?: string | null) {
  if (!value) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.slice(0, 10));
  return m ? `${m[3]}/${m[2]}` : "";
}

const TABLE_LIMIT = 10;

export default function LactacaoPage() {
  const { activeId, activePropriedade } = usePropriedadeStore();
  const hasActive = !!activeId;
  const anoAtual = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(anoAtual);
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState("");
  const [selectedFemea, setSelectedFemea] = useState<string | null>(null);
  const [showAlertas, setShowAlertas] = useState(false);

  // Cards usam sempre o ano atual; o gráfico segue o ano selecionado.
  const { data: producaoAtual, isLoading: isLoadingMetrics } = useDashboardProducaoMensal(
    activeId ?? "", anoAtual, { enabled: hasActive },
  );
  const { data: producaoGrafico } = useDashboardProducaoMensal(
    activeId ?? "", selectedYear, { enabled: hasActive },
  );
  const { data: estatisticas } = useEstatisticasLactacao(activeId ?? "", { enabled: hasActive });
  const { data: femeas = [], isLoading: isLoadingFemeas } = useFemeasEmLactacao(activeId ?? "", { enabled: hasActive });
  const { data: alertasResp, isLoading: isLoadingAlertas } = useAlertasByPropriedade(
    activeId ?? "",
    { nichos: ["CLINICO", "PRODUCAO"], incluirVistos: false, limit: 100 },
    { enabled: hasActive },
  );

  // ── Métricas ──
  const lactando = estatisticas?.ciclosAtivos ?? producaoAtual?.bufalasLactantesAtual ?? 0;
  const leiteMes = producaoAtual?.mesAtualLitros ?? 0;
  const variacao = producaoAtual?.variacaoPercentual ?? 0;
  const mesAnterior = producaoAtual?.mesAnteriorLitros ?? 0;
  const totalCiclos = estatisticas?.totalCiclos ?? 0;

  // ── Gráfico mensal ──
  const chartData = useMemo(() => {
    const serie = producaoGrafico?.serieHistorica ?? [];
    return serie.map((item, idx, arr) => {
      const mesIdx = Number(item.mes.split("-")[1]) - 1;
      let varMes = 0;
      if (idx > 0) {
        const ant = arr[idx - 1].totalLitros;
        if (ant > 0) varMes = ((item.totalLitros - ant) / ant) * 100;
        else if (item.totalLitros > 0) varMes = 100;
      }
      return { mes: MESES[mesIdx] ?? item.mes, producao: item.totalLitros ?? 0, variacao: varMes };
    });
  }, [producaoGrafico]);
  const hasChartData = chartData.some(d => d.producao > 0);

  // ── Alertas (painel) ──
  const alertas = useMemo(
    () => (alertasResp?.data ?? []).filter(a => !a.visto),
    [alertasResp],
  );

  // ── Tabela (busca + paginação client-side) ──
  // A API pode retornar a mesma búfala mais de uma vez — deduplica por idBufalo.
  const femeasUnicas = useMemo(() => {
    const seen = new Set<string>();
    return femeas.filter(f => {
      if (!f.idBufalo || seen.has(f.idBufalo)) return false;
      seen.add(f.idBufalo);
      return true;
    });
  }, [femeas]);

  const femeasFiltradas = useMemo(() => {
    const term = busca.trim().toLowerCase();
    if (!term) return femeasUnicas;
    return femeasUnicas.filter(f =>
      (f.nome ?? "").toLowerCase().includes(term) || (f.brinco ?? "").toLowerCase().includes(term),
    );
  }, [femeasUnicas, busca]);

  const total = femeasFiltradas.length;
  const totalPages = Math.max(1, Math.ceil(total / TABLE_LIMIT));
  const paginadas = femeasFiltradas.slice((page - 1) * TABLE_LIMIT, page * TABLE_LIMIT);

  const handleFilter = useCallback((params: Record<string, string>) => {
    setBusca(params.busca ?? "");
    setPage(1);
  }, []);

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* ── Header + métricas ─────────────────────────────────────── */}
      <Container className="p-5">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#404040]">
              Controle de Produção{activePropriedade?.nome ? ` - ${activePropriedade.nome}` : ""}
            </h1>
            <p className="text-sm text-[#404040]/60 mt-1">
              Gerencie a produção leiteira e os ciclos de lactação do rebanho.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
            <MetricCard
              title="Búfalas Lactando"
              value={!hasActive ? "0" : isLoadingMetrics ? "..." : String(lactando)}
              subtitle="Dados do mês atual"
              icon={<Activity className="w-4 h-4 text-[#ce7d0a]" />}
            />
            <MetricCard
              title="Leite produzido (mês atual)"
              value={!hasActive ? "0 L" : isLoadingMetrics ? "..." : `${leiteMes.toFixed(1)} L`}
              subtitle={
                !hasActive
                  ? "Selecione uma propriedade"
                  : `${variacao > 0 ? "+" : ""}${variacao.toFixed(1)}% · ${mesAnterior.toFixed(1)} L no mês anterior`
              }
              icon={<Droplets className="w-4 h-4 text-[#ce7d0a]" />}
            />
            <MetricCard
              title="Total de Ciclos"
              value={!hasActive ? "0" : isLoadingMetrics ? "..." : String(totalCiclos)}
              subtitle="Ciclos reprodutivos registrados"
              icon={<RefreshCw className="w-4 h-4 text-[#ce7d0a]" />}
            />
          </div>
        </div>
      </Container>

      {/* ── Gráfico + Alertas ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico mês a mês */}
        <Container className="p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-zinc-800 border-l-4 border-[#ffcf78] pl-3">
              Produção mês a mês ({selectedYear})
            </h2>
            <div className="flex items-center gap-2 bg-zinc-50 rounded-lg p-1">
              <button
                onClick={() => setSelectedYear(y => y - 1)}
                className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-zinc-600"
                title="Ano anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-zinc-700 min-w-[3rem] text-center">{selectedYear}</span>
              <button
                onClick={() => setSelectedYear(y => Math.min(anoAtual, y + 1))}
                disabled={selectedYear >= anoAtual}
                className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Próximo ano"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="w-full h-[350px]">
            {hasActive && hasChartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 0, left: -20 }} barCategoryGap="5%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="mes" tick={{ fontSize: 13, fill: "#6B7280", fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, "auto"]} tick={{ fontSize: 13, fill: "#6B7280", fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "#F3F4F6" }}
                    contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    formatter={(value, _name, item) => {
                      const v = typeof value === "number" ? value : parseFloat(String(value));
                      const varMes = Number(item?.payload?.variacao ?? 0);
                      const sufixo = varMes !== 0 ? ` (${varMes > 0 ? "▲" : "▼"} ${Math.abs(varMes).toFixed(1)}%)` : "";
                      return [`${(Number.isNaN(v) ? 0 : v).toFixed(1)} L${sufixo}`, "Produção"];
                    }}
                  />
                  <Bar dataKey="producao" radius={[4, 4, 0, 0]} barSize={64}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.variacao > 0 ? "#FCA90F" : entry.variacao < 0 ? "#CE7D0A" : "#FFCF78"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-zinc-300">
                <BarChart3 className="w-8 h-8" />
                <p className="text-sm font-semibold text-zinc-400">Sem dados de produção para {selectedYear}</p>
                <p className="text-xs text-zinc-300">Não há registros consolidados para este período.</p>
              </div>
            )}
          </div>
        </Container>

        {/* Alertas de Produção */}
        <Container className="p-6 flex flex-col min-h-[350px]">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold text-zinc-800 border-l-4 border-[#ffcf78] pl-3">Alertas de Produção</h2>
            <button
              onClick={() => setShowAlertas(true)}
              disabled={!hasActive}
              className="bg-[#FFCF78] hover:bg-[#fca90f] text-[#404040] font-medium py-1.5 px-4 rounded text-sm transition-colors disabled:opacity-40"
            >
              Ver Todos
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingAlertas ? (
              <div className="flex items-center justify-center h-full text-zinc-400 text-sm">Carregando alertas...</div>
            ) : alertas.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                <Bell className="w-7 h-7 text-zinc-200" />
                <p className="text-sm font-semibold text-zinc-400">Nenhum alerta no momento</p>
                <p className="text-xs text-zinc-300">Sem alertas de produção ou clínicos pendentes.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alertas.slice(0, 4).map((a) => {
                  const st = prioridadeStyle(a.prioridade);
                  return (
                    <div key={a.idAlerta} className={`p-3 rounded-lg border-l-4 ${st.border} ${st.bg}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${st.badge}`}>{a.prioridade}</span>
                        <span className="text-[10px] text-zinc-500">{a.nicho}</span>
                        {!a.visto && <span className="ml-auto w-2 h-2 bg-red-500 rounded-full" />}
                      </div>
                      {a.bufalo && (
                        <div className="flex items-center gap-2 mb-1.5 py-1 px-2 bg-white/70 rounded border border-zinc-100">
                          <span className="text-xs font-bold text-zinc-800 truncate">{a.bufalo.nome}</span>
                          {a.bufalo.brinco && <span className="text-[10px] text-zinc-500">· {a.bufalo.brinco}</span>}
                        </div>
                      )}
                      <p className="text-sm font-medium text-zinc-800">{a.motivo}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Container>
      </div>

      {/* ── Tabela: Búfalas disponíveis para ordenha ──────────────── */}
      <Container className="p-5">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-[#404040]">Búfalas Disponíveis para Ordenha</h2>
          <p className="text-sm text-[#404040]/60 mt-1">Selecione um animal para ver o resumo de produção</p>
        </div>

        <FilterBar
          filters={[{ type: "text", key: "busca", placeholder: "Buscar por nome ou brinco..." }]}
          onFilterChange={handleFilter}
          className="mb-4"
        />

        {isLoadingFemeas && hasActive ? (
          <div className="w-full min-h-[240px] flex items-center justify-center border border-zinc-200 rounded-xl bg-zinc-50/50">
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
              <span className="text-sm font-medium">Carregando animais...</span>
            </div>
          </div>
        ) : (
          <DataTable
            isEmpty={paginadas.length === 0}
            pagination={
              total > 0
                ? { page, totalPages, onPageChange: setPage, total, limit: TABLE_LIMIT }
                : undefined
            }
            emptyState={
              <TableEmptyState
                icon={Droplets}
                title={hasActive ? "Nenhuma búfala em lactação" : "Selecione uma propriedade"}
                description={
                  hasActive
                    ? "Não há fêmeas com ciclo de lactação ativo nesta propriedade."
                    : "Escolha uma propriedade para visualizar as búfalas disponíveis para ordenha."
                }
              />
            }
          >
            <TableHeader>
              <TableHead>Tag</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Raça</TableHead>
              <TableHead align="center">Dias em Lact.</TableHead>
              <TableHead align="center">Média/Dia</TableHead>
              <TableHead align="right">Última</TableHead>
              <TableHead align="center">Classificação</TableHead>
            </TableHeader>
            <TableBody>
              {paginadas.map((f: FemeaEmLactacao) => {
                const ult = f.producaoAtual?.ultimaOrdenha;
                return (
                  <TableRow key={f.idBufalo} onClick={() => setSelectedFemea(f.idBufalo)}>
                    <TableCell>
                      <span className="text-sm font-medium text-zinc-900">{f.brinco || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-bold text-zinc-900">{f.nome || "Sem nome"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-zinc-600">{f.raca || "—"}</span>
                    </TableCell>
                    <TableCell align="center">
                      <span className="text-sm text-zinc-700">
                        {f.cicloAtual?.diasEmLactacao != null ? `${f.cicloAtual.diasEmLactacao} dias` : "—"}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <span className="text-sm font-bold text-zinc-700">
                        {f.producaoAtual?.mediaDiaria != null ? `${Number(f.producaoAtual.mediaDiaria).toFixed(2)} L` : "—"}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      {ult ? (
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold text-zinc-900">{Number(ult.quantidade).toFixed(2)} L</span>
                          {ult.data && (
                            <span className="text-[10px] text-zinc-500">em {shortDayBR(ult.data)} ({ult.periodo})</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-zinc-300">—</span>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classificacaoColor(f.classificacao)}`}>
                        {f.classificacao || "—"}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </DataTable>
        )}

        {hasActive && !isLoadingFemeas && (
          <p className="text-sm text-zinc-500 mt-4">Mostrando {total} {total === 1 ? "animal" : "animais"}</p>
        )}
      </Container>

      {/* ── Modais ────────────────────────────────────────────────── */}
      <ResumoProducaoModal
        isOpen={!!selectedFemea}
        onClose={() => setSelectedFemea(null)}
        idFemea={selectedFemea}
      />

      {hasActive && (
        <AlertasProducaoModal
          isOpen={showAlertas}
          onClose={() => setShowAlertas(false)}
          idPropriedade={activeId!}
          nichos={["CLINICO", "PRODUCAO"]}
        />
      )}
    </div>
  );
}
