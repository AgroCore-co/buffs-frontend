import React from 'react';
import GruposTab from '@/components/proprietario/propriedade/GruposTab';

const meta = {
  title: 'Proprietário/Propriedade/GruposTab',
  component: GruposTab,
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
    created_at: '2024-01-15T10:00:00Z',
    dias_no_local: 45,
  },
  {
    id_grupo: 2,
    nome_grupo: 'Grupo B',
    color: '#4ECDC4',
    nivel_maturidade: 'jovem',
    created_at: '2024-02-20T14:30:00Z',
    dias_no_local: 30,
  },
  {
    id_grupo: 3,
    nome_grupo: 'Grupo C',
    color: '#95E1D3',
    nivel_maturidade: 'filhote',
    created_at: '2024-03-10T08:15:00Z',
    dias_no_local: 15,
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

export const EmptyState = {
  args: {
    grupos: [],
    nivelLabel: mockNivelLabel,
  },
};

export const SingleGroup = {
  args: {
    grupos: [mockGrupos[0]],
    nivelLabel: mockNivelLabel,
  },
};

export const ManyGroups = {
  args: {
    grupos: [
      ...mockGrupos,
      {
        id_grupo: 4,
        nome_grupo: 'Grupo D',
        color: '#F38181',
        nivel_maturidade: 'adulto',
        created_at: '2024-01-05T12:00:00Z',
        dias_no_local: 60,
      },
      {
        id_grupo: 5,
        nome_grupo: 'Grupo E',
        color: '#AA96DA',
        nivel_maturidade: 'jovem',
        created_at: '2024-02-28T16:45:00Z',
        dias_no_local: 25,
      },
    ],
    nivelLabel: mockNivelLabel,
  },
};
