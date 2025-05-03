import React from 'react';
import { render, screen } from '@testing-library/react';
import { CountryContext } from '../../../context/CountryContext';
import { AuthContext } from '../../../context/AuthContext';
import CountryList from '../../../components/countries/CountryList';


// Mock CountryRow component
jest.mock('../../../components/countries/CountryRow', () => {
  return function MockCountryRow({ country }) {
    return <div data-testid={`country-row-${country.cca3}`}>{country.name.common}</div>;
  };
});

// Mock data
const mockCountries = [
  { 
    name: { common: 'Country A' }, 
    cca3: 'AAA', 
    capital: ['Capital A'], 
    region: 'Region A', 
    population: 1000000 
  },
  { 
    name: { common: 'Country B' }, 
    cca3: 'BBB', 
    capital: ['Capital B'], 
    region: 'Region B', 
    population: 2000000 
  },
  { 
    name: { common: 'Country C' }, 
    cca3: 'CCC', 
    capital: ['Capital C'], 
    region: 'Region C', 
    population: 3000000 
  }
];

describe('CountryList component', () => {

  test('renders empty state when no countries', () => {
    render(
      <AuthContext.Provider value={{ currentUser: null }}>
        <CountryContext.Provider value={{ filteredCountries: [], loading: false, error: null }}>
          <CountryList />
        </CountryContext.Provider>
      </AuthContext.Provider>
    );
    
    // Check if empty message is displayed
    expect(screen.getByText('No countries found!')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search criteria.')).toBeInTheDocument();
  });
  
  test('renders list of countries', () => {
    render(
      <AuthContext.Provider value={{ currentUser: null }}>
        <CountryContext.Provider value={{ filteredCountries: mockCountries, loading: false, error: null }}>
          <CountryList />
        </CountryContext.Provider>
      </AuthContext.Provider>
    );
    
    // Check if table headers are displayed
    expect(screen.getByText('Country')).toBeInTheDocument();
    expect(screen.getByText('Capital')).toBeInTheDocument();
    expect(screen.getByText('Region')).toBeInTheDocument();
    expect(screen.getByText('Population')).toBeInTheDocument();
    
    // Check if each country row is rendered
    expect(screen.getByTestId('country-row-AAA')).toBeInTheDocument();
    expect(screen.getByTestId('country-row-BBB')).toBeInTheDocument();
    expect(screen.getByTestId('country-row-CCC')).toBeInTheDocument();
  });
  
  test('sorts countries by name', () => {
    const unsortedCountries = [
      { name: { common: 'Zimbabwe' }, cca3: 'ZWE' },
      { name: { common: 'Algeria' }, cca3: 'DZA' },
      { name: { common: 'Canada' }, cca3: 'CAN' }
    ];
    
    render(
      <AuthContext.Provider value={{ currentUser: null }}>
        <CountryContext.Provider value={{ filteredCountries: unsortedCountries, loading: false, error: null }}>
          <CountryList />
        </CountryContext.Provider>
      </AuthContext.Provider>
    );
    
    // Get all country rows
    const countryRows = screen.getAllByTestId(/country-row/);
    
    // Check if countries are sorted alphabetically by name
    expect(countryRows[0]).toHaveTextContent('Algeria');
    expect(countryRows[1]).toHaveTextContent('Canada');
    expect(countryRows[2]).toHaveTextContent('Zimbabwe');
  });
});