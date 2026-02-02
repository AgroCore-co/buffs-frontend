import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import { alertasService } from '@/services/alertas.service';
import bufaloService from '@/services/bufalo.service';
import { usePropriedade } from '@/contexts/PropriedadeContext';
import { toast } from 'react-hot-toast';
import {
  FiAlertCircle,
  FiCheck,
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiUser,
} from 'react-icons/fi';
import { GiBuffaloHead } from 'react-icons/gi';

/**
 * Modal para exibir todos os alertas do sistema
 * @param {boolean} isOpen - Se o modal está aberto
 * @param {function} onClose - Callback para fechar o modal
 * @param {string[]} [nichos] - Nichos para filtrar (default: CLINICO, PRODUCAO)
 */
export default function AlertsModal({
  isOpen = false,
  onClose,
  nichos = ['CLINICO', 'PRODUCAO'],
}) {
  const { propriedadeSelecionada } = usePropriedade();

  // Estados
  const [alertas, setAlertas] = useState([]);
  const [animaisInfo, setAnimaisInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [incluirVistos, setIncluirVistos] = useState(true);
  const [prioridadeFiltro, setPrioridadeFiltro] = useState('');

  const itemsPerPage = 10;

  // Buscar alertas quando o modal abre ou filtros mudam
  useEffect(() => {
    if (isOpen && propriedadeSelecionada) {
      fetchAlertas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isOpen,
    propriedadeSelecionada,
    currentPage,
    incluirVistos,
    prioridadeFiltro,
  ]);

  const fetchAlertas = async () => {
    try {
      setLoading(true);
      const idPropriedade =
        propriedadeSelecionada.idPropriedade ||
        propriedadeSelecionada.id_propriedade;

      let alertasList = [];

      if (prioridadeFiltro) {
        // Busca apenas a prioridade selecionada
        const params = {
          nichos,
          incluirVistos,
          page: currentPage,
          limit: itemsPerPage,
          prioridade: prioridadeFiltro,
        };

        const response = await alertasService.listarAlertasPorPropriedade(
          idPropriedade,
          params
        );

        if (Array.isArray(response)) {
          alertasList = response;
        } else if (response?.alertas && Array.isArray(response.alertas)) {
          alertasList = response.alertas;
        } else if (response?.data && Array.isArray(response.data)) {
          alertasList = response.data;
        }
      } else {
        // Busca todas as 3 prioridades em paralelo
        const prioridades = ['ALTA', 'MEDIA', 'BAIXA'];

        const resultados = await Promise.all(
          prioridades.map(async (prioridade) => {
            const params = {
              nichos,
              incluirVistos,
              page: 1,
              limit: 100, // Busca mais para combinar
              prioridade,
            };

            try {
              const response = await alertasService.listarAlertasPorPropriedade(
                idPropriedade,
                params
              );

              if (Array.isArray(response)) {
                return response;
              } else if (response?.alertas && Array.isArray(response.alertas)) {
                return response.alertas;
              } else if (response?.data && Array.isArray(response.data)) {
                return response.data;
              }
              return [];
            } catch (error) {
              console.error(`Erro ao buscar alertas ${prioridade}:`, error);
              return [];
            }
          })
        );

        // Combina todos os resultados
        alertasList = resultados.flat();

        // Remove duplicados pelo idAlerta
        const seen = new Set();
        alertasList = alertasList.filter((alerta) => {
          if (seen.has(alerta.idAlerta)) {
            return false;
          }
          seen.add(alerta.idAlerta);
          return true;
        });
      }

      // Filtrar por nichos client-side (caso o backend não filtre corretamente)
      const alertasFiltrados = alertasList.filter((a) =>
        nichos.includes(a.nicho)
      );

      // Ordenar por data (mais recentes primeiro) e prioridade
      const prioridadeOrdem = { ALTA: 0, MEDIA: 1, BAIXA: 2 };
      alertasFiltrados.sort((a, b) => {
        // Primeiro por prioridade
        const prioridadeDiff =
          (prioridadeOrdem[a.prioridade] || 2) -
          (prioridadeOrdem[b.prioridade] || 2);
        if (prioridadeDiff !== 0) return prioridadeDiff;

        // Depois por data (mais recentes primeiro)
        const dataA = new Date(a.dataAlerta || a.createdAt);
        const dataB = new Date(b.dataAlerta || b.createdAt);
        return dataB - dataA;
      });

      setAlertas(alertasFiltrados);
      setTotal(alertasFiltrados.length);
      setTotalPages(Math.ceil(alertasFiltrados.length / itemsPerPage) || 1);

      // Buscar informações dos animais
      await fetchAnimaisInfo(alertasFiltrados);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
      toast.error('Erro ao carregar alertas.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnimaisInfo = async (alertasList) => {
    // Pegar IDs únicos dos animais
    const animalIds = [
      ...new Set(alertasList.filter((a) => a.animalId).map((a) => a.animalId)),
    ];

    if (animalIds.length === 0) return;

    const animaisData = {};

    // Buscar informações de cada animal em paralelo
    await Promise.all(
      animalIds.map(async (animalId) => {
        try {
          const response = await bufaloService.getBufaloById(animalId);

          if (response) {
            // Normalizar estrutura - pode vir como response.data ou direto
            let animal = response.data || response;

            // Helper para extrair string de objeto ou valor direto
            const extractString = (value, fieldName = 'nome') => {
              if (!value) return null;
              if (typeof value === 'string') return value;
              if (typeof value === 'object') {
                // Tenta extrair do campo fieldName ou dos campos comuns
                return (
                  value[fieldName] ||
                  value.nome ||
                  value.name ||
                  value.descricao ||
                  null
                );
              }
              return String(value);
            };

            // Se os campos estão aninhados, extrair
            const normalizedAnimal = {
              nome:
                extractString(animal.nome) ||
                extractString(animal.nomeAnimal) ||
                extractString(animal.nm_animal),
              brinco:
                extractString(animal.brinco) ||
                extractString(animal.nrBrinco) ||
                extractString(animal.nr_brinco),
              sexo:
                extractString(animal.sexo) ||
                extractString(animal.nmSexo) ||
                extractString(animal.nm_sexo),
              raca:
                extractString(animal.raca) ||
                extractString(animal.nmRaca) ||
                extractString(animal.nm_raca),
            };

            animaisData[animalId] = normalizedAnimal;
          }
        } catch (error) {
          console.error(`Erro ao buscar animal ${animalId}:`, error);
        }
      })
    );

    setAnimaisInfo(animaisData);
  };

  const handleMarcarVisto = async (alertaId, novoStatus) => {
    try {
      await alertasService.marcarVisto(alertaId, novoStatus);
      toast.success(
        novoStatus
          ? 'Alerta marcado como visto'
          : 'Alerta marcado como não visto'
      );
      fetchAlertas();
    } catch (error) {
      console.error('Erro ao marcar alerta:', error);
      toast.error('Erro ao atualizar alerta.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getPrioridadeStyles = (prioridade) => {
    switch (prioridade) {
      case 'ALTA':
        return {
          border: 'border-l-red-500',
          bg: 'bg-red-50',
          badge: 'bg-red-100 text-red-700',
        };
      case 'MEDIA':
        return {
          border: 'border-l-amber-500',
          bg: 'bg-amber-50',
          badge: 'bg-amber-100 text-amber-700',
        };
      default:
        return {
          border: 'border-l-blue-500',
          bg: 'bg-blue-50',
          badge: 'bg-blue-100 text-blue-700',
        };
    }
  };

  const getNichoLabel = (nicho) => {
    const labels = {
      CLINICO: 'Clínico',
      PRODUCAO: 'Produção',
      REPRODUCAO: 'Reprodução',
      SANITARIO: 'Sanitário',
      MANEJO: 'Manejo',
    };
    return labels[nicho] || nicho;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      title={
        <div className="flex items-center gap-2">
          <FiAlertCircle className="text-amber-600" />
          <span>Todos os Alertas</span>
        </div>
      }
      footer={
        <div className="flex justify-between items-center w-full">
          <span className="text-sm text-gray-500">
            {total} alerta{total !== 1 ? 's' : ''} encontrado
            {total !== 1 ? 's' : ''}
          </span>
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiFilter className="text-gray-400" />
            <span className="font-medium">Filtros:</span>
          </div>

          {/* Filtro de Prioridade */}
          <select
            value={prioridadeFiltro}
            onChange={(e) => {
              setPrioridadeFiltro(e.target.value);
              setCurrentPage(1);
            }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Todas prioridades</option>
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Média</option>
            <option value="BAIXA">Baixa</option>
          </select>

          {/* Toggle Incluir Vistos */}
          <button
            onClick={() => {
              setIncluirVistos(!incluirVistos);
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              incluirVistos
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {incluirVistos ? (
              <FiEye className="w-4 h-4" />
            ) : (
              <FiEyeOff className="w-4 h-4" />
            )}
            {incluirVistos ? 'Incluindo vistos' : 'Apenas pendentes'}
          </button>

          {/* Botão Atualizar */}
          <button
            onClick={fetchAlertas}
            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors ml-auto"
          >
            <FiRefreshCw
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            />
            Atualizar
          </button>
        </div>

        {/* Lista de Alertas */}
        <div className="min-h-[400px] max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              <FiRefreshCw className="w-6 h-6 animate-spin mr-2" />
              Carregando alertas...
            </div>
          ) : alertas.length === 0 ? (
            <EmptyState
              icon={FiAlertCircle}
              title="Nenhum alerta encontrado"
              description="Não há alertas com os filtros selecionados."
              className="py-16"
            />
          ) : (
            <div className="space-y-3">
              {alertas
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )
                .map((alerta) => {
                  const styles = getPrioridadeStyles(alerta.prioridade);
                  const animal = animaisInfo[alerta.animalId];

                  return (
                    <div
                      key={alerta.idAlerta}
                      className={`p-4 rounded-lg border-l-4 ${styles.border} ${styles.bg} ${alerta.visto ? 'opacity-70' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Header com badges */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {!alerta.visto && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-500 text-white animate-pulse">
                                Pendente
                              </span>
                            )}
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded ${styles.badge}`}
                            >
                              {alerta.prioridade}
                            </span>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              {getNichoLabel(alerta.nicho)}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDate(
                                alerta.dataAlerta || alerta.createdAt
                              )}
                            </span>
                            {alerta.visto && (
                              <span className="text-xs text-green-600 flex items-center gap-1">
                                <FiCheck className="w-3 h-3" /> Visto
                              </span>
                            )}
                          </div>

                          {/* Info do Animal */}
                          {animal && (
                            <div className="flex items-center gap-3 mb-3 p-2 bg-white/60 rounded-lg border border-gray-100">
                              <div className="w-10 h-10 rounded-full bg-[#404040] flex items-center justify-center">
                                <GiBuffaloHead className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-gray-800">
                                  {String(
                                    animal.nome ||
                                      animal.nomeAnimal ||
                                      'Sem nome'
                                  )}
                                </p>
                                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                  {animal.brinco && (
                                    <span>
                                      Brinco:{' '}
                                      <strong>{String(animal.brinco)}</strong>
                                    </span>
                                  )}
                                  {animal.sexo && (
                                    <span>• {String(animal.sexo)}</span>
                                  )}
                                  {animal.raca && (
                                    <span>• {String(animal.raca)}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Motivo do alerta */}
                          <p className="text-sm font-medium text-gray-800 mb-1">
                            {alerta.motivo}
                          </p>

                          {/* Observação */}
                          {alerta.observacao && (
                            <p className="text-xs text-gray-500 italic mb-2">
                              {alerta.observacao}
                            </p>
                          )}

                          {/* Informações adicionais */}
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            {alerta.grupo &&
                              alerta.grupo !== 'Não informado' && (
                                <span>
                                  Grupo: <strong>{alerta.grupo}</strong>
                                </span>
                              )}
                            {alerta.localizacao && (
                              <span>
                                Local: <strong>{alerta.localizacao}</strong>
                              </span>
                            )}
                            {alerta.tipoEventoOrigem && (
                              <span className="text-gray-400">
                                Origem:{' '}
                                {alerta.tipoEventoOrigem.replace(/_/g, ' ')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Botão marcar como visto */}
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() =>
                              handleMarcarVisto(alerta.idAlerta, !alerta.visto)
                            }
                            className={`p-2 rounded-lg transition-colors ${
                              alerta.visto
                                ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                            title={
                              alerta.visto
                                ? 'Marcar como não visto'
                                : 'Marcar como visto'
                            }
                          >
                            {alerta.visto ? (
                              <FiEyeOff className="w-4 h-4" />
                            ) : (
                              <FiEye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, total)}{' '}
              - {Math.min(currentPage * itemsPerPage, total)} de {total} alertas
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              navVariant="report"
              numberVariant="secondary"
              activeNumberVariant="primary"
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
