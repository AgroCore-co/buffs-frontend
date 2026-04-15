"use client";

import { useRouter } from "@/i18n/routing"; // Import correto para next-intl
import Container from "@/components/ui/Container";
import MetricCard from "@/components/ui/MetricCard";
import PropriedadeCard from "@/components/proprietario/propriedades/PropriedadeCard";
import { Map, CheckCircle, Tractor, Award, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Mock de dados
const mockPropriedades = [
  {
    idPropriedade: "1",
    nome: "Fazenda Vale Búfalos",
    cnpj: "12.345.678/0001-90",
    status: "Ativa",
    pAbcb: true,
    tipoManejo: "P",
    updatedAt: "2026-04-14T10:30:00Z",
    endereco: { cidade: "Cajati", estado: "SP", bairro: "Zona Rural" },
    dono: { nome: "Vinicius" }
  },
  {
    idPropriedade: "2",
    nome: "Sítio Águas Claras",
    cnpj: "98.765.432/0001-10",
    status: "Ativa",
    pAbcb: false,
    tipoManejo: "E",
    updatedAt: "2026-04-12T14:15:00Z",
    endereco: { cidade: "Registro", estado: "SP", bairro: "Boa Vista" },
    dono: { nome: "Vinicius" }
  },
  {
    idPropriedade: "3",
    nome: "Estância Bubalina",
    cnpj: "45.678.901/0001-23",
    status: "Ativa",
    pAbcb: false,
    tipoManejo: "P",
    updatedAt: "2026-04-10T09:00:00Z",
    endereco: { cidade: "Jacupiranga", estado: "SP", bairro: "Rio Abaixo" },
    dono: { nome: "Vinicius" }
  }
];

export default function PropriedadesPageProprietario() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Container className="p-5">
        <div className="flex flex-col gap-4">
          

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-[#111827] tracking-tight uppercase leading-none">
                Gestão de Propriedades
              </h1>
              <p className="text-xs font-medium text-gray-400 mt-2 uppercase">
                Controle e monitore todas as unidades do seu negócio.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
            <MetricCard
              title="Total"
              value="3"
              subtitle="Propriedades"
              icon={<Map className="w-4 h-4" />}
            />
            <MetricCard
              title="Ativas"
              value="3"
              subtitle="Em operação"
              icon={<CheckCircle className="w-4 h-4" />}
            />
            <MetricCard
              title="Pecuária"
              value="2"
              subtitle="Foco bubalino"
              icon={<Tractor className="w-4 h-4" />}
            />
            <MetricCard
              title="Certificadas"
              value="1"
              subtitle="Padrão ABCB"
              icon={<Award className="w-4 h-4" />}
            />
          </div>
        </div>
      </Container>

      <Container className="p-5">
        <div className="mb-6">
          <h2 className="text-lg font-extrabold text-[#111827] tracking-tight uppercase">
            Propriedades Cadastradas
          </h2>
          <p className="text-[11px] font-bold text-gray-400 uppercase mt-1">
            {mockPropriedades.length} unidades encontradas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPropriedades.map((propriedade) => (
            <div
              key={propriedade.idPropriedade}
              onClick={() => router.push(`/proprietario/propriedade/${propriedade.idPropriedade}`)}
              className="cursor-pointer transition-transform active:scale-[0.98]"
            >
              <PropriedadeCard
                propriedade={propriedade}
                onEditar={(e, prop) => {
                  e.stopPropagation();
                  console.log("Editar:", prop.nome);
                }}
                onDeletar={(prop) => {
                  console.log("Deletar:", prop.nome);
                }}
              />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}