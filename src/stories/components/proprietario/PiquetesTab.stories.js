import React from 'react';
import PiquetesTab from '@/components/proprietario/propriedade/PiquetesTab';

const meta = {
  title: 'Proprietário/Propriedade/PiquetesTab',
  component: PiquetesTab,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

const mockGrupos = [
  {
    id_grupo: 1,
    nome_grupo: 'Grupo A',
    color: '#FF6B6B',
    nivel_maturidade: 'adulto',
  },
  {
    id_grupo: 2,
    nome_grupo: 'Grupo B',
    color: '#4ECDC4',
    nivel_maturidade: 'jovem',
  },
];

const mockNivelLabel = (nivel) => {
  const labels = {
    adulto: 'Adulto',
    jovem: 'Jovem',
    filhote: 'Filhote',
  };
  return labels[nivel] || nivel;
};

export const Default = {
  args: {
    grupos: mockGrupos,
    nivelLabel: mockNivelLabel,
  },
};

export const WithManyGroups = {
  args: {
    grupos: [
      ...mockGrupos,
      {
        id_grupo: 3,
        nome_grupo: 'Grupo C',
        color: '#95E1D3',
        nivel_maturidade: 'filhote',
      },
      {
        id_grupo: 4,
        nome_grupo: 'Grupo D',
        color: '#F38181',
        nivel_maturidade: 'adulto',
      },
    ],
    nivelLabel: mockNivelLabel,
  },
};
