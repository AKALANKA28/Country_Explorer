import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';
import { fetchAllCountries } from '../../services/api';
import { onAuthStateChanged } from '../../services/authService';

// Mock auth
jest.mock('../../services/authService', () => ({
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

// Mock map component 
jest.mock('../../components/countries/WorldMap', () => () => {
  return <div data-testid="world-map">World Map Component</div>;
});

describe('View Modes Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock countries data
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
      }
    ]);
  });

  test('switches between map, grid, and list views correctly', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Wait for app to load
    await waitFor(() => {
      // Map view should be shown by default
      expect(screen.getByTestId('world-map')).toBeInTheDocument();
    });
    
    // Switch to grid view
    fireEvent.click(screen.getByText('Grid'));
    
    // Should show grid view
    await waitFor(() => {
      expect(screen.queryByTestId('world-map')).not.toBeInTheDocument();
      expect(document.querySelector('.country-card')).toBeInTheDocument();
      expect(screen.getByText('Germany')).toBeInTheDocument();
      expect(screen.getByText('Japan')).toBeInTheDocument();
    });
    
    // Switch to list view
    fireEvent.click(screen.getByText('List'));
    
    // Should show list view
    await waitFor(() => {
      expect(screen.queryByTestId('world-map')).not.toBeInTheDocument();
      expect(document.querySelector('.country-card')).not.toBeInTheDocument();
      // Should have table headers
      expect(screen.getByText('Country')).toBeInTheDocument();
      expect(screen.getByText('Capital')).toBeInTheDocument();
      expect(screen.getByText('Region')).toBeInTheDocument();
      expect(screen.getByText('Population')).toBeInTheDocument();
    });
    
    // Switch back to map view
    fireEvent.click(screen.getByText('Map'));
    
    // Should show map view again
    await waitFor(() => {
      expect(screen.getByTestId('world-map')).toBeInTheDocument();
    });
  });

  test('view mode preference persists within a session', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Wait for app to load
    await waitFor(() => {
      expect(screen.getByTestId('world-map')).toBeInTheDocument();
    });
    
    // Switch to list view
    fireEvent.click(screen.getByText('List'));
    
    // Should show list view
    await waitFor(() => {
      expect(screen.queryByTestId('world-map')).not.toBeInTheDocument();
      expect(screen.getByText('Country')).toBeInTheDocument();
    });
    
    // Navigate to a country detail page
    fireEvent.click(screen.getAllByText('Germany')[0]);
    
    // Wait for country detail page to load
    await waitFor(() => {
      expect(screen.getByText('Back to All Countries')).toBeInTheDocument();
    });
    
    // Navigate back to home
    fireEvent.click(screen.getByText('Back to All Countries'));
    
    // Should still be in list view
    await waitFor(() => {
      expect(screen.queryByTestId('world-map')).not.toBeInTheDocument();
      expect(screen.getByText('Country')).toBeInTheDocument();
    });
  });

  test('each view displays the same countries', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Wait for map view to load
    await waitFor(() => {
      expect(screen.getByTestId('world-map')).toBeInTheDocument();
    });
    
    // Switch to grid view
    fireEvent.click(screen.getByText('Grid'));
    
    // Check countries in grid view
    await waitFor(() => {
      expect(screen.getAllByText('Germany').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Japan').length).toBeGreaterThan(0);
    });
    
    // Switch to list view
    fireEvent.click(screen.getByText('List'));
    
    // Check countries in list view
    await waitFor(() => {
      expect(screen.getAllByText('Germany').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Japan').length).toBeGreaterThan(0);
    });
  });

  test('search results update all view modes', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Wait for app to load
    await waitFor(() => {
      expect(screen.getByTestId('world-map')).toBeInTheDocument();
    });
    
    // Switch to list view
    fireEvent.click(screen.getByText('List'));
    
    // Both countries should be visible
    await waitFor(() => {
      expect(screen.getByText('Germany')).toBeInTheDocument();
      expect(screen.getByText('Japan')).toBeInTheDocument();
    });
    
    // Search for "Japan"
    const searchInput = screen.getByPlaceholderText(/search for a country/i);
    fireEvent.change(searchInput, { target: { value: 'Japan' } });
    fireEvent.submit(searchInput.closest('form'));
    
    // Only Japan should be visible in list view
    await waitFor(() => {
      expect(screen.queryByText('Germany')).not.toBeInTheDocument();
      expect(screen.getByText('Japan')).toBeInTheDocument();
    });
    
    // Switch to grid view
    fireEvent.click(screen.getByText('Grid'));
    
    // Only Japan should be visible in grid view
    await waitFor(() => {
      expect(screen.queryByText('Germany')).not.toBeInTheDocument();
      expect(screen.getByText('Japan')).toBeInTheDocument();
    });
    
    // Switch to map view (can't fully test the map markers, but at least check component rendering)
    fireEvent.click(screen.getByText('Map'));
    
    // Map should be displayed
    await waitFor(() => {
      expect(screen.getByTestId('world-map')).toBeInTheDocument();
      // Would need special test for markers - map component should handle filtering internally
    });
  });
});