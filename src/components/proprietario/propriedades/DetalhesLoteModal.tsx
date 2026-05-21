"use client";

import { Modal } from "@/components/ui/Modal";
import { useBufalosbyGrupo } from "@/hooks/useBufalos";
import { Lote } from "@/services/lotes.service";
import { Activity, Hash, Info, Maximize, Users } from "lucide-react";

interface DetalhesLoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  lote: Lote | null;
}

export function DetalhesLoteModal({ isOpen, onClose, lote }: DetalhesLoteModalProps) {
  const { data: bufalosData, isLoading: isLoadingBufalos } = useBufalosbyGrupo(
    lote?.idGrupo ?? undefined,
    1,
    50,
    { enabled: isOpen && !!lote?.idGrupo }
  );

  if (!lote) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={lote.nomeLote}
      description={lote.grupo ? `Grupo: ${lote.grupo.nomeGrupo}` : "Sem grupo vinculado"}
    >
      <div className="flex flex-col gap-5">
        {/* Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: lote.grupo?.color ? `${lote.grupo.color}20` : '#f4f4f5' }}
            >
              <Hash className="w-4 h-4" style={{ color: lote.grupo?.color ?? '#71717a' }} />
            </div>
            <div>
              <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Status</span>
              <span className={`inline-block text-xs font-semibold capitalize mt-0.5 ${
                lote.status === 'ativo' ? 'text-emerald-700' : 'text-zinc-500'
              }`}>
                {lote.status || 'N/D'}
              </span>
            </div>
          </div>

          <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-zinc-500" />
            </div>
            <div>
              <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Capacidade</span>
              <span className="block text-sm font-bold text-zinc-900 mt-0.5">
                {lote.qtdMax ? `${lote.qtdMax} cbç` : 'N/D'}
              </span>
            </div>
          </div>

          <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
              <Maximize className="w-4 h-4 text-zinc-500" />
            </div>
            <div>
              <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Área</span>
              <span className="block text-sm font-bold text-zinc-900 mt-0.5">
                {lote.areaM2
                  ? `${Number(lote.areaM2).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} m²`
                  : 'N/D'}
              </span>
            </div>
          </div>
        </div>

        {/* Observações */}
        {lote.descricao && lote.descricao !== lote.nomeLote && (
          <div className="flex items-start gap-3 bg-zinc-50 border border-zinc-100 rounded-xl p-4">
            <Info className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
            <div>
              <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Observações</span>
              <p className="text-sm text-zinc-700">{lote.descricao}</p>
            </div>
          </div>
        )}

        {/* Búfalos do grupo */}
        {lote.idGrupo ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-zinc-500" />
              <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                Búfalos do Grupo
                {!isLoadingBufalos && bufalosData?.meta?.total !== undefined && (
                  <span className="ml-2 text-zinc-400 font-medium normal-case">
                    ({bufalosData.meta.total})
                  </span>
                )}
              </h4>
            </div>

            {isLoadingBufalos ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-zinc-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : bufalosData?.data && bufalosData.data.length > 0 ? (
              <div className="border border-zinc-100 rounded-xl overflow-hidden">
                <div className="divide-y divide-zinc-100">
                  {bufalosData.data.map(bufalo => (
                    <div key={bufalo.idBufalo} className="px-4 py-3 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-zinc-800">{bufalo.nome || '—'}</span>
                        <span className="text-xs text-zinc-500">Brinco: {bufalo.brinco || '—'}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${
                        bufalo.status
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                      }`}>
                        {bufalo.status ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-500 text-center py-6">
                Nenhum búfalo vinculado a este grupo.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 text-center py-4">
            Este piquete não está vinculado a nenhum grupo.
          </p>
        )}
      </div>
    </Modal>
  );
}
