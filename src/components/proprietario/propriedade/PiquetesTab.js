import React, { useState, useEffect, useCallback } from 'react';
import DashboardContainer from '../../ui/DashboardContainer';
import MapaRotativoLeaflet from './piquetes/Mapa';
import GrupoModal from './piquetes/GrupoModal';
import GrupoCriarModal from './piquetes/GrupoCriarModal';
import GrupoEditarModal from './piquetes/GrupoEditarModal';
import GrupoDeleteModal from './piquetes/GrupoDeleteModal';
import PiqueteCriarModal from './piquetes/PiqueteCriarModal';
import PiqueteEditarModal from './piquetes/PiqueteEditarModal';
import PiqueteDeleteModal from './piquetes/PiqueteDeleteModal';
import Table from '../../table/Table';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import loteService from '../../../services/lote.service';
import grupoService from '../../../services/grupo.service';
import {
  FiMapPin,
  FiUsers,
  FiAlertCircle,
  FiPlus,
  FiEdit2,
  FiTrash2,
} from 'react-icons/fi';
import EmptyState from '../../ui/EmptyState';

// Componente de loading animado
const LoadingState = ({ text }) => (
  <div className="flex flex-col items-center justify-center h-full">
    <div className="relative mb-4">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-[#ce7d0a] rounded-full animate-spin" />
    </div>
    <span className="text-sm text-slate-400 animate-pulse">{text}</span>
  </div>
);

// Componente de erro
const ErrorState = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-full animate-in fade-in duration-500">
    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
      <FiAlertCircle className="w-7 h-7 text-red-500" />
    </div>
    <p className="text-red-500 font-medium">{message}</p>
  </div>
);

