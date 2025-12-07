import React, { useEffect, useState, useCallback } from 'react';
import {
  FiTruck,
  FiMapPin,
  FiArrowRight,
  FiCheckCircle,
  FiAlertCircle,
  FiNavigation,
} from 'react-icons/fi';
import movimentacaoService from '@/services/movimentacao.service';
import Button from '@/components/ui/Button';

export default function MovimentacaoTab({ grupo, lotes }) {
  const [loading, setLoading] = useState(true);
  const [loteAtualId, setLoteAtualId] = useState(null);
  const [loteDestinoId, setLoteDestinoId] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Cores do sistema
  const primaryColor = '#ce7d0a';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const historicoData = await movimentacaoService.getHistoricoByGrupo(
        grupo.id_grupo
      );
      const lista = historicoData?.historico || [];

      const atual = lista.find((m) => m.status === 'Atual') || lista[0];
      if (atual && !atual.dt_saida) {
        setLoteAtualId(atual.id_lote_atual);
      }
    } catch (error) {
      console.error('Erro ao buscar dados de movimentação:', error);
    } finally {
      setLoading(false);
    }
  }, [grupo?.id_grupo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getLoteNome = (idLote) => {
    if (!idLote) return 'Não alocado';
    const lote = lotes?.find((l) => l.id_lote === idLote);
    return lote?.nome_lote || 'Lote desconhecido';
  };

  const handleConfirmar = async () => {
    if (!loteDestinoId) return;

    // Simulação de salvamento
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setLoteAtualId(loteDestinoId);
    setLoteDestinoId('');
    setIsSuccess(true);
    setLoading(false);

    // Reset do estado de sucesso após 3 segundos
    setTimeout(() => setIsSuccess(false), 3000);
  };

  // Filtra o lote atual da lista de destinos possíveis
  const lotesDisponiveis = lotes.filter((l) => l.id_lote !== loteAtualId);

  if (loading && !loteAtualId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-pulse">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
          <FiTruck className="text-slate-300 text-xl" />
        </div>
        <p className="text-slate-400 font-medium">Carregando informações...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Container Centralizado - Estilo Card Limpo */}
      <div className="w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header do Card */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FiNavigation style={{ color: primaryColor }} />
              Registrar Movimentação
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Atualize a localização do grupo no mapa.
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm"
            style={{ backgroundColor: grupo.color || primaryColor }}
          >
            {grupo.nome_grupo?.charAt(0)}
          </div>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Visualização de Origem -> Destino */}
          <div className="flex items-center justify-between gap-4">
            {/* Origem */}
            <div className="flex-1 flex flex-col items-center p-4 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Local Atual
              </span>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-500 mb-2 shadow-sm border border-slate-100">
                <FiMapPin size={18} />
              </div>
              <span className="font-bold text-slate-700 text-center truncate w-full">
                {getLoteNome(loteAtualId)}
              </span>
            </div>

            {/* Seta Indicativa */}
            <div className="flex flex-col items-center text-slate-300">
              <FiArrowRight size={24} />
            </div>

            {/* Destino (Preview ou Selecionado) */}
            <div
              className={`flex-1 flex flex-col items-center p-4 rounded-lg border transition-colors ${loteDestinoId ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100 border-dashed'}`}
            >
              <span
                className={`text-xs font-bold uppercase tracking-wider mb-2 ${loteDestinoId ? 'text-amber-600' : 'text-slate-400'}`}
              >
                Novo Destino
              </span>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-sm border ${loteDestinoId ? 'bg-white text-amber-600 border-amber-100' : 'bg-slate-100 text-slate-300 border-transparent'}`}
              >
                <FiMapPin size={18} />
              </div>
              <span
                className={`font-bold text-center truncate w-full ${loteDestinoId ? 'text-amber-800' : 'text-slate-400 italic'}`}
              >
                {loteDestinoId ? getLoteNome(loteDestinoId) : 'Selecionar...'}
              </span>
            </div>
          </div>

          {/* Seleção de Destino */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Selecione o Piquete de Destino
            </label>
            <div className="relative">
              <select
                value={loteDestinoId}
                onChange={(e) => setLoteDestinoId(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-400 transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  Selecione um piquete...
                </option>
                {lotesDisponiveis.map((lote) => (
                  <option key={lote.id_lote} value={lote.id_lote}>
                    {lote.nome_lote} (Capacidade: {lote.capacidade || '-'})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                <FiMapPin />
              </div>
            </div>
          </div>

          {/* Feedback de Sucesso */}
          {isSuccess && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium animate-in fade-in zoom-in-95">
              <FiCheckCircle size={18} />
              Movimentação realizada com sucesso!
            </div>
          )}

          {/* Botão de Ação */}
          <Button
            variant="primary"
            size="large"
            className="w-full justify-center font-bold h-12 text-base shadow-md hover:shadow-lg transition-all"
            disabled={!loteDestinoId || loading || isSuccess}
            onClick={handleConfirmar}
          >
            {loading ? 'Processando...' : 'Confirmar Movimentação'}
          </Button>
        </div>
      </div>

      {/* Dica de rodapé */}
      <p className="mt-4 text-xs text-slate-400 flex items-center gap-1">
        <FiAlertCircle size={12} />A alteração será registrada no histórico
        automaticamente.
      </p>
    </div>
  );
}
