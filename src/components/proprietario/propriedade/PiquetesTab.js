import React, { useState, useEffect } from 'react';
import DashboardContainer from '../../ui/DashboardContainer';
import MapaRotativoLeaflet from './piquetes/Mapa';
import GrupoModal from './piquetes/GrupoModal';
import Table from '../../table/Table';
import loteService from '../../../services/lote.service';
import grupoService from '../../../services/grupo.service';
import { FiEye } from 'react-icons/fi';

export default function PiquetesTab({ idPropriedade }) {
  const [lotes, setLotes] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingGrupos, setLoadingGrupos] = useState(true);
  const [error, setError] = useState(null);
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const idMissing = !idPropriedade;

  useEffect(() => {
    if (idMissing) return;

    // Buscar lotes
    loteService
      .getLotesByPropriedade(idPropriedade)
      .then((res) => setLotes(res || []))
      .catch((err) => setError('Erro ao buscar lotes'))
      .finally(() => setLoading(false));

    // Buscar grupos
    grupoService
      .getGruposByPropriedade(idPropriedade, 1, 100)
      .then((res) => setGrupos(res?.data || []))
      .catch((err) => console.error('Erro ao buscar grupos:', err))
      .finally(() => setLoadingGrupos(false));
  }, [idPropriedade, idMissing]);

  const handleOpenModal = (grupo) => {
    setGrupoSelecionado(grupo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setGrupoSelecionado(null);
  };

  const columns = [
    { key: 'nome_grupo', label: 'Nome do Grupo', className: 'text-left' },
    { key: 'color', label: 'Cor', className: 'text-center' },
    { key: 'created_at', label: 'Criado em', className: 'text-center' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashboardContainer>
        <div className="w-full h-[600px] bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0">
            {idMissing ? (
              <div className="flex items-center justify-center h-full text-red-500">
                ID da propriedade não informado.
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Carregando lotes...
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-red-500">
                {error}
              </div>
            ) : (
              <MapaRotativoLeaflet lotes={lotes} />
            )}
          </div>
        </div>
      </DashboardContainer>

      <DashboardContainer>
        <h2 className="text-lg font-bold text-[#404040] mb-4">
          Grupos de Manejo
        </h2>
        {loadingGrupos ? (
          <div className="flex items-center justify-center h-32 text-gray-400">
            Carregando grupos...
          </div>
        ) : grupos.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400">
            Nenhum grupo cadastrado nesta propriedade
          </div>
        ) : (
          <Table
            columns={columns}
            data={grupos}
            minWidth="700px"
            rowClassName="cursor-pointer hover:bg-amber-50 transition-colors"
            onRowClick={handleOpenModal}
            renderCell={(grupo, key) => {
              if (key === 'color') {
                return (
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className="inline-block w-6 h-6 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: grupo.color || '#444444' }}
                    ></span>
                  </div>
                );
              }
              if (key === 'created_at') {
                return grupo.created_at || '-';
              }
              return grupo[key];
            }}
          />
        )}
      </DashboardContainer>

      {/* Modal de Detalhes do Grupo */}
      <GrupoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        grupo={grupoSelecionado}
        lotes={lotes}
      />
    </div>
  );
}
