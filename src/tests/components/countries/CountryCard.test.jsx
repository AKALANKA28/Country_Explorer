import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
jest.mock('react-router-dom', () => ({
    Link: ({ to, children }) => <a href={to}>{children}</a>
  }));
  
import { AuthContext } from '../../../context/AuthContext';
import { CountryContext } from '../../../context/CountryContext';
import CountryCard from '../../../components/countries/CountryCard';

// Mock react-router-dom Link component
// jest.mock('react-router-dom', () => ({
//   Link: ({ to, children, className }) => (
//     <a href={to} className={className} data-testid="mock-link">
//       {children}
//     </a>
//   ),
// }));

// Mock country data
const mockCountry = {
  flags: { svg: 'test-flag.svg', png: 'test-flag.png' },
  name: { common: 'Test Country', official: 'Republic of Test' },
  capital: ['Test City'],
  population: 1000000,
  region: 'Test Region',
  cca3: 'TST'
};

// Mock context values
const mockAuthContext = {
  currentUser: { uid: 'test-uid', email: 'test@test.com' }
};

const mockCountryContext = {
  toggleFavorite: jest.fn(),
  isFavorite: jest.fn(() => false)
};

const mockCountryContextWithFavorite = {
  toggleFavorite: jest.fn(),
  isFavorite: jest.fn(() => true)
};

const renderWithContext = (component, authContext = mockAuthContext, countryContext = mockCountryContext) => {
  return render(
    <AuthContext.Provider value={authContext}>
      <CountryContext.Provider value={countryContext}>
        {component}
      </CountryContext.Provider>
    </AuthContext.Provider>
  );
};

describe('CountryCard component', () => {
  test('renders country information correctly', () => {
    renderWithContext(<CountryCard country={mockCountry} />);
    
    // Check if country name, capital and region are displayed
    expect(screen.getByText('Test Country')).toBeInTheDocument();
    expect(screen.getByText('Test City')).toBeInTheDocument();
    expect(screen.getByText('Test Region')).toBeInTheDocument();
    
    // Check if population is formatted correctly with comma
    expect(screen.getByText('1,000,000')).toBeInTheDocument();
    
    // Check if flag is displayed
    const flagImage = screen.getByAltText('Flag of Test Country');
    expect(flagImage).toBeInTheDocument();
    expect(flagImage).toHaveAttribute('src', 'test-flag.svg');
  });
  
  test('renders favorite button when user is logged in', () => {
    renderWithContext(<CountryCard country={mockCountry} />);
    
    // Favorite button should be in the document when the user is logged in
    const favoriteButton = screen.getByRole('button');
    expect(favoriteButton).toBeInTheDocument();
  });
  
  test('does not render favorite button when user is not logged in', () => {
    renderWithContext(
      <CountryCard country={mockCountry} />, 
      { currentUser: null }
    );
    
    // Favorite button should not be in the document when the user is not logged in
    const favoriteButton = screen.queryByRole('button');
    expect(favoriteButton).not.toBeInTheDocument();
  });
  
  test('calls toggleFavorite when favorite button is clicked', () => {
    renderWithContext(<CountryCard country={mockCountry} />);
    
    // Click the favorite button
    const favoriteButton = screen.getByRole('button');
    fireEvent.click(favoriteButton);
    
    // Check if toggleFavorite was called with the correct country code
    expect(mockCountryContext.toggleFavorite).toHaveBeenCalledWith('TST');
  });
  
  test('displays filled star icon when country is favorited', () => {
    renderWithContext(
      <CountryCard country={mockCountry} />,
      mockAuthContext,
      mockCountryContextWithFavorite
    );
    
    // Verify the favorite icon has the "filled" attribute
    const favoriteIcon = screen.getByRole('button').querySelector('svg');
    expect(favoriteIcon).toHaveAttribute('fill', 'currentColor');
  });

  test('favorite button prevents event propagation when clicked', () => {
    renderWithContext(<CountryCard country={mockCountry} />);
    
    // Mock the preventDefault and stopPropagation functions
    const mockEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn()
    };
    
    // Get the favorite button and simulate a click with our mock event
    const favoriteButton = screen.getByRole('button');
    favoriteButton.onclick(mockEvent);
    
    // Verify that preventDefault and stopPropagation were called
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  test('links to country detail page', () => {
    renderWithContext(<CountryCard country={mockCountry} />);
    
    // Find the Link component and check if it points to the correct URL
    const link = screen.getByTestId('mock-link');
    expect(link).toHaveAttribute('href', '/country/TST');
  });

  test('displays correct color for favorited country', () => {
    renderWithContext(
      <CountryCard country={mockCountry} />,
      mockAuthContext,
      mockCountryContextWithFavorite
    );
    
    // Check that the SVG has the correct color attribute when favorited
    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toHaveAttribute('color', '#805AD5'); // The purple color from COLORS.favorite
  });
});