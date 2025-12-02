const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Caminho para o app Next.js
  dir: './',
});

const customJestConfig = {
  // Setup para execução antes dos testes
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Ambiente de teste
  testEnvironment: 'jest-environment-jsdom',

  // Padrões de arquivos de teste
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],

  // Arquivos e pastas ignorados
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/out/',
    '<rootDir>/storybook-static/',
  ],

  // Mapeamento de módulos
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Cobertura de código
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/stories/**',
  ],

  // Transformações
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
};

module.exports = createJestConfig(customJestConfig);
