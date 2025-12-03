import React from 'react';
import Loading from '@/components/loading/Loading';

const meta = {
  title: 'UI/Loading',
  component: Loading,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    text: {
      control: 'text',
      description: 'Texto de carregamento',
    },
  },
};

export default meta;

export const Default = {
  args: {
    text: 'Carregando painel...',
  },
};

export const CustomText = {
  args: {
    text: 'Processando dados...',
  },
};

export const LoadingData = {
  args: {
    text: 'Buscando informações...',
  },
};

export const InContainer = {
  render: () => (
    <div
      style={{
        width: '600px',
        height: '400px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
      }}
    >
      <Loading text="Carregando dashboard..." />
    </div>
  ),
};
