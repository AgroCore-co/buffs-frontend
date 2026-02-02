import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Table from '@/components/table/Table';
import Pagination from '@/components/ui/Pagination';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Droplet,
  Calendar,
  AlertCircle,
  Activity,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Archive,
} from 'lucide-react';
import { lactacaoService } from '@/services/lactacao.service';
import Loading from '@/components/loading/Loading';

/* -------------------------------------------------------------------------- */
/* COMPONENTES INTERNOS                      */
/* -------------------------------------------------------------------------- */

const DetailMetric = ({ label, value, subValue, icon: Icon }) => (
  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex items-start gap-3">
    <div className="p-2 bg-white rounded-md border border-slate-200 shadow-sm text-amber-600">
      {Icon ? <Icon className="w-4 h-4" /> : <Droplet className="w-4 h-4" />}
    </div>
    <div>
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className="text-lg font-bold text-slate-800">{value}</p>
      {subValue && <p className="text-xs text-slate-400 mt-0.5">{subValue}</p>}
    </div>
  </div>
);

// Novo componente para o Accordion dos ciclos anteriores
function CicloAccordion({ ciclo, columns, renderCell, isOpen, onToggle }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white transition-all hover:border-amber-200">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 text-left transition-colors ${isOpen ? 'bg-amber-50' : 'bg-white hover:bg-slate-50'}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-full ${isOpen ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}
          >
            <Archive className="w-4 h-4" />
          </div>
          <div>
            <h5 className="font-bold text-slate-800 text-sm">{ciclo.titulo}</h5>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {ciclo.periodo}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 block uppercase">
              Total Produzido
            </span>
            <span className="text-sm font-bold text-amber-600">
              {ciclo.totalLitros} L
            </span>
          </div>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="border-t border-slate-100 animate-in slide-in-from-top-1">
          <div className="bg-slate-50/50 p-2 flex justify-between items-center px-4 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Registros do Ciclo
            </span>
            <span className="text-xs text-slate-400">
              {ciclo.ordenhas.length} registros
            </span>
          </div>
          <Table
            columns={columns}
            data={ciclo.ordenhas}
            renderCell={renderCell}
            minWidth="100%"
            className="border-0 shadow-none rounded-none"
          />
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* COMPONENTE PRINCIPAL                      */
/* -------------------------------------------------------------------------- */

export default function LactacaoDetailModal({
  isOpen = true,
  onClose,
  animalId,
}) {
  // isOpen true default apenas para preview
  const [activeTab, setActiveTab] = useState('ciclo');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCicloId, setExpandedCicloId] = useState(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    async function fetchData() {
      if (!animalId) return;

      try {
        setLoading(true);
        const response = await lactacaoService.getResumoProducao(animalId);

        let detailedOrdenhas = [];

        // Se tiver ciclo atual, busca detalhes das ordenhas
        if (response.ciclo_atual?.id_ciclo_lactacao) {
          try {
            const ordenhasRes = await lactacaoService.getOrdenhasPorCiclo(
              response.ciclo_atual.id_ciclo_lactacao,
              1, // page
              100 // limit
            );
            detailedOrdenhas = ordenhasRes.data || [];
          } catch (err) {
            console.error('Erro ao buscar detalhes das ordenhas:', err);
          }
        }

        // Mapper para estrutura interna
        // API: bufala, ciclo_atual, comparativo_ciclos, grafico_producao
        const mappedData = {
          animal: {
            nome: response.bufala?.nome,
            brinco: response.bufala?.brinco,
            raca: 'Murrah', // TODO: Backend nao devolve raca ainda
            idade: 'N/I', // TODO: Backend nao devolve idade ainda
          },
          cicloAtual: {
            totalOrdenhas:
              response.grafico_producao?.length || detailedOrdenhas.length || 0,
            mediaOrdenha: response.ciclo_atual?.media_diaria || 0,
            maiorOrdenha: 0,
            menorOrdenha: 0,
            totalAcumulado: response.ciclo_atual?.total_produzido || 0,
            diasLactacao: response.ciclo_atual?.dias_em_lactacao || 0,
            status: 'Em Lactação',
            // Usa as ordenhas detalhadas se tiver, senão fallback pro gráfico
            ordenhas:
              detailedOrdenhas.length > 0
                ? detailedOrdenhas.map((item) => ({
                    id: item.idLact,
                    data: item.dtOrdenha,
                    periodo:
                      item.periodo === 'M'
                        ? 'Manhã'
                        : item.periodo === 'T'
                          ? 'Tarde'
                          : 'Secagem',
                    quantidade: parseFloat(item.qtOrdenha),
                    ocorrencia: item.ocorrencia,
                  }))
                : response.grafico_producao?.map((item, idx) => ({
                    id: idx,
                    data: item.data,
                    periodo: 'Dia',
                    quantidade: item.quantidade,
                    ocorrencia: null,
                  })) || [],
          },
          ciclosAnteriores:
            response.comparativo_ciclos?.map((c) => ({
              id: c.id_ciclo_lactacao,
              titulo: `Ciclo ${c.numero_ciclo}`,
              periodo: `${c.dt_parto?.split('-')[0] || '?'} - ${c.dt_secagem?.split('-')[0] || '?'}`,
              totalLitros: c.total_produzido,
              dias: c.duracao_dias,
              ordenhas: [],
            })) || [],
        };

        // Calcular maior/menor
        if (mappedData.cicloAtual.ordenhas.length > 0) {
          const quantities = mappedData.cicloAtual.ordenhas.map(
            (o) => o.quantidade
          );
          mappedData.cicloAtual.maiorOrdenha = Math.max(...quantities);
          mappedData.cicloAtual.menorOrdenha = Math.min(...quantities);
        }

        setData(mappedData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (isOpen) {
      fetchData();
    }
  }, [animalId, isOpen]);

  const handleExpandCiclo = async (cicloId) => {
    if (expandedCicloId === cicloId) {
      setExpandedCicloId(null);
      return;
    }
    setExpandedCicloId(cicloId);

    // 2. Verificar se já temos os dados desse ciclo
    const cicloIndex = data.ciclosAnteriores.findIndex((c) => c.id === cicloId);
    if (cicloIndex === -1) return;

    const ciclo = data.ciclosAnteriores[cicloIndex];
    if (ciclo.ordenhas && ciclo.ordenhas.length > 0) {
      return; // Já carregado
    }

    // 3. Buscar dados se não tiver
    try {
      // Opcional: mostrar loading no accordion? Por enquanto vamos confiar na rapidez ou estado local
      // Poderiamos ter um loading state por ciclo, mas vamos simplificar
      const res = await lactacaoService.getOrdenhasPorCiclo(cicloId, 1, 100);
      const novasOrdenhas = res.data || [];

      // 4. Mapear e atualizar estado
      const ordenhasMapeadas = novasOrdenhas.map((item) => ({
        id: item.idLact,
        data: item.dtOrdenha,
        periodo:
          item.periodo === 'M'
            ? 'Manhã'
            : item.periodo === 'T'
              ? 'Tarde'
              : 'Secagem',
        quantidade: parseFloat(item.qtOrdenha),
        ocorrencia: item.ocorrencia,
      }));

      setData((prev) => {
        const novosCiclos = [...prev.ciclosAnteriores];
        novosCiclos[cicloIndex] = {
          ...novosCiclos[cicloIndex],
          ordenhas: ordenhasMapeadas,
        };
        return {
          ...prev,
          ciclosAnteriores: novosCiclos,
        };
      });
    } catch (error) {
      console.error('Erro ao buscar detalhes do ciclo antigo:', error);
    }
  };

  // AUMENTADO DE 5 PARA 7: Isso preenche melhor o espaço vertical disponível e evita paginação desnecessária com poucos itens.
  const itemsPerPage = 7;

  // Loading State
  if (loading || !data) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" title="Carregando...">
        <div className="p-12 flex justify-center">
          <Loading />
        </div>
      </Modal>
    );
  }

  // Paginação para o Ciclo Atual
  /* const paginatedOrdenhas = data.cicloAtual.ordenhas.slice( */
  // Ordenar reverso (mais recente primeiro) para tabela
  const sortedOrdenhas = [...data.cicloAtual.ordenhas].reverse();
  const paginatedOrdenhas = sortedOrdenhas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(sortedOrdenhas.length / itemsPerPage);

  const columns = [
    { key: 'data', label: 'Data', className: 'text-left pl-4' },
    { key: 'periodo', label: 'Período', className: 'text-left' },
    {
      key: 'quantidade',
      label: 'Quantidade (L)',
      className: 'font-bold text-slate-700',
    },
    { key: 'ocorrencia', label: 'Ocorrência', className: 'text-right pr-4' },
  ];

  const renderCell = (row, key) => {
    if (key === 'data') {
      if (!row.data) return '-';
      // Tentar converter para Date object para segurança ou split simples em 'T' ou ' '
      // Formato esperado da API: "YYYY-MM-DD HH:mm:ss+00" ou "YYYY-MM-DD"

      const datePart = row.data.split(' ')[0].split('T')[0]; // Pega so a parte da data
      const [ano, mes, dia] = datePart.split('-');
      return `${dia}/${mes}/${ano}`;
    }
    if (key === 'ocorrencia') {
      return row.ocorrencia ? (
        <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium bg-amber-50 px-2 py-1 rounded-full border border-amber-100 justify-end">
          <AlertCircle className="w-3 h-3" /> {row.ocorrencia}
        </span>
      ) : (
        <span className="text-slate-400 text-right block">-</span>
      );
    }
    if (key === 'quantidade') return `${row.quantidade.toFixed(2)} L`;
    return row[key];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      title={
        <div className="flex flex-col">
          <span className="flex items-center gap-2">
            Resumo de Produção •{' '}
            <span className="text-amber-600">{data.animal.nome}</span>
          </span>
          <span className="text-xs font-normal text-slate-500 mt-1">
            Brinco:{' '}
            <span className="font-mono text-slate-700 font-medium">
              {data.animal.brinco}
            </span>{' '}
            • {data.animal.raca}
          </span>
        </div>
      }
      footer={
        <Button variant="ghost" onClick={onClose}>
          Fechar
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex border-b border-slate-200">
          {[
            { id: 'ciclo', label: 'Ciclo Atual' },
            { id: 'historico', label: 'Histórico' },
            { id: 'grafico', label: 'Gráfico' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- CONTEÚDO DA ABA CICLO ATUAL --- */}
        {activeTab === 'ciclo' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="lg:col-span-1 space-y-3">
              <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400" /> Resumo
              </h4>
              <DetailMetric
                label="Total de Ordenhas"
                value={data.cicloAtual.totalOrdenhas}
                icon={Calendar}
              />
              <DetailMetric
                label="Média por Ordenha"
                value={`${data.cicloAtual.mediaOrdenha} L`}
                icon={Droplet}
              />
              <DetailMetric
                label="Maior Ordenha"
                value={`${data.cicloAtual.maiorOrdenha} L`}
                icon={TrendingUp}
              />
              <DetailMetric
                label="Menor Ordenha"
                value={`${data.cicloAtual.menorOrdenha} L`}
                icon={TrendingDown}
              />
              <div className="pt-4 border-t border-slate-100 mt-4">
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 text-center">
                  <p className="text-xs text-amber-700 uppercase font-bold tracking-wider mb-1">
                    Total Acumulado
                  </p>
                  <p className="text-3xl font-extrabold text-amber-600">
                    {data.cicloAtual.totalAcumulado} L
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 flex flex-col">
              <h4 className="text-sm font-bold text-slate-800 mb-3">
                Ordenhas do Ciclo Atual
              </h4>

              {/* CORREÇÃO AQUI: Removido 'flex-1' para o quadro não esticar e criar lacunas brancas */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                <Table
                  columns={columns}
                  data={paginatedOrdenhas}
                  renderCell={renderCell}
                  minWidth="100%"
                  className="border-0 shadow-none rounded-none"
                />
              </div>

              <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  Página {currentPage} de {totalPages}
                </span>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </div>
        )}

        {/* --- CONTEÚDO DA ABA HISTÓRICO (ALTERADO) --- */}
        {activeTab === 'historico' && (
          <div className="animate-in fade-in duration-300 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Archive className="w-4 h-4 text-slate-400" /> Ciclos Anteriores
              </h4>
            </div>

            {data.ciclosAnteriores.map((ciclo) => (
              <CicloAccordion
                key={ciclo.id}
                ciclo={ciclo}
                columns={columns}
                renderCell={renderCell}
                isOpen={expandedCicloId === ciclo.id}
                onToggle={() => handleExpandCiclo(ciclo.id)}
              />
            ))}

            {data.ciclosAnteriores.length === 0 && (
              <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Nenhum histórico anterior encontrado.
              </div>
            )}
          </div>
        )}

        {/* --- CONTEÚDO DA ABA GRÁFICO --- */}
        {activeTab === 'grafico' && (
          <div className="h-[300px] w-full animate-in fade-in duration-300 bg-slate-50 rounded-xl border border-slate-200 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.cicloAtual.ordenhas}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="data"
                  tickFormatter={(val) => {
                    if (!val) return '';
                    const datePart = val.split(' ')[0].split('T')[0];
                    const [ano, mes, dia] = datePart.split('-');
                    return `${dia}/${mes}`;
                  }}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="quantidade"
                  stroke="#d97706"
                  strokeWidth={3}
                  activeDot={{ r: 6, fill: '#fbbf24' }}
                  name="Litros"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Modal>
  );
}
