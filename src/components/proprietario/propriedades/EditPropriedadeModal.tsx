"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePropriedades } from "@/hooks/usePropriedades";
import { useEnderecos } from "@/hooks/useEnderecos";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import { toast } from "sonner";
import { Propriedade } from "@/services/propriedades.service";
import { Endereco } from "@/services/enderecos.service";

interface EditPropriedadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  propriedade: (Propriedade & { endereco?: Endereco }) | null;
}

export default function EditPropriedadeModal({ isOpen, onClose, propriedade }: EditPropriedadeModalProps) {
  const t = useTranslations("Proprietario.propriedades");
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
    { label: t("form.steps.data") },
    { label: t("form.steps.address") },
    { label: t("form.steps.confirmation") },
  ];
  
  const [loading, setLoading] = useState(false);

  // Integração com hooks de propriedades e endereços
  const { updatePropriedade, isUpdatingPropriedade } = usePropriedades();
  const { updateEndereco, isUpdatingEndereco } = useEnderecos();

  // Carrega os dados da propriedade para o formulário assim que o modal abrir
  useEffect(() => {
    if (propriedade && isOpen) {
      setFormPropriedade({
        nome: propriedade.nome || "",
        cnpj: propriedade.cnpj || "",
        // Lida com variações de nomenclatura (camelCase vs snake_case) que a API possa retornar
        p_abcb: propriedade.pAbcb ?? false,
        tipoManejo: propriedade.tipoManejo || "P",
      });

      if (propriedade.endereco || propriedade.idEndereco) {
        // Se a listagem não trouxer o objeto de endereço completo, adapte aqui.
        // Assumindo que "propriedade.endereco" venha populado na listagem.
        const end: Partial<Endereco> = propriedade.endereco || {};
        setFormEndereco({
          pais: end.pais || "",
          estado: end.estado || "",
          cidade: end.cidade || "",
          bairro: end.bairro || "",
          // Lida com a possível variação rua/logradouro
          rua: end.rua || "",
          cep: end.cep || "",
          numero: end.numero || "",
          ponto_referencia: end.pontoReferencia || "",
        });
      }
      setStep(0);
    }
  }, [propriedade, isOpen]);

  // PATCH endereço e propriedade em sequência
  const handleSubmitAll = async () => {
    if (!propriedade?.idPropriedade) return;

    setLoading(true);
    const toastId = toast.loading(t("form.edit.loading"));
    try {
      // 1. Atualiza Endereço (se houver idEndereco vinculado)
      if (propriedade.idEndereco) {
        let cepFormatado = formEndereco.cep.replace(/\D/g, "");
        if (cepFormatado.length === 8) {
          cepFormatado = cepFormatado.replace(/(\d{5})(\d{3})/, "$1-$2");
        }

        const payloadEndereco = {
          pais: formEndereco.pais,
          estado: formEndereco.estado,
          cidade: formEndereco.cidade,
          bairro: formEndereco.bairro,
          rua: formEndereco.rua,
          cep: cepFormatado,
          numero: formEndereco.numero,
          ...(formEndereco.ponto_referencia && formEndereco.ponto_referencia.trim() !== ""
                ? { pontoReferencia: formEndereco.ponto_referencia }
                : {})
        };

        await updateEndereco({ id: propriedade.idEndereco, data: payloadEndereco });
      }

      // 2. Atualiza Propriedade

      // O backend não aceita atualização de CNPJ, então não envie esse campo
      const payloadPropriedade = {
        nome: formPropriedade.nome,
        pAbcb: formPropriedade.p_abcb,
        tipoManejo: formPropriedade.tipoManejo as 'P' | 'E' | 'I',
      };

      await updatePropriedade({ id: propriedade.idPropriedade, data: payloadPropriedade });

      toast.success(t("form.edit.success"), { id: toastId });
      onClose();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const mensagemBackend = e.response?.data?.message || e.response?.data?.error;
      toast.error(mensagemBackend || e.message || t("form.edit.errorFallback"), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  function handleNext(e?: React.FormEvent | React.MouseEvent) {
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
      title={t("form.edit.title")}
      description={t("form.edit.description")}
      footer={
        <>
          {step > 0 && (
            <Button type="button" variant="secondary" onClick={handleBack} disabled={loading}>
              {t("form.buttons.back")}
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            {t("form.buttons.cancel")}
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" onClick={handleNext} disabled={loading}>
              {t("form.buttons.next")}
            </Button>
          ) : (
            <Button
              type="submit"
              onClick={handleSubmitAll}
              disabled={loading || isUpdatingPropriedade || isUpdatingEndereco}
              isLoading={loading || isUpdatingPropriedade || isUpdatingEndereco}
            >
              {t("form.buttons.saveChanges")}
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
        
        {step === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label={t("form.fields.name")}
                name="nome"
                value={formPropriedade.nome}
                onChange={e => setFormPropriedade(f => ({ ...f, nome: e.target.value }))}
                required
              />
            </div>
            <Input
              label={t("form.fields.cnpj")}
              name="cnpj"
              value={formPropriedade.cnpj}
              onChange={e => setFormPropriedade(f => ({ ...f, cnpj: e.target.value }))}
            />
            <Select
              label={t("form.fields.managementType")}
              name="tipoManejo"
              value={formPropriedade.tipoManejo}
              onChange={e => setFormPropriedade(f => ({ ...f, tipoManejo: e.target.value }))}
              options={[
                { value: "P", label: t("form.managementOptions.P") },
                { value: "I", label: t("form.managementOptions.I") },
                { value: "E", label: t("form.managementOptions.E") },
              ]}
              required
            />
            <div className="md:col-span-2 flex items-center mt-2">
              <Checkbox
                label={t("form.fields.abcbProgram")}
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
              label={t("form.fields.country")}
              name="pais"
              value={formEndereco.pais}
              onChange={e => setFormEndereco(f => ({ ...f, pais: e.target.value }))}
              required
            />
            <Input
              label={t("form.fields.state")}
              name="estado"
              value={formEndereco.estado}
              onChange={e => setFormEndereco(f => ({ ...f, estado: e.target.value }))}
              required
            />
            <Input
              label={t("form.fields.city")}
              name="cidade"
              value={formEndereco.cidade}
              onChange={e => setFormEndereco(f => ({ ...f, cidade: e.target.value }))}
              required
            />
            <Input
              label={t("form.fields.neighborhood")}
              name="bairro"
              value={formEndereco.bairro}
              onChange={e => setFormEndereco(f => ({ ...f, bairro: e.target.value }))}
            />
            <Input
              label={t("form.fields.street")}
              name="rua"
              value={formEndereco.rua}
              onChange={e => setFormEndereco(f => ({ ...f, rua: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4 col-span-2">
              <Input
                label={t("form.fields.cep")}
                name="cep"
                value={formEndereco.cep}
                onChange={e => setFormEndereco(f => ({ ...f, cep: e.target.value }))}
                required
              />
              <Input
                label={t("form.fields.number")}
                name="numero"
                value={formEndereco.numero}
                onChange={e => setFormEndereco(f => ({ ...f, numero: e.target.value }))}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label={t("form.fields.referencePoint")}
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
              <Input label={t("form.fields.name")} name="nome" value={formPropriedade.nome} disabled readOnly />
            </div>
            <Input label={t("form.fields.cnpj")} name="cnpj" value={formPropriedade.cnpj} disabled readOnly />
            <Select
              label={t("form.fields.managementType")}
              name="tipoManejo"
              value={formPropriedade.tipoManejo}
              options={[
                { value: "P", label: t("form.managementOptions.P") },
                { value: "I", label: t("form.managementOptions.I") },
                { value: "E", label: t("form.managementOptions.E") },
              ]}
              disabled
            />
            <div className="flex items-center h-full">
              <Checkbox label={t("form.fields.abcbProgram")} name="p_abcb" checked={formPropriedade.p_abcb} disabled readOnly />
            </div>
            <Input label={t("form.fields.country")} name="pais" value={formEndereco.pais} disabled readOnly />
            <Input label={t("form.fields.state")} name="estado" value={formEndereco.estado} disabled readOnly />
            <Input label={t("form.fields.city")} name="cidade" value={formEndereco.cidade} disabled readOnly />
            <Input label={t("form.fields.neighborhood")} name="bairro" value={formEndereco.bairro} disabled readOnly />
            <Input label={t("form.fields.street")} name="rua" value={formEndereco.rua} disabled readOnly />
            <Input label={t("form.fields.number")} name="numero" value={formEndereco.numero} disabled readOnly />
            <Input label={t("form.fields.cep")} name="cep" value={formEndereco.cep} disabled readOnly />
            <div className="md:col-span-2">
              <Input label={t("form.fields.referencePoint")} name="ponto_referencia" value={formEndereco.ponto_referencia} disabled readOnly />
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}