import React, { useState, useEffect, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/form/Input';
import Select from '@/components/form/Select';
import Toggle from '@/components/form/Toggle';
import {
  FiTag,
  FiGitCommit,
  FiCalendar,
  FiActivity,
  FiUser,
  FiUsers,
  FiInfo,
  FiFileText,
} from 'react-icons/fi';
import grupoService from '@/services/grupo.service';
import racaService from '@/services/raca.service';
import bufaloService from '@/services/bufalo.service';

export default function BufaloCriarModal({
  isOpen,
  onClose,
  onSuccess,
  idPropriedade,
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nome: '',
    brinco: '',
    microchip: '',
    dt_nascimento: '',
    sexo: 'F',
    id_raca: '',
    id_grupo: '',
    nivel_maturidade: 'B',
    status: true,
    origem: 'Nascimento na propriedade',
    categoria: 'PA',
    brinco_original: '',
    registro_prov: '',
    registro_def: '',
    id_pai: '',
    id_mae: '',
    id_pai_semen: '',
    id_mae_ovulo: '',
  });

  const [grupos, setGrupos] = useState([]);
  const [racas, setRacas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDependencies = useCallback(async () => {
    try {
      const [gruposRes, racasRes] = await Promise.all([
        grupoService.getGruposByPropriedade(idPropriedade),
        racaService.getAllRacas(),
      ]);

      if (gruposRes.data) setGrupos(gruposRes.data);
      if (racasRes) {
        const listaRacas = Array.isArray(racasRes)
          ? racasRes
          : racasRes.data || [];
        setRacas(listaRacas);

        // Definir a primeira raça como default se existir
        if (listaRacas.length > 0) {
          const primeiraRaca = listaRacas[0];
          setForm((prev) => ({
            ...prev,
            id_raca: primeiraRaca.idRaca || primeiraRaca.id_raca || '',
          }));
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dependências', err);
    }
  }, [idPropriedade]);

  useEffect(() => {
    if (isOpen && idPropriedade) {
      loadDependencies();
      setStep(1);
      // Resetar formulário com valores vazios
      setForm({
        nome: '',
        brinco: '',
        microchip: '',
        dt_nascimento: '',
        sexo: 'F',
        id_raca: '',
        id_grupo: '',
        nivel_maturidade: 'B',
        status: true,
        origem: 'Nascimento na propriedade',
        categoria: 'PA',
        brinco_original: '',
        registro_prov: '',
        registro_def: '',
        id_pai: '',
        id_mae: '',
        id_pai_semen: '',
        id_mae_ovulo: '',
      });
      setError(null);
    }
  }, [isOpen, idPropriedade, loadDependencies]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      const erros = [];
      if (!form.nome) erros.push('Nome');
      if (!form.brinco) erros.push('Brinco');
      if (!form.dt_nascimento) erros.push('Data de Nascimento');
      if (!form.id_raca) erros.push('Raça');
      if (!form.nivel_maturidade) erros.push('Maturidade');
      if (!form.sexo) erros.push('Sexo');

      if (erros.length > 0) {
        setError(`Campos obrigatórios faltando: ${erros.join(', ')}`);
        return false;
      }
    }
    // Etapa 2 e 3 são majoritariamente opcionais ou têm defaults
    return true;
  };

  const handleNext = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (validateStep(step)) {
      setError(null);
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validação final de segurança
    if (!form.id_raca) {
      setError('Selecione a raça.');
      setLoading(false);
      return;
    }

    // Payload no formato que a API espera (camelCase)
    const payload = {
      nome: form.nome,
      brinco: form.brinco,
      microchip: form.microchip || null,
      dtNascimento: form.dt_nascimento
        ? new Date(form.dt_nascimento).toISOString()
        : null,
      nivelMaturidade: form.nivel_maturidade,
      sexo: form.sexo,
      idRaca: form.id_raca,
      idPropriedade: idPropriedade,
      idGrupo: form.id_grupo || null,
      idPai: form.id_pai || null,
      idMae: form.id_mae || null,
      status: form.status,
      categoria: form.categoria,
      origem: form.origem,
      brinco_original: form.brinco_original || null,
      registro_prov: form.registro_prov || null,
      registro_def: form.registro_def || null,
      id_pai_semen: form.id_pai_semen || null,
      id_mae_ovulo: form.id_mae_ovulo || null,
    };

    try {
      await bufaloService.createBufalo(payload);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao registrar búfalo.');
    } finally {
      setLoading(false);
    }
  };

  // Renderização dos passos
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome / Apelido"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
                icon={FiTag}
                placeholder="Nome do animal"
              />
              <Input
                label="Brinco (TAG)"
                name="brinco"
                value={form.brinco}
                onChange={handleChange}
                required
                icon={FiTag}
                placeholder="Código do brinco"
              />

              <Input
                label="Data de Nascimento"
                name="dt_nascimento"
                type="date"
                value={form.dt_nascimento}
                onChange={handleChange}
                required
                icon={FiCalendar}
              />

              <Select
                label="Sexo"
                name="sexo"
                value={form.sexo}
                onChange={handleChange}
                required
                icon={FiUser}
                options={[
                  { value: 'F', label: 'Fêmea' },
                  { value: 'M', label: 'Macho' },
                ]}
              />

              <Select
                label="Raça"
                name="id_raca"
                value={form.id_raca}
                onChange={handleChange}
                required
                icon={FiInfo}
                options={racas.map((r) => ({
                  value: r.idRaca || r.id_raca,
                  label: r.nome || r.raca,
                }))}
              />

              <Select
                label="Maturidade"
                name="nivel_maturidade"
                value={form.nivel_maturidade}
                onChange={handleChange}
                required
                icon={FiActivity}
                options={[
                  { value: 'B', label: 'Bezerro(a)' },
                  { value: 'N', label: 'Novilho(a)' },
                  { value: 'V', label: 'Vaca' },
                  { value: 'T', label: 'Touro' },
                  { value: 'A', label: 'Adulto' },
                ]}
              />
              <Select
                label="Categoria"
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                icon={FiTag}
                options={[
                  { value: 'PO', label: 'Puro de Origem (PO)' },
                  { value: 'PA', label: 'Puro por Cruzamento (PC/PA)' },
                  { value: 'SRD', label: 'Sem Raça Definida' },
                  { value: 'CCG', label: 'Cruzamento Industrial' },
                ]}
              />
              <Input
                label="Microchip (Opcional)"
                name="microchip"
                value={form.microchip}
                onChange={handleChange}
                icon={FiGitCommit}
                placeholder="Número do chip"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Grupo de Manejo"
                name="id_grupo"
                value={form.id_grupo}
                onChange={handleChange}
                icon={FiUsers}
                options={[
                  { value: '', label: 'Sem Grupo' },
                  ...grupos.map((g) => ({
                    value: g.idGrupo || g.id_grupo,
                    label: g.nomeGrupo || g.nome_grupo,
                  })),
                ]}
              />

              <Select
                label="Origem"
                name="origem"
                value={form.origem}
                onChange={handleChange}
                options={[
                  {
                    value: 'Nascimento na propriedade',
                    label: 'Nascimento próprio',
                  },
                  { value: 'Externo', label: 'Compra externa' },
                ]}
              />
              <Input
                label="Brinco Anterior / Original"
                name="brinco_original"
                value={form.brinco_original}
                onChange={handleChange}
                icon={FiTag}
                placeholder="Caso venha de outra propriedade"
              />

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
                <Input
                  label="Registro Provisório"
                  name="registro_prov"
                  value={form.registro_prov}
                  onChange={handleChange}
                  icon={FiFileText}
                />
                <Input
                  label="Registro Definitivo"
                  name="registro_def"
                  value={form.registro_def}
                  onChange={handleChange}
                  icon={FiFileText}
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <Toggle
                  label="Animal Ativo no Rebanho"
                  name="status"
                  checked={form.status}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-md mb-4 text-sm text-yellow-700 flex items-center gap-2">
              <FiInfo /> Preencha apenas se tiver a informação genética (UUID).
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="ID Pai (Genético)"
                name="id_pai"
                value={form.id_pai}
                onChange={handleChange}
                icon={FiGitCommit}
                placeholder="UUID do Pai"
              />
              <Input
                label="ID Mãe (Genética)"
                name="id_mae"
                value={form.id_mae}
                onChange={handleChange}
                icon={FiGitCommit}
                placeholder="UUID da Mãe"
              />
              <Input
                label="ID Pai (Sêmen)"
                name="id_pai_semen"
                value={form.id_pai_semen}
                onChange={handleChange}
                icon={FiGitCommit}
                placeholder="UUID Sêmen"
              />
              <Input
                label="ID Mãe (Óvulo)"
                name="id_mae_ovulo"
                value={form.id_mae_ovulo}
                onChange={handleChange}
                icon={FiGitCommit}
                placeholder="UUID Óvulo"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Búfalo"
      description="Cadastre um novo animal no rebanho."
      size="2xl" // Reduced size to allow steps
      footer={null}
    >
      <div className="flex flex-col h-full">
        {/* Stepper Header */}
        <div className="flex justify-between items-center mb-6 px-1">
          <div
            className={`flex-1 h-2 rounded-full mr-2 ${step >= 1 ? 'bg-yellow-500' : 'bg-gray-200'}`}
          ></div>
          <div
            className={`flex-1 h-2 rounded-full mr-2 ${step >= 2 ? 'bg-yellow-500' : 'bg-gray-200'}`}
          ></div>
          <div
            className={`flex-1 h-2 rounded-full ${step >= 3 ? 'bg-yellow-500' : 'bg-gray-200'}`}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mb-6 px-1 font-semibold uppercase tracking-wide">
          <span className={step === 1 ? 'text-yellow-600' : ''}>
            1. Dados Básicos
          </span>
          <span className={step === 2 ? 'text-yellow-600' : ''}>
            2. Manejo e Origem
          </span>
          <span className={step === 3 ? 'text-yellow-600' : ''}>
            3. Genética
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 flex-1 min-h-[300px]"
        >
          {renderStepContent()}

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-100 animate-pulse text-center mt-auto">
              {error}
            </div>
          )}

          {/* Navigation Footer */}
          <div className="flex justify-between items-center mt-8 border-t border-gray-100 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={step === 1 ? onClose : handleBack}
              disabled={loading}
            >
              {step === 1 ? 'Cancelar' : 'Voltar'}
            </Button>

            {step < 3 ? (
              <Button type="button" variant="primary" onClick={handleNext}>
                Próximo
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="font-bold"
              >
                Salvar Búfalo
              </Button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
}

// Ícones adicionais
