import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import {
  Building2,
  User,
  Phone,
  FileText,
  Calendar,
  Edit2,
  Trash2,
  Info,
} from 'lucide-react';
import IndustriaDeletarModal from './IndustriaDeletarModal';

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

export default function IndustriaDetalheModal({
  isOpen,
  onClose,
  data,
  onEdit,
  onRefresh,
}) {
  const [isDeletarOpen, setIsDeletarOpen] = useState(false);

  if (!data) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Detalhes da Indústria"
        size="lg"
      >
        <div className="space-y-6">
          {/* CABEÇALHO / HERO */}
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                {data.nome}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Ficha cadastral ativa no sistema
              </p>
            </div>
          </div>

          {/* GRID DE INFORMAÇÕES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-2">
                Informações de Contato
              </h4>
              <DetailRow
                icon={User}
                label="Representante"
                value={data.representante}
              />
              <DetailRow
                icon={Phone}
                label="Telefone / Contato"
                value={data.contato}
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-2">
                Administrativo
              </h4>
              <DetailRow
                icon={Calendar}
                label="Data de Cadastro"
                value={formatDate(data.created_at)}
              />
              <DetailRow
                icon={Info}
                label="ID do Registro"
                value={data.id_industria || data.id}
              />
            </div>
          </div>

          {/* OBSERVAÇÕES BLOCK */}
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h5 className="text-sm font-bold text-amber-800 mb-1 uppercase tracking-wider text-[11px]">
                  Observações
                </h5>
                <p className="text-sm text-amber-900/80 leading-relaxed font-medium">
                  {data.observacao || 'Nenhuma observação registrada.'}
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="report"
              onClick={() => setIsDeletarOpen(true)}
              className="flex items-center justify-center gap-2 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Remover Registro
            </Button>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={onClose}>
                Fechar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  onEdit(data);
                  onClose();
                }}
                className="flex items-center justify-center gap-2 font-bold px-6"
              >
                <Edit2 className="w-4 h-4" /> Editar Dados
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <IndustriaDeletarModal
        isOpen={isDeletarOpen}
        onClose={() => setIsDeletarOpen(false)}
        data={data}
        onDeleted={() => {
          onRefresh();
          onClose();
        }}
      />
    </>
  );
}
