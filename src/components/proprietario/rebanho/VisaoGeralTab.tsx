"use client";

import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Clock, Tag, Cpu, Calendar, Award, Bookmark, BookmarkCheck, MapPin, UserRound, ShieldOff } from "lucide-react";

import { useBufalo } from "@/hooks/useBufalos";
import { useGruposById } from "@/hooks/useGrupos";
import { usePropriedadeStore } from "@/stores/propriedade.store";
import { Bufalo } from "@/services/bufalos.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("pt-BR");
}

function calcularIdadeData(dtNascimento?: string | null): { years: number; months: number } | null {
  if (!dtNascimento) return null;
  const now = new Date();
  const birth = new Date(dtNascimento);
  if (Number.isNaN(birth.getTime())) return null;
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) { years--; months += 12; }
  return { years, months };
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function IdentField({
  icon: Icon, label, value, sub,
}: { icon: LucideIcon; label: string; value?: string | null; sub?: string | null }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
        <Icon className="w-4 h-4 text-amber-600" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</span>
        <span className="text-sm font-semibold text-zinc-800">{value || "—"}</span>
        {sub && <span className="text-xs text-zinc-400">{sub}</span>}
      </div>
    </div>
  );
}

function ManejoCelula({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-1 bg-zinc-50 rounded-xl p-4 border border-zinc-100">
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</span>
      <span className="text-sm font-bold text-zinc-800">{value || "—"}</span>
    </div>
  );
}

const CATEGORIAS_COM_SELO = ["PO", "PC", "PA", "CCG", "SRD"] as const;
type CategoriaComSelo = typeof CATEGORIAS_COM_SELO[number];

function ClassificacaoSeal({ categoria, noClass, categoriaLabel }: {
  categoria: string | null | undefined;
  noClass: string;
  categoriaLabel: string;
}) {
  const cat = (categoria ?? null) as CategoriaComSelo | null;
  const temSelo = cat && (CATEGORIAS_COM_SELO as readonly string[]).includes(cat);

  if (!temSelo) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="w-40 h-40 rounded-full border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center gap-2">
          <ShieldOff className="w-8 h-8 text-zinc-300" />
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{noClass}</span>
        </div>
        <div className="text-4xl font-black text-zinc-300 tracking-tight">—</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-40 h-40">
        <Image
          src={`/selos/classificacao-${cat}.svg`}
          alt={`Selo de classificação ${cat}`}
          fill
          className="object-contain drop-shadow-sm"
          priority
        />
      </div>
      <div className="text-4xl font-black text-zinc-800 tracking-tight">{cat}</div>
      <span className="px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-600">
        {categoriaLabel}
      </span>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface VisaoGeralTabProps {
  bufalo: Bufalo;
  onNavigateToGenealogy: () => void;
}

export function VisaoGeralTab({ bufalo, onNavigateToGenealogy }: VisaoGeralTabProps) {
  const t = useTranslations("Proprietario.rebanho.bufalo.visaoGeral");
  const { data: grupo }            = useGruposById(bufalo.idGrupo ?? undefined);
  const { data: pai }              = useBufalo(bufalo.idPai   ?? undefined);
  const { data: mae }              = useBufalo(bufalo.idMae   ?? undefined);
  const { activePropriedade }      = usePropriedadeStore();

  const idTruncado = bufalo.idBufalo.length > 10
    ? `${bufalo.idBufalo.slice(0, 8)}…`
    : bufalo.idBufalo;

  const idadeData = calcularIdadeData(bufalo.dtNascimento);
  const idadeSub = idadeData
    ? (idadeData.years === 0
        ? t("age.months", { months: idadeData.months })
        : t("age.yearsMonths", { years: idadeData.years, months: idadeData.months }))
    : null;

  const sexoDisplay = bufalo.sexo ? (
    bufalo.sexo === "M" ? t("sex.M") :
    bufalo.sexo === "F" ? t("sex.F") :
    bufalo.sexo
  ) : "—";

  const matDisplay = bufalo.nivelMaturidade
    ? t(`maturity.${bufalo.nivelMaturidade}` as Parameters<typeof t>[0], { defaultValue: bufalo.nivelMaturidade } as never) ?? bufalo.nivelMaturidade
    : "—";

  const catLabel = bufalo.categoria
    ? t(`categoria.${bufalo.categoria}` as Parameters<typeof t>[0], { defaultValue: bufalo.categoria } as never) ?? bufalo.categoria
    : "—";

  return (
    <div className="animate-in fade-in duration-300 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">

      {/* ── Coluna esquerda ──────────────────────────────────── */}
      <div className="flex flex-col gap-5">

        {/* Dados de Identificação */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-800">{t("identification")}</h2>
            <span className="text-[11px] text-zinc-400 font-mono">ID: {idTruncado}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <IdentField icon={Tag}           label={t("fields.visualTag")}      value={bufalo.brinco} />
            <IdentField icon={Cpu}           label={t("fields.microchip")}       value={bufalo.microchip ?? t("notImplanted")} />
            <IdentField icon={Calendar}      label={t("fields.birthDate")}       value={formatDate(bufalo.dtNascimento)} sub={idadeSub} />
            <IdentField icon={Award}         label={t("fields.sex")}             value={sexoDisplay} />
            <IdentField icon={Bookmark}      label={t("fields.provisionalReg")}  value={bufalo.registroProv} />
            <IdentField icon={BookmarkCheck} label={t("fields.definitiveReg")}   value={bufalo.registroDef} />
            <IdentField icon={MapPin}        label={t("fields.origin")}          value={bufalo.origem} />
            <IdentField icon={Tag}           label={t("fields.originalTag")}     value={bufalo.brincoOriginal} />
          </div>
        </div>

        {/* Manejo & Localização */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-bold text-zinc-800">{t("management")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ManejoCelula label={t("fields.property")}      value={activePropriedade?.nome} />
            <ManejoCelula label={t("fields.group")}         value={grupo?.nomeGrupo} />
            <ManejoCelula label={t("fields.category")}      value={bufalo.categoria} />
            <ManejoCelula label={t("fields.maturityLevel")} value={matDisplay} />
          </div>
        </div>
      </div>

      {/* ── Coluna direita ───────────────────────────────────── */}
      <div className="flex flex-col gap-5">

        {/* Classificação Racial */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex flex-col items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-600">{t("racialClass")}</span>
          <ClassificacaoSeal
            categoria={bufalo.categoria}
            noClass={t("noClassification")}
            categoriaLabel={catLabel}
          />
        </div>

        {/* Genealogia Rápida */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-bold text-zinc-800">{t("quickGenealogy")}</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <UserRound className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t("father")}</span>
                <span className="text-sm font-medium text-zinc-700">{pai?.nome ?? t("notInformed")}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                <UserRound className="w-3.5 h-3.5 text-pink-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t("mother")}</span>
                <span className="text-sm font-medium text-zinc-700">{mae?.nome ?? t("notInformed")}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onNavigateToGenealogy}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors w-fit"
          >
            {t("viewFullTree")}
          </button>
        </div>

        {/* Timestamps */}
        <div className="flex flex-col gap-1.5 px-1">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <Clock className="w-3 h-3" /> {t("createdAt")} {formatDateTime(bufalo.createdAt)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <Clock className="w-3 h-3" /> {t("updatedAt")} {formatDateTime(bufalo.updatedAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
