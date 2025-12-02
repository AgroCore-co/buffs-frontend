import React from "react";
import DashboardContainer from "@/components/ui/DashboardContainer";
import MetricCard from "@/components/ui/MetricCard";
import Table from "@/components/table/Table";

export default function AlimentacaoTab({
  alimentacaoDefService,
  alimentacaoRegistroService,
  grupos = [],
  propriedadeId,
}) {
  // ==================== MOCKS COMPLETOS (Inferidos para corrigir o erro) ====================
  // Estes dados estavam implícitos no seu código original.
  const tiposRacao = 4;
  const consumoDiarioTotal = 125.5;
  const estoqueCritico = 2;
  const totalRegistros = 48;

  const definicoes = [
    { id_aliment_def: 1, tipo_alimentacao: "Ração de Crescimento", descricao: "Ração balanceada para fase inicial" },
    { id_aliment_def: 2, tipo_alimentacao: "Suplemento Mineral", descricao: "Sal mineral com fósforo" },
  ];

  const registros = [
    {
      id_registro: 101,
      grupo: { nome_grupo: "Lote A" },
      alimentacao_def: { tipo_alimentacao: "Ração de Crescimento" },
      quantidade: 50,
      unidade_medida: "kg",
      freq_dia: 2,
      dt_registro: "2023-10-25",
    },
    {
      id_registro: 102,
      grupo: { nome_grupo: "Lote B" },
      alimentacao_def: { tipo_alimentacao: "Suplemento Mineral" },
      quantidade: 5,
      unidade_medida: "kg",
      freq_dia: 1,
      dt_registro: "2023-10-26",
    },
  ];
  // ==========================================================================================

  return (
    <div className="flex flex-col gap-6">
      {/* Cards de Métricas */}
      <DashboardContainer>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <MetricCard title="Tipos de Ração" value={tiposRacao} subtitle="cadastrados" />
          <MetricCard title="Consumo Diário" value={`${consumoDiarioTotal.toFixed(1)} kg`} subtitle="estimado" />
          <MetricCard title="Estoque Crítico" value={estoqueCritico} subtitle="abaixo de 100 kg" />
          <MetricCard title="Total de Registros" value={totalRegistros} subtitle="de alimentação" />
        </div>
      </DashboardContainer>

      {/* Tabela de Definições */}
      <DashboardContainer>
        <Table
          columns={[
            { key: "tipo_alimentacao", label: "Tipo", className: "text-left" },
            { key: "descricao", label: "Descrição", className: "text-left" },
            { key: "acoes", label: "Ações", className: "text-center" },
          ]}
          data={definicoes}
          minWidth="600px"
          renderCell={(def, key) => {
            if (key === "acoes") return <span className="text-gray-400">—</span>;
            if (key === "descricao") return <span title={def.descricao} className="max-w-md truncate block">{def.descricao}</span>;
            return def[key];
          }}
        />
      </DashboardContainer>

      {/* Tabela de Registros */}
      <DashboardContainer>
        <Table
          columns={[
            { key: "grupo", label: "Grupo", className: "text-left" },
            { key: "tipo", label: "Tipo", className: "text-left" },
            { key: "quantidade", label: "Quantidade", className: "text-left" },
            { key: "freq_dia", label: "Freq./Dia", className: "text-left" },
            { key: "dt_registro", label: "Data", className: "text-left" },
            { key: "acoes", label: "Ações", className: "text-center" },
          ]}
          data={registros.map((reg) => ({
            ...reg,
            grupo: reg.grupo.nome_grupo,
            tipo: reg.alimentacao_def.tipo_alimentacao,
            quantidade: `${reg.quantidade} ${reg.unidade_medida}`,
            dt_registro: new Date(reg.dt_registro).toLocaleDateString("pt-BR"),
            acoes: "—",
          }))}
          minWidth="700px"
          renderCell={(reg, key) => {
            if (key === "acoes") return <span className="text-gray-400">—</span>;
            return reg[key];
          }}
        />
      </DashboardContainer>
    </div>
  );
}