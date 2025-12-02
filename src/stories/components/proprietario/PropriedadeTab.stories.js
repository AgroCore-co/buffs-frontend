import React from 'react';
import PropriedadeTab from '@/components/proprietario/propriedade/PropriedadeTab';

const meta = {
  title: 'Proprietário/Propriedade/PropriedadeTab',
  component: PropriedadeTab,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

const mockDashboardStats = {
  qtd_macho_ativos: 245,
  qtd_femeas_ativas: 312,
  qtd_lotes: 8,
  qtd_usuarios: 15,
};

export const Default = {
  args: {
    dashboardStats: mockDashboardStats,
  },
};

export const SmallNumbers = {
  args: {
    dashboardStats: {
      qtd_macho_ativos: 12,
      qtd_femeas_ativas: 18,
      qtd_lotes: 2,
      qtd_usuarios: 3,
    },
  },
};

export const LargeNumbers = {
  args: {
    dashboardStats: {
      qtd_macho_ativos: 1543,
      qtd_femeas_ativas: 2187,
      qtd_lotes: 45,
      qtd_usuarios: 127,
    },
  },
};

export const ZeroValues = {
  args: {
    dashboardStats: {
      qtd_macho_ativos: 0,
      qtd_femeas_ativas: 0,
      qtd_lotes: 0,
      qtd_usuarios: 0,
    },
  },
};
