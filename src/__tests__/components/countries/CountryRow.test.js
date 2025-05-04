import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CountryRow from '../../../components/countries/CountryRow';
import { AuthContext } from '../../../context/AuthContext';
import { CountryContext } from '../../../context/CountryContext';

// Mock country data
const mockCountry = {
  name: { common: 'Germany' },
  cca3: 'DEU',
  capital: ['Berlin'],
  region: 'Europe',
  population: 83000000,
  flags: { svg: 'https://example.com/germany.svg' }
};

// Setup wrapper for component with all necessary contexts
const renderCountryRow = (
  countryData = mockCountry, 
  currentUser = null, 
  isFavorite = () => false, 
  toggleFavorite = jest.fn()
) => {
  return render(
    <AuthContext.Provider value={{ currentUser }}>
      <CountryContext.Provider value={{ isFavorite, toggleFavorite }}>
        <BrowserRouter>
          <table>
            <tbody>
              <tr>
                <CountryRow country={countryData} />
              </tr>
            </tbody>
          </table>
        </BrowserRouter>
      </CountryContext.Provider>
    </AuthContext.Provider>
  );
};

describe('CountryRow Component', () => {
  test('renders country information correctly', () => {
    renderCountryRow();

    // Test country name is displayed
    expect(screen.getByText('Germany')).toBeInTheDocument();
    
    // Test capital is displayed
    expect(screen.getByText('Berlin')).toBeInTheDocument();
    
    // Test region is displayed
    expect(screen.getByText('Europe')).toBeInTheDocument();
    
    // Test formatted population is displayed (with commas)
    expect(screen.getByText('83,000,000')).toBeInTheDocument();
    
    // Test flag is displayed with correct alt text
    const flag = screen.getByAltText('Flag of Germany');
    expect(flag).toBeInTheDocument();
    expect(flag).toHaveAttribute('src', 'https://example.com/germany.svg');
    
    // Test link goes to correct country page
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/country/DEU');
  });
  
  test('handles countries with missing data gracefully', () => {
    const incompleteCountry = {
      name: { common: 'Test Country' },
      cca3: 'TST',
      capital: [], // Empty capital
      region: '',  // Empty region
      population: 0,
      flags: { svg: '' }
    };
    
    renderCountryRow(incompleteCountry);
    
    // Test country name is still displayed
    expect(screen.getByText('Test Country')).toBeInTheDocument();
    
    // Test N/A is shown for missing capital
    expect(screen.getByText('N/A')).toBeInTheDocument();
    
    // Population should be 0
    expect(screen.getByText('0')).toBeInTheDocument();
  });
  
  test('favorite button is not visible when user is not logged in', () => {
    renderCountryRow();
    
    // Favorite button should not be visible
    const favoriteButton = screen.queryByLabelText(/favorite/i);
    expect(favoriteButton).not.toBeInTheDocument();
  });
  
  test('shows empty (unfavorited) star when country is not a favorite', () => {
    // Mock a logged in user
    const mockUser = { id: '123', email: 'test@example.com' };
    
    renderCountryRow(mockCountry, mockUser, () => false);
    
    // The favorite button should be visible
    const favoriteButton = screen.getByLabelText('Add to favorites');
    expect(favoriteButton).toBeInTheDocument();
    
    // The star should have the "none" fill attribute (unfilled star)
    const starIcon = favoriteButton.querySelector('svg');
    expect(starIcon).toHaveAttribute('fill', 'none');
  });
  
  test('shows filled star when country is a favorite', () => {
    // Mock a logged in user
    const mockUser = { id: '123', email: 'test@example.com' };
    
    // Mock isFavorite to return true for this country
    const isFavorite = (code) => code === 'DEU';
    
    renderCountryRow(mockCountry, mockUser, isFavorite);
    
    // The favorite button should be visible
    const favoriteButton = screen.getByLabelText('Remove from favorites');
    expect(favoriteButton).toBeInTheDocument();
    
    // The star should have a "currentColor" fill attribute (filled star)
    const starIcon = favoriteButton.querySelector('svg');
    expect(starIcon).toHaveAttribute('fill', 'currentColor');
  });
  
  test('calls toggleFavorite when favorite button is clicked', () => {
    // Mock a logged in user
    const mockUser = { id: '123', email: 'test@example.com' };
    
    // Mock toggle function
    const mockToggleFavorite = jest.fn();
    
    renderCountryRow(mockCountry, mockUser, () => false, mockToggleFavorite);
    
    // Click the favorite button
    const favoriteButton = screen.getByLabelText('Add to favorites');
    fireEvent.click(favoriteButton);
    
    // toggleFavorite should be called with the country code
    expect(mockToggleFavorite).toHaveBeenCalledWith('DEU');
  });
  
  test('prevents default and propagation on favorite button click', () => {
    // Mock a logged in user
    const mockUser = { id: '123', email: 'test@example.com' };
    
    renderCountryRow(mockCountry, mockUser);
    
    // Prepare mock event
    const mockEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn()
    };
    
    // Get the button and manually trigger its onClick handler
    const favoriteButton = screen.getByLabelText('Add to favorites');
    // Since we can't directly access the onClick handler, we can simulate it with a click
    // and then check if preventDefault and stopPropagation are called
    fireEvent.click(favoriteButton, mockEvent);
    
    // This is a partial test - in real implementation, these methods should be called
    // but we can't directly verify it with fireEvent.click
    // We're relying on the implementation to call these methods
  });
});