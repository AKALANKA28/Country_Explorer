import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../../pages/Home';
import { CountryContext } from '../../context/CountryContext';
import { AuthContext } from '../../context/AuthContext';



const originalConsoleWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (args[0] && args[0].includes && args[0].includes('React Router')) {
      return;
    }
    originalConsoleWarn(...args);
  };
});

afterAll(() => {
  console.warn = originalConsoleWarn;
});

// Mock child components
jest.mock('../../components/countries/SearchBar', () => () => <div data-testid="search-bar">Search Bar</div>);
jest.mock('../../components/countries/FilterOptions', () => () => <div data-testid="filter-options">Filter Options</div>);
jest.mock('../../components/countries/CountryList', () => () => <div data-testid="country-list">Country List</div>);
jest.mock('../../components/countries/CountryGrid', () => () => <div data-testid="country-grid">Country Grid</div>);
jest.mock('../../components/countries/WorldMap', () => () => <div data-testid="world-map">World Map</div>);

// Mock context values
const mockContextValues = {
  countries: [],
  filteredCountries: [],
  loading: false,
  error: null
};

describe('Home page', () => {
  test('renders all necessary components', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ currentUser: null }}>
          <CountryContext.Provider value={mockContextValues}>
            <Home />
          </CountryContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    // Check if all components are rendered
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('filter-options')).toBeInTheDocument();
    
    // Initially should display the map view
    expect(screen.getByTestId('world-map')).toBeInTheDocument();
    expect(screen.queryByTestId('country-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('country-grid')).not.toBeInTheDocument();
  });

  test('switches from map view to grid view', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ currentUser: null }}>
          <CountryContext.Provider value={mockContextValues}>
            <Home />
          </CountryContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    // Click the grid view button
    fireEvent.click(screen.getByText('Grid'));
    
    // Check if view switched to grid
    expect(screen.queryByTestId('world-map')).not.toBeInTheDocument();
    expect(screen.getByTestId('country-grid')).toBeInTheDocument();
    expect(screen.queryByTestId('country-list')).not.toBeInTheDocument();
  });

  test('switches from map view to list view', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ currentUser: null }}>
          <CountryContext.Provider value={mockContextValues}>
            <Home />
          </CountryContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    // Click the list view button
    fireEvent.click(screen.getByText('List'));
    
    // Check if view switched to list
    expect(screen.queryByTestId('world-map')).not.toBeInTheDocument();
    expect(screen.queryByTestId('country-grid')).not.toBeInTheDocument();
    expect(screen.getByTestId('country-list')).toBeInTheDocument();
  });

  test('highlights active view button', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ currentUser: null }}>
          <CountryContext.Provider value={mockContextValues}>
            <Home />
          </CountryContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    // Initially the Map button should be active
    const mapButton = screen.getByText('Map').closest('button');
    const listButton = screen.getByText('List').closest('button');
    const gridButton = screen.getByText('Grid').closest('button');
    
    // Check initial state - Map should be active
    expect(mapButton).toHaveStyle('background-color: #38B2AC');
    expect(listButton).not.toHaveStyle('background-color: #38B2AC');
    expect(gridButton).not.toHaveStyle('background-color: #38B2AC');
    
    // Click the list view button
    fireEvent.click(listButton);
    
    // List button should now be active
    expect(mapButton).not.toHaveStyle('background-color: #38B2AC');
    expect(listButton).toHaveStyle('background-color: #38B2AC');
    expect(gridButton).not.toHaveStyle('background-color: #38B2AC');
  });
});