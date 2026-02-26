import React, { useMemo } from 'react';
import { FiMapPin } from 'react-icons/fi';
import MapaGrupoLeaflet from './MapaGrupoLeaflet';
import { useEffect, useState } from 'react';
import movimentacaoService from '@/services/movimentacao.service';

export default function MapaTab({ grupo, lotes, todosLotes }) {
  const [idLoteAtual, setIdLoteAtual] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      setLoadingStatus(true);
      try {
        const status = await movimentacaoService.getStatusAtualByGrupo(
          grupo.idGrupo || grupo.id_grupo
        );
        setIdLoteAtual(
          status?.localizacao_atual?.idLote ||
            status?.localizacao_atual?.id_lote ||
            null
        );
      } catch (e) {
        setIdLoteAtual(null);
      } finally {
        setLoadingStatus(false);
      }
    }
    if (grupo?.idGrupo || grupo?.id_grupo) fetchStatus();
  }, [grupo?.idGrupo, grupo?.id_grupo]);

  if (lotes.length === 0 || loadingStatus) {
    return (
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <div className="text-center py-12 text-slate-400">
            <FiMapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium mb-2">
              {loadingStatus
                ? 'Carregando localização atual...'
                : 'Nenhum piquete associado'}
            </p>
            <p className="text-sm">
              {loadingStatus
                ? ''
                : 'Este grupo ainda não possui piquetes vinculados'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mapa Interativo */}
      <div
        className="rounded-lg overflow-hidden border border-slate-200 shadow-sm"
        style={{ height: '500px' }}
      >
        <MapaGrupoLeaflet
          todosLotes={todosLotes}
          grupo={grupo}
          idLoteAtual={idLoteAtual}
        />
      </div>

      {/* Resumo de Área Total */}
      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-amber-800 font-medium">
              Área Total do Grupo
            </p>
            <p className="text-xs text-amber-600">
              {lotes.length} {lotes.length === 1 ? 'piquete' : 'piquetes'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-amber-800">
              {(
                lotes.reduce(
                  (sum, lote) =>
                    sum + (parseFloat(lote.areaM2 || lote.area_m2) || 0),
                  0
                ) / 10000
              ).toFixed(2)}{' '}
              ha
            </p>
            <p className="text-xs text-amber-700 mt-1">
              {(() => {
                try {
                  const groupM2 = lotes.reduce(
                    (s, l) => s + (parseFloat(l.areaM2 || l.area_m2) || 0),
                    0
                  );
                  const totalM2 = (todosLotes || []).reduce(
                    (s, l) => s + (parseFloat(l.areaM2 || l.area_m2) || 0),
                    0
                  );
                  if (!totalM2) return '-';
                  const pct = (groupM2 / totalM2) * 100;
                  return `${pct.toFixed(1)}% da fazenda`;
                } catch (e) {
                  return '-';
                }
              })()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
