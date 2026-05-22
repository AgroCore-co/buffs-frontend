# Prontuário do Búfalo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar uma página dedicada de prontuário para cada búfalo, acessível ao clicar em uma linha da tabela de rebanho.

**Architecture:** A nova rota `rebanho/[id]` busca o búfalo via `useBufalo(id)`, o grupo via `useGruposById`, e renderiza um header com 5 abas: Resumo Geral (dados do búfalo), Localização (mapa Leaflet do piquete), e 3 placeholders para expansão futura.

**Tech Stack:** Next.js 14 App Router, React, TanStack Query, Leaflet (react-leaflet + dynamic imports), Tailwind CSS, TypeScript

---

## File Map

| Ação | Arquivo | Responsabilidade |
|---|---|---|
| Modificar | `src/components/ui/DataTable.tsx` | Adicionar props `onClick`/`className` em `TableRow` |
| Modificar | `src/app/[locale]/(buffs)/proprietario/rebanho/page.tsx` | Adicionar navegação ao clicar na linha |
| Criar | `src/components/proprietario/rebanho/prontuario/ResumoGeralTab.tsx` | Aba com dados de identificação e manejo |
| Criar | `src/components/proprietario/rebanho/prontuario/LocalizacaoTab.tsx` | Aba com mapa Leaflet do piquete atual |
| Criar | `src/app/[locale]/(buffs)/proprietario/rebanho/[id]/page.tsx` | Página do prontuário (header + TabNav) |

---

## Task 1: Tornar TableRow clicável + adicionar navegação no rebanho

**Files:**
- Modify: `src/components/ui/DataTable.tsx:101-103`
- Modify: `src/app/[locale]/(buffs)/proprietario/rebanho/page.tsx`

- [ ] **Step 1: Atualizar `TableRow` para aceitar `onClick` e `className`**

Em `src/components/ui/DataTable.tsx`, substitua a função `TableRow` (linhas 101-103):

```tsx
export function TableRow({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <tr
      className={`odd:bg-white even:bg-zinc-50 hover:bg-zinc-100 transition-colors group ${
        onClick ? "cursor-pointer" : ""
      } ${className ?? ""}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}
