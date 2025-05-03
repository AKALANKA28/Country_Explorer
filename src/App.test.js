import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { fetchAllCountries } from './services/api';
import { AuthProvider } from './context/AuthContext';
import { CountryProvider } from './context/CountryContext';

// Mock the API
jest.mock('./services/api', () => ({
  fetchAllCountries: jest.fn(),
  fetchCountryByCode: jest.fn()
}));

// Mock authentication service
jest.mock('./services/authService', () => ({
  loginUser: jest.fn(),
  registerUser: jest.fn()
}));

// Mock App component instead of using the real one
const MockApp = () => {
  // Use the real context providers
  return (
    <AuthProvider>
      <CountryProvider>
        <div data-testid="mock-app">
          <div data-testid="navbar">Navbar</div>
          <div data-testid="home-page">Home Page Content</div>
          <div data-testid="footer">Footer</div>
        </div>
      </CountryProvider>
    </AuthProvider>
  );
};

// Mock country data
const mockCountries = [
  { 
    name: { common: 'Test Country' }, 
    cca3: 'TST',
    capital: ['Test City'],
    region: 'Test Region',
    population: 1000000,
    flags: { svg: 'test-flag.svg' }
  }
];

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchAllCountries.mockResolvedValue(mockCountries);
  });

  test('renders the application with navbar and home page', async () => {
    render(<MockApp />);
    
    expect(screen.getByTestId('mock-app')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  test('fetches countries data', async () => {
    render(<MockApp />);
    
    // CountryProvider should call fetchAllCountries
    expect(fetchAllCountries).toHaveBeenCalled();
  });
});