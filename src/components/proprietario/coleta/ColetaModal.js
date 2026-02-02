import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import {
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Landmark,
  User,
  Phone,
} from 'lucide-react';
import { coletaService } from '@/services/coleta.service';
import { laticinioService } from '@/services/laticinio.service';
import Loading from '@/components/loading/Loading';

/* -------------------------------------------------------------------------- */
/* COMPONENTE INTERNO: LINHA DE DETALHE */
/* -------------------------------------------------------------------------- */
const DetailRow = ({
  icon: Icon,
  label,
  value,
  colorClass = 'text-slate-500',
}) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    <div className={`p-2 bg-slate-50 rounded-full ${colorClass}`}>
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
export default function ColetaModal({ isOpen, onClose, data: initialData }) {
  const [data, setData] = useState(null);
  const [laticinio, setLaticinio] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      const fetchDetail = async () => {
        setLoading(true);
        try {
          const id = initialData.id_coleta || initialData.id;
          let detailed = initialData;

          if (id) {
            detailed = await coletaService.getColetaById(id);
            setData(detailed);
          } else {
            setData(initialData);
          }

          // Buscar dados da indústria se tiver id_industria
          const idInd = detailed?.id_industria;
          if (idInd) {
            const latData = await laticinioService.getLaticinioById(idInd);
            setLaticinio(latData);
          }
        } catch (error) {
          console.error('Erro ao buscar detalhes da coleta', error);
          setData(initialData);
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    } else if (!isOpen) {
      setData(null);
      setLaticinio(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // Formatação de datas
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const datePart = dateStr.split(' ')[0].split('T')[0];
    const [y, m, d] = datePart.split('-');
    return `${d}/${m}/${y}`;
  };

  // Formatação de volume
  const formatVolume = (val) => {
    if (val === undefined || val === null) return '-';
    return `${parseFloat(val).toLocaleString('pt-BR')} L`;
  };

  const isApproved = data?.resultado_teste;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes da Coleta"
      size="md"
    >
      {loading || !data ? (
        <div className="flex justify-center p-8">
          <Loading />
        </div>
      ) : (
        <div className="space-y-6">
          {/* CABEÇALHO / STATUS */}
          <div
            className={`flex items-center justify-between p-4 rounded-xl border ${isApproved ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${isApproved ? 'bg-green-100' : 'bg-red-100'}`}
              >
                {isApproved ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-bold">
                  Coleta {isApproved ? 'Aprovada' : 'Reprovada'}
                </h3>
                <p className="text-xs opacity-80 uppercase font-semibold tracking-wider">
                  Resultado do Teste
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black">
                {formatVolume(data.quantidade)}
              </span>
            </div>
          </div>

          {/* GRID DE INFORMAÇÕES */}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="p-1">
              <DetailRow
                icon={Landmark}
                label="Indústria / Laticínio"
                value={laticinio?.nome || data.nome_empresa || 'Não informado'}
                colorClass="text-blue-500"
              />
              {laticinio && (
                <>
                  <DetailRow
                    icon={User}
                    label="Representante"
                    value={laticinio.representante}
                    colorClass="text-indigo-500"
                  />
                  <DetailRow
                    icon={Phone}
                    label="Contato"
                    value={laticinio.contato}
                    colorClass="text-green-500"
                  />
                </>
              )}
              <DetailRow
                icon={Calendar}
                label="Data da Coleta"
                value={formatDate(data.dt_coleta)}
                colorClass="text-amber-500"
              />
            </div>
          </div>

          {/* OBSERVAÇÕES */}
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Observações
                </h5>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {data.observacao ||
                    'Nenhuma observação registrada para esta coleta.'}
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Fechar Detalhes
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
