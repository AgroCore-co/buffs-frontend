// Configuração adicional do Jest
import '@testing-library/jest-dom';

// Mock do next/router
jest.mock('next/router', () => require('next-router-mock'));

// Mock do leaflet para testes
jest.mock('leaflet', () => ({
  map: jest.fn(),
  tileLayer: jest.fn(),
  marker: jest.fn(),
  icon: jest.fn(),
}));

// Mock do react-leaflet
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => <div data-testid="marker" />,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  useMap: jest.fn(),
}));
