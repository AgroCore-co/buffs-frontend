'use client';

import Head from 'next/head';
import Loading from '@/components/loading/Loading';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FiEdit2,
  FiTrash2,
  FiMapPin,
  FiUser,
  FiCalendar,
  FiActivity,
  FiLayers,
} from 'react-icons/fi';
import DashboardContainer from '@/components/ui/DashboardContainer';
import MetricCard from '@/components/ui/MetricCard';
import Badge from '@/components/ui/Badge';
import PropriedadeCard from '@/components/proprietario/propriedades/PropriedadeCard';
import PropriedadeDeleteModal from '@/components/proprietario/propriedades/PropriedadeDeleteModal';
import Button from '@/components/ui/Button';

import { useEffect, useState } from 'react';
import { propriedadeService } from '@/services/propriedade.service';
import { enderecoService } from '@/services/endereco.service';
import NovaPropriedadeModal from '@/components/proprietario/propriedades/NovaPropriedadeModal';
import PropriedadeEditModal from '@/components/proprietario/propriedades/PropriedadeEditModal';
import api from '@/lib/api';

export default function Propriedades({
  onEditarPropriedade,
  onDeletarPropriedade,
}) {
  const router = useRouter();
  const [propriedades, setPropriedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proprietarios, setProprietarios] = useState({});
  const [enderecos, setEnderecos] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [propriedadeSelecionada, setPropriedadeSelecionada] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Proteção de rota igual à index
  const { loading: loadingAuth } = useProtectedRoute(['PROPRIETARIO']);

  useEffect(() => {
    async function fetchPropriedades() {
      setLoading(true);
      setError(null);
      try {
        const res = await propriedadeService.getPropriedades();
        if (res && res.propriedades) {
          setPropriedades(res.propriedades);
          // Buscar proprietários únicos
          const ids = [
            ...new Set(res.propriedades.map((p) => p.id_dono).filter(Boolean)),
          ];
          const proprietariosTemp = {};
          await Promise.all(
            ids.map(async (id) => {
              try {
                const usuario = await api.get(`/usuarios/${id}`);
                proprietariosTemp[id] =
                  usuario && usuario.nome ? usuario.nome : 'Sem proprietário';
              } catch {
                proprietariosTemp[id] = 'Sem proprietário';
              }
            })
          );
          setProprietarios(proprietariosTemp);

          // Buscar endereços únicos
          const enderecoIds = [
            ...new Set(
              res.propriedades.map((p) => p.id_endereco).filter(Boolean)
            ),
          ];
          const enderecosTemp = {};
          await Promise.all(
            enderecoIds.map(async (id) => {
              try {
                const endereco = await enderecoService.getEnderecoById(id);
                enderecosTemp[id] = endereco || null;
              } catch {
                enderecosTemp[id] = null;
              }
            })
          );
          setEnderecos(enderecosTemp);
        } else {
          setPropriedades([]);
        }
      } catch (err) {
        setError('Erro ao buscar propriedades.');
        setPropriedades([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPropriedades();
  }, []);

  // Funções utilitárias para exibir dados
  const formatCNPJ = (cnpj) => cnpj || 'N/A';
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };
  const formatEndereco = (endereco) => {
    if (!endereco) return 'Endereço não informado';
    return `${endereco.cidade} - ${endereco.estado}`;
  };
  const getManejoLabel = (tipo) => {
    const map = { P: 'Pecuária', E: 'Extensivo', I: 'Intensivo' };
    return map[tipo] || tipo || 'Não informado';
  };

  // Loading inicial igual ao dashboard
  if (loadingAuth || loading) {
    return <Loading text="Carregando painel..." />;
  }

  const handleNovoPropriedade = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);
  const handlePropriedadeCriada = () => {
    // Recarrega propriedades após cadastro
    setLoading(true);
    setError(null);
    async function fetchPropriedades() {
      try {
        const res = await propriedadeService.getPropriedades();
        if (res && res.propriedades) {
          setPropriedades(res.propriedades);
          // Buscar proprietários únicos
          const ids = [
            ...new Set(res.propriedades.map((p) => p.id_dono).filter(Boolean)),
          ];
          const proprietariosTemp = {};
          await Promise.all(
            ids.map(async (id) => {
              try {
                const usuario = await api.get(`/usuarios/${id}`);
                proprietariosTemp[id] =
                  usuario && usuario.nome ? usuario.nome : 'Sem proprietário';
              } catch {
                proprietariosTemp[id] = 'Sem proprietário';
              }
            })
          );
          setProprietarios(proprietariosTemp);

          // Buscar endereços únicos
          const enderecoIds = [
            ...new Set(
              res.propriedades.map((p) => p.id_endereco).filter(Boolean)
            ),
          ];
          const enderecosTemp = {};
          await Promise.all(
            enderecoIds.map(async (id) => {
              try {
                const endereco = await enderecoService.getEnderecoById(id);
                enderecosTemp[id] = endereco || null;
              } catch {
                enderecosTemp[id] = null;
              }
            })
          );
          setEnderecos(enderecosTemp);
        } else {
          setPropriedades([]);
        }
      } catch (err) {
        setError('Erro ao buscar propriedades.');
        setPropriedades([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPropriedades();
  };

  // Handler para abrir modal de edição
  const handleEditarPropriedade = (propriedade) => {
    setPropriedadeSelecionada(propriedade);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setPropriedadeSelecionada(null);
  };

  // Handler para abrir modal de exclusão
  const handleDeletarPropriedade = (propriedade) => {
    setPropriedadeSelecionada(propriedade);
    setDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
    setPropriedadeSelecionada(null);
  };

  const handlePropriedadeDeletada = () => {
    handleDeleteModalClose();
    handlePropriedadeCriada(); // Recarrega lista
  };

  const handlePropriedadeAtualizada = () => {
    handleEditModalClose();
    handlePropriedadeCriada(); // Reutiliza reload
  };

  return (
    <>
      <Head>
        <title>Gestão de Propriedades | Buffs</title>
        <meta
          name="description"
          content="Gestão e controle de propriedades rurais"
        />
      </Head>
      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
        {/* Seção de Métricas */}
        <DashboardContainer>
          <div>
            <h1 className="text-2xl font-bold text-[#404040] mb-1">
              Gestão de Propriedades
            </h1>
            <p className="text-[#404040]/70 text-sm">
              Controle e monitore todas as propriedades rurais do seu negócio.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total de Propriedades"
              value={propriedades.length}
              subtitle="Cadastradas"
              icon={<FiLayers className="text-[#ce7d0a]" />}
            />
            <MetricCard
              title="Propriedades Ativas"
              value={
                propriedades.filter(
                  (p) => p.status === 'Ativa' || p.status === undefined
                ).length
              }
              subtitle="Em operação"
              icon={<FiActivity className="text-green-600" />}
            />
            <MetricCard
              title="Tipo Pecuária"
              value={propriedades.filter((p) => p.tipo_manejo === 'P').length}
              subtitle="Foco bubalino"
              icon={<span className="font-bold text-[#ce7d0a]">P</span>}
            />
            <MetricCard
              title="Registradas ABCB"
              value={propriedades.filter((p) => p.p_abcb).length}
              subtitle="Certificadas"
              icon={<span className="font-bold text-blue-600">✓</span>}
            />
          </div>
        </DashboardContainer>
        {/* Seção de Listagem */}
        <DashboardContainer>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4 mb-2">
            <div>
              <h2 className="text-xl font-bold text-[#404040]">
                Propriedades Cadastradas
              </h2>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ce7d0a]"></span>
                {propriedades.length}{' '}
                {propriedades.length === 1
                  ? 'unidade encontrada'
                  : 'unidades encontradas'}
              </p>
            </div>
            <Button
              variant="primary"
              size="medium"
              className="font-bold flex items-center gap-2"
              onClick={handleNovoPropriedade}
            >
              <span>+</span> Nova Propriedade
            </Button>
          </div>
          {error ? (
            <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
              <p className="text-red-600 font-medium mb-1">Erro ao carregar</p>
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : propriedades.length === 0 ? (
            <div className="text-center py-16 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <FiLayers size={24} />
              </div>
              <h3 className="text-gray-800 font-semibold mb-1">
                Nenhuma propriedade encontrada
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Comece cadastrando sua primeira propriedade rural.
              </p>
              <button
                onClick={handleNovoPropriedade}
                className="text-[#ce7d0a] text-sm font-bold hover:underline"
              >
                Cadastrar agora
              </button>
              {/* REMOVIDO DAQUI: <NovaPropriedadeModal ... /> estava aqui dentro */}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {propriedades.map((propriedade) => (
                <div
                  key={propriedade.id_propriedade}
                  onClick={() =>
                    router.push(
                      `/proprietario/propriedade/${propriedade.id_propriedade}`
                    )
                  }
                  className="cursor-pointer"
                >
                  <PropriedadeCard
                    propriedade={{
                      ...propriedade,
                      dono: {
                        nome:
                          proprietarios[propriedade.id_dono] ||
                          'Sem proprietário',
                      },
                      endereco: enderecos[propriedade.id_endereco] || null,
                    }}
                    onEditar={(e, prop) => {
                      if (e && e.stopPropagation) e.stopPropagation();
                      handleEditarPropriedade({
                        ...prop,
                        dono: {
                          nome:
                            proprietarios[prop.id_dono] || 'Sem proprietário',
                        },
                        endereco: enderecos[prop.id_endereco] || null,
                      });
                    }}
                    onDeletar={handleDeletarPropriedade}
                  />
                </div>
              ))}
            </div>
          )}
        </DashboardContainer>
      </div>

      {/* Modais globais */}
      <NovaPropriedadeModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onCreated={handlePropriedadeCriada}
      />
      <PropriedadeEditModal
        isOpen={editModalOpen}
        onClose={handleEditModalClose}
        propriedade={propriedadeSelecionada}
        onUpdated={handlePropriedadeAtualizada}
      />
      <PropriedadeDeleteModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteModalClose}
        propriedade={propriedadeSelecionada}
        onDeleted={handlePropriedadeDeletada}
      />
    </>
  );
}
