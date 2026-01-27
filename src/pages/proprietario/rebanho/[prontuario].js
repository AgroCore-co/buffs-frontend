'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import Loading from '@/components/loading/Loading';
import BackButton from '@/components/ui/BackButton';
import TabNav from '@/components/ui/TabNav';
import { Printer, Edit, Dna, Calendar, Tag } from 'lucide-react';
import ResumoTab from '@/components/proprietario/rebanho/ResumoTab';
import GenealogiaTab from '@/components/proprietario/rebanho/GenealogiaTab';
import SanitarioTab from '@/components/proprietario/rebanho/SanitarioTab';
import ZootecnicoTab from '@/components/proprietario/rebanho/ZootecnicoTab';
import bufaloService from '@/services/bufalo.service';

// --- UTILS ---
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
  const router = useRouter();
  const { prontuario: idBufalo } = router.query;
  const { loading: loadingAuth } = useProtectedRoute(['PROPRIETARIO']);
  const [activeTab, setActiveTab] = useState('resumo');

  // SWR Fetcher
  const {
    data: bufalo,
    error,
    isLoading,
  } = useSWR(
    idBufalo ? `bufalo/${idBufalo}` : null,
    () => bufaloService.getBufaloById(idBufalo),
    {
      revalidateOnFocus: false, // Evita requests desnecessários ao trocar de aba
      dedupingInterval: 60000,
    }
  );

  if (loadingAuth || isLoading) {
    return <Loading text="Carregando prontuário..." />;
  }

  if (error || !bufalo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-xl font-bold text-gray-700 mb-2">
          Búfalo não encontrado
        </h2>
        <p className="text-gray-500 mb-6">
          Não foi possível carregar os dados deste animal.
        </p>
        <BackButton />
      </div>
    );
  }

  const tabs = [
    { key: 'resumo', label: 'Resumo Geral' },
    { key: 'genealogia', label: 'Genealogia' },
    { key: 'sanitario', label: 'Sanitário' },
    { key: 'zootecnico', label: 'Zootécnico' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* --- HEADER --- */}
      <header>
        <BackButton />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center border-4 border-white shadow-sm shrink-0">
              <span className="text-2xl font-bold text-amber-700">
                {bufalo.nome ? bufalo.nome.substring(0, 2).toUpperCase() : '??'}
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
                  <Dna className="w-3 h-3" /> Raça: {bufalo.raca?.nome || 'N/A'}
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
        <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* --- CONTENT --- */}
      <div className="animate-in fade-in duration-300">
        {activeTab === 'resumo' && (
          <ResumoTab bufalo={bufalo} onTabChange={setActiveTab} />
        )}

        {activeTab === 'genealogia' && <GenealogiaTab bufalo={bufalo} />}

        {activeTab === 'sanitario' && <SanitarioTab bufalo={bufalo} />}

        {activeTab === 'zootecnico' && <ZootecnicoTab bufalo={bufalo} />}
      </div>
    </div>
  );
}
