import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock components to simplify testing
jest.mock('./components/layout/Layout', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="mock-layout">{children}</div>,
}));

jest.mock('./pages/Home', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-home">Home Page</div>,
}));

// This is causing the error - let's fix it
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }) => <div data-testid="mock-browser-router">{children}</div>,
    Routes: ({ children }) => <div data-testid="mock-routes">{children}</div>,
    Route: () => <div data-testid="mock-route" />
  };
});

describe('App', () => {
  test('renders app structure correctly', () => {
    render(<App />);
    expect(screen.getByTestId('mock-browser-router')).toBeInTheDocument();
    expect(screen.getByTestId('mock-layout')).toBeInTheDocument();
    expect(screen.getByTestId('mock-routes')).toBeInTheDocument();
  });
});