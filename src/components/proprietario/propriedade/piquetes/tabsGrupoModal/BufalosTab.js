import React, { useState, useEffect, useMemo } from 'react';
import { FiUsers, FiAlertCircle } from 'react-icons/fi';
import bufaloService from '../../../../../services/bufalo.service';
import Badge from '../../../../ui/Badge';
import Table from '../../../../table/Table';
import EmptyState from '../../../../ui/EmptyState';
import Pagination from '../../../../ui/Pagination';

const ITEMS_PER_PAGE = 10;

/**
 * Tab que exibe os búfalos pertencentes ao grupo
 */
export default function BufalosTab({ grupo, idPropriedade }) {
  const [bufalos, setBufalos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Buscar búfalos do grupo
  useEffect(() => {
    if (!idPropriedade || !grupo?.id_grupo) {
      setLoading(false);
      return;
    }

    const fetchBufalos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await bufaloService.getBufalosByGrupo(
          idPropriedade,
          grupo.id_grupo
        );
        setBufalos(response?.data || []);
        setCurrentPage(1); // Reset para primeira página
      } catch (err) {
        console.error('Erro ao buscar búfalos:', err);
        setError('Erro ao carregar búfalos do grupo');
      } finally {
        setLoading(false);
      }
    };

    fetchBufalos();
  }, [idPropriedade, grupo?.id_grupo]);

  // Paginação local
  const totalPages = Math.ceil(bufalos.length / ITEMS_PER_PAGE);

  const paginatedBufalos = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return bufalos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [bufalos, currentPage]);

  // Calcula idade
  const calcularIdade = (dtNascimento) => {
    if (!dtNascimento) return '-';
    const nascimento = new Date(dtNascimento);
    const hoje = new Date();
    let anos = hoje.getFullYear() - nascimento.getFullYear();
    const meses = hoje.getMonth() - nascimento.getMonth();

    if (meses < 0 || (meses === 0 && hoje.getDate() < nascimento.getDate())) {
      anos--;
    }

    return `${anos} anos`;
  };

  // Colunas da tabela
  const columns = [
    { key: 'brinco', label: 'Brinco', className: 'text-left' },
    { key: 'nome', label: 'Nome', className: 'text-left' },
    { key: 'sexo', label: 'Sexo', className: 'text-center' },
    { key: 'raca', label: 'Raça', className: 'text-left' },
    { key: 'idade', label: 'Idade', className: 'text-center' },
    { key: 'nivel_maturidade', label: 'Maturidade', className: 'text-center' },
    { key: 'status', label: 'Status', className: 'text-center' },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#ce7d0a] rounded-full animate-spin mb-4" />
        <span className="text-sm text-slate-400">Carregando búfalos...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <FiAlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  // Empty state
  if (bufalos.length === 0) {
    return (
      <EmptyState
        icon={FiUsers}
        title="Nenhum búfalo neste grupo"
        description="Associe búfalos a este grupo para vê-los listados aqui"
        compact
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com contagem */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <FiUsers className="w-5 h-5 text-[#ce7d0a]" />
          Búfalos do Grupo
        </h3>
        <Badge type="info">
          {bufalos.length} búfalo{bufalos.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Tabela de búfalos */}
      <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
        <Table
          columns={columns}
          data={paginatedBufalos}
          minWidth="700px"
          rowClassName="hover:bg-amber-50/50 transition-colors"
          renderCell={(bufalo, key) => {
            if (key === 'sexo') {
              return (
                <Badge type={bufalo.sexo === 'F' ? 'warning' : 'info'}>
                  {bufalo.sexo === 'F' ? 'Fêmea' : 'Macho'}
                </Badge>
              );
            }
            if (key === 'raca') {
              return bufalo.raca?.nome || '-';
            }
            if (key === 'idade') {
              return calcularIdade(bufalo.dt_nascimento);
            }
            if (key === 'nivel_maturidade') {
              const maturidadeMap = {
                B: 'Bezerra(o)',
                D: 'Desmamado',
                N: 'Novilha(o)',
                T: 'Touro',
                V: 'Vaca',
              };
              return (
                <span className="text-xs font-medium text-slate-600">
                  {maturidadeMap[bufalo.nivel_maturidade] ||
                    bufalo.nivel_maturidade ||
                    '-'}
                </span>
              );
            }
            if (key === 'status') {
              return (
                <Badge type={bufalo.status ? 'active' : 'inactive'}>
                  {bufalo.status ? 'Ativo' : 'Inativo'}
                </Badge>
              );
            }
            return bufalo[key] || '-';
          }}
        />
      </div>

      {/* Paginação - só exibe se tiver mais de uma página */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">
            {bufalos.filter((b) => b.sexo === 'F').length}
          </p>
          <p className="text-xs text-slate-500 uppercase font-medium">Fêmeas</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">
            {bufalos.filter((b) => b.sexo === 'M').length}
          </p>
          <p className="text-xs text-slate-500 uppercase font-medium">Machos</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {bufalos.filter((b) => b.status).length}
          </p>
          <p className="text-xs text-slate-500 uppercase font-medium">Ativos</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-500">
            {bufalos.filter((b) => !b.status).length}
          </p>
          <p className="text-xs text-slate-500 uppercase font-medium">
            Inativos
          </p>
        </div>
      </div>
    </div>
  );
}
