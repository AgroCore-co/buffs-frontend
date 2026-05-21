"use client";

import TabNav from "@/components/ui/TabNav";
import { BufaloPaginatedResponse } from "@/services/bufalos.service";

interface DetailsGrupoTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  bufalosData: BufaloPaginatedResponse | null;
  className?: string;
}

export function DetailsGrupoTabs({ activeTab, onTabChange, bufalosData, className }: DetailsGrupoTabsProps) {
  return (
    <TabNav
      tabs={[
        { key: "visao-geral", label: "Visão Geral" },
        { key: "mapa", label: "Localização no Mapa" },
        {
          key: "animais",
          label:
            bufalosData?.meta?.total !== undefined
              ? `Búfalos (${bufalosData.meta.total})`
              : "Búfalos",
        },
        { key: "historico", label: "Movimentação" },
      ]}
      activeTab={activeTab}
      onTabChange={onTabChange}
      className={className}
    />
  );
}
