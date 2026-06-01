"use client";

import { useTranslations } from "next-intl";
import { FilterBar } from "@/components/ui/FilterBar";
import { FiltroAvancadoParams, SexoBufalo, NivelMaturidade } from "@/services/bufalos.service";

interface BufalosFilterBarProps {
  onFilterChange: (params: FiltroAvancadoParams, hasFilters: boolean) => void;
  className?: string;
}

export function BufalosFilterBar({ onFilterChange, className }: BufalosFilterBarProps) {
  const t = useTranslations('RebanhoPage.filterBar');

  const BUFALO_FILTERS = [
    { type: "text" as const, key: "brinco", placeholder: t('searchTag') },
    {
      type: "select" as const,
      key: "sexo",
      placeholder: t('sex'),
      options: [
        { value: "M", label: t('male') },
        { value: "F", label: t('female') },
      ],
    },
    {
      type: "select" as const,
      key: "nivelMaturidade",
      placeholder: t('maturity'),
      options: [
        { value: "B", label: t('calf') },
        { value: "N", label: t('heifer') },
        { value: "V", label: t('cow') },
        { value: "T", label: t('bull') },
      ],
    },
    {
      type: "select" as const,
      key: "status",
      placeholder: t('status'),
      options: [
        { value: "true", label: t('active') },
        { value: "false", label: t('inactive') },
      ],
    },
  ];

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
