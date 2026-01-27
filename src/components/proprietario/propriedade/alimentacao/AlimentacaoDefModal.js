import React, { useState, useEffect } from 'react';
import Modal from '../../../ui/Modal';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import { FiSave, FiX, FiInfo } from 'react-icons/fi';
import alimentacaoDefService from '../../../../services/alimentacao-def.service';

export default function AlimentacaoDefModal({
  isOpen,
  onClose,
  onSuccess,
  definicao,
  idPropriedade,
}) {
  const [formData, setFormData] = useState({
    tipo_alimentacao: '',
    descricao: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!definicao;

  useEffect(() => {
    if (isOpen) {
      if (definicao) {
        setFormData({
          tipo_alimentacao:
            definicao.tipoAlimentacao || definicao.tipo_alimentacao || '',
          descricao: definicao.descricao || '',
        });
      } else {
        setFormData({
          tipo_alimentacao: '',
          descricao: '',
        });
      }
      setError('');
    }
  }, [isOpen, definicao]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.tipo_alimentacao.trim()) {
      setError('Tipo de alimentação é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        tipo_alimentacao: formData.tipo_alimentacao,
        id_propriedade: idPropriedade,
      };

      if (formData.descricao?.trim()) {
        payload.descricao = formData.descricao.trim();
      }

      if (isEditing) {
        await alimentacaoDefService.updateAlimentacaoDef(
          definicao.idAlimentDef || definicao.id_aliment_def,
          payload
        );
      } else {
        await alimentacaoDefService.createAlimentacaoDef(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar definição:', err);
      setError(err.message || 'Erro ao salvar. Tente novamente.');
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
      <Button variant="primary" onClick={handleSubmit} loading={loading}>
        <FiSave className="w-4 h-4 mr-2" />
        {isEditing ? 'Salvar Alterações' : 'Criar Definição'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Tipo de Alimento' : 'Novo Tipo de Alimento'}
      description="Cadastre um novo tipo de ração ou suplemento para utilizar nos registros."
      size="md"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
            <FiInfo className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <Input
          label="Tipo de Alimentação"
          name="tipo_alimentacao"
          value={formData.tipo_alimentacao}
          onChange={handleInputChange}
          placeholder="Ex: Ração de Crescimento, Sal Mineral..."
          required
        />

        <Input
          label="Descrição"
          name="descricao"
          value={formData.descricao}
          onChange={handleInputChange}
          placeholder="Detalhes sobre a composição ou uso (opcional)"
        />
      </form>
    </Modal>
  );
}
