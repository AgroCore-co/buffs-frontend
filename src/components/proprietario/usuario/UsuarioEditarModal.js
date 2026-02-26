import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';

const CARGO_OPTIONS = ['GERENTE', 'FUNCIONARIO', 'VETERINARIO'];

export default function UsuarioEditarModal({
  isOpen,
  onClose,
  data,
  onRefresh,
}) {
  const [loading, setLoading] = useState(false);
  const [cargo, setCargo] = useState('');

  useEffect(() => {
    if (data) {
      setCargo(data.cargo || data.papel || data.role || '');
    } else {
      setCargo('');
    }
  }, [data]);

  const id = data ? data.id_usuario || data.id || data._id : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;

    // Don't allow changing PROPRIETARIO via this modal
    const currentCargo = data.cargo || data.papel || data.role;
    if (currentCargo === 'PROPRIETARIO' || cargo === 'PROPRIETARIO') {
      toast.error('Alteração de cargo para/de PROPRIETARIO não é permitida.');
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/usuarios/${id}/cargo`, { cargo });
      toast.success('Cargo atualizado com sucesso.');
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 400) toast.error('Cargo inválido.');
      else if (err?.response?.status === 403) toast.error('Acesso negado.');
      else toast.error('Erro ao atualizar cargo.');
    } finally {
      setLoading(false);
    }
  };

  const currentCargo = data?.cargo || data?.papel || data?.role;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Alterar Cargo" size="sm">
      <form onSubmit={handleSubmit} className="space-y-6 py-2">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" /> Cargo
          </label>
          {currentCargo === 'PROPRIETARIO' ? (
            <div className="text-sm text-red-600">
              Cargo do proprietário não pode ser alterado.
            </div>
          ) : (
            <select
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200"
            >
              <option value="">Selecione um cargo</option>
              {CARGO_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="font-bold min-w-[120px]"
            disabled={loading || currentCargo === 'PROPRIETARIO' || !cargo}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