export default function PiquetesTab({ idPropriedade }) {
  // Estados de dados
  const [lotes, setLotes] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingGrupos, setLoadingGrupos] = useState(true);
  const [error, setError] = useState(null);

  // Estados de modal de detalhes do grupo
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [isGrupoModalOpen, setIsGrupoModalOpen] = useState(false);

  // Estados de modais CRUD de grupo
  const [isGrupoCriarModalOpen, setIsGrupoCriarModalOpen] = useState(false);
  const [isGrupoEditarModalOpen, setIsGrupoEditarModalOpen] = useState(false);
  const [grupoParaEditar, setGrupoParaEditar] = useState(null);
  const [isGrupoDeleteModalOpen, setIsGrupoDeleteModalOpen] = useState(false);
  const [grupoParaExcluir, setGrupoParaExcluir] = useState(null);

  // Estados de modal de CRIAR piquete
  const [isCriarModalOpen, setIsCriarModalOpen] = useState(false);

  // Estados de modal de EDITAR piquete
  const [isEditarModalOpen, setIsEditarModalOpen] = useState(false);
  const [piqueteParaEditar, setPiqueteParaEditar] = useState(null);

  // Estados de modal de EXCLUIR piquete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [piqueteParaExcluir, setPiqueteParaExcluir] = useState(null);

  const idMissing = !idPropriedade;

  // Função para buscar lotes
  const fetchLotes = useCallback(async () => {
    if (!idPropriedade) return;
    setLoading(true);
    try {
      const res = await loteService.getLotesByPropriedade(idPropriedade);
      setLotes(res || []);
      setError(null);
    } catch (err) {
      setError('Erro ao buscar lotes');
    } finally {
      setLoading(false);
    }
  }, [idPropriedade]);

  // Função para buscar grupos
  const fetchGrupos = useCallback(async () => {
    if (!idPropriedade) return;
    console.log('[fetchGrupos] Iniciando busca...');
    setLoadingGrupos(true);
    try {
      const res = await grupoService.getGruposByPropriedade(
        idPropriedade,
        1,
        100
      );
      console.log('[fetchGrupos] Resposta:', res?.data?.length, 'grupos');
      setGrupos(res?.data || []);
    } catch (err) {
      console.error('[fetchGrupos] Erro:', err);
    } finally {
      setLoadingGrupos(false);
      console.log('[fetchGrupos] Finalizado');
    }
  }, [idPropriedade]);

  // Carregar dados iniciais
  useEffect(() => {
    if (idMissing) return;
    fetchLotes();
    fetchGrupos();
  }, [idMissing, fetchLotes, fetchGrupos]);

  // Handlers do GrupoModal (detalhes)
  const handleOpenGrupoModal = (grupo) => {
    setGrupoSelecionado(grupo);
    setIsGrupoModalOpen(true);
  };

  const handleCloseGrupoModal = () => {
    setIsGrupoModalOpen(false);
    setGrupoSelecionado(null);
  };

  // Handlers CRUD de Grupo
  const handleNovoGrupo = () => {
    setIsGrupoCriarModalOpen(true);
  };

  const handleEditarGrupo = (grupo, e) => {
    e?.stopPropagation();
    setGrupoParaEditar(grupo);
    setIsGrupoEditarModalOpen(true);
  };

  const handleExcluirGrupo = (grupo, e) => {
    e?.stopPropagation();
    setGrupoParaExcluir(grupo);
    setIsGrupoDeleteModalOpen(true);
  };

  const handleGrupoCrudSuccess = async () => {
    console.log('[handleGrupoCrudSuccess] Chamando fetchGrupos...');
    await fetchGrupos();
    console.log('[handleGrupoCrudSuccess] fetchGrupos concluído');
  };

  // Handlers do modal de CRIAR piquete
  const handleNovoPiquete = () => {
    setIsCriarModalOpen(true);
  };

  const handleCloseCriarModal = () => {
    setIsCriarModalOpen(false);
  };

  // Handlers do modal de EDITAR piquete
  const handleEditarPiquete = (piquete) => {
    setPiqueteParaEditar(piquete);
    setIsEditarModalOpen(true);
  };

  const handleCloseEditarModal = () => {
    setIsEditarModalOpen(false);
    setPiqueteParaEditar(null);
  };

  // Handlers do modal de EXCLUIR piquete
  const handleExcluirPiquete = (piquete) => {
    setPiqueteParaExcluir(piquete);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPiqueteParaExcluir(null);
  };

  // Callback após sucesso em qualquer operação CRUD de piquete
  const handleCrudSuccess = () => {
    fetchLotes();
  };

  // Colunas da tabela de grupos
  const grupoColumns = [
    { key: 'nomeGrupo', label: 'Nome do Grupo', className: 'text-left' },
    { key: 'color', label: 'Cor', className: 'text-center' },
    { key: 'qtd_lotes', label: 'Piquetes', className: 'text-center' },
    { key: 'acoes', label: 'Ações', className: 'text-center w-24' },
  ];

  // Enriquece grupos com contagem de lotes
  const gruposEnriquecidos = grupos.map((g) => ({
    ...g,
    qtd_lotes: lotes.filter(
      (l) => (l.idGrupo || l.id_grupo) === (g.idGrupo || g.id_grupo)
    ).length,
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Mapa de Piquetes */}
      <DashboardContainer>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#404040]">Mapa de Piquetes</h2>
          <Button variant="primary" size="small" onClick={handleNovoPiquete}>
            <FiPlus className="w-4 h-4 mr-2" />
            Novo Piquete
          </Button>
        </div>
        <div className="w-full h-[600px] bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0">
            {idMissing ? (
              <ErrorState message="ID da propriedade não informado." />
            ) : loading ? (
              <LoadingState text="Carregando piquetes..." />
            ) : error ? (
              <ErrorState message={error} />
            ) : lotes.length === 0 ? (
              <EmptyState
                icon={FiMapPin}
                title="Nenhum piquete cadastrado"
                description="Comece desenhando as áreas de pastagem no mapa para organizar sua propriedade."
                buttonText="Criar Primeiro Piquete"
                buttonSize="medium"
                onButtonClick={handleNovoPiquete}
                className="h-full bg-gradient-to-br from-slate-50 to-slate-100"
              />
            ) : (
              <MapaRotativoLeaflet
                lotes={lotes}
                onEditPiquete={handleEditarPiquete}
                onDeletePiquete={handleExcluirPiquete}
              />
            )}
          </div>
        </div>
      </DashboardContainer>

      {/* Tabela de Grupos */}
      <DashboardContainer>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#404040]">Grupos de Manejo</h2>
          <Button variant="primary" size="small" onClick={handleNovoGrupo}>
            <FiPlus className="w-4 h-4 mr-2" />
            Novo Grupo
          </Button>
        </div>
        {loadingGrupos ? (
          <div className="h-32 flex items-center justify-center">
            <LoadingState text="Carregando grupos..." />
          </div>
        ) : grupos.length === 0 ? (
          <EmptyState
            icon={FiUsers}
            title="Nenhum grupo de manejo"
            description="Organize seus animais em grupos para facilitar o acompanhamento e manejo do rebanho."
            buttonText="Novo Grupo"
            onButtonClick={handleNovoGrupo}
          />
        ) : (
          <Table
            columns={grupoColumns}
            data={gruposEnriquecidos}
            minWidth="600px"
            rowClassName="cursor-pointer hover:bg-amber-50 transition-colors"
            onRowClick={handleOpenGrupoModal}
            renderCell={(grupo, key) => {
              if (key === 'color') {
                return (
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className="inline-block w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: grupo.color || '#444444' }}
                    />
                  </div>
                );
              }
              if (key === 'qtd_lotes') {
                return (
                  <Badge type="info">
                    {grupo.qtd_lotes} piquete{grupo.qtd_lotes !== 1 ? 's' : ''}
                  </Badge>
                );
              }
              if (key === 'acoes') {
                return (
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={(e) => handleEditarGrupo(grupo, e)}
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Editar grupo"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleExcluirGrupo(grupo, e)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir grupo"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              }
              return grupo[key];
            }}
          />
        )}
      </DashboardContainer>

      {/* Modal de Detalhes do Grupo */}
      <GrupoModal
        isOpen={isGrupoModalOpen}
        onClose={handleCloseGrupoModal}
        grupo={grupoSelecionado}
        lotes={lotes}
        idPropriedade={idPropriedade}
      />

      {/* Modais CRUD de Grupo */}
      <GrupoCriarModal
        isOpen={isGrupoCriarModalOpen}
        onClose={() => setIsGrupoCriarModalOpen(false)}
        onSuccess={handleGrupoCrudSuccess}
        idPropriedade={idPropriedade}
      />

      <GrupoEditarModal
        isOpen={isGrupoEditarModalOpen}
        onClose={() => {
          setIsGrupoEditarModalOpen(false);
          setGrupoParaEditar(null);
        }}
        onSuccess={handleGrupoCrudSuccess}
        grupo={grupoParaEditar}
      />

      <GrupoDeleteModal
        isOpen={isGrupoDeleteModalOpen}
        onClose={() => {
          setIsGrupoDeleteModalOpen(false);
          setGrupoParaExcluir(null);
        }}
        onSuccess={handleGrupoCrudSuccess}
        grupo={grupoParaExcluir}
      />

      {/* Modal de CRIAR Piquete */}
      <PiqueteCriarModal
        isOpen={isCriarModalOpen}
        onClose={handleCloseCriarModal}
        onSuccess={handleCrudSuccess}
        idPropriedade={idPropriedade}
        grupos={grupos}
        existingLotes={lotes}
      />

      {/* Modal de EDITAR Piquete */}
      <PiqueteEditarModal
        isOpen={isEditarModalOpen}
        onClose={handleCloseEditarModal}
        onSuccess={handleCrudSuccess}
        grupos={grupos}
        piquete={piqueteParaEditar}
        existingLotes={lotes}
      />

      {/* Modal de EXCLUIR Piquete */}
      <PiqueteDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onSuccess={handleCrudSuccess}
        piquete={piqueteParaExcluir}
      />
    </div>
  );
}
