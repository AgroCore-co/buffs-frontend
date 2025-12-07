import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/form/Input';
import Select from '@/components/form/Select';
import Toggle from '@/components/form/Toggle';
import { enderecoService } from '@/services/endereco.service';
import { propriedadeService } from '@/services/propriedade.service';
import { formatarCNPJ, maskCNPJ, maskCEP } from '@/utils/formatters';
import {
  FiHome,
  FiFileText,
  FiMapPin,
  FiNavigation,
  FiFlag,
  FiMap,
  FiActivity,
} from 'react-icons/fi';

export default function PropriedadeEditModal({
  isOpen,
  onClose,
  propriedade,
  onUpdated,
}) {
  const [form, setForm] = useState({
    nome: '',
    cnpj: '',
    p_abcb: false,
    tipo_manejo: 'P',
    pais: 'Brasil',
    estado: '',
    cidade: '',
    bairro: '',
    rua: '',
    cep: '',
    numero: '',
    ponto_referencia: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && propriedade) {
      setForm({
        nome: propriedade.nome || '',
        cnpj: maskCNPJ(propriedade.cnpj || ''),
        p_abcb: !!propriedade.p_abcb,
        tipo_manejo: propriedade.tipo_manejo || 'P',
        pais: propriedade.endereco?.pais || 'Brasil',
        estado: propriedade.endereco?.estado || '',
        cidade: propriedade.endereco?.cidade || '',
        bairro: propriedade.endereco?.bairro || '',
        rua: propriedade.endereco?.rua || '',
        cep: maskCEP(propriedade.endereco?.cep || ''),
        numero: propriedade.endereco?.numero || '',
        ponto_referencia: propriedade.endereco?.ponto_referencia || '',
      });
      setError(null);
    }
  }, [isOpen, propriedade]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;
    if (name === 'cnpj') finalValue = maskCNPJ(value);
    if (name === 'cep') finalValue = maskCEP(value);
    setForm((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Atualiza endereço
      const enderecoPayload = {
        pais: form.pais,
        estado: form.estado,
        cidade: form.cidade,
        bairro: form.bairro,
        rua: form.rua,
        cep: form.cep,
        numero: form.numero,
        ponto_referencia: form.ponto_referencia || undefined,
      };
      await enderecoService.updateEndereco(
        propriedade.endereco.id_endereco,
        enderecoPayload
      );
      // Atualiza propriedade
      const propriedadePayload = {
        nome: form.nome,
        cnpj: formatarCNPJ(form.cnpj),
        id_endereco: propriedade.endereco.id_endereco,
        p_abcb: form.p_abcb,
        tipo_manejo: form.tipo_manejo,
      };
      await propriedadeService.updatePropriedade(
        propriedade.id_propriedade,
        propriedadePayload
      );
      onUpdated && onUpdated();
      onClose();
    } catch (err) {
      setError('Erro ao atualizar. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Propriedade"
      description="Altere os dados da propriedade e endereço conforme necessário."
      size="4xl"
      footer={null}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <h3 className="text-md font-bold text-[#404040] mb-4 border-l-4 border-[#ffcf78] pl-3 flex items-center gap-2">
            Informações Gerais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome da Propriedade"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
              placeholder="Ex: Fazenda Santa Rita"
              icon={FiHome}
            />
            <Input
              label="CNPJ"
              name="cnpj"
              value={form.cnpj}
              onChange={handleChange}
              required
              maxLength={18}
              placeholder="00.000.000/0000-00"
              icon={FiFileText}
            />
            <Select
              label="Sistema de Manejo"
              name="tipo_manejo"
              value={form.tipo_manejo}
              onChange={handleChange}
              required
              icon={FiActivity}
              options={[
                { value: 'P', label: 'Pecuária Geral' },
                { value: 'E', label: 'Extensivo (Pasto)' },
                { value: 'I', label: 'Intensivo (Confinamento)' },
              ]}
            />
            <div className="flex flex-col justify-end pb-1">
              <Toggle
                label="Certificação ABCB"
                name="p_abcb"
                checked={form.p_abcb}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-md font-bold text-[#404040] mb-4 border-l-4 border-[#ffcf78] pl-3 flex items-center gap-2">
            Localização
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <Input
                label="CEP"
                name="cep"
                value={form.cep}
                onChange={handleChange}
                required
                placeholder="00000-000"
                icon={FiMapPin}
              />
            </div>
            <div className="md:col-span-3">
              <Input
                label="Logradouro"
                name="rua"
                value={form.rua}
                onChange={handleChange}
                required
                placeholder="Rua, Estrada ou Rodovia"
                icon={FiMap}
              />
            </div>
            <div className="md:col-span-1">
              <Input
                label="Número"
                name="numero"
                value={form.numero}
                onChange={handleChange}
                required
                placeholder="S/N"
                icon={FiNavigation}
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Bairro"
                name="bairro"
                value={form.bairro}
                onChange={handleChange}
                required
                placeholder="Zona Rural"
                icon={FiMapPin}
              />
            </div>
            <div className="md:col-span-3">
              <Input
                label="Cidade"
                name="cidade"
                value={form.cidade}
                onChange={handleChange}
                required
                placeholder="Nome da Cidade"
                icon={FiMap}
              />
            </div>
            <div className="md:col-span-1">
              <Input
                label="UF"
                name="estado"
                value={form.estado}
                onChange={(e) =>
                  handleChange({
                    ...e,
                    target: {
                      ...e.target,
                      value: e.target.value.toUpperCase().slice(0, 2),
                    },
                  })
                }
                required
                placeholder="SP"
                icon={FiFlag}
              />
            </div>
            <div className="md:col-span-6">
              <Input
                label="Ponto de Referência (Opcional)"
                name="ponto_referencia"
                value={form.ponto_referencia}
                onChange={handleChange}
                placeholder="Próximo ao km 45, antiga fazenda..."
                icon={FiNavigation}
              />
            </div>
          </div>
        </div>
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-center justify-center animate-pulse">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="px-6 font-bold shadow-sm"
          >
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
}
