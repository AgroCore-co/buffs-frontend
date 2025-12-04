import React, { useState } from 'react';
import Head from 'next/head';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import Loading from '@/components/loading/Loading';
import DashboardContainer from '@/components/ui/DashboardContainer';
import {
  BookOpen,
  Search,
  ChevronRight,
  ChevronDown,
  FileText,
  Video,
  Download,
} from 'lucide-react';

export default function DocumentacaoPage() {
  const { loading } = useProtectedRoute([
    'PROPRIETARIO',
    'FUNCIONARIO',
    'ADMIN',
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({});

  const documentacao = [
    {
      id: 'primeiros-passos',
      titulo: 'Primeiros Passos',
      descricao: 'Comece a usar o sistema Buffs',
      icon: BookOpen,
      artigos: [
        {
          id: 1,
          titulo: 'Como cadastrar búfalos',
          tipo: 'texto',
          duracao: '5 min',
        },
        {
          id: 2,
          titulo: 'Configuração inicial da fazenda',
          tipo: 'video',
          duracao: '8 min',
        },
        {
          id: 3,
          titulo: 'Gerenciamento de usuários',
          tipo: 'texto',
          duracao: '4 min',
        },
      ],
    },
    {
      id: 'rebanho',
      titulo: 'Gestão de Rebanho',
      descricao: 'Controle completo do seu rebanho',
      icon: FileText,
      artigos: [
        {
          id: 4,
          titulo: 'Registro de nascimentos',
          tipo: 'texto',
          duracao: '6 min',
        },
        {
          id: 5,
          titulo: 'Controle genealógico',
          tipo: 'video',
          duracao: '12 min',
        },
        { id: 6, titulo: 'Manejo sanitário', tipo: 'texto', duracao: '10 min' },
        {
          id: 7,
          titulo: 'Controle de peso e desenvolvimento',
          tipo: 'texto',
          duracao: '7 min',
        },
      ],
    },
    {
      id: 'producao',
      titulo: 'Produção de Leite',
      descricao: 'Gerencie a produção leiteira',
      icon: Video,
      artigos: [
        {
          id: 8,
          titulo: 'Registro de ordenha',
          tipo: 'video',
          duracao: '10 min',
        },
        {
          id: 9,
          titulo: 'Controle de qualidade do leite',
          tipo: 'texto',
          duracao: '8 min',
        },
        {
          id: 10,
          titulo: 'Análise de produtividade',
          tipo: 'texto',
          duracao: '6 min',
        },
      ],
    },
    {
      id: 'propriedade',
      titulo: 'Gestão da Propriedade',
      descricao: 'Administre piquetes e alimentação',
      icon: FileText,
      artigos: [
        {
          id: 11,
          titulo: 'Configuração de piquetes',
          tipo: 'texto',
          duracao: '5 min',
        },
        {
          id: 12,
          titulo: 'Controle de alimentação',
          tipo: 'video',
          duracao: '9 min',
        },
        {
          id: 13,
          titulo: 'Rotação de pastagens',
          tipo: 'texto',
          duracao: '7 min',
        },
      ],
    },
    {
      id: 'relatorios',
      titulo: 'Relatórios e Análises',
      descricao: 'Extraia insights dos seus dados',
      icon: Download,
      artigos: [
        {
          id: 14,
          titulo: 'Relatório de produção mensal',
          tipo: 'texto',
          duracao: '4 min',
        },
        {
          id: 15,
          titulo: 'Análise financeira',
          tipo: 'video',
          duracao: '15 min',
        },
        {
          id: 16,
          titulo: 'Exportação de dados',
          tipo: 'texto',
          duracao: '5 min',
        },
      ],
    },
  ];

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const filteredDocs = searchTerm
    ? documentacao
        .map((section) => ({
          ...section,
          artigos: section.artigos.filter((artigo) =>
            artigo.titulo.toLowerCase().includes(searchTerm.toLowerCase())
          ),
        }))
        .filter((section) => section.artigos.length > 0)
    : documentacao;

  if (loading) {
    return <Loading text="Carregando documentação..." />;
  }

  return (
    <>
      <Head>
        <title>Documentação | Buffs</title>
        <meta
          name="description"
          content="Central de documentação do sistema Buffs"
        />
      </Head>

      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
        {/* Header */}
        <DashboardContainer>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#ffcf78] rounded-lg">
              <BookOpen className="text-[#ce7d0a]" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#404040]">
                Central de Documentação
              </h1>
              <p className="text-sm text-gray-600">
                Encontre guias e tutoriais para usar o sistema
              </p>
            </div>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar na documentação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffcf78] focus:border-transparent"
            />
          </div>
        </DashboardContainer>

        {/* Seções de Documentação */}
        <div className="space-y-4">
          {filteredDocs.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections[section.id];

            return (
              <DashboardContainer key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center justify-between w-full text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#f8fcfa] rounded-lg group-hover:bg-[#ffcf78] transition-colors">
                      <Icon className="text-[#ce7d0a]" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#404040] group-hover:text-[#ce7d0a] transition-colors">
                        {section.titulo}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {section.descricao}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">
                      {section.artigos.length} artigos
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="text-[#ce7d0a]" size={20} />
                    ) : (
                      <ChevronRight className="text-gray-400" size={20} />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {section.artigos.map((artigo) => (
                      <button
                        key={artigo.id}
                        className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-amber-50 transition-colors border border-transparent hover:border-amber-200 group"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-1.5 rounded ${
                              artigo.tipo === 'video'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {artigo.tipo === 'video' ? (
                              <Video size={14} />
                            ) : (
                              <FileText size={14} />
                            )}
                          </div>
                          <span className="text-sm text-gray-700 group-hover:text-[#ce7d0a] font-medium">
                            {artigo.titulo}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {artigo.duracao}
                          </span>
                          <ChevronRight
                            className="text-gray-400 group-hover:text-[#ce7d0a]"
                            size={16}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </DashboardContainer>
            );
          })}
        </div>

        {/* Recursos Adicionais */}
        <DashboardContainer>
          <h2 className="text-lg font-bold text-[#404040] border-l-4 border-[#ffcf78] pl-3 mb-4">
            Recursos Adicionais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-all group text-left">
              <Video className="text-blue-600 mb-2" size={24} />
              <h3 className="font-bold text-gray-800 mb-1">Vídeos Tutoriais</h3>
              <p className="text-xs text-gray-600">
                Aprenda visualmente com nossos vídeos
              </p>
            </button>

            <button className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:shadow-md transition-all group text-left">
              <Download className="text-green-600 mb-2" size={24} />
              <h3 className="font-bold text-gray-800 mb-1">Downloads</h3>
              <p className="text-xs text-gray-600">PDFs e materiais de apoio</p>
            </button>

            <button className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg hover:shadow-md transition-all group text-left">
              <FileText className="text-amber-600 mb-2" size={24} />
              <h3 className="font-bold text-gray-800 mb-1">FAQ</h3>
              <p className="text-xs text-gray-600">Perguntas frequentes</p>
            </button>
          </div>
        </DashboardContainer>
      </div>
    </>
  );
}
