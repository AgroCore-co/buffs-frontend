"use client";

import Head from "next/head";
import Loading from "@/components/loading/Loading";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiEdit2, FiTrash2, FiMapPin, FiUser, FiCalendar, FiActivity, FiLayers } from "react-icons/fi";
import DashboardContainer from "@/components/ui/DashboardContainer";
import MetricCard from "@/components/ui/MetricCard";
import Badge from "@/components/ui/Badge";
import PropriedadeCard from "@/components/proprietario/propriedades/PropriedadeCard";
import Button from "@/components/ui/Button";

// Mock data mantido para visualização
const propriedadesMock = [
  {
    id_propriedade: 1,
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
  },
  {
    id_propriedade: 2,
    nome: "Sítio Luna",
    cnpj: "98.765.432/0001-11",
    tipo_manejo: "E",
    status: "Ativa",
    p_abcb: false,
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2025-01-01T10:00:00Z",
    endereco: {
      rua: "Estrada do Leite",
      bairro: "Rural",
      cidade: "Buffalópolis",
      estado: "SP"
    },
    dono: { nome: "Maria Luna" }
  },
  {
    id_propriedade: 3,
    nome: "Chácara Mimosa",
    cnpj: "11.222.333/0001-44",
    tipo_manejo: "I",
    status: "Inativa",
    p_abcb: false,
    created_at: "2025-03-15T10:00:00Z",
    updated_at: "2025-03-15T10:00:00Z",
    endereco: {
      rua: "Alameda das Flores",
      bairro: "Jardim",
      cidade: "Buffalópolis",
      estado: "SP"
    },
    dono: { nome: "João Mimosa" }
  },
  {
    id_propriedade: 4,
    nome: "Fazenda Preta",
    cnpj: "22.333.444/0001-55",
    tipo_manejo: "P",
    status: "Ativa",
    p_abcb: true,
    created_at: "2025-05-20T10:00:00Z",
    updated_at: "2025-06-01T10:00:00Z",
    endereco: {
      rua: "Rodovia BR-101",
      bairro: "Zona Rural",
      cidade: "Buffalópolis",
      estado: "SP"
    },
    dono: { nome: "Carlos Preta" }
  }
];


  // Proteção de rota igual à index
export default function Propriedades({ propriedades = propriedadesMock, loading = false, error = null, onNovoPropriedade, onEditarPropriedade, onDeletarPropriedade }) {
  const router = useRouter();

  // Função para mascarar o id usando base64
  const encodeId = (id) => {
    try {
      return btoa(id.toString());
    } catch {
      return id;
    }
  };
  // Proteção de rota igual à index
  const { loading: loadingAuth } = useProtectedRoute(["PROPRIETARIO"]);

  // Funções utilitárias para exibir dados
  const formatCNPJ = (cnpj) => cnpj || "N/A";
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: '2-digit' });
    } catch {
      return "N/A";
    }
  };
  const formatEndereco = (endereco) => {
    if (!endereco) return "Endereço não informado";
    return `${endereco.cidade} - ${endereco.estado}`;
  };
  const getManejoLabel = (tipo) => {
    const map = { P: "Pecuária", E: "Extensivo", I: "Intensivo" };
    return map[tipo] || tipo || "Não informado";
  };

  // Loading inicial igual ao dashboard
  if (loadingAuth || loading) {
    return <Loading text="Carregando painel..." />;
  }

  return (
    <>
      <Head>
        <title>Gestão de Propriedades | Buffs</title>
        <meta
          name="description"
          content="Gestão e controle de propriedades rurais"
        />
      </Head>
      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
        {/* Seção de Métricas */}
        <DashboardContainer>
          <div>
            <h1 className="text-2xl font-bold text-[#404040] mb-1">Gestão de Propriedades</h1>
            <p className="text-[#404040]/70 text-sm">Controle e monitore todas as propriedades rurais do seu negócio.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Total de Propriedades" 
              value={propriedades.length} 
              subtitle="Cadastradas" 
              icon={<FiLayers className="text-[#ce7d0a]" />}
            />
            <MetricCard 
              title="Propriedades Ativas" 
              value={propriedades.filter((p) => p.status === "Ativa" || p.status === undefined).length} 
              subtitle="Em operação" 
              icon={<FiActivity className="text-green-600" />}
            />
            <MetricCard 
              title="Tipo Pecuária" 
              value={propriedades.filter((p) => p.tipo_manejo === "P").length} 
              subtitle="Foco bubalino" 
              icon={<span className="font-bold text-[#ce7d0a]">P</span>}
            />
            <MetricCard 
              title="Registradas ABCB" 
              value={propriedades.filter((p) => p.p_abcb).length} 
              subtitle="Certificadas" 
              icon={<span className="font-bold text-blue-600">✓</span>}
            />
          </div>
        </DashboardContainer>
        {/* Seção de Listagem */}
        <DashboardContainer>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4 mb-2">
            <div>
              <h2 className="text-xl font-bold text-[#404040]">Propriedades Cadastradas</h2>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ce7d0a]"></span>
                {propriedades.length} {propriedades.length === 1 ? 'unidade encontrada' : 'unidades encontradas'}
              </p>
            </div>
            <Button
              variant="primary"
              size="medium"
              className="font-bold flex items-center gap-2"
              onClick={onNovoPropriedade}
            >
              <span>+</span> Nova Propriedade
            </Button>
          </div>
          {error ? (
            <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
              <p className="text-red-600 font-medium mb-1">Erro ao carregar</p>
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : propriedades.length === 0 ? (
            <div className="text-center py-16 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <FiLayers size={24} />
              </div>
              <h3 className="text-gray-800 font-semibold mb-1">Nenhuma propriedade encontrada</h3>
              <p className="text-gray-500 text-sm mb-4">Comece cadastrando sua primeira propriedade rural.</p>
              <button onClick={onNovoPropriedade} className="text-[#ce7d0a] text-sm font-bold hover:underline">
                Cadastrar agora
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {propriedades.map((propriedade) => (
                <div
                  key={propriedade.id_propriedade}
                  onClick={() => router.push(`/proprietario/propriedade/${encodeId(propriedade.id_propriedade)}`)}
                  className="cursor-pointer"
                >
                  <PropriedadeCard
                    propriedade={propriedade}
                    onEditar={onEditarPropriedade}
                    onDeletar={onDeletarPropriedade}
                  />
                </div>
              ))}
            </div>
          )}
        </DashboardContainer>
      </div>
    </>
  );
}

