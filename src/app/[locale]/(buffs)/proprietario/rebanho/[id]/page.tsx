"use client";

import React, { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

import { useBufalo } from "@/hooks/useBufalos";

import Badge from "@/components/ui/Badge";
import Container from "@/components/ui/Container";
import TabNav from "@/components/ui/TabNav";
import { DesempenhoTab }   from "@/components/proprietario/rebanho/DesempenhoTab";
import { EventosTab }      from "@/components/proprietario/rebanho/EventosTab";
import { GenealogiaTab }   from "@/components/proprietario/rebanho/GenealogiaTab";
import { MovimentacoesTab } from "@/components/proprietario/rebanho/MovimentacoesTab";
import { ProducaoTab }     from "@/components/proprietario/rebanho/ProducaoTab";
import { ReproducaoTab }   from "@/components/proprietario/rebanho/ReproducaoTab";
import { SanitarioTab }    from "@/components/proprietario/rebanho/SanitarioTab";
import { VisaoGeralTab }   from "@/components/proprietario/rebanho/VisaoGeralTab";
import { ZootecnicoTab }   from "@/components/proprietario/rebanho/ZootecnicoTab";

import { ArrowLeft, Beef, Calendar, Tag } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ProntuarioBufaloPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const t = useTranslations('BufaloPage');
  const { id } = React.use(params);
  const [activeTab, setActiveTab] = useState("visao-geral");

  const { data: bufalo, isLoading } = useBufalo(id);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <BackBtn label={t('back')} onClick={() => router.back()} />
        <Container className="p-5">
          <div className="w-full min-h-[200px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
              <span className="text-sm font-medium">{t('loading')}</span>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (!bufalo) {
    return (
      <div className="flex flex-col gap-4">
        <BackBtn label={t('back')} onClick={() => router.back()} />
        <Container className="p-5 flex flex-col items-center gap-2 py-12">
          <Beef className="w-8 h-8 text-zinc-300" />
          <p className="text-sm font-semibold text-zinc-500">{t('notFound')}</p>
        </Container>
      </div>
    );
  }

  const sexLabel = bufalo.sexo ? (t.has(`sex.${bufalo.sexo}`) ? t(`sex.${bufalo.sexo}` as 'sex.M') : bufalo.sexo) : '';
  const maturityLabel = bufalo.nivelMaturidade ? (t.has(`maturity.${bufalo.nivelMaturidade}`) ? t(`maturity.${bufalo.nivelMaturidade}` as 'maturity.B') : bufalo.nivelMaturidade) : '';

  return (
    <div className="flex flex-col gap-4">
      <BackBtn label={t('back')} onClick={() => router.back()} />

      {/* ── Header ──────────────────────────────────────────────── */}
      <Container className="p-5">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--color-primary-light)]/20 border border-[var(--color-primary-light)]/40 flex items-center justify-center">
            <Beef className="w-6 h-6 text-[var(--color-primary-dark)]" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-foreground tracking-tight uppercase">{bufalo.nome}</h1>
              <Badge type={bufalo.status ? "active" : "inactive"}>
                {bufalo.status ? t('status.active') : t('status.inactive')}
              </Badge>
            </div>
            <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> {bufalo.brinco}</span>
              {bufalo.dtNascimento && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(bufalo.dtNascimento)}</span>
                </>
              )}
              {bufalo.sexo && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span>{sexLabel} · {maturityLabel}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Container>

      {/* ── Abas ────────────────────────────────────────────────── */}
      <Container className="pt-2 px-6 w-full min-w-0">
        <TabNav
          tabs={[
            { key: "visao-geral",    label: t('tabs.overview')      },
            { key: "zootecnico",     label: t('tabs.zootechnical')  },
            { key: "reproducao",     label: t('tabs.reproduction')  },
            // Produção (ordenha) só faz sentido para fêmeas
            ...(bufalo.sexo === "F" ? [{ key: "producao", label: t('tabs.production') }] : []),
            { key: "sanitario",      label: t('tabs.health')        },
            { key: "movimentacoes",  label: t('tabs.movements')     },
            { key: "desempenho",     label: t('tabs.performance')   },
            { key: "eventos",        label: t('tabs.events')        },
            { key: "genealogia",     label: t('tabs.genealogy')     },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="pt-6 pb-4">

          {/* ── Visão Geral ─────────────────────────────────────── */}
          {activeTab === "visao-geral" && (
            <VisaoGeralTab bufalo={bufalo} onNavigateToGenealogy={() => setActiveTab("genealogia")} />
          )}

          {/* ── Genealogia ──────────────────────────────────────── */}
          {activeTab === "genealogia" && (
            <GenealogiaTab bufalo={bufalo} />
          )}

          {/* ── Sanitário ───────────────────────────────────────── */}
          {activeTab === "sanitario" && (
            <SanitarioTab bufaloId={bufalo.idBufalo} idPropriedade={bufalo.idPropriedade} />
          )}

          {/* ── Zootécnico ──────────────────────────────────────── */}
          {activeTab === "zootecnico" && (
            <ZootecnicoTab bufalo={bufalo} />
          )}

          {/* ── Reprodução ──────────────────────────────────────── */}
          {activeTab === "reproducao" && (
            <ReproducaoTab bufalo={bufalo} />
          )}

          {/* ── Produção (apenas fêmeas) ────────────────────────── */}
          {activeTab === "producao" && bufalo.sexo === "F" && (
            <ProducaoTab bufalo={bufalo} />
          )}

          {/* ── Movimentações ───────────────────────────────────── */}
          {activeTab === "movimentacoes" && (
            <MovimentacoesTab bufalo={bufalo} />
          )}

          {/* ── Desempenho ──────────────────────────────────────── */}
          {activeTab === "desempenho" && (
            <DesempenhoTab bufalo={bufalo} />
          )}

          {/* ── Eventos ─────────────────────────────────────────── */}
          {activeTab === "eventos" && (
            <EventosTab bufalo={bufalo} />
          )}

        </div>
      </Container>
    </div>
  );
}

function BackBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-[var(--color-primary-dark)] transition-colors ml-1 w-fit"
    >
      <ArrowLeft className="w-3 h-3" />
      {label}
    </button>
  );
}
