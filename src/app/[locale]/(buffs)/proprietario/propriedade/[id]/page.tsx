"use client";

import React, { useState } from "react";
// Importamos o useRouter do seu arquivo de rotas para manter o suporte ao locale
import { useRouter } from "@/i18n/routing"; 
import Container from "@/components/ui/Container";
import { 
  ArrowLeft, 
  MapPin, 
  Building2, 
  Calendar, 
  Printer, 
  Edit 
} from "lucide-react";

export default function PropriedadeDetalhesPage({ params }: any) {
  const router = useRouter();
  const { id } = React.use(params);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const mockDetalhes = {
    nome: "TESTE PC 2",
    manejo: "PASTAGEM / EXTENSIVO",
    localizacao: "Cajati - SP",
    atualizacao: "09/03/2026",
  };

  return (
    <div className="flex flex-col gap-4 pb-10">
      {/* Botão Voltar agora utiliza router.back() para retornar à janela anterior */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-[#ce7d0a] transition-colors ml-1 w-fit"
      >
        <ArrowLeft className="w-3 h-3" />
        Voltar
      </button>

      <Container className="p-4 flex flex-col gap-4">
        {/* Header Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar Circular Slim */}
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#FEF3C7] border border-[#f5e3b5] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#ce7d0a]" strokeWidth={1.5} />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-extrabold text-[#111827] tracking-tight uppercase">
                  {mockDetalhes.nome}
                </h1>
                {/* Badge super slim */}
                <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[9px] font-black text-gray-500 uppercase tracking-tighter border border-gray-200">
                  {mockDetalhes.manejo}
                </span>
              </div>
              
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                  <MapPin className="w-3 h-3" />
                  {mockDetalhes.localizacao}
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-200" />
                <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                  <Calendar className="w-3 h-3" />
                  {mockDetalhes.atualizacao}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors">
              <Printer className="w-3.5 h-3.5" />
              Relatório
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#ce7d0a] rounded-lg text-white text-xs font-bold hover:bg-[#b06a08] transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Editar
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}