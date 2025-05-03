import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';
import { fetchAllCountries } from '../../services/api';

// Mock auth
jest.mock('../../services/auth', () => ({
  onAuthStateChanged: jest.fn((_auth, callback) => {
    callback(null); // Start not logged in
    return jest.fn(); // Return unsubscribe function
  })
}));

// Mock API
jest.mock('../../services/api', () => ({
  fetchAllCountries: jest.fn(),
  fetchCountryByCode: jest.fn()
}));

describe('Country Search and Filter Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API response
    fetchAllCountries.mockResolvedValue([
      { 
        name: { common: 'Germany' }, 
        cca3: 'DEU',
        capital: ['Berlin'],
        region: 'Europe',
        population: 83000000,
        flags: { svg: 'germany.svg' }
      },
      { 
        name: { common: 'Japan' }, 
        cca3: 'JPN',
        capital: ['Tokyo'],
        region: 'Asia',
        population: 126000000,
        flags: { svg: 'japan.svg' }
      },
      { 
        name: { common: 'Brazil' }, 
        cca3: 'BRA',
        capital: ['Brasília'],
        region: 'Americas',
        population: 213000000,
        flags: { svg: 'brazil.svg' }
      }
    ]);
  });

  test('search filters countries correctly', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Wait for countries to load (map view by default)
    await waitFor(() => {
      expect(screen.getByText(/countries displayed/i)).toBeInTheDocument();
    });
    
    // Switch to list view to better verify search results
    fireEvent.click(screen.getByText('List'));
    
    // Wait for list view to render
    await waitFor(() => {
      expect(screen.getByText('Germany')).toBeInTheDocument();
      expect(screen.getByText('Japan')).toBeInTheDocument();
      expect(screen.getByText('Brazil')).toBeInTheDocument();
    });
    
    // Search for 'japan'
    const searchInput = screen.getByPlaceholderText(/search for a country/i);
    fireEvent.change(searchInput, { target: { value: 'japan' } });
    fireEvent.submit(searchInput.closest('form'));
    
    // Only Japan should be in the results
    await waitFor(() => {
      expect(screen.getByText('Japan')).toBeInTheDocument();
      expect(screen.queryByText('Germany')).not.toBeInTheDocument();
      expect(screen.queryByText('Brazil')).not.toBeInTheDocument();
    });
  });

  test('region filter works correctly', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Wait for countries to load
    await waitFor(() => {
      expect(screen.getByText(/countries displayed/i)).toBeInTheDocument();
    });
    
    // Switch to list view
    fireEvent.click(screen.getByText('List'));
    
    // Wait for list view to render
    await waitFor(() => {
      expect(screen.getByText('Germany')).toBeInTheDocument();
    });
    
    // Filter by Europe region
    const regionFilter = screen.getByLabelText(/filter by region/i);
    fireEvent.change(regionFilter, { target: { value: 'Europe' } });
    
    // Only Germany should be in the results
    await waitFor(() => {
      expect(screen.getByText('Germany')).toBeInTheDocument();
      expect(screen.queryByText('Japan')).not.toBeInTheDocument();
      expect(screen.queryByText('Brazil')).not.toBeInTheDocument();
    });
    
    // Change to Asia region
    fireEvent.change(regionFilter, { target: { value: 'Asia' } });
    
    // Only Japan should be in the results
    await waitFor(() => {
      expect(screen.queryByText('Germany')).not.toBeInTheDocument();
      expect(screen.getByText('Japan')).toBeInTheDocument();
      expect(screen.queryByText('Brazil')).not.toBeInTheDocument();
    });
  });

  test('combining search and region filter works correctly', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Wait for countries to load
    await waitFor(() => {
      expect(screen.getByText(/countries displayed/i)).toBeInTheDocument();
    });
    
    // Switch to list view
    fireEvent.click(screen.getByText('List'));
    
    // Wait for list view to render
    await waitFor(() => {
      expect(screen.getByText('Germany')).toBeInTheDocument();
    });
    
    // Filter by Europe region
    const regionFilter = screen.getByLabelText(/filter by region/i);
    fireEvent.change(regionFilter, { target: { value: 'Europe' } });
    
    // Only Germany should be in the results
    await waitFor(() => {
      expect(screen.getByText('Germany')).toBeInTheDocument();
      expect(screen.queryByText('Japan')).not.toBeInTheDocument();
    });
    
    // Now search for 'japan' within Europe region
    const searchInput = screen.getByPlaceholderText(/search for a country/i);
    fireEvent.change(searchInput, { target: { value: 'japan' } });
    fireEvent.submit(searchInput.closest('form'));
    
    // No results should be found
    await waitFor(() => {
      expect(screen.queryByText('Germany')).not.toBeInTheDocument();
      expect(screen.queryByText('Japan')).not.toBeInTheDocument();
      expect(screen.queryByText('Brazil')).not.toBeInTheDocument();
      expect(screen.getByText(/no countries found/i)).toBeInTheDocument();
    });
    
    // Reset region filter
    fireEvent.change(regionFilter, { target: { value: '' } });
    
    // Now Japan should appear
    await waitFor(() => {
      expect(screen.queryByText('Germany')).not.toBeInTheDocument();
      expect(screen.getByText('Japan')).toBeInTheDocument();
      expect(screen.queryByText('Brazil')).not.toBeInTheDocument();
    });
  });

  test('search is case insensitive', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Wait for countries to load
    await waitFor(() => {
      expect(screen.getByText(/countries displayed/i)).toBeInTheDocument();
    });
    
    // Switch to list view
    fireEvent.click(screen.getByText('List'));
    
    // Search for 'GERMANY' in uppercase
    const searchInput = screen.getByPlaceholderText(/search for a country/i);
    fireEvent.change(searchInput, { target: { value: 'GERMANY' } });
    fireEvent.submit(searchInput.closest('form'));
    
    // Germany should still be found despite case difference
    await waitFor(() => {
      expect(screen.getByText('Germany')).toBeInTheDocument();
    });
  });

  test('search works with partial matches', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Wait for countries to load
    await waitFor(() => {
      expect(screen.getByText(/countries displayed/i)).toBeInTheDocument();
    });
    
    // Switch to list view
    fireEvent.click(screen.getByText('List'));
    
    // Search for 'bra' (partial match for Brazil)
    const searchInput = screen.getByPlaceholderText(/search for a country/i);
    fireEvent.change(searchInput, { target: { value: 'bra' } });
    fireEvent.submit(searchInput.closest('form'));
    
    // Brazil should be found
    await waitFor(() => {
      expect(screen.getByText('Brazil')).toBeInTheDocument();
      expect(screen.queryByText('Germany')).not.toBeInTheDocument();
      expect(screen.queryByText('Japan')).not.toBeInTheDocument();
    });
  });
});