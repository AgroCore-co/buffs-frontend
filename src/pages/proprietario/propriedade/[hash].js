"use client";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import DashboardContainer from "@/components/ui/DashboardContainer";
import Loading from "@/components/loading/Loading";
import PropriedadeTab from "@/components/proprietario/propriedade/PropriedadeTab";
import PiquetesTab from "@/components/proprietario/propriedade/PiquetesTab";
import GruposTab from "@/components/proprietario/propriedade/GruposTab";
// Importa o componente externo que acabamos de criar
import AlimentacaoTab from "@/components/proprietario/propriedade/AlimentacaoTab";

// --- MOCK SERVICES ---
// Mantenho aqui para que o código rode, mas o ideal é que estejam em arquivos separados
const alimentacaoDefService = {
  listarDefinicoesPorPropriedade: async () => [
    { id_aliment_def: 1, tipo_alimentacao: "Sal Mineral", descricao: "Fosbovi 30" },
    { id_aliment_def: 2, tipo_alimentacao: "Ração", descricao: "Ração de Engorda 18%" }
  ],
  criarDefinicaoAlimentacao: async (data) => ({ ...data, id_aliment_def: Date.now() }),
  atualizarDefinicaoAlimentacao: async (id, data) => ({ ...data, id_aliment_def: id }),
  removerDefinicaoAlimentacao: async () => {},
};

const alimentacaoRegistroService = {
  listarRegistrosPorPropriedade: async () => [
    { 
      id_registro: 101, 
      grupo: { nome_grupo: "Grupo A" }, 
      alimentacao_def: { tipo_alimentacao: "Sal Mineral" }, 
      quantidade: 5, 
      unidade_medida: "kg", 
      freq_dia: 1, 
      usuario: { nome: "Paulo" }, 
      dt_registro: "2025-05-10T08:00:00Z" 
    }
  ],
  criarRegistroAlimentacao: async (data) => ({ ...data, id_registro: Date.now() }),
  atualizarRegistroAlimentacao: async (id, data) => ({ ...data }),
  removerRegistroAlimentacao: async () => {},
};

export default function PropriedadePage() {
  const router = useRouter();
  const { loading } = useProtectedRoute(["PROPRIETARIO"]);
  const { hash } = router.query;
  const [activeTab, setActiveTab] = useState("propriedade");
  
  const decodeId = (h) => { try { return parseInt(atob(h), 10); } catch { return null; } };
  const id = decodeId(hash);

  // Mock de dados da propriedade
  const propriedade = {
    id_propriedade: id || 1,
    nome: "Fazenda Estrela",
    cnpj: "12.345.678/0001-99",
    tipo_manejo: "P",
    status: "Ativa",
    p_abcb: true,
    created_at: "2025-01-10T10:00:00Z",
    updated_at: "2025-06-01T10:00:00Z",
    endereco: {
      rua: "Rua das Palmeiras",
      bairro: "Centro",
      cidade: "Buffalópolis",
      estado: "SP"
    },
    dono: { nome: "Paulo Candiani" }
  };

  const dashboardStats = {
    qtd_macho_ativos: 12,
    qtd_femeas_ativas: 34,
    qtd_lotes: 5,
    qtd_usuarios: 2
  };

  const grupos = [
    { id_grupo: 1, nome_grupo: "Grupo A", color: "#FCA90F", nivel_maturidade: "B", created_at: "2025-01-10T10:00:00Z", dias_no_local: 10 },
    { id_grupo: 2, nome_grupo: "Grupo B", color: "#CE7D0A", nivel_maturidade: "V", created_at: "2025-01-12T10:00:00Z", dias_no_local: 5 }
  ];

  // Helper function
  function nivelLabel(code) {
    if (!code) return '-';
    switch ((code || '').toUpperCase()) {
      case 'B': return 'Bezerro';
      case 'N': return 'Novilha';
      case 'V': return 'Vaca';
      case 'T': return 'Touro';
      default: return code;
    }
  }

  // Loading
  if (loading || !propriedade) {
    return <Loading text="Carregando propriedade..." />;
  }

  // Títulos e subtítulos dinâmicos por tab
  const tabTitles = {
    propriedade: {
      title: "Visão Geral da Propriedade",
      subtitle: "Resumo rápido das métricas e informações da propriedade."
    },
    piquetes: {
      title: "Mapa dos Piquetes",
      subtitle: "Visualização georreferenciada dos lotes"
    },
    grupos: {
      title: "Gestão de Grupos do Rebanho",
      subtitle: `Visualize, organize e acompanhe os ${grupos.length} grupo${grupos.length !== 1 ? 's' : ''} cadastrados nesta propriedade.`
    },
    alimentacao: {
      title: "Visão Geral da Alimentação",
      subtitle: "Registros e definições de alimentação dos grupos."
    }
  };

  const { title, subtitle } = tabTitles[activeTab] || {};

  return (
    <>
      <Head>
        <title>{propriedade.nome} | Buffs</title>
        <meta name="description" content={`Detalhes da propriedade ${propriedade.nome}`} />
      </Head>
      <DashboardContainer>
        {/* Título dinâmico conforme a tab */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 leading-tight">{title}</h1>
            <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
          </div>
          {/* Navegação das Tabs Compacta */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab("propriedade")}
              className={`whitespace-nowrap py-1.5 px-3 rounded-md text-sm font-semibold transition-colors border ${activeTab === "propriedade" ? "bg-[#FFCF78] text-gray-900 border-[#FFCF78]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
            >Propriedade</button>
            <button
              onClick={() => setActiveTab("piquetes")}
              className={`whitespace-nowrap py-1.5 px-3 rounded-md text-sm font-semibold transition-colors border ${activeTab === "piquetes" ? "bg-[#FFCF78] text-gray-900 border-[#FFCF78]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
            >Piquetes</button>
            <button
              onClick={() => setActiveTab("grupos")}
              className={`whitespace-nowrap py-1.5 px-3 rounded-md text-sm font-semibold transition-colors border ${activeTab === "grupos" ? "bg-[#FFCF78] text-gray-900 border-[#FFCF78]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
            >Grupos</button>
            <button
              onClick={() => setActiveTab("alimentacao")}
              className={`whitespace-nowrap py-1.5 px-3 rounded-md text-sm font-semibold transition-colors border ${activeTab === "alimentacao" ? "bg-[#FFCF78] text-gray-900 border-[#FFCF78]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
            >Alimentação</button>
          </div>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="h-full">
          {activeTab === "propriedade" && <PropriedadeTab dashboardStats={dashboardStats} hideTitle />}
          {activeTab === "piquetes" && <PiquetesTab grupos={grupos} nivelLabel={nivelLabel} hideTitle />}
          {activeTab === "grupos" && <GruposTab grupos={grupos} nivelLabel={nivelLabel} hideTitle />}
          {activeTab === "alimentacao" && (
            <AlimentacaoTab 
              alimentacaoDefService={alimentacaoDefService} 
              alimentacaoRegistroService={alimentacaoRegistroService} 
              grupos={grupos}
              usuarioLogado={{ id_usuario: 1, nome: "Admin" }} // Mock de usuário
              hideTitle
            />
          )}
        </div>
      </DashboardContainer>
    </>
  );
}