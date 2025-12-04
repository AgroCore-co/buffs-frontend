import React from 'react';
import DashboardContainer from '../../ui/DashboardContainer';
import {
  Tag,
  QrCode,
  Baby,
  Dna,
  MapPin,
  User,
  Clock,
  Edit,
} from 'lucide-react';
import Image from 'next/image';

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

const getSeloImage = (categoria) => {
  const cat = categoria ? categoria.toUpperCase() : 'SRD';
  const validas = ['PO', 'PC', 'PA', 'CCG', 'SRD'];
  const finalCat = validas.includes(cat) ? cat : 'SRD';
  return `/images/selos/classificacao-${finalCat}.svg`;
};

export default function ResumoTab({ bufalo, onTabChange }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
      {/* COLUNA ESQUERDA - DADOS PRINCIPAIS */}
      <DashboardContainer className="lg:col-span-2 space-y-6 p-0 shadow-none border-none bg-transparent">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <SectionTitle>Dados de Identificação</SectionTitle>
            <div className="text-xs text-slate-400">
              ID: {bufalo.id_bufalo.split('-')[0]}...
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem icon={Tag} label="Brinco Visual" value={bufalo.brinco} />
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
      </DashboardContainer>

      {/* COLUNA DIREITA - SIDEBAR */}
      <DashboardContainer className="space-y-6 p-0 shadow-none border-none bg-transparent">
        {/* CARD DEDICADO AO SELO */}
        <Card className="flex flex-col items-center justify-center text-center py-10 relative overflow-hidden border-amber-200">
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
            onClick={() => onTabChange('genealogia')}
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
      </DashboardContainer>
    </div>
  );
}
