import React, { useState } from 'react';
import Modal from '../../../ui/Modal';
import Button from '../../../ui/Button';
import grupoService from '../../../../services/grupo.service';
import { FiTrash2, FiX, FiAlertTriangle } from 'react-icons/fi';

/**
 * Modal para confirmar exclusão de um grupo
 */
export default function GrupoDeleteModal({
  isOpen,
  onClose,
  onSuccess,
  grupo,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setError('');
    setLoading(true);
    console.log('[GrupoDeleteModal] Iniciando exclusão...');

    try {
      await grupoService.deleteGrupo(grupo.id_grupo);
      console.log('[GrupoDeleteModal] Grupo excluído, chamando onSuccess...');
      // Atualiza a lista ANTES de fechar
      if (onSuccess) {
        await onSuccess();
        console.log('[GrupoDeleteModal] onSuccess concluído');
      }
      console.log('[GrupoDeleteModal] Fechando modal...');
      onClose();
    } catch (err) {
      console.error('[GrupoDeleteModal] Erro:', err);
      setError(err.message || 'Erro ao excluir grupo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!grupo) return null;

  const footer = (
    <>
      <Button variant="outline" onClick={onClose} disabled={loading}>
        <FiX className="w-4 h-4 mr-2" />
        Cancelar
      </Button>
      <Button variant="danger" onClick={handleDelete} loading={loading}>
        <FiTrash2 className="w-4 h-4 mr-2" />
        Excluir Grupo
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Excluir Grupo"
      size="sm"
      footer={footer}
    >
      <div className="space-y-4">
        {/* Ícone de alerta */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <FiAlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        {/* Mensagem */}
        <div className="text-center">
          <p className="text-slate-600">
            Tem certeza que deseja excluir o grupo{' '}
            <span className="font-bold text-slate-800">{grupo.nome_grupo}</span>
            ?
          </p>
          <p className="text-sm text-slate-400 mt-2">
            Os animais associados a este grupo ficarão sem grupo.
          </p>
        </div>

        {/* Preview do grupo */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-white shadow-md"
            style={{ backgroundColor: grupo.color }}
          />
          <span className="font-medium text-slate-800">{grupo.nome_grupo}</span>
        </div>

        {/* Erro */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
