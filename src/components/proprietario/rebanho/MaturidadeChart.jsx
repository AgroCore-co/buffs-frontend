import React from 'react';
import DashboardContainer from '@/components/ui/DashboardContainer';

export default function MaturidadeChart({ data }) {
  return (
    // Adicionado 'flex flex-col h-full' para o container ocupar a altura e organizar verticalmente
    <DashboardContainer className="p-6 flex flex-col h-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 shrink-0">
        Distribuição por Maturidade
      </h2>

      {/* Alterado:
        - 'flex-1': Ocupa todo o espaço vertical restante abaixo do título
        - Removido 'h-[250px]': Agora a altura é dinâmica baseada no pai
        - Removido 'content-center': Para que os itens estiquem (stretch)
      */}
      <div className="grid grid-cols-2 gap-4 flex-1 w-full">
        {data.map((item, index) => (
          <div
            key={index}
            // Adicionado 'h-full w-full' para o card preencher a célula da grid
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 border border-gray-100 hover:shadow-sm transition-shadow h-full w-full"
          >
            <span className="text-5xl font-bold" style={{ color: item.color }}>
              {item.value}
            </span>
            <span className="text-base font-semibold text-gray-600 text-center mt-2">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </DashboardContainer>
  );
}
