'use client';

import React, { useState } from 'react';
import { ArrowLeft, Printer, Edit, Dna, Calendar, Tag } from 'lucide-react';
import ResumoTab from '@/components/proprietario/rebanho/ResumoTab';
import GenealogiaTab from '@/components/proprietario/rebanho/GenealogiaTab';
import SanitarioTab from '@/components/proprietario/rebanho/SanitarioTab';
import ZootecnicoTab from '@/components/proprietario/rebanho/ZootecnicoTab';

// --- MOCK DATA (Baseado no seu JSON) ---
const mockBufaloData = {
  id_bufalo: '0d567ee2-2579-48dc-9870-2c242a0a55e9',
  nome: 'Pérola',
  brinco: 'BUFF-001',
  microchip: null,
  dt_nascimento: '2013-03-05',
  nivel_maturidade: 'V',
  sexo: 'F',
  data_baixa: null,
  status: true,
  motivo_inativo: null,
  id_raca: 'f7cf3428-5309-4117-abff-5b7f498c63d6',
  id_propriedade: 'e7625c27-da8d-4ffa-a514-0c191b1fb1e3',
  id_grupo: 'acb95814-3119-4b2f-8f03-5902e5094c9b',
  origem: 'Externo',
  brinco_original: null,
  registro_prov: 'RP-9988',
  registro_def: null,
  categoria: 'SRD', // Tente mudar para 'PC', 'PA', 'CCG' ou 'SRD' para testar
  id_pai: null,
  id_mae: null,
  id_pai_semen: null,
  id_mae_ovulo: null,
  created_at: '18/11/2025, 11:09',
  updated_at: '21/11/2025, 20:09',
  deleted_at: null,
  raca: {
    nome: 'Murrah',
  },
  grupo: {
    nome_grupo: 'Recria',
  },
  propriedade: {
    nome: 'Fazenda Buffs',
  },
};

// --- UTILS ---
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

const calculateAge = (dateString) => {
  if (!dateString) return '-';
  const birthDate = new Date(dateString);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
    years--;
    months += 12;
  }

  if (today.getDate() < birthDate.getDate()) {
    months--;
  }

  return `${years}a ${months}m`;
};

const getStatusColor = (status) =>
  status
    ? 'bg-green-100 text-green-700 border-green-200'
    : 'bg-red-100 text-red-700 border-red-200';

export default function ProntuarioPage() {
  const [activeTab, setActiveTab] = useState('resumo');
  const bufalo = mockBufaloData;

  const tabs = [
    { id: 'resumo', label: 'Resumo Geral' },
    { id: 'genealogia', label: 'Genealogia' },
    { id: 'sanitario', label: 'Sanitário' },
    { id: 'zootecnico', label: 'Zootécnico' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* --- HEADER --- */}
      <header>
        <button className="flex items-center text-slate-500 hover:text-slate-800 mb-4 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para o Rebanho
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center border-4 border-white shadow-sm shrink-0">
              <span className="text-2xl font-bold text-amber-700">
                {bufalo.nome.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  {bufalo.nome}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(bufalo.status)}`}
                >
                  {bufalo.status ? 'ATIVO' : 'INATIVO'}
                </span>

                {/* Mantendo o selo pequeno no header para identificação rápida, mas o destaque maior estará na sidebar */}
                {bufalo.categoria && (
                  <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    <span className="text-xs font-bold text-slate-600">
                      {bufalo.categoria}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Brinco:{' '}
                  <strong className="text-slate-700">{bufalo.brinco}</strong>
                </span>
                <span className="hidden md:inline text-slate-300">|</span>
                <span className="flex items-center gap-1">
                  <Dna className="w-3 h-3" /> Raça: {bufalo.raca?.nome}
                </span>
                <span className="hidden md:inline text-slate-300">|</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />{' '}
                  {calculateAge(bufalo.dt_nascimento)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
              <Printer className="w-4 h-4" /> Imprimir
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 rounded-lg text-white text-sm font-medium hover:bg-amber-700 transition-colors shadow-sm shadow-amber-200">
              <Edit className="w-4 h-4" /> Editar
            </button>
          </div>
        </div>
      </header>

      {/* --- TABS --- */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* --- CONTENT --- */}
      {activeTab === 'resumo' && (
        <ResumoTab bufalo={bufalo} onTabChange={setActiveTab} />
      )}

      {activeTab === 'genealogia' && <GenealogiaTab bufalo={bufalo} />}

      {activeTab === 'sanitario' && <SanitarioTab bufalo={bufalo} />}

      {activeTab === 'zootecnico' && <ZootecnicoTab bufalo={bufalo} />}
    </div>
  );
}
