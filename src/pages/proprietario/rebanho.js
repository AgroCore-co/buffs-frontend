"use client";
import Loading from "@/components/loading/Loading";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import React from "react";
import Button from "@/components/ui/Button";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  XAxis,
  YAxis,
  Bar,
} from "recharts";
import DashboardContainer from "@/components/ui/DashboardContainer";
import MetricCard from "@/components/ui/MetricCard";

// Dados mockados para os gráficos
const totalAtivos = 46;
const femeasAtivas = 34;
const machosAtivos = 12;
const lactando = 8;

const maturidadeData = [
  { name: "Bezerros", value: 10, color: "#FCA90F" },
  { name: "Novilhas", value: 12, color: "#FFCF78" },
  { name: "Vacas", value: 18, color: "#CE7D0A" },
  { name: "Touros", value: 6, color: "#F2B84D" },
];

const sexData = [
  { name: "Fêmeas", value: 34, color: "#FFCF78" },
  { name: "Machos", value: 12, color: "#CE7D0A" },
];

const bufalosPorRaca = [
  { raca: "Murrah", quantidade: 20 },
  { raca: "Jafarabadi", quantidade: 10 },
  { raca: "Mediterrâneo", quantidade: 8 },
  { raca: "Carabao", quantidade: 8 },
];

const frequenciaDoencas = [
  { doenca: "Brucelose", frequencia: 3 },
  { doenca: "Febre Aftosa", frequencia: 2 },
  { doenca: "Tuberculose", frequencia: 1 },
  { doenca: "Raiva", frequencia: 1 },
];

// Dados mockados da tabela (100% estáticos)
const bufalosMock = [
  {
    id: 1,
    brinco: "BUF-001",
    nome: "Lua Cheia",
    sexo: "F",
    raca: "Murrah",
    maturidade: "V",
    status: true,
  },
  {
    id: 2,
    brinco: "BUF-002",
    nome: "Trovão",
    sexo: "M",
    raca: "Jafarabadi",
    maturidade: "T",
    status: true,
  },
  {
    id: 3,
    brinco: "BUF-003",
    nome: "Estrela",
    sexo: "F",
    raca: "Murrah",
    maturidade: "N",
    status: true,
  },
  {
    id: 4,
    brinco: "BUF-004",
    nome: "Raio",
    sexo: "M",
    raca: "Mediterrâneo",
    maturidade: "B",
    status: false,
  },
  {
    id: 5,
    brinco: "BUF-005",
    nome: "Sol Nascente",
    sexo: "F",
    raca: "Carabao",
    maturidade: "V",
    status: true,
  },
  {
    id: 6,
    brinco: "BUF-006",
    nome: "Neve",
    sexo: "F",
    raca: "Murrah",
    maturidade: "V",
    status: true,
  },
  {
    id: 7,
    brinco: "BUF-007",
    nome: "Vento Norte",
    sexo: "M",
    raca: "Jafarabadi",
    maturidade: "A",
    status: true,
  },
  {
    id: 8,
    brinco: "BUF-008",
    nome: "Aurora",
    sexo: "F",
    raca: "Murrah",
    maturidade: "V",
    status: true,
  },
];

const getMaturidadeTexto = (codigo) => {
  switch (codigo) {
    case "B":
      return "Bezerro(a)";
    case "N":
      return "Novilho(a)";
    case "V":
      return "Vaca";
    case "T":
      return "Touro";
    case "A":
      return "Adulto";
    default:
      return "N/D";
  }
};

