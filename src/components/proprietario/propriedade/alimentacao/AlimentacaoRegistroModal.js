import React, { useState, useEffect } from 'react';
import Modal from '../../../ui/Modal';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import { FiSave, FiX, FiInfo } from 'react-icons/fi';
import alimentacaoRegistroService from '../../../../services/alimentacao-registro.service';
import { useAuth } from '@/contexts/AuthContext';

export default function AlimentacaoRegistroModal({
  isOpen,
  onClose,
  onSuccess,
  grupos = [],
  definicoes = [],
  idPropriedade,
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    id_grupo: '',
    id_aliment_def: '',
    quantidade: '',
    unidade_medida: 'kg',
    freq_dia: 1,
    dt_registro: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        id_grupo: grupos[0]?.idGrupo || grupos[0]?.id_grupo || '',
        id_aliment_def:
          definicoes[0]?.idAlimentDef || definicoes[0]?.id_aliment_def || '',
        quantidade: '',
        unidade_medida: 'kg',
        freq_dia: 1,
        dt_registro: new Date().toISOString().split('T')[0],
      });
      setError('');
    }
  }, [isOpen, grupos, definicoes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !formData.id_grupo ||
      !formData.id_aliment_def ||
      !formData.quantidade
    ) {
      setError('Preencha os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        quantidade: parseFloat(formData.quantidade),
        freq_dia: parseInt(formData.freq_dia),
        id_propriedade: idPropriedade,
        id_usuario: user?.id,
        dt_registro: new Date(formData.dt_registro).toISOString(),
      };

      await alimentacaoRegistroService.createRegistro(payload);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar registro:', err);
      setError(err.message || 'Erro ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const grupoOptions = grupos.map((g) => ({
    value: g.idGrupo || g.id_grupo,
    label: g.nomeGrupo || g.nome_grupo,
  }));

  const defOptions = definicoes.map((d) => ({
    value: d.idAlimentDef || d.id_aliment_def,
    label: d.tipoAlimentacao || d.tipo_alimentacao,
  }));

  const unidadeOptions = [
    { value: 'kg', label: 'Quilogramas (kg)' },
    { value: 'g', label: 'Gramas (g)' },
    { value: 'sc', label: 'Sacos (sc)' },
    { value: 'un', label: 'Unidades (un)' },
    { value: 'L', label: 'Litros (L)' },
  ];

  const footer = (
    <>
      <Button variant="outline" onClick={onClose} disabled={loading}>
        <FiX className="w-4 h-4 mr-2" />
        Cancelar
      </Button>
      <Button variant="primary" onClick={handleSubmit} loading={loading}>
        <FiSave className="w-4 h-4 mr-2" />
        Registrar Alimentação
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Registro de Alimentação"
      description="Registre o fornecimento de alimento para um grupo."
      size="lg"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
            <FiInfo className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Grupo de Manejo"
            name="id_grupo"
            value={formData.id_grupo}
            onChange={handleInputChange}
            options={grupoOptions}
            placeholder="Selecione..."
            required
          />

          <Select
            label="Tipo de Alimento"
            name="id_aliment_def"
            value={formData.id_aliment_def}
            onChange={handleInputChange}
            options={defOptions}
            placeholder="Selecione..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Quantidade"
            name="quantidade"
            type="number"
            step="0.01"
            min="0"
            value={formData.quantidade}
            onChange={handleInputChange}
            required
          />

          <Select
            label="Unidade"
            name="unidade_medida"
            value={formData.unidade_medida}
            onChange={handleInputChange}
            options={unidadeOptions}
            required
          />

          <Input
            label="Frequência (vezes/dia)"
            name="freq_dia"
            type="number"
            min="1"
            value={formData.freq_dia}
            onChange={handleInputChange}
          />
        </div>

        <Input
          label="Data do Registro"
          name="dt_registro"
          type="date"
          value={formData.dt_registro}
          onChange={handleInputChange}
          required
        />
      </form>
    </Modal>
  );
}
