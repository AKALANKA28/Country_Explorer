import React from 'react';
import { render, screen } from '@testing-library/react';
import { CountryContext } from '../../../context/CountryContext';
import { AuthContext } from '../../../context/AuthContext';


jest.mock('react-router-dom', () => ({
    useNavigate: () => jest.fn()
  }));
  
  jest.mock('react-leaflet', () => ({
    MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => <div data-testid="tile-layer" />,
    Marker: ({ children }) => <div data-testid="marker">{children}</div>,
    Tooltip: ({ children }) => <div data-testid="tooltip">{children}</div>,
    Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  }));
  
  jest.mock('leaflet', () => ({
    divIcon: jest.fn().mockReturnValue({}),
    Icon: {
      Default: {
        mergeOptions: jest.fn(),
        prototype: {
          _getIconUrl: jest.fn()
        }
      }
    }
  }));

  
import WorldMap from '../../../components/countries/WorldMap';

// // Mock react-router-dom hooks
// jest.mock('react-router-dom', () => ({
//     Link: ({ to, children }) => (
//       <a href={to} data-testid="mock-link">{children}</a>
//     )
//   }));
  

// Mock react-leaflet components
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Tooltip: ({ children }) => <div data-testid="tooltip">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
}));

// Mock countries data
const mockCountries = [
  {
    name: { common: 'Germany' },
    cca3: 'DEU',
    latlng: [51, 9],
    flags: { svg: 'germany-flag.svg' },
    capital: ['Berlin'],
    region: 'Europe',
    population: 83000000
  },
  {
    name: { common: 'France' },
    cca3: 'FRA',
    latlng: [46, 2],
    flags: { svg: 'france-flag.svg' },
    capital: ['Paris'],
    region: 'Europe',
    population: 67000000
  }
];

// Mock context values
const mockContextValue = {
  countries: mockCountries,
  filteredCountries: mockCountries,
  isFavorite: jest.fn(() => false),
  loading: false
};

const mockAuthContext = {
  currentUser: { uid: 'test-user' }
};

describe('WorldMap component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  test('renders loading state correctly', () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <CountryContext.Provider value={{ ...mockContextValue, loading: true }}>
          <WorldMap />
        </CountryContext.Provider>
      </AuthContext.Provider>
    );

    // Your component shows a loader div with a specific class rather than a testid
    expect(document.querySelector('.loader')).toBeInTheDocument();
  });

  test('renders map container when not loading', () => {
    // Force mapLoaded state to be true to render the map
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [true, jest.fn()]);

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <CountryContext.Provider value={mockContextValue}>
          <WorldMap />
        </CountryContext.Provider>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  test('displays correct legend labels', () => {
    // Force mapLoaded state to be true to render the map
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [true, jest.fn()]);

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <CountryContext.Provider value={mockContextValue}>
          <WorldMap />
        </CountryContext.Provider>
      </AuthContext.Provider>
    );

    // Check for the text that appears in your legend labels
    expect(screen.getByText('Countries')).toBeInTheDocument();
    expect(screen.getByText('Favorites')).toBeInTheDocument();
  });

  test('shows correct count of displayed countries', () => {
    // Force mapLoaded state to be true to render the map
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [true, jest.fn()]);

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <CountryContext.Provider value={mockContextValue}>
          <WorldMap />
        </CountryContext.Provider>
      </AuthContext.Provider>
    );

    expect(screen.getByText('2 countries displayed')).toBeInTheDocument();
  });

  test('does not show favorites legend when user is not logged in', () => {
    // Force mapLoaded state to be true to render the map
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [true, jest.fn()]);

    render(
      <AuthContext.Provider value={{ currentUser: null }}>
        <CountryContext.Provider value={mockContextValue}>
          <WorldMap />
        </CountryContext.Provider>
      </AuthContext.Provider>
    );

    expect(screen.queryByText('Favorites')).not.toBeInTheDocument();
  });

  test('displays instructions in the footer', () => {
    // Force mapLoaded state to be true to render the map
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [true, jest.fn()]);

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <CountryContext.Provider value={mockContextValue}>
          <WorldMap />
        </CountryContext.Provider>
      </AuthContext.Provider>
    );

    // Match the exact text in your footer
    const footerText = screen.getByText('Hover over markers to see country information • Click for more details');
    expect(footerText).toBeInTheDocument();
  });

  test('renders the interactive world map title', () => {
    // Force mapLoaded state to be true to render the map
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [true, jest.fn()]);

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <CountryContext.Provider value={mockContextValue}>
          <WorldMap />
        </CountryContext.Provider>
      </AuthContext.Provider>
    );

    // Check for the title of the map
    expect(screen.getByText('Interactive World Map')).toBeInTheDocument();
  });
});