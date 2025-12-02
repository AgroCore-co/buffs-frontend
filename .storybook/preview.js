import React from 'react';
import '../src/styles/globals.css';

// Mock Next.js Link component for Storybook
const MockLink = ({ href, children, className, passHref, ...props }) => {
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  );
};

// Make React globally available
if (typeof window !== 'undefined') {
  window.React = React;
}

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#333333',
        },
        {
          name: 'gray',
          value: '#f3f4f6',
        },
      ],
    },
    nextjs: {
      appDirectory: true,
    },
  },
};

export default preview;
