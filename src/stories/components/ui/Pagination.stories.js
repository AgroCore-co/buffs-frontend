import React from 'react';
import Pagination from '@/components/ui/Pagination';
import { useState } from 'react';

const meta = {
  title: 'UI/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    currentPage: {
      control: 'number',
      description: 'Página atual',
    },
    totalPages: {
      control: 'number',
      description: 'Total de páginas',
    },
    showNumbers: {
      control: 'boolean',
      description: 'Exibe botões numerados',
    },
  },
};

export default meta;

export const Default = {
  args: {
    currentPage: 1,
    totalPages: 10,
    showNumbers: true,
  },
};

export const FewPages = {
  args: {
    currentPage: 2,
    totalPages: 5,
    showNumbers: true,
  },
};

export const ManyPages = {
  args: {
    currentPage: 15,
    totalPages: 50,
    showNumbers: true,
  },
};

export const WithoutNumbers = {
  args: {
    currentPage: 3,
    totalPages: 10,
    showNumbers: false,
  },
};

export const FirstPage = {
  args: {
    currentPage: 1,
    totalPages: 10,
    showNumbers: true,
  },
};

export const LastPage = {
  args: {
    currentPage: 10,
    totalPages: 10,
    showNumbers: true,
  },
};

const InteractiveRender = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 20;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
      <div style={{ 
        padding: '2rem', 
        backgroundColor: '#f3f4f6', 
        borderRadius: '0.5rem',
        minWidth: '400px',
        textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: '1rem' }}>
          Página {currentPage} de {totalPages}
        </h3>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Clique nos botões para navegar entre as páginas
        </p>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        showNumbers={true}
      />
    </div>
  );
};

export const Interactive = {
  render: InteractiveRender,
};

export const CustomVariants = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
          Variantes padrão (report/primary)
        </p>
        <Pagination
          currentPage={3}
          totalPages={10}
          showNumbers={true}
          navVariant="report"
          numberVariant="report"
          activeNumberVariant="primary"
        />
      </div>
      <div>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
          Variantes secundárias
        </p>
        <Pagination
          currentPage={5}
          totalPages={10}
          showNumbers={true}
          navVariant="secondary"
          numberVariant="outline"
          activeNumberVariant="secondary"
        />
      </div>
      <div>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
          Variantes info
        </p>
        <Pagination
          currentPage={7}
          totalPages={10}
          showNumbers={true}
          navVariant="info"
          numberVariant="outline"
          activeNumberVariant="info"
        />
      </div>
    </div>
  ),
};
