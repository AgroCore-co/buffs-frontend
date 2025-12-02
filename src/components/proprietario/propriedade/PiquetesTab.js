import { useState } from 'react';
import DashboardContainer from '@/components/ui/DashboardContainer';
import MapaRotativoLeaflet from './piquetes/Mapa';

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

  return (
    <DashboardContainer>
      <div className="w-full h-[600px] bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <MapaRotativoLeaflet />
        </div>
      </div>
    </DashboardContainer>
  );
}
