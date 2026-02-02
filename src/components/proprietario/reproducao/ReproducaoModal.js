import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import {
  Calendar,
  AlertCircle,
  CheckCircle,
  Activity,
  Info,
} from 'lucide-react';
import { reproducaoService } from '@/services/reproducao.service';
import Loading from '@/components/loading/Loading';

/* -------------------------------------------------------------------------- */
/* COMPONENTE INTERNO: CARD DE STATUS */
/* -------------------------------------------------------------------------- */
const StatusCard = ({ label, value, type }) => {
  const colors = {
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    default: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  const style = colors[type] || colors.default;

  return (
    <div className={`p-4 rounded-lg border ${style} flex flex-col gap-1`}>
      <span className="text-xs font-semibold uppercase opacity-80">
        {label}
      </span>
      <span className="text-lg font-bold">{value}</span>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* COMPONENTE INTERNO: LINHA DE DETALHE */
/* -------------------------------------------------------------------------- */
const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    <div className="p-2 bg-slate-50 rounded-full text-slate-500">
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
        {label}
      </p>
      <p className="text-sm text-slate-800 font-semibold mt-0.5">
        {value || '-'}
      </p>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* COMPONENTE PRINCIPAL */
/* -------------------------------------------------------------------------- */
export default function ReproducaoModal({
  isOpen,
  onClose,
  data: initialData,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      const fetchDetail = async () => {
        setLoading(true);
        try {
          const id = initialData.idReproducao || initialData.id;
          if (id) {
            const detailed = await reproducaoService.getReproducaoById(id);
            setData(detailed);
          } else {
            setData(initialData);
          }
        } catch (error) {
          console.error('Erro ao buscar detalhes da reprodução', error);
          setData(initialData);
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    } else if (!isOpen) {
      setData(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // Formatação de datas
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    // Assumindo formato ISO
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  // Determinar status style
  const getStatusType = (status) => {
    if (status === 'Confirmada') return 'success';
    if (status === 'Concluída') return 'info';
    if (status === 'Falha') return 'danger';
    return 'default';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes da Reprodução"
      size="lg"
    >
      {loading || !data ? (
        <div className="flex justify-center p-8">
          <Loading />
        </div>
      ) : (
        <div className="space-y-6">
          {/* CABEÇALHO / HERO */}
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-600" />
                Reprodução {data.tipoInseminacao}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Registro criado em {formatDate(data.createdAt)}
              </p>
            </div>
            <div
              className={`px-4 py-1.5 rounded-full text-sm font-bold border ${data.status === 'Confirmada' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}
            >
              {data.status}
            </div>
          </div>

          {/* GRID DE INFORMAÇÕES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* COLUNA 1: ANIMAIS */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-2">
                Envolvidos
              </h4>

              <DetailRow
                icon={Info}
                label="Matriz (Búfala)"
                value={`${data.bufalo_idBufala?.nome || ''} (${data.bufalo_idBufala?.brinco || ''})`}
              />
              <DetailRow
                icon={Info}
                label={data.idSemen ? 'Sêmen' : 'Touro (Búfalo)'}
                value={
                  data.idSemen
                    ? data.semen?.identifier || 'Inseminação Artificial'
                    : `${data.bufalo_idBufalo?.nome || data.bufalo_idBufalo_2?.nome || ''} (${data.bufalo_idBufalo?.brinco || data.bufalo_idBufalo_2?.brinco || ''})`
                }
              />
            </div>

            {/* COLUNA 2: DATAS E DETALHES */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-2">
                Detalhes do Evento
              </h4>
              <DetailRow
                icon={Calendar}
                label="Data do Evento"
                value={formatDate(data.dtEvento)}
              />
              <DetailRow
                icon={CheckCircle}
                label="Tipo de Parto"
                value={data.tipoParto}
              />
            </div>
          </div>

          {/* OCORRÊNCIA / OBSERVAÇÕES */}
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h5 className="text-sm font-bold text-amber-800 mb-1">
                  Ocorrência / Observação
                </h5>
                <p className="text-sm text-amber-900/80 leading-relaxed">
                  {data.ocorrencia || 'Nenhuma observação registrada.'}
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={onClose}>
              Fechar
            </Button>
            {/* Futuramente: Botão Editar */}
          </div>
        </div>
      )}
    </Modal>
  );
}
