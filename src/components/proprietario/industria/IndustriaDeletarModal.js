import React, { useState } from 'react';
import { AlertTriangle, Trash2, Building2, User, Phone } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { laticinioService } from '@/services/laticinio.service';
import toast from 'react-hot-toast';

export default function IndustriaDeletarModal({
  isOpen,
  onClose,
  data,
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!data) return;

    setLoading(true);
    setError(null);
    try {
      const id = data.id_industria || data.id;
      await laticinioService.delete(id);
      toast.success('Indústria removida com sucesso!');
      onDeleted && onDeleted();
      onClose && onClose();
    } catch (err) {
      console.error('Erro ao excluir indústria:', err);
      setError('Erro ao excluir indústria. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  if (!data) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Exclusão"
      size="md"
    >
      <div className="flex flex-col gap-6 pt-2">
        {/* Ícone de Alerta e Mensagem */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-2">
            <AlertTriangle className="text-red-500" size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Excluir Indústria?
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
              Esta ação removerá o laticínio do sistema. Dados históricos de
              coletas vinculados a ele podem ser afetados.
            </p>
          </div>
        </div>

        {/* Card com Detalhes do Item a ser Excluído */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400"></div>

          <div className="flex items-start gap-4 ml-2">
            <div className="p-2.5 bg-white rounded-lg shadow-sm text-gray-600">
              <Building2 size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-800 text-base truncate">
                {data.nome}
              </h4>

              <div className="mt-2 space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User size={14} className="shrink-0" />
                  <span className="truncate">
                    {data.representante || 'Sem representante'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone size={14} className="shrink-0" />
                  <span className="truncate">
                    {data.contato || 'Sem contato'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-medium text-center animate-pulse">
            {error}
          </div>
        )}

        {/* Botões de Ação */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            type="button"
            variant="report"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            loading={loading}
            onClick={handleDelete}
            className="flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            Sim, Excluir
          </Button>
        </div>
      </div>
    </Modal>
  );
}
