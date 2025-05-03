import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CountryContext } from '../../context/CountryContext';
import CountryDetail from '../../pages/CountryDetail';
import { fetchCountryByCode } from '../../services/api';

// Mock API service
jest.mock('../../services/api', () => ({
  fetchCountryByCode: jest.fn()
}));

// Mock map component
jest.mock('../../components/countries/CountryLocationMap', () => () => (
  <div data-testid="map-component">Country Location Map</div>
));

// Mock country data
const mockCountry = {
  flags: { 
    svg: 'test-flag.svg',
    png: 'test-flag.png',
    alt: 'Flag of Test Country'
  },
  name: { 
    common: 'Test Country', 
    official: 'Republic of Test',
    nativeName: { 
      eng: { common: 'Test Country', official: 'Republic of Test' } 
    }
  },
  capital: ['Test City'],
  population: 1000000,
  area: 500000,
  region: 'Test Region',
  subregion: 'Test Subregion',
  latlng: [10, 20],
  borders: ['ABC', 'DEF'],
  tld: ['.tc'],
  currencies: {
    TST: { name: 'Test Dollar', symbol: 'T$' }
  },
  languages: {
    eng: 'English',
    tes: 'Test Language'
  },
  independent: true,
  unMember: true,
  cca3: 'TST'
};

// Mock context values
const mockAuthContext = {
  currentUser: { uid: 'test-uid' }
};

const mockCountryContext = {
  countries: [
    mockCountry,
    { cca3: 'ABC', name: { common: 'Neighbor A' }, latlng: [12, 22], flags: { svg: 'a.svg' }, capital: ['A City'], population: 500000 },
    { cca3: 'DEF', name: { common: 'Neighbor B' }, latlng: [8, 18], flags: { svg: 'b.svg' }, capital: ['B City'], population: 300000 }
  ],
  toggleFavorite: jest.fn(),
  isFavorite: jest.fn(() => false)
};

describe('CountryDetail page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful API response
    fetchCountryByCode.mockResolvedValue(mockCountry);
  });

  test('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <CountryContext.Provider value={mockCountryContext}>
            <Routes>
              <Route path="*" element={<CountryDetail />} />
            </Routes>
          </CountryContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    // Check if loader is displayed
    expect(document.querySelector('.loader')).toBeInTheDocument();
  });

  test('renders error state when API fails', async () => {
    // Mock API error
    fetchCountryByCode.mockRejectedValue(new Error('API error'));
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <CountryContext.Provider value={mockCountryContext}>
            <Routes>
              <Route path="*" element={<CountryDetail />} />
            </Routes>
          </CountryContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    // Wait for error state to render
    await waitFor(() => {
      expect(screen.getByText('Error!')).toBeInTheDocument();
    });
  });

  test('renders country details after successful API call', async () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <CountryContext.Provider value={mockCountryContext}>
            <Routes>
              <Route path="*" element={<CountryDetail />} />
            </Routes>
          </CountryContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    // Wait for country data to load
    await waitFor(() => {
      expect(screen.getByText('Test Country')).toBeInTheDocument();
    });
    
    // Check if basic country information is displayed
    expect(screen.getByText('Republic of Test')).toBeInTheDocument();
    expect(screen.getByText('Test City')).toBeInTheDocument();
    expect(screen.getByText('Test Region')).toBeInTheDocument();
    expect(screen.getByText('1,000,000')).toBeInTheDocument();
    expect(screen.getByText('500,000 km²')).toBeInTheDocument();
    expect(screen.getByText('Test Dollar')).toBeInTheDocument();
    
    // Check if tabs are rendered
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Statistics')).toBeInTheDocument();
    expect(screen.getByText('Border Countries')).toBeInTheDocument();
    
    // Check if map component is rendered
    expect(screen.getByTestId('map-component')).toBeInTheDocument();
  });

  test('displays favorite button only when user is logged in', async () => {
    // First render with logged in user
    const { rerender } = render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <CountryContext.Provider value={mockCountryContext}>
            <Routes>
              <Route path="*" element={<CountryDetail />} />
            </Routes>
          </CountryContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    // Wait for country data to load
    await waitFor(() => {
      expect(screen.getByText('Test Country')).toBeInTheDocument();
    });
    
    // Check if favorite button is displayed for logged in user
    const favoriteButton = screen.getByLabelText(/favorite/i);
    expect(favoriteButton).toBeInTheDocument();
    
    // Re-render with no user logged in
    rerender(
      <BrowserRouter>
        <AuthContext.Provider value={{ currentUser: null }}>
          <CountryContext.Provider value={mockCountryContext}>
            <Routes>
              <Route path="*" element={<CountryDetail />} />
            </Routes>
          </CountryContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    // Check that favorite button is not displayed for logged out user
    await waitFor(() => {
      expect(screen.queryByLabelText(/favorite/i)).not.toBeInTheDocument();
    });
  });

  test('back button links to home page', async () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <CountryContext.Provider value={mockCountryContext}>
            <Routes>
              <Route path="*" element={<CountryDetail />} />
            </Routes>
          </CountryContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    // Wait for country data to load
    await waitFor(() => {
      expect(screen.getByText('Test Country')).toBeInTheDocument();
    });
    
    // Check if back button links to home page
    const backButton = screen.getByText('Back to All Countries');
    expect(backButton).toBeInTheDocument();
    expect(backButton.closest('a')).toHaveAttribute('href', '/');
  });
});