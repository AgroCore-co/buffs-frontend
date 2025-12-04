import { useState } from 'react';
import DashboardContainer from '@/components/ui/DashboardContainer';
import MapaRotativoLeaflet from './piquetes/Mapa';
import Table from '@/components/table/Table';

export default function PiquetesTab({ grupos, nivelLabel }) {
  // Estado para lotes e modal (Mantido como original)
  const [lotes, setLotes] = useState([
    {
      id_lote: 1,
      nome_lote: 'Lote 1',
      status: 'ativo',
      qtd_max: 10,
      area_m2: 1000,
      grupo: grupos[0],
    },
    {
      id_lote: 2,
      nome_lote: 'Lote 2',
      status: 'ativo',
      qtd_max: 8,
      area_m2: 800,
      grupo: grupos[1],
    },
  ]);

  const columns = [
    { key: 'id_grupo', label: 'ID', className: 'text-center' },
    { key: 'nome_grupo', label: 'Nome', className: 'text-center' },
    { key: 'color', label: 'Cor', className: 'text-center' },
    { key: 'nivel_maturidade', label: 'Nível', className: 'text-center' },
    { key: 'created_at', label: 'Desde', className: 'text-center' },
    { key: 'dias_no_local', label: 'Dias no Local', className: 'text-center' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashboardContainer>
        <div className="w-full h-[600px] bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0">
            <MapaRotativoLeaflet />
          </div>
        </div>
      </DashboardContainer>

      <DashboardContainer>
        <h2 className="text-lg font-bold text-[#404040] mb-4">Grupos</h2>
        <Table
          columns={columns}
          data={grupos}
          minWidth="700px"
          renderCell={(grupo, key) => {
            if (key === 'color') {
              return (
                <span
                  className="inline-block w-4 h-4 rounded-full border border-gray-300 mx-auto"
                  style={{ backgroundColor: grupo.color || '#444444' }}
                ></span>
              );
            }
            if (key === 'nivel_maturidade') {
              return nivelLabel(grupo.nivel_maturidade);
            }
            if (key === 'created_at') {
              return grupo.created_at
                ? new Date(grupo.created_at).toLocaleDateString('pt-BR')
                : '-';
            }
            if (key === 'dias_no_local') {
              return grupo.dias_no_local ?? '-';
            }
            return grupo[key];
          }}
        />
      </DashboardContainer>
    </div>
  );
}
