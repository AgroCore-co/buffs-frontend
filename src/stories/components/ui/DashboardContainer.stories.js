import React from 'react';
import DashboardContainer from '@/components/ui/DashboardContainer';

const meta = {
  title: 'UI/DashboardContainer',
  component: DashboardContainer,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  args: {
    children: (
      <div>
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
          }}
        >
          Título do Dashboard
        </h2>
        <p style={{ color: '#6b7280' }}>
          Este é um exemplo de conteúdo dentro do DashboardContainer.
        </p>
      </div>
    ),
  },
};

export const WithMultipleElements = {
  args: {
    children: (
      <>
        <div>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
            }}
          >
            Resumo do Rebanho
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Visualização geral dos animais cadastrados
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                fontWeight: '600',
              }}
            >
              TOTAL
            </p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>1.234</p>
          </div>
          <div>
            <p
              style={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                fontWeight: '600',
              }}
            >
              MACHOS
            </p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>589</p>
          </div>
          <div>
            <p
              style={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                fontWeight: '600',
              }}
            >
              FÊMEAS
            </p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>645</p>
          </div>
        </div>
      </>
    ),
  },
};

export const EmptyState = {
  args: {
    children: (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</p>
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
          }}
        >
          Nenhum dado disponível
        </h3>
        <p style={{ color: '#6b7280' }}>
          Adicione informações para visualizar o dashboard
        </p>
      </div>
    ),
  },
};
