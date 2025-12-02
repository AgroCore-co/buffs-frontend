import React from 'react';
import Header from '@/components/layout/Header';

const meta = {
  title: 'Layout/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  render: () => (
    <div style={{ minHeight: '100px' }}>
      <Header />
    </div>
  ),
};

export const InDarkBackground = {
  render: () => (
    <div style={{ minHeight: '100px', backgroundColor: '#1a1a1a' }}>
      <Header />
    </div>
  ),
};