export default function Rebanho() {
  const { loading } = useProtectedRoute(["PROPRIETARIO"]);
  if (loading) {
    return <Loading text="Carregando painel..." />;
  }
  return (
    // Ajustado para manter o padrão das outras telas (removido p-4, bg-gray-50 e min-h-screen)
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      {/* Header */}
      <DashboardContainer>
        <div>
          <h1 className="text-2xl font-bold text-[#404040] mb-1">
            Gestão do Rebanho
          </h1>
          <p className="text-[#404040]/70 text-sm">
            Gerencie seu rebanho de búfalos, registre informações zootécnicas e
            sanitárias.
          </p>
        </div>
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total do Rebanho"
            value={totalAtivos}
            subtitle="Búfalos ativos no sistema"
          />
          <MetricCard
            title="Fêmeas"
            value={femeasAtivas}
            subtitle={`${Math.round(
              (femeasAtivas / totalAtivos) * 100
            )}% do rebanho`}
          />
          <MetricCard
            title="Machos"
            value={machosAtivos}
            subtitle={`${Math.round(
              (machosAtivos / totalAtivos) * 100
            )}% do rebanho`}
          />
          <MetricCard
            title="Vacas Produtoras"
            value={lactando}
            subtitle="Em lactação"
          />
        </div>
      </DashboardContainer>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardContainer className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Distribuição por Maturidade
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={maturidadeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {maturidadeData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </DashboardContainer>
        <DashboardContainer className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Distribuição por Sexo
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={sexData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {sexData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </DashboardContainer>
        <DashboardContainer className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Distribuição por Raça
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={bufalosPorRaca}
                dataKey="quantidade"
                nameKey="raca"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={({ raca, quantidade }) => `${raca}: ${quantidade}`}
              >
                {bufalosPorRaca.map((_, i) => (
                  <Cell
                    key={i}
                    fill={["#FCA90F", "#FFCF78", "#CE7D0A", "#F2B84D"][i]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </DashboardContainer>
      </div>

      {/* TABELA DE BÚFALOS - TOTALMENTE DENTRO DO ARQUIVO */}
      <DashboardContainer>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#404040] mb-1">
              Registro de Búfalos
            </h1>
            <p className="text-[#404040]/70 text-sm">
              Lista completa do rebanho
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="report" size="medium" className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Gerar Relatório
            </Button>
            <Button variant="primary" size="medium" className="font-bold">
              + Adicionar Búfalo
            </Button>
          </div>
        </div>

        {/* Filtros visuais */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 flex flex-wrap gap-4">
          <span className="font-semibold text-gray-700">Filtros:</span>
          <select
            className="px-4 py-2 border rounded-md text-sm bg-white"
            defaultValue=""
          >
            <option disabled>Sexo: Todos</option>
          </select>
          <select
            className="px-4 py-2 border rounded-md text-sm bg-white"
            defaultValue=""
          >
            <option disabled>Raça: Todas</option>
          </select>
          <select
            className="px-4 py-2 border rounded-md text-sm bg-white"
            defaultValue=""
          >
            <option disabled>Maturidade: Todas</option>
          </select>
        </div>

        {/* Tabela usando componente Table */}
        {/** Importação dinâmica do Table para evitar erro de import duplicada **/}
        {(() => {
          const Table = require("@/components/table/Table").default;
          const columns = [
            { key: "brinco", label: "TAG", className: "p-4 text-left font-semibold" },
            { key: "nome", label: "Nome", className: "p-4 text-left font-semibold" },
            { key: "sexo", label: "Sexo", className: "p-4 text-left font-semibold" },
            { key: "raca", label: "Raça", className: "p-4 text-left font-semibold" },
            { key: "maturidade", label: "Maturidade", className: "p-4 text-left font-semibold" },
            { key: "status", label: "Status", className: "p-4 text-left font-semibold" },
          ];
          return (
            <Table
              columns={columns}
              data={bufalosMock}
              minWidth="900px"
              renderCell={(b, key) => {
                if (key === "sexo") {
                  return b.sexo === "F" ? "Fêmea" : "Macho";
                }
                if (key === "maturidade") {
                  return getMaturidadeTexto(b.maturidade);
                }
                if (key === "status") {
                  const Badge = require("@/components/ui/Badge").default;
                  return (
                    <Badge type={b.status ? "active" : "inactive"}>
                      {b.status ? "Ativo" : "Inativo"}
                    </Badge>
                  );
                }
                return b[key];
              }}
            />
          );
        })()}

        <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
          <p>Mostrando 8 de 46 búfalos</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="small">Anterior</Button>
            <Button variant="secondary" size="small" className="w-10 h-10 !p-0 font-bold bg-[#ce7d0a] text-white hover:bg-[#b86c09]">1</Button>
            <Button variant="secondary" size="small" className="w-10 h-10 !p-0 font-bold">2</Button>
            <Button variant="primary" size="small">Próximo</Button>
          </div>
        </div>
      </DashboardContainer>

      {/* Gráfico de Doenças */}
      <DashboardContainer>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Frequência de Doenças
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={frequenciaDoencas}>
            <XAxis dataKey="doenca" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="frequencia" fill="#CE7D0A" />
          </BarChart>
        </ResponsiveContainer>
      </DashboardContainer>
    </div>
  );
}
