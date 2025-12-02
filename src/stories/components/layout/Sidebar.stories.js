import React from 'react';
import Sidebar from '@/components/layout/Sidebar';

const meta = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  render: () => (
    <div style={{ height: '100vh', display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '2rem', backgroundColor: '#f3f4f6' }}>
        <h2>Conteúdo Principal</h2>
        <p>A sidebar aparece à esquerda</p>
      </div>
    </div>
  ),
};

export const CollapsedView = {
  render: () => (
    <div style={{ height: '100vh', display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '2rem', backgroundColor: '#f3f4f6' }}>
        <h2>Sidebar Colapsada</h2>
        <p>Passe o mouse sobre a sidebar para expandir</p>
      </div>
    </div>
  ),
};
