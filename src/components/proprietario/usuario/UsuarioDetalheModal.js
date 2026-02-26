import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function UsuarioDetalheModal({
  isOpen,
  onClose,
  data,
  onEdit,
  onRefresh,
}) {
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!data)
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Detalhes do Usuário"
        size="sm"
      >
        <div className="py-6">Sem dados para exibir.</div>
      </Modal>
    );

  const id = data.id_usuario || data.id || data._id;

  const openDeleteConfirm = () => {
    if (!id) {
      toast.error('ID do usuário inválido.');
      return;
    }

    if (
      data.cargo === 'PROPRIETARIO' ||
      data.papel === 'PROPRIETARIO' ||
      data.role === 'PROPRIETARIO'
    ) {
      toast.error('Não é possível excluir o proprietário.');
      return;
    }

    setConfirmOpen(true);
  };

  const performDelete = async () => {
    setConfirmOpen(false);
    setLoading(true);
    try {
      await api.delete(`/usuarios/${id}`);
      toast.success('Usuário excluído com sucesso.');
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 403) toast.error('Acesso negado.');
      else toast.error('Erro ao excluir usuário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Detalhes do Usuário"
        size="sm"
      >
        <div className="space-y-4 py-2">
          <div>
            <div className="text-sm text-slate-500">Nome</div>
            <div className="font-bold">{data.nome || data.nome_completo}</div>
          </div>

          <div>
            <div className="text-sm text-slate-500">E-mail</div>
            <div className="font-medium">{data.email}</div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Papel</div>
            <div className="font-medium">
              {data.cargo || data.papel || data.role}
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Contato</div>
            <div className="font-medium">
              {data.telefone || data.contato || '-'}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Fechar
            </Button>
            <Button
              variant="primary"
              onClick={() => onEdit && onEdit(data)}
              disabled={loading}
            >
              Editar
            </Button>
            <Button
              variant="secondary"
              className="text-red-600"
              onClick={openDeleteConfirm}
              disabled={loading}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="py-4">
          <p className="text-sm text-slate-700">
            Confirma exclusão do usuário? Esta ação é irreversível.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="text-red-600"
              onClick={performDelete}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
