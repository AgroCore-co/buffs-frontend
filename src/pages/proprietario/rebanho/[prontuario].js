'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  Printer,
  Edit,
  Syringe,
  Dna,
  Calendar,
  MapPin,
  Tag,
  Info,
  QrCode,
  Baby,
  Activity,
  User,
  Clock,
} from 'lucide-react';

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
const getSexLabel = (sex) => (sex === 'F' ? 'Fêmea' : 'Macho');

const getCategoriaLabel = (cat) => {
  if (!cat) return 'Não classificado';

  const map = {
    PO: 'Puro de Origem',
    PC: 'Puro por Cruza',
    PA: 'Puro por Avaliação',
    CCG: 'Cruzamento Controlado',
    SRD: 'Sem Raça Definida',
  };

  return map[cat] || cat;
};

// --- NOVA FUNÇÃO PARA O SELO ---
const getSeloImage = (categoria) => {
  // Padroniza para maiúsculo ou define SRD como fallback
  const cat = categoria ? categoria.toUpperCase() : 'SRD';

  // Lista de categorias válidas que possuem imagem
  const validas = ['PO', 'PC', 'PA', 'CCG', 'SRD'];

  // Se a categoria do banco não estiver na lista, usa SRD ou retorna null se preferir não mostrar nada
  const finalCat = validas.includes(cat) ? cat : 'SRD';

  // Retorna o caminho relativo à pasta public
  return `/images/selos/classificacao-${finalCat}.svg`;
};

// --- COMPONENTS ---

const InfoItem = ({ icon: Icon, label, value, subValue }) => (
  <div className="flex items-start p-3 rounded-lg hover:bg-slate-50 transition-colors">
    <div className="p-2 bg-amber-50 rounded-lg mr-3">
      <Icon className="w-5 h-5 text-amber-600" />
    </div>
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-900 mt-0.5">
        {value || '-'}
      </p>
      {subValue && <p className="text-xs text-slate-400">{subValue}</p>}
    </div>
  </div>
);

const SectionTitle = ({ children }) => (
  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
    {children}
  </h3>
);

const Card = ({ children, className = '' }) => (
  <div
    className={`bg-white rounded-xl border border-slate-200 shadow-sm p-6 ${className}`}
  >
    {children}
  </div>
);

