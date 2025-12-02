import React from 'react';
import Badge from '@/components/ui/Badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['active', 'inactive', 'info'],
      description: 'Tipo/estilo do badge',
    },
    children: {
      control: 'text',
      description: 'Conteúdo do badge',
    },
  },
};

export default meta;

export const Active = {
  args: {
    type: 'active',
    children: 'Ativo',
  },
};

export const Inactive = {
  args: {
    type: 'inactive',
    children: 'Inativo',
  },
};

export const Info = {
  args: {
    type: 'info',
    children: 'Info',
  },
};

export const AllTypes = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Badge type="active">Ativo</Badge>
      <Badge type="inactive">Inativo</Badge>
      <Badge type="info">Info</Badge>
    </div>
  ),
};

export const StatusExamples = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span>Propriedade:</span>
        <Badge type="active">Disponível</Badge>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span>Piquete:</span>
        <Badge type="inactive">Em Manutenção</Badge>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span>Animal:</span>
        <Badge type="info">Em Observação</Badge>
      </div>
    </div>
  ),
};
