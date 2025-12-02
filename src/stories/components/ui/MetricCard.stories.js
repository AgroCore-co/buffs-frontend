import React from 'react';
import MetricCard from '@/components/ui/MetricCard';
import { TrendingUp, Users, MapPin, Beef } from 'lucide-react';

const meta = {
  title: 'UI/MetricCard',
  component: MetricCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Título da métrica',
    },
    value: {
      control: 'text',
      description: 'Valor principal da métrica',
    },
    subtitle: {
      control: 'text',
      description: 'Subtítulo/descrição adicional',
    },
  },
};

export default meta;

export const Default = {
  args: {
    title: 'Total de Animais',
    value: '1.234',
    subtitle: 'Ativos no rebanho',
    icon: '🐄',
  },
};

export const WithLucideIcon = {
  args: {
    title: 'Propriedades',
    value: '12',
    subtitle: 'Cadastradas no sistema',
    icon: <MapPin size={16} />,
  },
};

export const AllExamples = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
      <MetricCard
        title="Total de Animais"
        value="1.234"
        subtitle="Ativos no rebanho"
        icon={<Beef size={16} />}
      />
      <MetricCard
        title="Propriedades"
        value="12"
        subtitle="Cadastradas no sistema"
        icon={<MapPin size={16} />}
      />
      <MetricCard
        title="Funcionários"
        value="48"
        subtitle="Equipe ativa"
        icon={<Users size={16} />}
      />
      <MetricCard
        title="Crescimento"
        value="+15%"
        subtitle="Últimos 30 dias"
        icon={<TrendingUp size={16} />}
      />
    </div>
  ),
};

export const LargeNumbers = {
  args: {
    title: 'Produção Anual',
    value: '125.480',
    subtitle: 'Kg de carne produzida',
    icon: '📊',
  },
};

export const Percentage = {
  args: {
    title: 'Taxa de Ocupação',
    value: '87%',
    subtitle: 'Dos piquetes utilizados',
    icon: '📈',
  },
};
