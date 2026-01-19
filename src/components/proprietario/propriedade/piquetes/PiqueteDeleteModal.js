import React, { useState } from 'react';
import Modal from '../../../ui/Modal';
import Button from '../../../ui/Button';
import loteService from '../../../../services/lote.service';
import { FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi';

/**
 * Modal de confirmação para excluir um piquete
 * @param {boolean} isOpen - Se o modal está aberto
 * @param {function} onClose - Função para fechar
 * @param {function} onSuccess - Callback após excluir com sucesso
 * @param {Object} piquete - Piquete a ser excluído
 */
export default function PiqueteDeleteModal({
    isOpen,
    onClose,
    onSuccess,
    piquete,
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        if (!piquete?.id_lote) return;

        setLoading(true);
        setError('');

        try {
            await loteService.deleteLote(piquete.id_lote);
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Erro ao excluir piquete:', err);
            setError(err.message || 'Erro ao excluir piquete. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const footer = (
        <>
            <Button variant="outline" onClick={onClose} disabled={loading}>
                <FiX className="w-4 h-4 mr-2" />
                Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={loading}>
                <FiTrash2 className="w-4 h-4 mr-2" />
                Excluir Piquete
            </Button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Excluir Piquete"
            size="sm"
            footer={footer}
        >
            <div className="text-center py-4">
                {/* Ícone de alerta */}
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <FiAlertTriangle className="w-8 h-8 text-red-500" />
                </div>

                {/* Mensagem */}
                <h4 className="text-lg font-semibold text-slate-800 mb-2">
                    Tem certeza que deseja excluir?
                </h4>
                <p className="text-slate-500 mb-4">
                    O piquete <strong className="text-slate-700">{piquete?.nome_lote}</strong> será
                    removido permanentemente. Esta ação não pode ser desfeita.
                </p>

                {/* Erro */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}
            </div>
        </Modal>
    );
}
