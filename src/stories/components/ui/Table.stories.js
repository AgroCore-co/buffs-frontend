import React from 'react';
import Table from '@/components/table/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Edit, Trash2 } from 'lucide-react';

const meta = {
  title: 'UI/Table',
  component: Table,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

const sampleColumns = [
  { key: 'id', label: 'ID', className: 'text-left' },
  { key: 'nome', label: 'Nome', className: 'text-left' },
  { key: 'tipo', label: 'Tipo', className: 'text-left' },
  { key: 'status', label: 'Status', className: 'text-center' },
  { key: 'acoes', label: 'Ações', className: 'text-right' },
];

const sampleData = [
  { id: 1, nome: 'Fazenda Boa Vista', tipo: 'Propriedade', status: 'active' },
  { id: 2, nome: 'Fazenda Santa Maria', tipo: 'Propriedade', status: 'active' },
  { id: 3, nome: 'Sítio Primavera', tipo: 'Propriedade', status: 'inactive' },
  { id: 4, nome: 'Rancho Alegre', tipo: 'Propriedade', status: 'active' },
];

export const Default = {
  args: {
    columns: sampleColumns,
    data: sampleData,
  },
};

export const WithCustomRender = {
  args: {
    columns: sampleColumns,
    data: sampleData,
    renderCell: (row, colKey) => {
      if (colKey === 'status') {
        return <Badge type={row.status}>{row.status === 'active' ? 'Ativo' : 'Inativo'}</Badge>;
      }
      if (colKey === 'acoes') {
        return (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button variant="info" size="small">
              <Edit size={16} />
            </Button>
            <Button variant="danger" size="small">
              <Trash2 size={16} />
            </Button>
          </div>
        );
      }
      return row[colKey];
    },
  },
};

export const EmptyState = {
  args: {
    columns: sampleColumns,
    data: [],
  },
};

export const LargeDataset = {
  args: {
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'animal', label: 'Animal' },
      { key: 'raca', label: 'Raça' },
      { key: 'peso', label: 'Peso (kg)' },
      { key: 'idade', label: 'Idade' },
      { key: 'status', label: 'Status', className: 'text-center' },
    ],
    data: Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      animal: `Animal ${String(i + 1).padStart(4, '0')}`,
      raca: ['Nelore', 'Angus', 'Brahman', 'Hereford'][i % 4],
      peso: Math.floor(Math.random() * 200 + 300),
      idade: `${Math.floor(Math.random() * 5 + 1)} anos`,
      status: i % 3 === 0 ? 'inactive' : 'active',
    })),
    renderCell: (row, colKey) => {
      if (colKey === 'status') {
        return <Badge type={row.status}>{row.status === 'active' ? 'Ativo' : 'Inativo'}</Badge>;
      }
      return row[colKey];
    },
  },
};

export const SimpleColumns = {
  args: {
    columns: [
      { key: 'nome', label: 'Nome' },
      { key: 'email', label: 'E-mail' },
      { key: 'funcao', label: 'Função' },
    ],
    data: [
      { id: 1, nome: 'João Silva', email: 'joao@example.com', funcao: 'Veterinário' },
      { id: 2, nome: 'Maria Santos', email: 'maria@example.com', funcao: 'Gerente' },
      { id: 3, nome: 'Pedro Oliveira', email: 'pedro@example.com', funcao: 'Funcionário' },
    ],
  },
};
