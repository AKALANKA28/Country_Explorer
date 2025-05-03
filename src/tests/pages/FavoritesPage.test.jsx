import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FavoritesPage from '../../pages/FavoritesPage';
import { CountryContext } from '../../context/CountryContext';
import { AuthContext } from '../../context/AuthContext';

// Mock child components
jest.mock('../../components/countries/WorldMap', () => () => <div data-testid="world-map">World Map</div>);
jest.mock('../../components/countries/CountryRow', () => {
  return function MockCountryRow({ country }) {
    return <div data-testid={`country-row-${country.cca3}`}>{country.name.common}</div>;
  };
});
jest.mock('../../components/countries/CountryCard', () => {
  return function MockCountryCard({ country }) {
    return <div data-testid={`country-card-${country.cca3}`}>{country.name.common}</div>;
  };
});

// Mock favorite countries
const mockFavoriteCountries = [
  { 
    name: { common: 'Germany' }, 
    cca3: 'DEU',
    capital: ['Berlin'],
    population: 83000000,
    region: 'Europe',
    flags: { svg: 'germany.svg' }
  },
  { 
    name: { common: 'Japan' }, 
    cca3: 'JPN',
    capital: ['Tokyo'],
    population: 126000000,
    region: 'Asia',
    flags: { svg: 'japan.svg' }
  }
];

// Mock context values
const mockCountryContext = {
  getFavoriteCountries: jest.fn(() => mockFavoriteCountries),
  loading: false
};

const mockEmptyCountryContext = {
  getFavoriteCountries: jest.fn(() => []),
  loading: false
};

describe('FavoritesPage component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ currentUser: { uid: 'test-user' } }}>
          <CountryContext.Provider value={{ ...mockCountryContext, loading: true }}>
            <FavoritesPage />
          </CountryContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    // Check if loader is displayed
    expect(document.querySelector('.loader')).toBeInTheDocument();
  });

  test('renders empty state when no favorites', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ currentUser: { uid: 'test-user' } }}>
          <CountryContext.Provider value={mockEmptyCountryContext}>
            <FavoritesPage />
          </CountryContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    // Check if empty message is displayed
    expect(screen.getByText('No favorite countries yet')).toBeInTheDocument();
    expect(screen.getByText('Start exploring and add countries to your favorites list.')).toBeInTheDocument();
    
    // Check if explore button is displayed
    const exploreButton = screen.getByText('Explore Countries');
    expect(exploreButton).toBeInTheDocument();
    expect(exploreButton.closest('a')).toHaveAttribute('href', '/');
  });

  test('renders map view by default with favorites', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ currentUser: { uid: 'test-user' } }}>
          <CountryContext.Provider value={mockCountryContext}>
            <FavoritesPage />
          </CountryContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    // Check if title is displayed
    expect(screen.getByText('Your Favorite Countries')).toBeInTheDocument();
    
    // Check if map view is displayed by default
    expect(screen.getByTestId('world-map')).toBeInTheDocument();
    
    // Other views should not be displayed
    expect(screen.queryByTestId('country-row-DEU')).not.toBeInTheDocument();
    expect(screen.queryByTestId('country-card-DEU')).not.toBeInTheDocument();
  });

  test('switches to list view when list button is clicked', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ currentUser: { uid: 'test-user' } }}>
          <CountryContext.Provider value={mockCountryContext}>
            <FavoritesPage />
          </CountryContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    // Click the list view button
    fireEvent.click(screen.getByText('List'));
    
    // Map should no longer be displayed
    expect(screen.queryByTestId('world-map')).not.toBeInTheDocument();
    
    // List items should be displayed
    expect(screen.getByTestId('country-row-DEU')).toBeInTheDocument();
    expect(screen.getByTestId('country-row-JPN')).toBeInTheDocument();
    
    // Grid items should not be displayed
    expect(screen.queryByTestId('country-card-DEU')).not.toBeInTheDocument();
  });

  test('switches to grid view when grid button is clicked', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ currentUser: { uid: 'test-user' } }}>
          <CountryContext.Provider value={mockCountryContext}>
            <FavoritesPage />
          </CountryContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    // Click the grid view button
    fireEvent.click(screen.getByText('Grid'));
    
    // Map should no longer be displayed
    expect(screen.queryByTestId('world-map')).not.toBeInTheDocument();
    
    // Grid items should be displayed
    expect(screen.getByTestId('country-card-DEU')).toBeInTheDocument();
    expect(screen.getByTestId('country-card-JPN')).toBeInTheDocument();
    
    // List items should not be displayed
    expect(screen.queryByTestId('country-row-DEU')).not.toBeInTheDocument();
  });

  test('back button links to home page', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ currentUser: { uid: 'test-user' } }}>
          <CountryContext.Provider value={mockCountryContext}>
            <FavoritesPage />
          </CountryContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    // Check if back button links to home page
    const backButton = screen.getByText('Back');
    expect(backButton).toBeInTheDocument();
    expect(backButton.closest('a')).toHaveAttribute('href', '/');
  });
});