'use client';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import TabNav from '@/components/ui/TabNav';
import DashboardContainer from '@/components/ui/DashboardContainer';
import Loading from '@/components/loading/Loading';
import PropriedadeTab from '@/components/proprietario/propriedade/PropriedadeTab';
import PiquetesTab from '@/components/proprietario/propriedade/PiquetesTab';
import AlimentacaoTab from '@/components/proprietario/propriedade/AlimentacaoTab';
import BackButton from '@/components/ui/BackButton';
import { propriedadeService } from '@/services/propriedade.service';

// --- MOCK SERVICES ---
// Mantenho aqui para que o código rode, mas o ideal é que estejam em arquivos separados
const alimentacaoDefService = {
  listarDefinicoesPorPropriedade: async () => [
    {
      id_aliment_def: 1,
      tipo_alimentacao: 'Sal Mineral',
      descricao: 'Fosbovi 30',
    },
    {
      id_aliment_def: 2,
      tipo_alimentacao: 'Ração',
      descricao: 'Ração de Engorda 18%',
    },
  ],
  criarDefinicaoAlimentacao: async (data) => ({
    ...data,
    id_aliment_def: Date.now(),
  }),
  atualizarDefinicaoAlimentacao: async (id, data) => ({
    ...data,
    id_aliment_def: id,
  }),
  removerDefinicaoAlimentacao: async () => {},
};

const alimentacaoRegistroService = {
  listarRegistrosPorPropriedade: async () => [
    {
      id_registro: 101,
      grupo: { nome_grupo: 'Grupo A' },
      alimentacao_def: { tipo_alimentacao: 'Sal Mineral' },
      quantidade: 5,
      unidade_medida: 'kg',
      freq_dia: 1,
      usuario: { nome: 'Paulo' },
      dt_registro: '2025-05-10T08:00:00Z',
    },
  ],
  criarRegistroAlimentacao: async (data) => ({
    ...data,
    id_registro: Date.now(),
  }),
  atualizarRegistroAlimentacao: async (id, data) => ({ ...data }),
  removerRegistroAlimentacao: async () => {},
};

export default function PropriedadePage() {
  const router = useRouter();
  const { loading: authLoading } = useProtectedRoute(['PROPRIETARIO']);
  const { propriedade: propriedadeId } = router.query;
  const [activeTab, setActiveTab] = useState('propriedade');
  const [propriedade, setPropriedade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPropriedade = async () => {
      if (!propriedadeId) return;

      // Validação básica de UUID
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(propriedadeId)) {
        setError('ID de propriedade inválido.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Buscando propriedade com ID:', propriedadeId);

        const propriedadeData =
          await propriedadeService.getPropriedadeById(propriedadeId);

        if (!propriedadeData) {
          setError(
            'Propriedade não encontrada ou você não tem permissão para acessá-la.'
          );
          return;
        }

        console.log('Propriedade carregada:', propriedadeData);

        setPropriedade(propriedadeData);
      } catch (err) {
        console.error('Erro ao buscar propriedade:', err);
        setError('Erro ao carregar dados da propriedade. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchPropriedade();
  }, [propriedadeId]);

  const grupos = [
    {
      id_grupo: 1,
      nome_grupo: 'Grupo A',
      color: '#FCA90F',
      nivel_maturidade: 'B',
      created_at: '2025-01-10T10:00:00Z',
      dias_no_local: 10,
    },
    {
      id_grupo: 2,
      nome_grupo: 'Grupo B',
      color: '#CE7D0A',
      nivel_maturidade: 'V',
      created_at: '2025-01-12T10:00:00Z',
      dias_no_local: 5,
    },
  ];

  // Helper function
  function nivelLabel(code) {
    if (!code) return '-';
    switch ((code || '').toUpperCase()) {
      case 'B':
        return 'Bezerro';
      case 'N':
        return 'Novilha';
      case 'V':
        return 'Vaca';
      case 'T':
        return 'Touro';
      default:
        return code;
    }
  }

  // Loading e Error States
  if (authLoading || loading) {
    return <Loading text="Carregando propriedade..." />;
  }

  if (error) {
    return (
      <DashboardContainer>
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-2">{error}</p>
            <button
              onClick={() => router.push('/proprietario/propriedades')}
              className="mt-4 bg-[#FFCF78] text-gray-800 py-2 px-4 rounded-lg text-sm font-bold"
            >
              Voltar para Propriedades
            </button>
          </div>
        </div>
      </DashboardContainer>
    );
  }

  if (!propriedade) {
    return <Loading text="Carregando propriedade..." />;
  }

  // Títulos e subtítulos dinâmicos por tab
  const tabTitles = {
    propriedade: {
      title: 'Visão Geral da Propriedade',
      subtitle: 'Resumo rápido das métricas e informações da propriedade.',
    },
    piquetes: {
      title: 'Mapa dos Piquetes',
      subtitle: 'Visualização georreferenciada dos lotes',
    },
    alimentacao: {
      title: 'Visão Geral da Alimentação',
      subtitle: 'Registros e definições de alimentação dos grupos.',
    },
  };

  const tabList = [
    { key: 'propriedade', label: 'Propriedade' },
    { key: 'piquetes', label: 'Piquetes' },
    { key: 'alimentacao', label: 'Alimentação' },
  ];

  const { title, subtitle } = tabTitles[activeTab] || {};

  return (
    <>
      <Head>
        <title>{propriedade.nome} | Buffs</title>
        <meta
          name="description"
          content={`Detalhes da propriedade ${propriedade.nome}`}
        />
      </Head>
      <DashboardContainer>
        <BackButton onClick={() => router.push('/proprietario/propriedades')}>
          Voltar para Propriedades
        </BackButton>

        {/* Título dinâmico conforme a tab */}
        <div className="mb-0">
          <h1 className="text-2xl font-bold text-gray-800 leading-tight">
            {title}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
        </div>
        {/* Navegação das Tabs - padrão prontuário, encaixe visual igual */}
        <div className="border-b border-slate-200 overflow-x-auto mb-4">
          <TabNav
            tabs={tabList}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Conteúdo das Tabs */}
        <div className="h-full">
          {activeTab === 'propriedade' && (
            <PropriedadeTab
              propriedade={propriedade}
              idPropriedade={
                propriedade.idPropriedade || propriedade.id_propriedade
              }
              hideTitle
            />
          )}
          {activeTab === 'piquetes' && (
            <PiquetesTab
              grupos={grupos}
              nivelLabel={nivelLabel}
              idPropriedade={
                propriedade.idPropriedade || propriedade.id_propriedade
              }
              hideTitle
            />
          )}
          {activeTab === 'alimentacao' && (
            <AlimentacaoTab
              grupos={grupos}
              propriedadeId={
                propriedade.idPropriedade || propriedade.id_propriedade
              }
              usuarioLogado={{ id_usuario: 1, nome: 'Admin' }} // Mock de usuário
              hideTitle
            />
          )}
        </div>
      </DashboardContainer>
    </>
  );
}
