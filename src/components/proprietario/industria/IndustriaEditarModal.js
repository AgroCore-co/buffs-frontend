import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { laticinioService } from '@/services/laticinio.service';
import { usePropriedade } from '@/contexts/PropriedadeContext';
import toast from 'react-hot-toast';
import { Building2, User, Phone, FileText } from 'lucide-react';

export default function IndustriaEditarModal({
  isOpen,
  onClose,
  data,
  onRefresh,
}) {
  const { propriedadeSelecionada } = usePropriedade();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    representante: '',
    contato: '',
    observacao: '',
  });

  useEffect(() => {
    if (isOpen && data) {
      setFormData({
        nome: data.nome || '',
        representante: data.representante || '',
        contato: data.contato || '',
        observacao: data.observacao || '',
      });
    }
  }, [isOpen, data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const idProp =
      propriedadeSelecionada?.id ||
      propriedadeSelecionada?.idPropriedade ||
      propriedadeSelecionada?.id_propriedade;
    const idInd = data?.id_industria || data?.id;

    if (!idInd) return;

    if (!formData.nome.trim()) {
      toast.error('O nome da indústria é obrigatório.');
      return;
    }

    setLoading(true);
    try {
      await laticinioService.update(idInd, {
        ...formData,
        id_propriedade: idProp,
      });
      toast.success('Indústria atualizada com sucesso!');

      if (onRefresh) onRefresh();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar indústria:', error);
      toast.error('Erro ao atualizar os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Indústria" size="md">
      <form onSubmit={handleSubmit} className="space-y-6 py-2">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-500" /> Nome da Indústria *
          </label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" /> Representante
            </label>
            <input
              type="text"
              name="representante"
              value={formData.representante}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-500" /> Contato
            </label>
            <input
              type="text"
              name="contato"
              value={formData.contato}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" /> Observações
          </label>
          <textarea
            name="observacao"
            value={formData.observacao}
            onChange={handleChange}
            rows={3}
            className="w-full p-3 rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all resize-none text-sm"
          />
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
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
