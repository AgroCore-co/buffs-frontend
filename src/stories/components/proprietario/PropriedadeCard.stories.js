import React from 'react';
import PropriedadeCard from '@/components/proprietario/propriedades/PropriedadeCard';

const meta = {
  title: 'Proprietário/PropriedadeCard',
  component: PropriedadeCard,
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

const samplePropriedade = {
  id_propriedade: 'abc123',
  nome: 'Fazenda Boa Vista',
  cnpj: '12.345.678/0001-90',
  status: 'Ativa',
  tipo_manejo: 'P',
  p_abcb: true,
  updated_at: '2024-11-15T10:30:00Z',
  endereco: {
    bairro: 'Centro',
    cidade: 'Campinas',
    estado: 'SP',
  },
  dono: {
    nome: 'João Silva',
  },
};

export const Default = {
  args: {
    propriedade: samplePropriedade,
    onEditar: (prop) => alert(`Editar: ${prop.nome}`),
    onDeletar: (prop) => alert(`Deletar: ${prop.nome}`),
  },
};

export const Inactive = {
  args: {
    propriedade: {
      ...samplePropriedade,
      status: 'Inativa',
      nome: 'Fazenda Desativada',
    },
    onEditar: (prop) => alert(`Editar: ${prop.nome}`),
    onDeletar: (prop) => alert(`Deletar: ${prop.nome}`),
  },
};

export const WithoutABCB = {
  args: {
    propriedade: {
      ...samplePropriedade,
      p_abcb: false,
      nome: 'Sítio Primavera',
    },
    onEditar: (prop) => alert(`Editar: ${prop.nome}`),
    onDeletar: (prop) => alert(`Deletar: ${prop.nome}`),
  },
};

export const ExtensiveManagement = {
  args: {
    propriedade: {
      ...samplePropriedade,
      tipo_manejo: 'E',
      nome: 'Rancho Extensivo',
    },
    onEditar: (prop) => alert(`Editar: ${prop.nome}`),
    onDeletar: (prop) => alert(`Deletar: ${prop.nome}`),
  },
};

export const IntensiveManagement = {
  args: {
    propriedade: {
      ...samplePropriedade,
      tipo_manejo: 'I',
      nome: 'Fazenda Intensiva',
    },
    onEditar: (prop) => alert(`Editar: ${prop.nome}`),
    onDeletar: (prop) => alert(`Deletar: ${prop.nome}`),
  },
};

export const WithoutAddress = {
  args: {
    propriedade: {
      ...samplePropriedade,
      endereco: null,
      nome: 'Propriedade sem Endereço',
    },
    onEditar: (prop) => alert(`Editar: ${prop.nome}`),
    onDeletar: (prop) => alert(`Deletar: ${prop.nome}`),
  },
};

export const WithoutOwner = {
  args: {
    propriedade: {
      ...samplePropriedade,
      dono: null,
      nome: 'Propriedade sem Dono',
    },
    onEditar: (prop) => alert(`Editar: ${prop.nome}`),
    onDeletar: (prop) => alert(`Deletar: ${prop.nome}`),
  },
};

export const MultipleCards = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1rem',
      }}
    >
      <PropriedadeCard
        propriedade={{
          ...samplePropriedade,
          id_propriedade: '1',
          nome: 'Fazenda Boa Vista',
        }}
        onEditar={(prop) => alert(`Editar: ${prop.nome}`)}
        onDeletar={(prop) => alert(`Deletar: ${prop.nome}`)}
      />
      <PropriedadeCard
        propriedade={{
          ...samplePropriedade,
          id_propriedade: '2',
          nome: 'Fazenda Santa Maria',
          status: 'Inativa',
          tipo_manejo: 'E',
        }}
        onEditar={(prop) => alert(`Editar: ${prop.nome}`)}
        onDeletar={(prop) => alert(`Deletar: ${prop.nome}`)}
      />
      <PropriedadeCard
        propriedade={{
          ...samplePropriedade,
          id_propriedade: '3',
          nome: 'Sítio Primavera',
          p_abcb: false,
          tipo_manejo: 'I',
        }}
        onEditar={(prop) => alert(`Editar: ${prop.nome}`)}
        onDeletar={(prop) => alert(`Deletar: ${prop.nome}`)}
      />
    </div>
  ),
};