export default function ProntuarioPage() {
  const [activeTab, setActiveTab] = useState('resumo');
  const bufalo = mockBufaloData;

  const tabs = [
    { id: 'resumo', label: 'Resumo Geral' },
    { id: 'genealogia', label: 'Genealogia' },
    { id: 'sanitario', label: 'Sanitário' },
    { id: 'historico', label: 'Histórico' },
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {/* COLUNA ESQUERDA - DADOS PRINCIPAIS */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex justify-between items-center mb-6">
                <SectionTitle>Dados de Identificação</SectionTitle>
                <div className="text-xs text-slate-400">
                  ID: {bufalo.id_bufalo.split('-')[0]}...
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  icon={Tag}
                  label="Brinco Visual"
                  value={bufalo.brinco}
                />
                <InfoItem
                  icon={QrCode}
                  label="Microchip / Eletrônico"
                  value={bufalo.microchip || 'Não implantado'}
                />
                <InfoItem
                  icon={Baby}
                  label="Data Nascimento"
                  value={formatDate(bufalo.dt_nascimento)}
                  subValue={`${calculateAge(bufalo.dt_nascimento)} de idade`}
                />
                <InfoItem
                  icon={Dna}
                  label="Sexo"
                  value={getSexLabel(bufalo.sexo)}
                />
                <InfoItem
                  icon={Tag}
                  label="Registro Provisório"
                  value={bufalo.registro_prov}
                />
                <InfoItem
                  icon={Tag}
                  label="Registro Definitivo"
                  value={bufalo.registro_def}
                />
                <InfoItem icon={MapPin} label="Origem" value={bufalo.origem} />
                <InfoItem
                  icon={Tag}
                  label="Brinco Original"
                  value={bufalo.brinco_original}
                />
              </div>
            </Card>

            <Card>
              <SectionTitle>Manejo & Localização</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                    Propriedade
                  </p>
                  <p className="text-lg font-medium text-slate-800">
                    {bufalo.propriedade?.nome || 'Sem propriedade'}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                    Grupo / Lote
                  </p>
                  <p className="text-lg font-medium text-slate-800">
                    {bufalo.grupo?.nome_grupo || 'Sem grupo definido'}
                  </p>
                </div>

                {/* Bloco de Categoria Simplificado (O destaque agora está na Sidebar) */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                    Categoria
                  </p>
                  <p className="text-lg font-medium text-slate-800">
                    {bufalo.categoria || 'SRD'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                    Nível Maturidade
                  </p>
                  <p className="text-lg font-medium text-slate-800">
                    {bufalo.nivel_maturidade === 'V'
                      ? 'Vaca / Adulto'
                      : bufalo.nivel_maturidade}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* COLUNA DIREITA - SIDEBAR */}
          <div className="space-y-6">
            {/* NOVO CARD DEDICADO AO SELO */}
            <Card className="flex flex-col items-center justify-center text-center py-10 relative overflow-hidden border-amber-200">
              {/* Fundo decorativo sutil */}
              <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-amber-50 to-transparent opacity-50"></div>

              <div className="relative z-10 w-full flex flex-col items-center">
                <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-6">
                  Classificação Racial
                </h4>

                <div className="relative mb-6 group">
                  <div className="absolute inset-0 bg-amber-200 blur-[40px] opacity-30 rounded-full group-hover:opacity-50 transition-opacity duration-500"></div>
                  <Image
                    src={getSeloImage(bufalo.categoria)}
                    alt={`Selo ${bufalo.categoria}`}
                    width={160}
                    height={160}
                    className="h-40 w-auto object-contain relative z-10 drop-shadow-lg transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <h3 className="text-3xl font-extrabold text-slate-800 mb-2">
                  {bufalo.categoria || 'SRD'}
                </h3>
                <div className="px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                  <p className="text-sm font-medium text-slate-600">
                    {getCategoriaLabel(bufalo.categoria)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Genealogia Simplificada */}
            <Card>
              <SectionTitle>Genealogia Rápida</SectionTitle>
              <div className="relative border-l-2 border-slate-200 ml-4 pl-8 space-y-6 py-2">
                {/* Item Pai */}
                <div className="relative">
                  <div className="absolute -left-[45px] top-0.5 bg-blue-100 text-blue-600 rounded-full p-1 border-2 border-white z-10">
                    <User className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase leading-none mb-1">
                      Pai
                    </p>
                    <p className="font-medium text-slate-800">
                      {bufalo.id_pai_semen
                        ? 'Inseminação'
                        : bufalo.id_pai
                          ? 'Touro Local'
                          : 'Não informado'}
                    </p>
                  </div>
                </div>

                {/* Item Mãe */}
                <div className="relative">
                  <div className="absolute -left-[45px] top-0.5 bg-pink-100 text-pink-600 rounded-full p-1 border-2 border-white z-10">
                    <User className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase leading-none mb-1">
                      Mãe
                    </p>
                    <p className="font-medium text-slate-800">
                      {bufalo.id_mae ? 'Matriz Local' : 'Não informado'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('genealogia')}
                className="w-full mt-4 text-center text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                Ver árvore completa
              </button>
            </Card>

            {/* Meta Info */}
            <div className="text-xs text-slate-400 space-y-1 px-2">
              <p className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> Criado em: {bufalo.created_at}
              </p>
              <p className="flex items-center gap-1">
                <Edit className="w-3 h-3" /> Atualizado: {bufalo.updated_at}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'genealogia' && (
        <Card className="flex items-center justify-center h-64">
          <div className="text-center text-slate-400">
            <Dna className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Visualização da árvore genealógica completa em construção...</p>
          </div>
        </Card>
      )}

      {activeTab === 'sanitario' && (
        <Card className="flex items-center justify-center h-64">
          <div className="text-center text-slate-400">
            <Syringe className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Histórico de vacinas e tratamentos em construção...</p>
          </div>
        </Card>
      )}

      {activeTab === 'historico' && (
        <Card className="flex items-center justify-center h-64">
          <div className="text-center text-slate-400">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Timeline de pesagens e eventos em construção...</p>
          </div>
        </Card>
      )}
    </div>
  );
}
