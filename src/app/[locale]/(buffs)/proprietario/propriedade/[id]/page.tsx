"use client";

import React, { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

// Importação dos novos hooks singulares
import { usePropriedade } from "@/hooks/usePropriedades";
import { useEndereco } from "@/hooks/useEnderecos";
import { useUsuario } from "@/hooks/useUsuarios";

import Container from "@/components/ui/Container";
import TabNav from "@/components/ui/TabNav";

import { ArrowLeft, MapPin, Building2, Calendar, Printer, Edit } from "lucide-react";

// Importação das Abas (Tabs)
import VisaoGeralTab from "@/components/proprietario/propriedades/tabs/VIsaoGeralTab";
import MapaPiquetes from "@/components/proprietario/propriedades/MapaPiquetes";
import GruposTab from "@/components/proprietario/propriedades/tabs/GruposTab";
import EquipeTab from "@/components/proprietario/propriedades/tabs/EquipeTab";
import AlimentacaoTab from "@/components/proprietario/propriedades/tabs/AlimentacaoTab";
import DataIngestionTab from "@/components/proprietario/propriedades/tabs/DataIngestionTab";

export default function PropriedadeDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const t = useTranslations("Proprietario.detalhes");
  const { id } = React.use(params);
  
  const [activeTab, setActiveTab] = useState("visao-geral");

  // Chamadas API (Em cascata usando os novos hooks separados)
  const { data: propriedade } = usePropriedade(id);
  const { data: endereco } = useEndereco(propriedade?.idEndereco);
  const { data: dono } = useUsuario(propriedade?.idDono);

  // Dados vindos da API (sem fallback mock)
  const dadosCadastrais = propriedade
    ? {
        ...propriedade,
        nome: propriedade.nome || "",
        manejo: propriedade.tipoManejo || "",
        localizacao: endereco ? `${endereco.cidade} - ${endereco.estado}` : "",
        atualizacao: propriedade.updatedAt || "",
        cnpj: propriedade.cnpj || "",
        tipoManejo: propriedade.tipoManejo || propriedade.tipo_manejo || "",
        nomeDono: dono?.nome || "",
        emailDono: dono?.email || "",
        enderecoCompleto: endereco ? `${endereco.rua}, ${endereco.bairro}` : "",
        cep: endereco?.cep || "",
      }
    : {};

  return (
    <div className="flex flex-col gap-4">
      {/* Botão Voltar */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-[var(--color-primary-dark)] transition-colors ml-1 w-fit"
      >
        <ArrowLeft className="w-3 h-3" />
        {t("back")}
      </button>

      {/* Header Principal da Propriedade */}
      <Container className="p-5 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--color-primary-light)]/20 border border-[var(--color-primary-light)]/40 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[var(--color-primary-dark)]" strokeWidth={1.5} />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-foreground tracking-tight uppercase">
                  {dadosCadastrais.nome}
                </h1>
                <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-black text-muted-foreground uppercase tracking-tighter border border-border">
                  {dadosCadastrais.manejo || dadosCadastrais.tipoManejo}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  {dadosCadastrais.localizacao}
                </div>
                <div className="w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {dadosCadastrais.atualizacao}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-lg text-foreground text-xs font-bold hover:bg-muted transition-colors shadow-sm">
              <Printer className="w-3.5 h-3.5" />
              {t("report")}
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-primary-dark)] rounded-lg text-[var(--color-text-light)] text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
            >
              <Edit className="w-3.5 h-3.5" />
              {t("edit")}
            </button>
          </div>
        </div>
      </Container>

      {/* Container das Abas e Conteúdo Dinâmico */}
      <Container className="pt-2 px-6 w-full min-w-0"> 
        <TabNav
          tabs={[
            { key: "visao-geral", label: "Visão Geral" },
            { key: "lotes", label: "Lotes e Piquetes" },
            { key: "grupos", label: "Grupos de Manejo" },
            { key: "equipe", label: "Equipe" },
            { key: "alimentacao", label: "Alimentação" },
            {key: "data-injestion", label: "Importação de dados"}

          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        {/* Renderização Condicional da Aba Ativa */}
        <div className="pt-6 pb-2">
          {activeTab === "visao-geral" && (
            <VisaoGeralTab dadosCadastrais={dadosCadastrais} />
          )}

          {activeTab === "grupos" && (
             <GruposTab idPropriedade={id} />
          )}
          
          {activeTab === "lotes" && (
            <div className="animate-in fade-in duration-500">
              <MapaPiquetes idPropriedade={id} />
            </div>
          )}


          {activeTab === "equipe" && (
            <div className="animate-in fade-in duration-500">
              <EquipeTab idPropriedade={id} />
            </div>
          )}

          {activeTab === "alimentacao" && (
            <div className="animate-in fade-in duration-500">
              <AlimentacaoTab idPropriedade={id} />
            </div>
          )}

          {activeTab === "data-injestion" && (
            <div className="animate-in fade-in duration-500">
              <DataIngestionTab idPropriedade={id} />
            </div>
          )}

        

         
        </div>
      </Container>
    </div>
  );
}