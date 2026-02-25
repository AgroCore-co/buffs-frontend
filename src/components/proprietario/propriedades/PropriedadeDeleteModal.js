import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Trash2, MapPin, FileText, Home } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { propriedadeService } from '@/services/propriedade.service';
import { enderecoService } from '@/services/endereco.service';

// --- COMPONENTE PRINCIPAL ---

export default function PropriedadeDeleteModal({
  isOpen,
  onClose,
  propriedade,
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    let enderecoError = null;
    try {
      // Tenta deletar o endereço primeiro, se existir
      if (propriedade.endereco?.id_endereco) {
        try {
          await enderecoService.deleteEndereco(
            propriedade.endereco.id_endereco
          );
        } catch (err) {
          enderecoError = 'Endereço não encontrado ou já removido.';
        }
      }
      // Depois deleta a propriedade
      const idPropriedade =
        propriedade.idPropriedade || propriedade.id_propriedade;
      await propriedadeService.deletePropriedade(idPropriedade);
      onDeleted && onDeleted();
      onClose && onClose();
    } catch (err) {
      if (err?.response?.status === 500) {
        setError(
          'Não foi possível excluir esta propriedade porque existem vínculos obrigatórios (ex: animais, lactações, etc). Remova os vínculos antes de tentar novamente.'
        );
      } else {
        setError(
          'Erro ao excluir propriedade. Verifique se ela existe ou se já foi removida.'
        );
      }
    } finally {
      setLoading(false);
      if (enderecoError) {
        setError(enderecoError);
      }
    }
  };

  // Limpa erro ao fechar o modal
  const handleClose = () => {
    setError(null);
    onClose && onClose();
  };

  if (!propriedade) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Confirmar Exclusão"
      size="md"
    >
      <div className="flex flex-col gap-6">
        {/* Ícone de Alerta e Mensagem */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-2">
            <AlertTriangle className="text-red-500" size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Excluir Propriedade?
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
              Esta ação é irreversível. Todos os dados vinculados a esta
              propriedade serão perdidos permanentemente.
            </p>
          </div>
        </div>

        {/* Card com Detalhes do Item a ser Excluído */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 relative overflow-hidden group">
          {/* Faixa decorativa lateral */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400"></div>

          <div className="flex items-start gap-3 ml-2">
            <div className="p-2 bg-white rounded-lg shadow-sm text-gray-600">
              <Home size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-800 text-base truncate">
                {propriedade.nome}
              </h4>

              <div className="mt-2 space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText size={14} className="shrink-0" />
                  <span className="truncate font-mono text-xs">
                    {propriedade.cnpj || 'CNPJ não informado'}
                  </span>
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-500">
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  <span className="truncate text-xs leading-snug">
                    {propriedade.endereco
                      ? `${propriedade.endereco.rua}, ${propriedade.endereco.cidade} - ${propriedade.endereco.estado}`
                      : 'Endereço não cadastrado'}
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
            variant="secondary"
            onClick={handleClose}
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
