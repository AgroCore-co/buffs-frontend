"use client";

import { useState } from "react";
import { usePropriedades } from "@/hooks/usePropriedades";
import { useEnderecos } from "@/hooks/useEnderecos";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";

export default function CreatePropriedadeModal({ isOpen, onClose }) {
  const [formPropriedade, setFormPropriedade] = useState({
    nome: "",
    cnpj: "",
    p_abcb: false,
    tipoManejo: "P",
  });
  
  const [formEndereco, setFormEndereco] = useState({
    pais: "",
    estado: "",
    cidade: "",
    bairro: "",
    rua: "",
    cep: "",
    numero: "",
    ponto_referencia: "",
  });
  
  const [step, setStep] = useState(0);
  const steps = [
    { label: 'Dados' },
    { label: 'Endereço' },
    { label: 'Confirmação' },
  ];
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Integração com hooks de propriedades e endereços
  const { createPropriedade, isCreatingPropriedade } = usePropriedades();
  const { createEndereco, isCreatingEndereco } = useEnderecos();

  // POST endereço e propriedade em sequência
  const handleSubmitAll = async () => {
    setLoading(true);
    setError(null);
    try {

      // 1. Mapeia campos para o formato esperado pelo backend (pontoReferencia)

      // Formata o CEP para 00000-000 se necessário
      let cepFormatado = formEndereco.cep.replace(/\D/g, "");
      if (cepFormatado.length === 8) {
        cepFormatado = cepFormatado.replace(/(\d{5})(\d{3})/, "$1-$2");
      }

      // Só inclui pontoReferencia se realmente preenchido e não vazio
      const payloadEndereco = {
        pais: formEndereco.pais,
        estado: formEndereco.estado,
        cidade: formEndereco.cidade,
        bairro: formEndereco.bairro,
        rua: formEndereco.rua,
        cep: cepFormatado,
        numero: formEndereco.numero,
        ...(formEndereco.ponto_referencia && formEndereco.ponto_referencia.trim() !== "" ? { ponto_referencia: formEndereco.ponto_referencia } : {})
      };


      // Loga o payload do endereço para depuração
      console.log('Payload enviado para /enderecos:', payloadEndereco);

      // 2. Cria endereço enviando apenas os dados preenchidos e com nomes corretos
      const enderecoData = await createEndereco(payloadEndereco);
      
      // O Swagger confirmou que o retorno é exatamente "idEndereco"
      const novoIdEndereco = enderecoData?.idEndereco || enderecoData?.id;

      if (!novoIdEndereco) {
        throw new Error("Falha ao obter o ID do endereço recém-criado.");
      }

      setIdEndereco(novoIdEndereco);
      

      // Formata o CNPJ para 00.000.000/0000-00
      let cnpjFormatado = formPropriedade.cnpj.replace(/\D/g, "");
      if (cnpjFormatado.length === 14) {
        cnpjFormatado = cnpjFormatado.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
      } else {
        cnpjFormatado = formPropriedade.cnpj; // mantém original se não for 14 dígitos
      }

      // Monta o payload da propriedade
      const payloadPropriedade = {
        nome: formPropriedade.nome,
        cnpj: cnpjFormatado,
        p_abcb: formPropriedade.p_abcb,
        tipoManejo: formPropriedade.tipoManejo,
        idEndereco: novoIdEndereco
      };
      // Loga o payload da propriedade para depuração
      console.log('Payload enviado para /propriedades:', payloadPropriedade);

      // 3. Cria propriedade enviando a chave idEndereco
      await createPropriedade(payloadPropriedade);
      
      onClose();
    } catch (err) {
      // Tenta extrair a mensagem exata de erro do backend (muito comum usando Axios)
      const mensagemBackend = err.response?.data?.message || err.response?.data?.error;
      setError(mensagemBackend || err.message || "Erro desconhecido ao tentar salvar.");
    } finally {
      setLoading(false);
    }
  };

  function handleNext(e) {
    if (e) e.preventDefault();
    if (step < steps.length - 1) setStep(s => s + 1);
  }
  
  function handleBack() {
    if (step > 0) setStep(s => s - 1);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Criar Propriedade"
      description="Preencha os dados"
      footer={
        <>
          {step > 0 && (
            <Button type="button" variant="secondary" onClick={handleBack} disabled={loading}>
              Voltar
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" onClick={handleNext} disabled={loading}>
              Próximo
            </Button>
          ) : (
            <Button 
              type="submit" 
              onClick={handleSubmitAll} 
              disabled={loading || isCreatingPropriedade || isCreatingEndereco} 
              isLoading={loading || isCreatingPropriedade || isCreatingEndereco}
            >
              Salvar
            </Button>
          )}
        </>
      }
    >
      <form
        onSubmit={e => {
          e.preventDefault();
          if (step < steps.length - 1) {
            handleNext();
          } else {
            handleSubmitAll();
          }
        }}
        className="flex flex-col gap-4"
      >
        <Stepper steps={steps} current={step} className="mb-6" />
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        
        {step === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Nome"
                name="nome"
                value={formPropriedade.nome}
                onChange={e => setFormPropriedade(f => ({ ...f, nome: e.target.value }))}
                required
              />
            </div>
            <Input
              label="CNPJ"
              name="cnpj"
              value={formPropriedade.cnpj}
              onChange={e => setFormPropriedade(f => ({ ...f, cnpj: e.target.value }))}
            />
            <Select
              label="Tipo de Manejo"
              name="tipoManejo"
              value={formPropriedade.tipoManejo}
              onChange={e => setFormPropriedade(f => ({ ...f, tipoManejo: e.target.value }))}
              options={[
                { value: "P", label: "Padrão" },
                { value: "I", label: "Intensivo" },
                { value: "E", label: "Extensivo" },
              ]}
              required
            />
            <div className="md:col-span-2 flex items-center mt-2">
              <Checkbox
                label="Participa do Programa ABCB"
                name="p_abcb"
                checked={formPropriedade.p_abcb}
                onChange={e => setFormPropriedade(f => ({ ...f, p_abcb: e.target.checked }))}
              />
            </div>
          </div>
        )}
        
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="País"
              name="pais"
              value={formEndereco.pais}
              onChange={e => setFormEndereco(f => ({ ...f, pais: e.target.value }))}
              required
            />
            <Input
              label="Estado"
              name="estado"
              value={formEndereco.estado}
              onChange={e => setFormEndereco(f => ({ ...f, estado: e.target.value }))}
              required
            />
            <Input
              label="Cidade"
              name="cidade"
              value={formEndereco.cidade}
              onChange={e => setFormEndereco(f => ({ ...f, cidade: e.target.value }))}
              required
            />
            <Input
              label="Bairro"
              name="bairro"
              value={formEndereco.bairro}
              onChange={e => setFormEndereco(f => ({ ...f, bairro: e.target.value }))}
            />
            <Input
              label="Rua"
              name="rua"
              value={formEndereco.rua}
              onChange={e => setFormEndereco(f => ({ ...f, rua: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4 col-span-2">
              <Input
                label="CEP"
                name="cep"
                value={formEndereco.cep}
                onChange={e => setFormEndereco(f => ({ ...f, cep: e.target.value }))}
                required
              />
              <Input
                label="Número"
                name="numero"
                value={formEndereco.numero}
                onChange={e => setFormEndereco(f => ({ ...f, numero: e.target.value }))}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Ponto de Referência"
                name="ponto_referencia"
                value={formEndereco.ponto_referencia}
                onChange={e => setFormEndereco(f => ({ ...f, ponto_referencia: e.target.value }))}
              />
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-3">
              <Input
                label="Nome"
                name="nome"
                value={formPropriedade.nome}
                disabled
                readOnly
              />
            </div>
            <Input
              label="CNPJ"
              name="cnpj"
              value={formPropriedade.cnpj}
              disabled
              readOnly
            />
            <Select
              label="Tipo de Manejo"
              name="tipoManejo"
              value={formPropriedade.tipoManejo}
              options={[
                { value: "P", label: "Padrão" },
                { value: "I", label: "Intensivo" },
                { value: "E", label: "Extensivo" },
              ]}
              disabled
            />
            <div className="flex items-center h-full">
              <Checkbox
                label="Participa do Programa ABCB"
                name="p_abcb"
                checked={formPropriedade.p_abcb}
                disabled
                readOnly
              />
            </div>
            <Input
              label="País"
              name="pais"
              value={formEndereco.pais}
              disabled
              readOnly
            />
            <Input
              label="Estado"
              name="estado"
              value={formEndereco.estado}
              disabled
              readOnly
            />
            <Input
              label="Cidade"
              name="cidade"
              value={formEndereco.cidade}
              disabled
              readOnly
            />
            <Input
              label="Bairro"
              name="bairro"
              value={formEndereco.bairro}
              disabled
              readOnly
            />
            <Input
              label="Rua"
              name="rua"
              value={formEndereco.rua}
              disabled
              readOnly
            />
            <Input
              label="Número"
              name="numero"
              value={formEndereco.numero}
              disabled
              readOnly
            />
            <Input
              label="CEP"
              name="cep"
              value={formEndereco.cep}
              disabled
              readOnly
            />
            <div className="md:col-span-2">
              <Input
                label="Ponto de Referência"
                name="ponto_referencia"
                value={formEndereco.ponto_referencia}
                disabled
                readOnly
              />
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