```

- [ ] **Step 2: Adicionar `useRouter` em `rebanho/page.tsx`**

Em `src/app/[locale]/(buffs)/proprietario/rebanho/page.tsx`, adicione o import:

```tsx
import { useRouter } from "@/i18n/routing";
```

E dentro de `RebanhoPage()`, adicione após as declarações de estado existentes:

```tsx
const router = useRouter();
```

- [ ] **Step 3: Adicionar `onClick` nas linhas da tabela**

No mesmo arquivo, localize o trecho `{bufalos.map((bufalo) => (` e substitua o `<TableRow key={bufalo.idBufalo}>` por:

```tsx
<TableRow
  key={bufalo.idBufalo}
  onClick={() => router.push(`/proprietario/rebanho/${bufalo.idBufalo}`)}
>
```

- [ ] **Step 4: Verificar navegação no browser**

Rode o dev server (`npm run dev`) e acesse a tela de rebanho. Clicar em qualquer linha deve navegar para `/proprietario/rebanho/<id>` (a página retornará 404 por enquanto, o que é esperado).

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/DataTable.tsx src/app/[locale]/\(buffs\)/proprietario/rebanho/page.tsx
git commit -m "feat: make buffalo table rows clickable for prontuario navigation"
```

---

## Task 2: Criar `ResumoGeralTab`

**Files:**
- Create: `src/components/proprietario/rebanho/prontuario/ResumoGeralTab.tsx`

- [ ] **Step 1: Criar o arquivo com todo o conteúdo**

Crie `src/components/proprietario/rebanho/prontuario/ResumoGeralTab.tsx`:

```tsx
"use client";

import React from "react";
import Container from "@/components/ui/Container";
import {
  Tag,
  Cpu,
  Calendar,
  Venus,
  Mars,
  FileText,
  MapPin,
  Layers,
  Hash,
} from "lucide-react";
import { Bufalo } from "@/services/bufalos.service";

const CATEGORIA_LABELS: Record<string, string> = {
  PO: "Puro de Origem",
  PC: "Puro por Cruzamento",
  PA: "Puro por Avaliação",
  CCG: "Com Controle de Genealogia",
  SRD: "Sem Raça Definida",
};

const MATURIDADE_LABELS: Record<string, string> = {
  B: "Bezerro",
  N: "Novilha",
  V: "Vaca / Adulto",
  T: "Touro / Adulto",
};

function calcularIdade(dtNascimento: string): string {
  const nascimento = new Date(dtNascimento);
  const agora = new Date();
  let anos = agora.getFullYear() - nascimento.getFullYear();
  let meses = agora.getMonth() - nascimento.getMonth();
  if (meses < 0) {
    anos--;
    meses += 12;
  }
  if (anos > 0 && meses > 0) return `${anos}a ${meses}m`;
  if (anos > 0) return `${anos}a`;
  return `${meses}m`;
}

function InfoItem({
  label,
  value,
  icon,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-[#CE7D0A] shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-medium text-zinc-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export interface ResumoGeralTabProps {
  bufalo: Bufalo;
  grupoNome: string | undefined;
  propriedadeNome: string | undefined;
}

export function ResumoGeralTab({
  bufalo,
  grupoNome,
  propriedadeNome,
}: ResumoGeralTabProps) {
  const categoriaFull = bufalo.categoria
    ? CATEGORIA_LABELS[bufalo.categoria]
    : null;
  const idade = bufalo.dtNascimento ? calcularIdade(bufalo.dtNascimento) : null;
  const maturidade = bufalo.nivelMaturidade
    ? MATURIDADE_LABELS[bufalo.nivelMaturidade] ?? bufalo.nivelMaturidade
    : "—";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Coluna principal */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {/* Dados de Identificação */}
        <Container className="p-5">
          <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-5">
            Dados de Identificação
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InfoItem
              label="Brinco Visual"
              value={bufalo.brinco}
              icon={<Tag className="w-4 h-4" />}
            />
            <InfoItem
              label="Microchip / Eletrônico"
              value={bufalo.microchip ?? "Não implantado"}
              icon={<Cpu className="w-4 h-4" />}
            />
            <InfoItem
              label="Data de Nascimento"
              value={
                bufalo.dtNascimento
                  ? new Date(bufalo.dtNascimento).toLocaleDateString("pt-BR")
                  : "—"
              }
              icon={<Calendar className="w-4 h-4" />}
              sub={idade ? `${idade} de idade` : undefined}
            />
            <InfoItem
              label="Sexo"
              value={
                bufalo.sexo === "M"
                  ? "Macho"
                  : bufalo.sexo === "F"
                  ? "Fêmea"
                  : "—"
              }
              icon={
                bufalo.sexo === "M" ? (
                  <Mars className="w-4 h-4" />
                ) : (
                  <Venus className="w-4 h-4" />
                )
              }
            />
            <InfoItem
              label="Registro Provisório"
              value={bufalo.registroProv ?? "—"}
              icon={<FileText className="w-4 h-4" />}
            />
            <InfoItem
              label="Registro Definitivo"
              value={bufalo.registroDef ?? "—"}
              icon={<FileText className="w-4 h-4" />}
            />
            <InfoItem
              label="Origem"
              value={bufalo.origem ?? "—"}
              icon={<MapPin className="w-4 h-4" />}
            />
            <InfoItem
              label="Brinco Original"
              value={bufalo.brincoOriginal ?? "—"}
              icon={<Hash className="w-4 h-4" />}
            />
          </div>
        </Container>

        {/* Manejo & Localização */}
        <Container className="p-5">
          <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-5">
            Manejo & Localização
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InfoItem
              label="Propriedade"
              value={propriedadeNome ?? "—"}
              icon={<MapPin className="w-4 h-4" />}
            />
            <InfoItem
              label="Grupo / Lote"
              value={grupoNome ?? "—"}
              icon={<Layers className="w-4 h-4" />}
            />
            <InfoItem
              label="Categoria"
              value={bufalo.categoria ?? "—"}
              icon={<Tag className="w-4 h-4" />}
            />
            <InfoItem
              label="Nível de Maturidade"
              value={maturidade}
              icon={<Tag className="w-4 h-4" />}
            />
          </div>
        </Container>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-4">
        {/* Classificação Racial */}
        <Container className="p-5 flex flex-col items-center text-center gap-3">
          <p className="text-[10px] font-bold text-[#CE7D0A] uppercase tracking-widest">
            Classificação Racial
          </p>
          <div className="w-16 h-16 rounded-full bg-[#CE7D0A]/10 border-2 border-[#CE7D0A]/30 flex items-center justify-center">
            <span className="text-xl font-black text-[#CE7D0A]">
              {bufalo.categoria ?? "—"}
            </span>
          </div>
          {categoriaFull && (
            <div>
              <p className="text-base font-bold text-zinc-900">
                {bufalo.categoria}
              </p>
              <p className="text-sm text-zinc-500 mt-0.5">{categoriaFull}</p>
            </div>
          )}
        </Container>

        {/* Genealogia Rápida */}
        <Container className="p-5">
          <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-4">
            Genealogia Rápida
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-blue-600">P</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase">
                  Pai
                </p>
                <p className="text-sm text-zinc-700">
                  {bufalo.idPai ? "Registrado" : "Não informado"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-pink-600">M</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase">
                  Mãe
                </p>
                <p className="text-sm text-zinc-700">
                  {bufalo.idMae ? "Registrada" : "Não informada"}
                </p>
              </div>
            </div>
          </div>
        </Container>

        {/* Timestamps */}
        <div className="text-xs text-zinc-400 flex flex-col gap-1 px-1">
          <span>
            Criado em:{" "}
            {new Date(bufalo.createdAt).toLocaleString("pt-BR")}
          </span>
          <span>
            Atualizado em:{" "}
            {new Date(bufalo.updatedAt).toLocaleString("pt-BR")}
          </span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/proprietario/rebanho/prontuario/ResumoGeralTab.tsx
git commit -m "feat: add ResumoGeralTab component for buffalo prontuario"
```

---

## Task 3: Criar `LocalizacaoTab`

**Files:**
- Create: `src/components/proprietario/rebanho/prontuario/LocalizacaoTab.tsx`

- [ ] **Step 1: Criar o arquivo com todo o conteúdo**

Crie `src/components/proprietario/rebanho/prontuario/LocalizacaoTab.tsx`:

```tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import type { Map as LeafletMap } from "leaflet";
import { useMap } from "react-leaflet";
import { MapPin, Plus, Minus, Focus } from "lucide-react";
import { useMovLoteStatusByGrupo } from "@/hooks/useMovLote";
import { useLotesByPropriedade } from "@/hooks/useLotes";
import { Lote } from "@/services/lotes.service";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);
const Polygon = dynamic(
  () => import("react-leaflet").then((m) => m.Polygon),
  { ssr: false },
);
const Tooltip = dynamic(
  () => import("react-leaflet").then((m) => m.Tooltip),
  { ssr: false },
);

function MapBoundsFitter({
  bounds,
}: {
  bounds: [[number, number], [number, number]] | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, bounds]);
  return null;
}

export interface LocalizacaoTabProps {
  idGrupo: string | null | undefined;
  idPropriedade: string;
  grupoNome: string | undefined;
  grupoColor: string | undefined;
}

export function LocalizacaoTab({
  idGrupo,
  idPropriedade,
  grupoNome,
  grupoColor,
}: LocalizacaoTabProps) {
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);

  useEffect(() => {
    void import("leaflet/dist/leaflet.css");
  }, []);

  const { data: statusGrupo, isLoading: isLoadingStatus } =
    useMovLoteStatusByGrupo(idGrupo ?? undefined, { enabled: !!idGrupo });

  const { data: lotes, isLoading: isLoadingLotes } = useLotesByPropriedade(
    idPropriedade,
    { enabled: !!idPropriedade },
  );

  const color = grupoColor ?? "#CE7D0A";

  const mapBounds = useMemo(() => {
    if (!lotes || lotes.length === 0) return null;
    const idLoteAtual = statusGrupo?.localizacaoAtual?.idLote;
    const targetLotes = idLoteAtual
      ? lotes.filter((l: Lote) => l.idLote === idLoteAtual)
      : lotes;

    let minLat = Infinity,
      maxLat = -Infinity,
      minLng = Infinity,
      maxLng = -Infinity;

    targetLotes.forEach((lote: Lote) => {
      if (!lote.geoMapa || lote.geoMapa.type !== "Polygon") return;
      (lote.geoMapa.coordinates as number[][][])[0].forEach(
        (coord: number[]) => {
          if (coord[1] < minLat) minLat = coord[1];
          if (coord[1] > maxLat) maxLat = coord[1];
          if (coord[0] < minLng) minLng = coord[0];
          if (coord[0] > maxLng) maxLng = coord[0];
        },
      );
    });

    if (minLat === Infinity) return null;
    return [
      [minLat, minLng],
      [maxLat, maxLng],
    ] as [[number, number], [number, number]];
  }, [lotes, statusGrupo]);

  const fallbackCenter: [number, number] = mapBounds
    ? mapBounds[0]
    : [-24.7366, -48.0673];

  if (!idGrupo) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2 text-zinc-400">
        <MapPin className="w-8 h-8" />
        <p className="text-sm font-medium">
          Este búfalo não está alocado em nenhum grupo.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-200 flex flex-col gap-4">
      <style>{`
        .leaflet-tooltip.piquete-label {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
          color: #ffffff;
          font-family: inherit;
          font-weight: 800;
          font-size: 16px;
          text-shadow:
            -1px -1px 2px rgba(0,0,0,0.8),
             1px -1px 2px rgba(0,0,0,0.8),
            -1px  1px 2px rgba(0,0,0,0.8),
             1px  1px 2px rgba(0,0,0,0.8);
        }
        .leaflet-tooltip.piquete-label::before { display: none; }
      `}</style>

      <div className="flex items-center gap-2 text-sm bg-zinc-50 p-3 rounded-lg border border-zinc-100">
        <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
        <span className="font-medium text-zinc-600">
          {isLoadingStatus
            ? "Carregando localização..."
            : statusGrupo?.localizacaoAtual
            ? `Grupo ${grupoNome ?? idGrupo} — ${statusGrupo.localizacaoAtual.diasNoLocal} dia(s) neste piquete`
            : "Grupo sem alocação registrada."}
        </span>
      </div>

      <div className="h-[60vh] min-h-[400px] w-full rounded-xl overflow-hidden border border-zinc-200 relative bg-zinc-100 shadow-inner">
        {/* Controles do mapa */}
        <div className="absolute bottom-6 right-6 z-[400] flex flex-col gap-3">
          <button
            onClick={() =>
              mapBounds &&
              mapInstance?.fitBounds(mapBounds, { padding: [40, 40] })
            }
            className="w-10 h-10 bg-white flex items-center justify-center rounded-xl shadow-lg border border-zinc-200 text-zinc-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all focus:outline-none"
            title="Enquadrar piquete"
          >
            <Focus className="w-5 h-5" />
          </button>
          <div className="flex flex-col bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden divide-y divide-zinc-100">
            <button
              onClick={() => mapInstance?.zoomIn()}
              className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors focus:outline-none"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => mapInstance?.zoomOut()}
              className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors focus:outline-none"
            >
              <Minus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isLoadingLotes ? (
          <MapContainer
            center={fallbackCenter}
            zoom={15}
            style={{ height: "100%", width: "100%", zIndex: 10 }}
            scrollWheelZoom
            zoomControl={false}
            ref={setMapInstance}
          >
            <MapBoundsFitter bounds={mapBounds} />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            />
            {lotes?.map((lote: Lote, index: number) => {
              if (
                !lote.geoMapa ||
                lote.geoMapa.type !== "Polygon" ||
                !lote.geoMapa.coordinates
              )
                return null;

              const positions = (
                lote.geoMapa.coordinates as number[][][]
              )[0].map((c: number[]) => [c[1], c[0]] as [number, number]);

              const isCurrent =
                lote.idLote === statusGrupo?.localizacaoAtual?.idLote;
              const matchNumero = (lote.nomeLote ?? "").match(/\d+/);
              const shortName = matchNumero
                ? `P${matchNumero[0]}`
                : `P${index + 1}`;

              return (
                <Polygon
                  key={lote.idLote}
                  positions={positions}
                  pathOptions={{
                    color: isCurrent ? color : "#a1a1aa",
                    fillColor: isCurrent ? color : "#a1a1aa",
                    fillOpacity: isCurrent ? 0.4 : 0.12,
                    weight: isCurrent ? 3 : 1,
                  }}
                >
                  <Tooltip
                    permanent
                    direction="center"
                    className="piquete-label"
                  >
                    {shortName}
                  </Tooltip>
                </Polygon>
              );
            })}
          </MapContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center animate-pulse bg-zinc-200">
            <span className="text-zinc-500 font-medium text-sm">
              Carregando mapa satélite...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/proprietario/rebanho/prontuario/LocalizacaoTab.tsx
git commit -m "feat: add LocalizacaoTab with Leaflet map for buffalo prontuario"
```

---

## Task 4: Criar a página de prontuário

**Files:**
- Create: `src/app/[locale]/(buffs)/proprietario/rebanho/[id]/page.tsx`

- [ ] **Step 1: Criar o arquivo da página**

Crie `src/app/[locale]/(buffs)/proprietario/rebanho/[id]/page.tsx`:

```tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { ArrowLeft, Printer, Edit } from "lucide-react";

import Container from "@/components/ui/Container";
import TabNav from "@/components/ui/TabNav";
import { useBufalo } from "@/hooks/useBufalos";
import { useGruposById } from "@/hooks/useGrupos";
import { usePropriedadeStore } from "@/stores/propriedade.store";
import { ResumoGeralTab } from "@/components/proprietario/rebanho/prontuario/ResumoGeralTab";
import { LocalizacaoTab } from "@/components/proprietario/rebanho/prontuario/LocalizacaoTab";

const TABS = [
  { key: "resumo-geral", label: "Resumo Geral" },
  { key: "localizacao", label: "Localização" },
  { key: "genealogia", label: "Genealogia" },
  { key: "sanitario", label: "Sanitário" },
  { key: "zootecnico", label: "Zootécnico" },
];

function getInitials(nome: string): string {
  const parts = nome.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return nome.slice(0, 2).toUpperCase();
}

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-zinc-400 gap-2">
      <p className="text-sm font-medium">
        Seção &ldquo;{label}&rdquo; em construção.
      </p>
    </div>
  );
}

export default function ProntuarioBufaloPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = React.use(params);
  const [activeTab, setActiveTab] = useState("resumo-geral");

  const { activePropriedade } = usePropriedadeStore();
  const { data: bufalo, isLoading } = useBufalo(id);
  const { data: grupo } = useGruposById(bufalo?.idGrupo ?? undefined, {
    enabled: !!bufalo?.idGrupo,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-400 text-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
          <span>Carregando prontuário...</span>
        </div>
      </div>
    );
  }

  if (!bufalo) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-400 text-sm">
        Búfalo não encontrado.
      </div>
    );
  }

  const initials = getInitials(bufalo.nome);

  return (
    <div className="flex flex-col gap-4 pb-10">
      {/* Botão voltar */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-[var(--color-primary-dark)] transition-colors ml-1 w-fit"
      >
        <ArrowLeft className="w-3 h-3" />
        Voltar para o Rebanho
      </button>

      {/* Header */}
      <Container className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar com iniciais */}
            <div className="w-14 h-14 rounded-full bg-[#CE7D0A] flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white font-black text-lg tracking-tight">
                {initials}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-zinc-900">
                  {bufalo.nome}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border ${
                    bufalo.status
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-zinc-100 text-zinc-500 border-zinc-200"
                  }`}
                >
                  {bufalo.status ? "Ativo" : "Inativo"}
                </span>
                {bufalo.categoria && (
                  <span className="px-2 py-0.5 rounded bg-[#CE7D0A]/10 text-[#CE7D0A] border border-[#CE7D0A]/30 text-[10px] font-black uppercase tracking-tighter">
                    {bufalo.categoria}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500 flex-wrap">
                <span>Brinco: {bufalo.brinco}</span>
                {grupo && (
                  <>
                    <span>·</span>
                    <span>Grupo: {grupo.nomeGrupo}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Botões de ação (desabilitados por ora) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              disabled
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-400 text-xs font-bold cursor-not-allowed"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
            <button
              disabled
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-400 text-xs font-bold cursor-not-allowed"
            >
              <Edit className="w-3.5 h-3.5" />
              Editar
            </button>
          </div>
        </div>
      </Container>

      {/* Abas */}
      <Container className="pt-2 px-6 pb-0">
        <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      </Container>

      {/* Conteúdo das abas */}
      <div>
        {activeTab === "resumo-geral" && (
          <ResumoGeralTab
            bufalo={bufalo}
            grupoNome={grupo?.nomeGrupo}
            propriedadeNome={activePropriedade?.nome}
          />
        )}
        {activeTab === "localizacao" && (
          <LocalizacaoTab
            idGrupo={bufalo.idGrupo}
            idPropriedade={bufalo.idPropriedade}
            grupoNome={grupo?.nomeGrupo}
            grupoColor={grupo?.color}
          />
        )}
        {activeTab === "genealogia" && (
          <PlaceholderTab label="Genealogia" />
        )}
        {activeTab === "sanitario" && (
          <PlaceholderTab label="Sanitário" />
        )}
        {activeTab === "zootecnico" && (
          <PlaceholderTab label="Zootécnico" />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar no browser**

Com o dev server rodando, abra a tela de rebanho, clique em um búfalo e confirme:
- Navega para `/proprietario/rebanho/<id>`
- Header exibe nome, iniciais, badges de status e categoria
- Aba "Resumo Geral" mostra os dados de identificação e manejo
- Aba "Localização" exibe o mapa com os piquetes
- Abas "Genealogia", "Sanitário" e "Zootécnico" mostram o placeholder
- Botão "Voltar para o Rebanho" retorna à listagem

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/\(buffs\)/proprietario/rebanho/\[id\]/page.tsx
git commit -m "feat: add buffalo prontuario page with tabs and location map"
```
