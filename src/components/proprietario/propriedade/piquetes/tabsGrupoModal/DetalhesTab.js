import React, { useEffect, useState } from 'react';
import {
  FiInfo,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiLayers,
  FiActivity,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
} from 'react-icons/fi';
import movimentacaoService from '@/services/movimentacao.service';

// Componente visual simples para métricas (Mini Card)
const StatCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  colorClass = 'bg-blue-50 text-blue-600',
}) => (
  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-bold text-[#404040] mt-1">{value}</p>
      {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </div>
    <div className={`p-2 rounded-lg ${colorClass}`}>
      <Icon size={20} />
    </div>
  </div>
);

export default function DetalhesTab({ grupo, lotes }) {
  const [statusAtual, setStatusAtual] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      setLoadingStatus(true);
      try {
        const status = await movimentacaoService.getStatusAtualByGrupo(
          grupo.id_grupo
        );
        setStatusAtual(status);
      } catch (error) {
        console.error('Erro ao buscar status:', error);
      } finally {
        setLoadingStatus(false);
      }
    }
    if (grupo?.id_grupo) fetchStatus();
  }, [grupo?.id_grupo]);

  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getLoteAtual = () => {
    if (!statusAtual?.localizacao_atual?.id_lote) return null;
    return lotes?.find(
      (l) => l.id_lote === statusAtual.localizacao_atual.id_lote
    );
  };

  const loteAtual = getLoteAtual();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* --- GRID DE INDICADORES (KPIs) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total de Animais"
          value={grupo.total_animais || 0}
          subtext="Cabeças registradas"
          icon={FiLayers}
          colorClass="bg-amber-100 text-[#ce7d0a]"
        />
        <StatCard
          label="Lote Atual"
          value={loadingStatus ? '...' : loteAtual?.nome_lote || 'Não definido'}
          subtext={loteAtual ? 'Localização confirmada' : 'Sem movimentação'}
          icon={FiMapPin}
          colorClass="bg-blue-100 text-blue-600"
        />
        <StatCard
          label="Tempo no Local"
          value={
            loadingStatus
              ? '...'
              : `${statusAtual?.localizacao_atual?.dias_no_local || 0} dias`
          }
          subtext={
            statusAtual?.localizacao_atual?.desde
              ? `Desde ${formatarData(statusAtual.localizacao_atual.desde)}`
              : '-'
          }
          icon={FiClock}
          colorClass={
            statusAtual?.localizacao_atual?.dias_no_local > 30
              ? 'bg-red-100 text-red-600'
              : 'bg-green-100 text-green-600'
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- COLUNA ESQUERDA: DETALHES DE MOVIMENTAÇÃO --- */}
        <div className="lg:col-span-2 space-y-6">
          {loadingStatus ? (
            <div className="h-48 bg-slate-50 animate-pulse rounded-lg border border-slate-200"></div>
          ) : loteAtual ? (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-[#404040] flex items-center gap-2">
                  <FiActivity className="text-[#ce7d0a]" /> Status de
                  Localização
                </h3>
                <span className="text-xs text-slate-500">
                  Atualizado recentemente
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-4 rounded-xl border border-amber-200 shadow-sm min-w-[120px] text-center">
                    <FiMapPin className="mx-auto text-[#ce7d0a] w-8 h-8 mb-2" />
                    <p className="text-xs text-amber-800 font-bold uppercase">
                      Lote Atual
                    </p>
                    <p className="text-amber-900 font-bold text-lg leading-tight mt-1">
                      {loteAtual.nome_lote}
                    </p>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">
                        Entrada no Lote:
                      </span>
                      <span className="text-sm font-semibold text-[#404040] flex items-center gap-2">
                        <FiCalendar className="text-slate-400" />
                        {formatarData(statusAtual.localizacao_atual.desde)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">
                        Capacidade do Lote:
                      </span>
                      <span className="text-sm font-semibold text-[#404040]">
                        {loteAtual.capacidade || '-'} animais
                      </span>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
                      <p className="text-xs text-blue-800 flex items-start gap-2">
                        <FiInfo className="shrink-0 mt-0.5" />
                        <span>
                          O grupo está ocupando este lote há{' '}
                          <strong>
                            {statusAtual.localizacao_atual.dias_no_local} dias
                          </strong>
                          .
                          {statusAtual.localizacao_atual.dias_no_local > 45
                            ? ' Recomendado avaliar rotação de pastagem.'
                            : ' Dentro do período esperado.'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-lg p-8 border border-slate-200 text-center">
              <FiMapPin className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">
                Nenhuma localização registrada
              </p>
              <p className="text-sm text-slate-400">
                Este grupo ainda não foi movimentado.
              </p>
            </div>
          )}
        </div>

        {/* --- COLUNA DIREITA: PIQUETES VINCULADOS --- */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm h-full">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-[#404040] text-sm">
                  Piquetes Permitidos
                </h3>
                <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">
                  {lotes.length}
                </span>
              </div>
            </div>

            <div className="p-0 max-h-[300px] overflow-y-auto custom-scrollbar">
              {lotes.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {lotes.map((lote) => {
                    const isCurrent = loteAtual?.id_lote === lote.id_lote;
                    return (
                      <div
                        key={lote.id_lote}
                        className={`p-4 hover:bg-slate-50 transition-colors ${isCurrent ? 'bg-amber-50/60' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${isCurrent ? 'bg-amber-100 text-[#ce7d0a]' : 'bg-slate-100 text-slate-500'}`}
                            >
                              <FiMapPin size={16} />
                            </div>
                            <div>
                              <p
                                className={`text-sm font-bold ${isCurrent ? 'text-amber-900' : 'text-slate-700'}`}
                              >
                                {lote.nome_lote}
                              </p>
                              <p className="text-xs text-slate-500">
                                Cap: {lote.capacidade || '?'} •{' '}
                                {lote.tipo_pasto || 'Pasto Nativo'}
                              </p>
                            </div>
                          </div>
                          {isCurrent && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#ce7d0a] bg-amber-100 px-2 py-1 rounded-full">
                              Atual
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-400">
                    Nenhum piquete vinculado.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
