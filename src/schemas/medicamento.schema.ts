import { z } from "zod";
import {
  TIPO_TRATAMENTO_LABELS,
  type TipoTratamentoMedicacao,
} from "@/services/medicamentos.service";

/**
 * Tradutor mínimo esperado pelo schema — compatível com o retorno de
 * `useTranslations('Proprietario.medicamentos.formModal.errors')` do next-intl.
 */
type Translator = (key: string) => string;

const TIPOS = Object.keys(TIPO_TRATAMENTO_LABELS) as [
  TipoTratamentoMedicacao,
  ...TipoTratamentoMedicacao[],
];

export function createMedicamentoSchema(t: Translator) {
  return z.object({
    tipoTratamento: z.enum(TIPOS),
    medicacao: z
      .string()
      .min(1, t("nameRequired"))
      .max(30, t("nameMax")),
    descricao: z.string().max(100, t("descriptionMax")),
  });
}

export type MedicamentoFormValues = z.infer<ReturnType<typeof createMedicamentoSchema>>;
