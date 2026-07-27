import { z } from "zod";
import {
  TIPO_MATERIAL_OPTIONS,
  ORIGEM_MATERIAL_OPTIONS,
  type TipoMaterial,
  type OrigemMaterial,
} from "@/services/material-genetico.service";

/**
 * Tradutor mínimo esperado pelo schema — compatível com o retorno de
 * `useTranslations('MaterialGeneticoPage.formModal.errors')` do next-intl.
 */
type Translator = (key: string) => string;

const ORIGEM_COLETA_PROPRIA: OrigemMaterial = "Coleta Própria";
const ORIGEM_COMPRA: OrigemMaterial = "Compra";

/**
 * Schema do formulário de Material Genético.
 *
 * idBufaloOrigem só é exigido quando origem === "Coleta Própria";
 * fornecedor só é exigido quando origem === "Compra" — mesma regra que hoje
 * existe implicitamente no `handleSubmit` do MaterialGeneticoFormModal.
 */
export function createMaterialGeneticoSchema(t: Translator) {
  return z
    .object({
      tipo: z.enum(TIPO_MATERIAL_OPTIONS as [TipoMaterial, ...TipoMaterial[]]),
      origem: z.enum(ORIGEM_MATERIAL_OPTIONS as [OrigemMaterial, ...OrigemMaterial[]]),
      idBufaloOrigem: z.string(),
      fornecedor: z.string(),
      dataColeta: z
        .string()
        .min(1, t("dataColetaRequired"))
        .refine((value) => new Date(value) <= new Date(), {
          message: t("dataColetaFuture"),
        }),
    })
    .superRefine((data, ctx) => {
      if (data.origem === ORIGEM_COLETA_PROPRIA && !data.idBufaloOrigem) {
        ctx.addIssue({
          code: "custom",
          path: ["idBufaloOrigem"],
          message: t("bufaloOrigemRequired"),
        });
      }

      if (data.origem === ORIGEM_COMPRA && !data.fornecedor) {
        ctx.addIssue({
          code: "custom",
          path: ["fornecedor"],
          message: t("fornecedorRequired"),
        });
      }
    });
}

export type MaterialGeneticoFormValues = z.infer<
  ReturnType<typeof createMaterialGeneticoSchema>
>;
