import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import App from '../../App';
import { CountryContext } from '../../context/CountryContext';
import { AuthContext } from '../../context/AuthContext';
import { fetchAllCountries, fetchCountryByCode } from '../../services/api';
import { onAuthStateChanged } from '../../services/authService';
import FavoritesPage from '../../pages/FavoritesPage';

// Suppress React Router warnings
const originalWarn = console.warn;
const originalError = console.error;
beforeAll(() => {
  console.warn = (...args) => {
    if (args[0] && args[0].includes && (args[0].includes('React Router') || args[0].includes('future flag'))) {
      return;
    }
    originalWarn(...args);
  };
  console.error = (...args) => {
    if (args[0] && args[0].includes && args[0].includes('not wrapped in act')) {
      return;
    }
    originalError(...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

// Mock child components
jest.mock('../../components/countries/WorldMap', () => ({
  __esModule: true,
  default: () => <div data-testid="world-map">World Map Component</div>,
}));

jest.mock('../../components/countries/CountryCard', () => ({
  __esModule: true,
  default: ({ country }) => (
    <div data-testid={`country-card-${country.cca3}`}>
      {country.name.common}
    </div>
  ),
}));

jest.mock('../../components/countries/CountryRow', () => ({
  __esModule: true,
  default: ({ country }) => (
    <div data-testid={`country-row-${country.cca3}`} className="country-row">
      {country.name.common}
    </div>
  ),
}));

// Mock auth
jest.mock('../../services/authService', () => ({
  onAuthStateChanged: jest.fn(),
  loginUser: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  registerUser: jest.fn()
}));

// Mock API
jest.mock('../../services/api', () => ({
  fetchAllCountries: jest.fn(),
  fetchCountryByCode: jest.fn(),
  fetchCountryByName: jest.fn(),
  fetchCountriesByRegion: jest.fn()
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Improved render with both contexts and routing
const renderWithContexts = (initialRoute = '/') => {
  const mockUser = { uid: 'test-user', email: 'test@example.com' };
  const mockCountries = [
    {
      name: { common: 'Germany' },
      cca3: 'DEU',
      capital: ['Berlin'],
      region: 'Europe',
      population: 83000000,
      flags: { svg: 'germany.svg', alt: 'Flag of Germany' }
    },
    {
      name: { common: 'Japan' },
      cca3: 'JPN',
      capital: ['Tokyo'],
      region: 'Asia',
      population: 126000000,
      flags: { svg: 'japan.svg', alt: 'Flag of Japan' }
    }
  ];

  // Set up context wrapper with initial favorites
  const ContextWrapper = ({ children }) => {
    const [user] = React.useState(mockUser);
    const [countries] = React.useState(mockCountries);
    const [filteredCountries] = React.useState(mockCountries);
    const [favorites, setFavorites] = React.useState(['DEU']);
    
    const getFavoriteCountries = React.useCallback(() => {
      return mockCountries.filter(country => favorites.includes(country.cca3));
    }, [favorites]);
    
    const toggleFavorite = React.useCallback((countryCode) => {
      setFavorites(prev => {
        const newFavorites = prev.includes(countryCode) 
          ? prev.filter(code => code !== countryCode)
          : [...prev, countryCode];
          
        localStorage.setItem(`favorites_${mockUser.uid}`, JSON.stringify(newFavorites));
        return newFavorites;
      });
    }, []);
    
    const authContextValue = {
      user,
      loading: false,
      error: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      resetPassword: jest.fn()
    };
    
    const countryContextValue = {
      countries,
      filteredCountries,
      loading: false,
      error: null,
      searchTerm: '',
      selectedRegion: '',
      setSearchTerm: jest.fn(),
      setSelectedRegion: jest.fn(),
      searchCountries: jest.fn(),
      favorites,
      toggleFavorite,
      getFavoriteCountries
    };
    
    return (
      <AuthContext.Provider value={authContextValue}>
        <CountryContext.Provider value={countryContextValue}>
          {children}
        </CountryContext.Provider>
      </AuthContext.Provider>
    );
  };
  
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ContextWrapper>
        <App />
      </ContextWrapper>
    </MemoryRouter>
  );
};

// Direct render of FavoritesPage for more isolated testing
const renderFavoritesPage = (favoriteCodes = ['DEU']) => {
  const mockUser = { uid: 'test-user', email: 'test@example.com' };
  const mockCountries = [
    {
      name: { common: 'Germany' },
      cca3: 'DEU',
      capital: ['Berlin'],
      region: 'Europe',
      population: 83000000,
      flags: { svg: 'germany.svg', alt: 'Flag of Germany' }
    },
    {
      name: { common: 'Japan' },
      cca3: 'JPN',
      capital: ['Tokyo'],
      region: 'Asia',
      population: 126000000,
      flags: { svg: 'japan.svg', alt: 'Flag of Japan' }
    }
  ];
  
  localStorage.setItem(`favorites_${mockUser.uid}`, JSON.stringify(favoriteCodes));
  
  const favoriteCountries = mockCountries.filter(country => 
    favoriteCodes.includes(country.cca3)
  );
  
  const MockContextWrapper = ({ children }) => {
    const [favorites, setFavorites] = React.useState(favoriteCodes);
    
    const getFavoriteCountries = React.useCallback(() => {
      return favoriteCountries;
    }, []);
    
    const toggleFavorite = React.useCallback((countryCode) => {
      setFavorites(prev => {
        const newFavorites = prev.includes(countryCode) 
          ? prev.filter(code => code !== countryCode)
          : [...prev, countryCode];
          
        localStorage.setItem(`favorites_${mockUser.uid}`, JSON.stringify(newFavorites));
        return newFavorites;
      });
    }, []);
    
    const authContextValue = {
      user: mockUser,
      loading: false,
      error: null,
    };
    
    const countryContextValue = {
      favorites,
      toggleFavorite,
      getFavoriteCountries
    };
    
    return (
      <AuthContext.Provider value={authContextValue}>
        <CountryContext.Provider value={countryContextValue}>
          {children}
        </CountryContext.Provider>
      </AuthContext.Provider>
    );
  };

  return render(
    <BrowserRouter>
      <MockContextWrapper>
        <FavoritesPage />
      </MockContextWrapper>
    </BrowserRouter>
  );
};

describe('Favorites Page Integration', () => {
  const mockUser = { uid: 'test-user', email: 'test@example.com' };
  
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    // Setup auth state listener to start as logged in
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser); // Start logged in
      return jest.fn(); // Return unsubscribe function
    });
  });

  test('displays favorites correctly', async () => {
    // Render the favorites page directly with initial favorites
    const { container } = renderFavoritesPage(['DEU']);
    
    // Switch to list view
    const listButton = screen.getByRole('button', { name: /list/i });
    fireEvent.click(listButton);
    
    // Check that Germany is in the list
    await waitFor(() => {
      expect(screen.getByTestId('country-row-DEU')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/germany/i)).toBeInTheDocument();
  });

  test('shows empty state when no favorites', async () => {
    // Render with empty favorites array
    renderFavoritesPage([]);
    
    // Check for empty state message
    expect(screen.getByText(/no favorite countries yet/i)).toBeInTheDocument();
  });



  test('switching view modes works correctly', async () => {
    renderFavoritesPage(['DEU']);
    
    // Start with map view
    const mapButton = screen.getByRole('button', { name: /map/i });
    fireEvent.click(mapButton);
    
    // Check for world map component
    expect(screen.getByTestId('world-map')).toBeInTheDocument();
    
    // Switch to grid view
    const gridButton = screen.getByRole('button', { name: /grid/i });
    fireEvent.click(gridButton);
    
    // Check for country card
    expect(screen.getByTestId('country-card-DEU')).toBeInTheDocument();
    
    // Switch to list view
    const listButton = screen.getByRole('button', { name: /list/i });
    fireEvent.click(listButton);
    
    // Check for country row
    expect(screen.getByTestId('country-row-DEU')).toBeInTheDocument();
  });
});

