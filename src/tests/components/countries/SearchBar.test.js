import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CountryContext } from '../../../context/CountryContext';
import SearchBar from '../../../components/countries/SearchBar';

const mockContextValue = {
  searchCountries: jest.fn(),
  searchTerm: '', 
};

describe('SearchBar component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders search input correctly', () => {
    render(
      <CountryContext.Provider value={mockContextValue}>
        <SearchBar />
      </CountryContext.Provider>
    );
    
    // Check if search input is rendered
    const searchInput = screen.getByPlaceholderText(/search for a country/i);
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('type', 'text');
  });
  
  test('calls searchCountries when input changes', () => {
    render(
      <CountryContext.Provider value={mockContextValue}>
        <SearchBar />
      </CountryContext.Provider>
    );
    
    // Simulate typing in the search box
    const searchInput = screen.getByPlaceholderText(/search for a country/i);
    fireEvent.change(searchInput, { target: { value: 'germany' } });
    
    // Check if searchCountries was called with the correct value
    expect(mockContextValue.searchCountries).toHaveBeenCalledWith('germany');
  });
  
  
  test('displays the correct input value based on context', () => {
    const contextWithValue = {
      ...mockContextValue,
      searchTerm: 'test query' // Using searchTerm
    };
    
    render(
      <CountryContext.Provider value={contextWithValue}>
        <SearchBar />
      </CountryContext.Provider>
    );
    
    // In your component, you initialize inputValue state with searchTerm
    // So it should have the value from context
    const searchInput = screen.getByPlaceholderText(/search for a country/i);
    expect(searchInput).toHaveValue('test query');
  });
  

});