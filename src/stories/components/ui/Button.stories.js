import React from 'react';
import Button from '@/components/ui/Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'success', 'danger', 'info', 'report'],
      description: 'Variante visual do botão',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large', 'full'],
      description: 'Tamanho do botão',
    },
    loading: {
      control: 'boolean',
      description: 'Exibe indicador de carregamento',
    },
    disabled: {
      control: 'boolean',
      description: 'Desabilita o botão',
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'Tipo HTML do botão',
    },
  },
};

export default meta;

export const Primary = {
  args: {
    children: 'Botão Primary',
    variant: 'primary',
    size: 'medium',
  },
};

export const Secondary = {
  args: {
    children: 'Botão Secondary',
    variant: 'secondary',
    size: 'medium',
  },
};

export const Outline = {
  args: {
    children: 'Botão Outline',
    variant: 'outline',
    size: 'medium',
  },
};

export const Success = {
  args: {
    children: 'Botão Success',
    variant: 'success',
    size: 'medium',
  },
};

export const Danger = {
  args: {
    children: 'Botão Danger',
    variant: 'danger',
    size: 'medium',
  },
};

export const Info = {
  args: {
    children: 'Botão Info',
    variant: 'info',
    size: 'medium',
  },
};

export const Report = {
  args: {
    children: 'Botão Report',
    variant: 'report',
    size: 'medium',
  },
};

export const Small = {
  args: {
    children: 'Botão Pequeno',
    variant: 'primary',
    size: 'small',
  },
};

export const Large = {
  args: {
    children: 'Botão Grande',
    variant: 'primary',
    size: 'large',
  },
};

export const FullWidth = {
  args: {
    children: 'Botão Largura Total',
    variant: 'primary',
    size: 'full',
  },
  parameters: {
    layout: 'padded',
  },
};

export const Loading = {
  args: {
    children: 'Carregando...',
    variant: 'primary',
    size: 'medium',
    loading: true,
  },
};

export const Disabled = {
  args: {
    children: 'Botão Desabilitado',
    variant: 'primary',
    size: 'medium',
    disabled: true,
  },
};

export const AllVariants = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="success">Success</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="info">Info</Button>
      <Button variant="report">Report</Button>
    </div>
  ),
};

export const AllSizes = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
      <Button variant="primary" size="small">Small</Button>
      <Button variant="primary" size="medium">Medium</Button>
      <Button variant="primary" size="large">Large</Button>
    </div>
  ),
};
