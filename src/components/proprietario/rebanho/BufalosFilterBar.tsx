"use client";

import { FilterBar } from "@/components/ui/FilterBar";
import { FiltroAvancadoParams, SexoBufalo, NivelMaturidade } from "@/services/bufalos.service";

interface BufalosFilterBarProps {
  onFilterChange: (params: FiltroAvancadoParams, hasFilters: boolean) => void;
  className?: string;
}

const BUFALO_FILTERS = [
  { type: "text" as const, key: "brinco", placeholder: "Buscar brinco..." },
  {
    type: "select" as const,
    key: "sexo",
    placeholder: "Sexo",
    options: [
      { value: "M", label: "Macho" },
      { value: "F", label: "Fêmea" },
    ],
  },
  {
    type: "select" as const,
    key: "nivelMaturidade",
    placeholder: "Maturidade",
    options: [
      { value: "B", label: "Bezerro" },
      { value: "N", label: "Novilha" },
      { value: "V", label: "Vaca" },
      { value: "T", label: "Touro" },
    ],
  },
  {
    type: "select" as const,
    key: "status",
    placeholder: "Status",
    options: [
      { value: "true", label: "Ativo" },
      { value: "false", label: "Inativo" },
    ],
  },
];

export function BufalosFilterBar({ onFilterChange, className }: BufalosFilterBarProps) {
  const handleChange = (raw: Record<string, string>, hasFilters: boolean) => {
    const params: FiltroAvancadoParams = {
      ...(raw.sexo && { sexo: raw.sexo as SexoBufalo }),
      ...(raw.nivelMaturidade && { nivelMaturidade: raw.nivelMaturidade as NivelMaturidade }),
      ...(raw.status && { status: raw.status === "true" }),
      ...(raw.brinco && { brinco: raw.brinco }),
    };
    onFilterChange(params, hasFilters);
  };

  return <FilterBar filters={BUFALO_FILTERS} onFilterChange={handleChange} className={className} />;
}
