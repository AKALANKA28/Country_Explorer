import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CountryContext } from '../../../context/CountryContext';
import FilterOptions from '../../../components/countries/FilterOptions';

// Mock context value
const mockContextValue = {
  filterByRegion: jest.fn(),
  selectedRegion: '',
  regions: ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania']
};

describe('FilterOptions component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  test('renders all region options when opened', async () => {
    render(
      <CountryContext.Provider value={mockContextValue}>
        <FilterOptions />
      </CountryContext.Provider>
    );
    
    // Open the dropdown
    const dropdownButton = screen.getByRole('button', { name: /filter by region/i });
    fireEvent.click(dropdownButton);
    
    // Wait for dropdown menu to be visible
    await waitFor(() => {
      // Check for at least one region to verify the menu opened
      expect(screen.getByText('Africa')).toBeInTheDocument();
    });
    
    // Check if all regions are displayed
    mockContextValue.regions.forEach(region => {
      expect(screen.getByText(region)).toBeInTheDocument();
    });
    
    // Check if "All Regions" option is also available
    expect(screen.getByText('All Regions')).toBeInTheDocument();
  });

  test('calls filterByRegion when region is selected', async () => {
    render(
      <CountryContext.Provider value={mockContextValue}>
        <FilterOptions />
      </CountryContext.Provider>
    );
    
    // Open the dropdown
    const dropdownButton = screen.getByRole('button', { name: /filter by region/i });
    fireEvent.click(dropdownButton);
    
    // Wait for dropdown menu to be visible
    await waitFor(() => {
      expect(screen.getByText('Europe')).toBeInTheDocument();
    });
    
    // Click on a region option
    fireEvent.click(screen.getByText('Europe'));
    
    // Check if filterByRegion was called with the correct region
    expect(mockContextValue.filterByRegion).toHaveBeenCalledWith('Europe');
  });

  test('displays the currently selected region', () => {
    const contextWithSelectedRegion = {
      ...mockContextValue,
      selectedRegion: 'Asia'
    };
    
    render(
      <CountryContext.Provider value={contextWithSelectedRegion}>
        <FilterOptions />
      </CountryContext.Provider>
    );
    
    // Check if button shows the selected region
    expect(screen.getByRole('button', { name: /asia/i })).toBeInTheDocument();
  });

  test('calls filterByRegion with empty string when "All Regions" is selected', async () => {
    render(
      <CountryContext.Provider value={mockContextValue}>
        <FilterOptions />
      </CountryContext.Provider>
    );
    
    // Open the dropdown
    const dropdownButton = screen.getByRole('button', { name: /filter by region/i });
    fireEvent.click(dropdownButton);
    
    // Wait for dropdown menu to be visible
    await waitFor(() => {
      expect(screen.getByText('All Regions')).toBeInTheDocument();
    });
    
    // Click on "All Regions" option
    fireEvent.click(screen.getByText('All Regions'));
    
    // Check if filterByRegion was called with an empty string
    expect(mockContextValue.filterByRegion).toHaveBeenCalledWith('');
  });
});