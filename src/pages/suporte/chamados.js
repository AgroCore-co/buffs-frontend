import React, { useState } from 'react';
import Head from 'next/head';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import Loading from '@/components/loading/Loading';
import DashboardContainer from '@/components/ui/DashboardContainer';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
} from 'lucide-react';

export default function ChamadosPage() {
  const { loading } = useProtectedRoute([
    'PROPRIETARIO',
    'FUNCIONARIO',
    'ADMIN',
  ]);
  const [showNewChamado, setShowNewChamado] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const chamados = [
    {
      id: '#8821',
      titulo: 'Erro ao gerar relatório mensal',
      descricao:
        'Ao tentar gerar o relatório de produção de Novembro, o sistema retorna erro 500.',
      categoria: 'Bug',
      prioridade: 'Alta',
      status: 'Em Andamento',
      data: '2025-12-03',
      responsavel: 'João Silva',
    },
    {
      id: '#8820',
      titulo: 'Sugestão: Exportar dados em Excel',
      descricao:
        'Gostaria de poder exportar os dados do rebanho em formato Excel (.xlsx).',
      categoria: 'Melhoria',
      prioridade: 'Média',
      status: 'Aberto',
      data: '2025-12-02',
      responsavel: 'Aguardando',
    },
    {
      id: '#8819',
      titulo: 'Dúvida sobre controle genealógico',
      descricao:
        'Como faço para registrar a genealogia completa de um búfalo importado?',
      categoria: 'Dúvida',
      prioridade: 'Baixa',
      status: 'Resolvido',
      data: '2025-12-01',
      responsavel: 'Maria Santos',
    },
    {
      id: '#8818',
      titulo: 'Problema de acesso ao módulo financeiro',
      descricao:
        'Usuários funcionários não conseguem acessar a área financeira mesmo com permissão.',
      categoria: 'Bug',
      prioridade: 'Alta',
      status: 'Em Andamento',
      data: '2025-11-30',
      responsavel: 'João Silva',
    },
    {
      id: '#8817',
      titulo: 'Integração com laticínio',
      descricao:
        'Solicito integração automática com o sistema do Laticínio Valle.',
      categoria: 'Recurso',
      prioridade: 'Média',
      status: 'Cancelado',
      data: '2025-11-28',
      responsavel: 'N/A',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Aberto':
        return 'bg-blue-100 text-blue-700';
      case 'Em Andamento':
        return 'bg-amber-100 text-amber-700';
      case 'Resolvido':
        return 'bg-green-100 text-green-700';
      case 'Cancelado':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case 'Alta':
        return 'text-red-600';
      case 'Média':
        return 'text-amber-600';
      case 'Baixa':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Aberto':
        return <Clock size={16} />;
      case 'Em Andamento':
        return <AlertCircle size={16} />;
      case 'Resolvido':
        return <CheckCircle size={16} />;
      case 'Cancelado':
        return <XCircle size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const filteredChamados = chamados.filter((chamado) => {
    const matchesStatus =
      filtroStatus === 'todos' || chamado.status === filtroStatus;
    const matchesSearch =
      chamado.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chamado.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    abertos: chamados.filter((c) => c.status === 'Aberto').length,
    emAndamento: chamados.filter((c) => c.status === 'Em Andamento').length,
    resolvidos: chamados.filter((c) => c.status === 'Resolvido').length,
  };

  if (loading) {
    return <Loading text="Carregando chamados..." />;
  }

  return (
    <>
      <Head>
        <title>Chamados | Buffs</title>
        <meta name="description" content="Gerencie seus chamados de suporte" />
      </Head>

      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
        {/* Header */}
        <DashboardContainer>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-lg">
                <FileText className="text-amber-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#404040]">
                  Meus Chamados
                </h1>
                <p className="text-sm text-gray-600">
                  Acompanhe e gerencie seus tickets de suporte
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowNewChamado(true)}
              className="flex items-center gap-2"
            >
              <Plus size={18} />
              Novo Chamado
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Abertos</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {stats.abertos}
                  </p>
                </div>
                <Clock className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 font-medium">
                    Em Andamento
                  </p>
                  <p className="text-2xl font-bold text-amber-700">
                    {stats.emAndamento}
                  </p>
                </div>
                <AlertCircle className="text-amber-600" size={24} />
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">
                    Resolvidos
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    {stats.resolvidos}
                  </p>
                </div>
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </DashboardContainer>

        {/* Filtros */}
        <DashboardContainer>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar por ID ou título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffcf78] focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFiltroStatus('todos')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroStatus === 'todos'
                    ? 'bg-[#ce7d0a] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroStatus('Aberto')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroStatus === 'Aberto'
                    ? 'bg-[#ce7d0a] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Abertos
              </button>
              <button
                onClick={() => setFiltroStatus('Em Andamento')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroStatus === 'Em Andamento'
                    ? 'bg-[#ce7d0a] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Em Andamento
              </button>
              <button
                onClick={() => setFiltroStatus('Resolvido')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroStatus === 'Resolvido'
                    ? 'bg-[#ce7d0a] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Resolvidos
              </button>
            </div>
          </div>
        </DashboardContainer>

        {/* Lista de Chamados */}
        <DashboardContainer>
          <div className="space-y-3">
            {filteredChamados.map((chamado) => (
              <div
                key={chamado.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-amber-200 hover:bg-amber-50/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`p-2 rounded-lg ${getStatusColor(chamado.status)}`}
                    >
                      {getStatusIcon(chamado.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-gray-500">
                          {chamado.id}
                        </span>
                        <span
                          className={`text-xs font-bold ${getPrioridadeColor(chamado.prioridade)}`}
                        >
                          {chamado.prioridade}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {chamado.categoria}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-800 mb-1 group-hover:text-[#ce7d0a]">
                        {chamado.titulo}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {chamado.descricao}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Responsável: {chamado.responsavel}</span>
                        <span>•</span>
                        <span>{chamado.data}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(chamado.status)}`}
                    >
                      {chamado.status}
                    </span>
                    <button className="p-2 text-gray-400 hover:text-[#ce7d0a] hover:bg-amber-50 rounded-lg transition-colors">
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DashboardContainer>
      </div>
    </>
  );
}
