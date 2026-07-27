import { z } from "zod";
import {
  TIPO_INSEMINACAO_OPTIONS,
  STATUS_REPRODUCAO_OPTIONS,
  type TipoInseminacao,
  type StatusReproducao,
} from "@/services/reproducao.service";

/**
 * Tradutor mínimo esperado pelo schema — compatível com o retorno de
 * `useTranslations('ReproducaoPage.formModal.errors')` do next-intl.
 */
type Translator = (key: string) => string;

const TIPOS_COM_MATERIAL: TipoInseminacao[] = ["IA", "IATF", "TE"];
const TIPO_MONTA_NATURAL: TipoInseminacao = "Monta Natural";

/**
 * Schema do formulário de Cobertura/Reprodução.
 *
 * idSemen e idBufalo só são exigidos condicionalmente (via superRefine)
 * de acordo com o tipoInseminacao escolhido — mesma regra que hoje existe
 * implicitamente no `handleSubmit` do CoberturaFormModal.
 */
export function createCoberturaSchema(t: Translator) {
  return z
    .object({
      idBufala: z.string().min(1, t("femeaRequired")),
      tipoInseminacao: z.enum(
        TIPO_INSEMINACAO_OPTIONS as [TipoInseminacao, ...TipoInseminacao[]]
      ),
      idSemen: z.string(),
      idBufalo: z.string(),
      dtEvento: z
        .string()
        .min(1, t("dtEventoRequired"))
        .refine((value) => new Date(value) <= new Date(), {
          message: t("dtEventoFuture"),
        }),
      status: z.enum(
        STATUS_REPRODUCAO_OPTIONS as [StatusReproducao, ...StatusReproducao[]]
      ),
    })
    .superRefine((data, ctx) => {
      const precisaMaterial = TIPOS_COM_MATERIAL.includes(data.tipoInseminacao);
      const precisaMacho = data.tipoInseminacao === TIPO_MONTA_NATURAL;

      if (precisaMaterial && !data.idSemen) {
        ctx.addIssue({
          code: "custom",
          path: ["idSemen"],
          message: t("semenRequired"),
        });
      }

      if (precisaMacho && !data.idBufalo) {
        ctx.addIssue({
          code: "custom",
          path: ["idBufalo"],
          message: t("machoRequired"),
        });
      }
    });
}

export type CoberturaFormValues = z.infer<ReturnType<typeof createCoberturaSchema>>;
