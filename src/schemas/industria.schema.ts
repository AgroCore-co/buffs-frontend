import { z } from "zod";

/**
 * Tradutor mínimo esperado pelo schema — compatível com o retorno de
 * `useTranslations('Proprietario.industria.formModal.errors')` do next-intl.
 */
type Translator = (key: string) => string;

/**
 * Schema do formulário de Indústria (laticínio parceiro).
 * Único campo obrigatório é `nome`; os demais são livres.
 */
export function createIndustriaSchema(t: Translator) {
  return z.object({
    nome: z.string().min(1, t("nameRequired")),
    representante: z.string(),
    contato: z.string(),
    observacao: z.string(),
  });
}

export type IndustriaFormValues = z.infer<ReturnType<typeof createIndustriaSchema>>;
