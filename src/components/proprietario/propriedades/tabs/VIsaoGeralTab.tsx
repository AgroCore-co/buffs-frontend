"use client";

import React from "react";
import MetricCard from "@/components/ui/MetricCard";
import Badge from "@/components/ui/Badge";
import { useDashboard } from "@/hooks/useDashboard";
import {
  FileText,
  Tractor,
  Fingerprint,
  MapPin,
  Activity,
  AlertCircle,
  Layers,
  Users,
} from "lucide-react";

// --- Tipagens ---
export type RacaInfo = {
  raca: string;
  quantidade: number;
};

export type IndicadoresStats = {
  femeas: number;
  machos: number;
  lotes: number;
  usuarios: number;
};

interface VisaoGeralTabProps {
  dadosCadastrais: any;
}

// --- Subcomponentes Internos ---

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

function DadosCadastraisSection({ propriedade }: { propriedade: any }) {
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

function ComposicaoRacialSection({ loadingDashboard, stats }: { loadingDashboard: boolean; stats?: any }) {
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
          {stats.bufalosPorRaca.map((raca: RacaInfo, idx: number) => {
            const total = stats.bufalosPorRaca!.reduce((a: number, b: RacaInfo) => a + b.quantidade, 0);
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

function IndicadoresRebanhoSection({ stats }: { stats: IndicadoresStats }) {
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

// --- Componente Principal da Aba ---

export default function VisaoGeralTab({ dadosCadastrais }: VisaoGeralTabProps) {
  const { getGeral } = useDashboard();
  
  // Extrai o ID da propriedade dos dados cadastrais (suporta camelCase ou snake_case)
  const idPropriedade = dadosCadastrais?.idPropriedade || dadosCadastrais?.id_propriedade;
  
  // Busca as estatísticas gerais (rota GET /dashboard/{id_propriedade})
  const { data: dashboardData, isLoading: loadingDashboard } = getGeral(idPropriedade, {
    enabled: !!idPropriedade,
  });

  // Mapeia os dados da API para o formato esperado pelos cards de indicadores
  const indicadores: IndicadoresStats = {
    femeas: dashboardData?.qtd_femeas_ativas || 0,
    machos: dashboardData?.qtd_macho_ativos || 0,
    lotes: dashboardData?.qtd_lotes || 0,
    usuarios: dashboardData?.qtd_usuarios || 0,
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Grid Superior: Dados Cadastrais e Composição Racial */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <DadosCadastraisSection propriedade={dadosCadastrais} />
        <ComposicaoRacialSection loadingDashboard={loadingDashboard} stats={dashboardData} />
      </div>

      {/* Grid Inferior Full Width: Indicadores do Rebanho */}
      <IndicadoresRebanhoSection stats={indicadores} />
    </div>
  );
}