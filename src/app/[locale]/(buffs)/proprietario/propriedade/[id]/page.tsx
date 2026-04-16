"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

// Ajuste os imports dos hooks conforme a sua estrutura
import { usePropriedades } from "@/hooks/usePropriedades";
import { useEnderecos } from "@/hooks/useEnderecos";
import { useUsuarios } from "@/hooks/useUsuarios";

import Container from "@/components/ui/Container";
import MetricCard from "@/components/ui/MetricCard";
import {
  ArrowLeft,
  MapPin,
  Building2,
  Calendar,
  Printer,
  Edit,
  FileText,
  Tractor,
  Fingerprint,
  AlertCircle,
  Activity,
  Users,
  Layers,
  Map as MapIcon,
} from "lucide-react";
import TabNav from "@/components/ui/TabNav";
import Badge from "@/components/ui/Badge";

// Importações do Leaflet (React-Leaflet)
import { MapContainer, TileLayer, Polygon, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// --- Tipagens ---

type DadosCadastraisSectionProps = {
  propriedade: any;
};

type RacaInfo = {
  raca: string;
  quantidade: number;
};

type DashboardStats = {
  bufalosPorRaca?: RacaInfo[];
};

type ComposicaoRacialSectionProps = {
  loadingDashboard: boolean;
  stats?: DashboardStats | null;
};

type IndicadoresStats = {
  femeas: number;
  machos: number;
  lotes: number;
  usuarios: number;
};

type IndicadoresRebanhoSectionProps = {
  stats: IndicadoresStats;
};

// --- Subcomponentes ---

function InfoItem({ icon: Icon, label, value, subValue }: { icon: any; label: string; value?: string; subValue?: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-medium text-[#404040]">
          {value || <span className="text-gray-300 italic">Não informado</span>}
        </p>
        {subValue && <p className="text-xs text-gray-500 mt-0.5">{subValue}</p>}
      </div>
    </div>
  );
}

function DadosCadastraisSection({ propriedade }: DadosCadastraisSectionProps) {
  const getManejoLabel = (tipo: string) => {
    const map: Record<string, string> = {
      P: "Pastagem / Extensivo",
      C: "Confinamento",
      S: "Semi-confinamento",
    };
    return map[tipo] || tipo || "Não informado";
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
      <h2 className="text-lg font-bold mb-4 text-[#404040] flex items-center gap-2">
        <FileText className="w-5 h-5 text-[var(--color-primary-dark)]" />
        Dados Cadastrais
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 flex-1">
        <InfoItem icon={FileText} label="CNPJ / Documento" value={propriedade.cnpj} />
        <InfoItem icon={Tractor} label="Sistema de Produção" value={getManejoLabel(propriedade.tipoManejo || propriedade.tipo_manejo)} />
        <InfoItem icon={Fingerprint} label="Proprietário" value={propriedade.nomeDono || "-"} subValue={propriedade.emailDono} />
        <InfoItem icon={MapPin} label="Endereço Completo" value={propriedade.enderecoCompleto} subValue={propriedade.cep} />
      </div>
    </div>
  );
}

function ComposicaoRacialSection({ loadingDashboard, stats }: ComposicaoRacialSectionProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
      <h2 className="text-lg font-bold mb-4 text-[#404040] flex items-center gap-2">
        <Activity className="w-5 h-5 text-[var(--color-primary-dark)]" />
        Composição Racial
      </h2>
      
      {loadingDashboard ? (
        <div className="h-32 bg-gray-50 rounded-xl animate-pulse flex items-center justify-center border border-gray-100 flex-1">
          <span className="text-gray-400 text-sm">Carregando composição...</span>
        </div>
      ) : !stats?.bufalosPorRaca?.length ? (
        <div className="h-32 flex flex-col items-center justify-center bg-gray-50 border border-gray-100 rounded-xl text-gray-400 flex-1">
          <AlertCircle className="w-6 h-6 mb-2" />
          <span className="font-semibold text-sm">Sem dados de raças</span>
        </div>
      ) : (
        <div className="space-y-5 mt-2 flex-1 flex flex-col justify-center">
          {stats.bufalosPorRaca.map((raca, idx) => {
            const total = stats.bufalosPorRaca!.reduce((a, b) => a + b.quantidade, 0);
            const pct = total > 0 ? ((raca.quantidade / total) * 100).toFixed(1) : "0";
            
            return (
              <div key={idx} className="group">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-[#404040]">{raca.raca}</span>
                  <span className="text-gray-500 flex items-center gap-2">
                    {raca.quantidade} animais <Badge type="info">{pct}%</Badge>
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-[var(--color-primary-dark)] h-full rounded-full transition-all duration-700 ease-out hover:opacity-80"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function IndicadoresRebanhoSection({ stats }: IndicadoresRebanhoSectionProps) {
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-lg font-bold text-[#404040] flex items-center gap-2">
          <Layers className="w-5 h-5 text-[var(--color-primary-dark)]" />
          Visão Geral em Números
        </h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard 
          title="Fêmeas" 
          value={stats.femeas.toString()} 
          subtitle="Animais ativos"
          icon={<Activity className="w-3.5 h-3.5 text-[#ce7d0a]" />} 
        />
        <MetricCard 
          title="Machos" 
          value={stats.machos.toString()} 
          subtitle="Animais ativos"
          icon={<Activity className="w-3.5 h-3.5 text-[#ce7d0a]" />} 
        />
        <MetricCard 
          title="Lotes" 
          value={stats.lotes.toString()} 
          subtitle="Cadastrados no sistema"
          icon={<Layers className="w-3.5 h-3.5 text-[#ce7d0a]" />} 
        />
        <MetricCard 
          title="Usuários" 
          value={stats.usuarios.toString()} 
          subtitle="Com acesso à propriedade"
          icon={<Users className="w-3.5 h-3.5 text-[#ce7d0a]" />} 
        />
      </div>
    </div>
  );
}

// Subcomponente do Mapa de Piquetes
function MapaPiquetesSection() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Coordenadas mockadas para Cajati-SP
  const centerPosition: [number, number] = [-24.7366, -48.0673];

  const mockPiqueteCoords: [number, number][] = [
    [-24.736, -48.067],
    [-24.736, -48.064],
    [-24.738, -48.064],
    [-24.739, -48.066],
    [-24.738, -48.068],
  ];

  if (!isMounted) {
    return (
      <div className="w-full h-[calc(100vh-360px)] min-h-[300px] bg-gray-100 rounded-xl border border-gray-200 animate-pulse flex items-center justify-center">
        <span className="text-gray-400 font-medium">Carregando mapa satélite...</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[calc(100vh-360px)] min-h-[300px] overflow-hidden relative">
      <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-gray-100 pointer-events-none">
        <h3 className="text-sm font-bold text-[#404040] flex items-center gap-2">
          <MapIcon className="w-4 h-4 text-[var(--color-primary-dark)]" />
          Mapeamento da Propriedade
        </h3>
        <p className="text-xs text-gray-500 mt-1">Visão de Satélite (Esri World Imagery)</p>
      </div>

      <style>{`
        .leaflet-tooltip.piquete-label {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
          color: white;
          font-weight: 800;
          font-size: 14px;
          text-shadow: 1px 1px 3px rgba(0,0,0,0.8), -1px -1px 3px rgba(0,0,0,0.8);
          direction: center;
        }
        .leaflet-tooltip.piquete-label::before {
          display: none;
        }
      `}</style>

      <MapContainer 
        center={centerPosition} 
        zoom={15} 
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem', zIndex: 10 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
        />

        <Polygon 
          positions={mockPiqueteCoords} 
          pathOptions={{ 
            color: '#ce7d0a', 
            fillColor: '#ffcf78', 
            fillOpacity: 0.4, 
            weight: 3 
          }}
        >
          <Tooltip 
            permanent 
            direction="center" 
            className="piquete-label"
          >
            Piquete 01 - Maternidade
          </Tooltip>
        </Polygon>
      </MapContainer>
    </div>
  );
}

// --- Componente Principal ---

export default function PropriedadeDetalhesPage({ params }: { params: any }) {
  const router = useRouter();
  const t = useTranslations("Proprietario.detalhes");
  const { id } = React.use(params);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("visao-geral");

  // Chamadas API
  const { getById: getPropriedadeById } = usePropriedades();
  const { data: propriedade } = getPropriedadeById(id);

  // Hooks SEMPRE chamados na mesma ordem, ids podem ser undefined
  const { getById: getEnderecoById } = useEnderecos({ enabled: false });
  const { getById: getUsuarioById } = useUsuarios({ enabled: false });
  const { data: endereco } = getEnderecoById(propriedade?.idEndereco);
  const { data: dono } = getUsuarioById(propriedade?.idDono);

  // --- Mocks Visuais Fallback ---
  const mockDetalhes = {
    nome: "TESTE PC 2",
    manejo: "PASTAGEM / EXTENSIVO",
    localizacao: "Cajati - SP",
    atualizacao: "09/03/2026",
    cnpj: "00.000.000/0001-00",
    tipoManejo: "P",
    nomeDono: "João Agricultor",
    emailDono: "joao@email.com",
    enderecoCompleto: "Estrada Rural, Km 12",
    cep: "11950-000"
  };

  const mockDashboardStats: DashboardStats = {
    bufalosPorRaca: [
      { raca: "Murrah", quantidade: 120 },
      { raca: "Mediterrâneo", quantidade: 45 },
      { raca: "Jafarabadi", quantidade: 15 }
    ]
  };
  
  const mockIndicadores: IndicadoresStats = {
    femeas: 1,
    machos: 0,
    lotes: 0,
    usuarios: 0,
  };

  // Prepara o objeto mesclando os dados da API (se existirem) com o Mock para que a tela não quebre
  const dadosCadastrais = propriedade
    ? {
        ...propriedade,
        nome: propriedade.nome || mockDetalhes.nome,
        manejo: propriedade.tipoManejo || mockDetalhes.manejo,
        localizacao: endereco ? `${endereco.cidade} - ${endereco.estado}` : mockDetalhes.localizacao,
        atualizacao: propriedade.updatedAt || mockDetalhes.atualizacao,
        cnpj: propriedade.cnpj || mockDetalhes.cnpj,
        tipoManejo: propriedade.tipoManejo || propriedade.tipo_manejo || mockDetalhes.tipoManejo,
        nomeDono: dono?.nome || mockDetalhes.nomeDono,
        emailDono: dono?.email || mockDetalhes.emailDono,
        enderecoCompleto: endereco ? `${endereco.rua}, ${endereco.bairro}` : mockDetalhes.enderecoCompleto,
        cep: endereco?.cep || mockDetalhes.cep,
      }
    : mockDetalhes;

  return (
    <div className="flex flex-col gap-4">
      {/* Botão Voltar */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-[var(--color-primary-dark)] transition-colors ml-1 w-fit"
      >
        <ArrowLeft className="w-3 h-3" />
        {t("back")}
      </button>

      <Container className="p-5 flex flex-col gap-4">
        {/* Header Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--color-primary-light)]/20 border border-[var(--color-primary-light)]/40 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[var(--color-primary-dark)]" strokeWidth={1.5} />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-foreground tracking-tight uppercase">
                  {dadosCadastrais.nome}
                </h1>
                <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-black text-muted-foreground uppercase tracking-tighter border border-border">
                  {dadosCadastrais.manejo || dadosCadastrais.tipoManejo}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  {dadosCadastrais.localizacao}
                </div>
                <div className="w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {dadosCadastrais.atualizacao}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-lg text-foreground text-xs font-bold hover:bg-muted transition-colors shadow-sm">
              <Printer className="w-3.5 h-3.5" />
              {t("report")}
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-primary-dark)] rounded-lg text-[var(--color-text-light)] text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
            >
              <Edit className="w-3.5 h-3.5" />
              {t("edit")}
            </button>
          </div>
        </div>
      </Container>

      {/* Container das Abas e Conteúdo */}
      <Container className="pt-2 px-6">
        <TabNav
          tabs={[
            { key: "visao-geral", label: "Visão Geral" },
            { key: "lotes", label: "Lotes e Piquetes" },
            { key: "animais", label: "Animais" },
            { key: "producao", label: "Produção" },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        {/* Área de conteúdo dinâmica */}
        <div className="pt-6 pb-2">
          {activeTab === "visao-geral" && (
            <div className="flex flex-col gap-6">
              {/* Grid Superior: Dados Cadastrais e Composição Racial */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <DadosCadastraisSection propriedade={dadosCadastrais} />
                <ComposicaoRacialSection 
                  loadingDashboard={false} 
                  stats={mockDashboardStats} 
                />
              </div>

              {/* Grid Inferior Full Width: Indicadores do Rebanho */}
              <IndicadoresRebanhoSection stats={mockIndicadores} />
            </div>
          )}
          
          {activeTab === "lotes" && (
            <div className="animate-in fade-in duration-500">
              <MapaPiquetesSection />
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}