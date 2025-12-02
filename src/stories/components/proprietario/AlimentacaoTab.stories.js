import React from 'react';
import AlimentacaoTab from '@/components/proprietario/propriedade/AlimentacaoTab';

const meta = {
  title: 'Proprietário/Propriedade/AlimentacaoTab',
  component: AlimentacaoTab,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

const mockGrupos = [
  { id_grupo: 1, nome_grupo: 'Lote A' },
  { id_grupo: 2, nome_grupo: 'Lote B' },
  { id_grupo: 3, nome_grupo: 'Lote C' },
];

const mockAlimentacaoDefService = {};
const mockAlimentacaoRegistroService = {};

export const Default = {
  args: {
    alimentacaoDefService: mockAlimentacaoDefService,
    alimentacaoRegistroService: mockAlimentacaoRegistroService,
    grupos: mockGrupos,
    propriedadeId: 'prop-123',
  },
};

export const WithFewGroups = {
  args: {
    alimentacaoDefService: mockAlimentacaoDefService,
    alimentacaoRegistroService: mockAlimentacaoRegistroService,
    grupos: [mockGrupos[0]],
    propriedadeId: 'prop-123',
  },
};

export const WithManyGroups = {
  args: {
    alimentacaoDefService: mockAlimentacaoDefService,
    alimentacaoRegistroService: mockAlimentacaoRegistroService,
    grupos: [
      ...mockGrupos,
      { id_grupo: 4, nome_grupo: 'Lote D' },
      { id_grupo: 5, nome_grupo: 'Lote E' },
      { id_grupo: 6, nome_grupo: 'Lote F' },
    ],
    propriedadeId: 'prop-123',
  },
};
