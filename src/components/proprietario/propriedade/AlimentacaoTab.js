import React, { useState, useEffect, useCallback } from 'react';
import DashboardContainer from '@/components/ui/DashboardContainer';
import MetricCard from '@/components/ui/MetricCard';
import Table from '@/components/table/Table';
import Button from '@/components/ui/Button';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import alimentacaoDefService from '../../../services/alimentacao-def.service';
import alimentacaoRegistroService from '../../../services/alimentacao-registro.service';
import AlimentacaoDefModal from './alimentacao/AlimentacaoDefModal';
import AlimentacaoRegistroModal from './alimentacao/AlimentacaoRegistroModal';
import EmptyState from '@/components/ui/EmptyState';

export default function AlimentacaoTab({ grupos = [], propriedadeId }) {
  const [definicoes, setDefinicoes] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [loadingDefs, setLoadingDefs] = useState(false);
  const [loadingRegistros, setLoadingRegistros] = useState(false);

  // Modals Definição
  const [isDefModalOpen, setIsDefModalOpen] = useState(false);
  const [defParaEditar, setDefParaEditar] = useState(null);

  // Modals Registro
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);

  // Fetch Definitions
  const fetchDefinicoes = useCallback(async () => {
    if (!propriedadeId) return;
    setLoadingDefs(true);
    try {
      const res =
        await alimentacaoDefService.getAlimentacoesDefByPropriedade(
          propriedadeId
        );
      setDefinicoes(res?.data || []);
    } catch (error) {
      console.error('Erro ao buscar definições', error);
    } finally {
      setLoadingDefs(false);
    }
  }, [propriedadeId]);

  // Fetch Registros
  const fetchRegistros = useCallback(async () => {
    if (!propriedadeId) return;
    setLoadingRegistros(true);
    try {
      const res =
        await alimentacaoRegistroService.getRegistrosByPropriedade(
          propriedadeId
        );
      setRegistros(res?.data || []);
    } catch (error) {
      console.error('Erro ao buscar registros', error);
    } finally {
      setLoadingRegistros(false);
    }
  }, [propriedadeId]);

  useEffect(() => {
    fetchDefinicoes();
    fetchRegistros();
  }, [fetchDefinicoes, fetchRegistros]);

  // Handlers Definição
  const handleNovaDefinicao = () => {
    setDefParaEditar(null);
    setIsDefModalOpen(true);
  };

  const handleEditarDefinicao = (def) => {
    setDefParaEditar(def);
    setIsDefModalOpen(true);
  };

  const handleExcluirDefinicao = async (id) => {
    if (
      window.confirm('Tem certeza que deseja excluir este tipo de alimento?')
    ) {
      try {
        await alimentacaoDefService.deleteAlimentacaoDef(id);
        fetchDefinicoes();
      } catch (error) {
        alert('Erro ao excluir: ' + error.message);
      }
    }
  };

  // Handlers Registro
  const handleNovoRegistro = () => {
    setIsRegModalOpen(true);
  };

  // Metrics Calculation (Client-side implementation)
  const consumoDiarioTotal = registros.reduce((acc, curr) => {
    // Apenas uma estimativa simples baseada nos registros recentes
    // Em produção, isso deveria vir do backend
    return acc + (parseFloat(curr.quantidade) || 0);
  }, 0);

  const totalRegistros = registros.length;
  const tiposRacao = definicoes.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Cards de Métricas */}
      <DashboardContainer>
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          }}
        >
          <MetricCard
            title="Tipos de Alimento"
            value={tiposRacao}
            subtitle="cadastrados"
          />
          <MetricCard
            title="Total Registros"
            value={totalRegistros}
            subtitle="alimentações"
          />
          <MetricCard
            title="Consumo Total"
            value={`${consumoDiarioTotal.toFixed(1)}`}
            subtitle="acumulado (geral)"
          />
        </div>
      </DashboardContainer>

      {/* Tabela de Definições */}
      <DashboardContainer>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#404040]">
            Tipos de Alimentação
          </h2>
          <Button variant="primary" size="small" onClick={handleNovaDefinicao}>
            <FiPlus className="w-4 h-4 mr-2" />
            Novo Tipo
          </Button>
        </div>

        {loadingDefs ? (
          <div className="p-8 text-center text-gray-500">
            Carregando tipos...
          </div>
        ) : definicoes.length === 0 ? (
          <EmptyState
            title="Nenhum tipo de alimento definido"
            description="Cadastre os tipos de ração ou suplemento para iniciar os registros."
            buttonText="Novo Tipo"
            onButtonClick={handleNovaDefinicao}
          />
        ) : (
          <Table
            columns={[
              {
                key: 'tipo_alimentacao',
                label: 'Tipo',
                className: 'text-left',
              },
              { key: 'descricao', label: 'Descrição', className: 'text-left' },
              { key: 'acoes', label: 'Ações', className: 'text-center w-24' },
            ]}
            data={definicoes.map((d) => ({
              ...d,
              tipo_alimentacao: d.tipoAlimentacao || d.tipo_alimentacao,
              id: d.idAlimentDef || d.id_aliment_def, // normalizando ID para facilitar
            }))}
            minWidth="600px"
            renderCell={(def, key) => {
              if (key === 'acoes')
                return (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEditarDefinicao(def)}
                      className="p-1 text-slate-400 hover:text-amber-600 transition-colors"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleExcluirDefinicao(def.id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                );
              if (key === 'descricao')
                return (
                  <span
                    title={def.descricao}
                    className="max-w-md truncate block"
                  >
                    {def.descricao || '-'}
                  </span>
                );
              return def[key];
            }}
          />
        )}
      </DashboardContainer>

      {/* Tabela de Registros */}
      <DashboardContainer>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#404040]">
            Histórico de Alimentação
          </h2>
          <Button variant="outline" size="small" onClick={handleNovoRegistro}>
            <FiPlus className="w-4 h-4 mr-2" />
            Registrar Alimentação
          </Button>
        </div>

        {loadingRegistros ? (
          <div className="p-8 text-center text-gray-500">
            Carregando histórico...
          </div>
        ) : registros.length === 0 ? (
          <EmptyState
            title="Nenhum registro encontrado"
            description="Registre a alimentação dos grupos para acompanhar o histórico."
            buttonText="Registrar Alimentação"
            onButtonClick={handleNovoRegistro}
          />
        ) : (
          <Table
            columns={[
              { key: 'grupo', label: 'Grupo', className: 'text-left' },
              { key: 'tipo', label: 'Tipo', className: 'text-left' },
              { key: 'quantidade', label: 'Qtd.', className: 'text-left' },
              { key: 'freq_dia', label: 'Freq.', className: 'text-left' },
              { key: 'dt_registro', label: 'Data', className: 'text-left' },
              { key: 'usuario', label: 'Feito por', className: 'text-left' },
            ]}
            data={registros.map((reg) => ({
              ...reg,
              grupo: reg.grupo?.nomeGrupo || reg.grupo?.nome_grupo || '-',
              tipo:
                reg.alimentacaodef?.tipoAlimentacao ||
                reg.alimentacaodef?.tipo_alimentacao ||
                '-',
              quantidade: `${parseFloat(reg.quantidade).toFixed(1)} ${reg.unidadeMedida || reg.unidade_medida}`,
              dt_registro: reg.dtRegistro
                ? new Date(
                    reg.dtRegistro || reg.dt_registro
                  ).toLocaleDateString('pt-BR')
                : '-',
              usuario: reg.usuario?.nome || '-',
              freq_dia: `${reg.freqDia}x`,
            }))}
            minWidth="700px"
          />
        )}
      </DashboardContainer>

      {/* Modals */}
      <AlimentacaoDefModal
        isOpen={isDefModalOpen}
        onClose={() => setIsDefModalOpen(false)}
        onSuccess={fetchDefinicoes}
        definicao={defParaEditar}
        idPropriedade={propriedadeId}
      />

      <AlimentacaoRegistroModal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        onSuccess={fetchRegistros}
        grupos={grupos}
        definicoes={definicoes}
        idPropriedade={propriedadeId}
      />
    </div>
  );
}
