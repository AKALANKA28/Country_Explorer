import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';
import { fetchAllCountries } from '../../services/api';
import { onAuthStateChanged } from '../../services/authService';

// Mock auth
jest.mock('../../services/authService', () => ({
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn()
}));

// Mock API
jest.mock('../../services/api', () => ({
  fetchAllCountries: jest.fn(),
  fetchCountryByCode: jest.fn()
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

describe('Favorites Integration', () => {
  const mockUser = { uid: 'test-user', email: 'test@example.com' };
  
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
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
    
    // Setup auth state listener to start as logged in
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser); // Start logged in
      return jest.fn(); // Return unsubscribe function
    });
  });

  test('user can add and remove countries from favorites', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Wait for app to load
    await waitFor(() => {
      expect(screen.getByText(/countries displayed/i)).toBeInTheDocument();
    });
    
    // Switch to list view for easier testing
    fireEvent.click(screen.getByText('List'));
    
    // Wait for list to render
    await waitFor(() => {
      expect(screen.getByText('Germany')).toBeInTheDocument();
    });
    
    // Add Germany to favorites
    const favoriteButtons = screen.getAllByLabelText(/add to favorites|remove from favorites/i);
    const germanyFavoriteButton = favoriteButtons[0]; // First button (Germany)
    fireEvent.click(germanyFavoriteButton);
    
    // Check localStorage was updated
    expect(localStorage.setItem).toHaveBeenCalledWith(
      `favorites_${mockUser.uid}`,
      expect.stringContaining('DEU')
    );
    
    // Navigate to favorites page
    fireEvent.click(screen.getByText('Favorites'));
    
    // Wait for favorites page to load
    await waitFor(() => {
      expect(screen.getByText('Your Favorite Countries')).toBeInTheDocument();
    });
    
    // Switch to list view in favorites
    fireEvent.click(screen.getByText('List'));
    
    // Should see Germany in favorites
    await waitFor(() => {
      expect(screen.getByText('Germany')).toBeInTheDocument();
      expect(screen.queryByText('Japan')).not.toBeInTheDocument();
    });
    
    // Remove Germany from favorites
    const removeFavoriteButton = screen.getByLabelText(/remove from favorites/i);
    fireEvent.click(removeFavoriteButton);
    
    // Should see empty state
    await waitFor(() => {
      expect(screen.getByText('No favorite countries yet')).toBeInTheDocument();
    });
    
    // Check localStorage was updated to remove favorite
    expect(localStorage.setItem).toHaveBeenCalledWith(
      `favorites_${mockUser.uid}`,
      '[]'
    );
  });

  test('favorites are user-specific', async () => {
    // Setup initial favorites for test-user
    localStorage.setItem(`favorites_${mockUser.uid}`, JSON.stringify(['DEU']));
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Wait for app to load with test-user
    await waitFor(() => {
      expect(screen.getByText(/countries displayed/i)).toBeInTheDocument();
    });
    
    // Navigate to favorites
    fireEvent.click(screen.getByText('Favorites'));
    
    // Switch to list view
    fireEvent.click(screen.getByText('List'));
    
    // Should see Germany in favorites for test-user
    await waitFor(() => {
      expect(screen.getByText('Germany')).toBeInTheDocument();
    });
    
    // Now simulate logout
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null); // Now logged out
      return jest.fn();
    });
    
    // Force re-render by navigating home
    fireEvent.click(screen.getByText('Back'));
    
    // Wait for home to load
    await waitFor(() => {
      expect(screen.getByText('Log In')).toBeInTheDocument();
    });
    
    // Login as different user
    const newUser = { uid: 'another-user', email: 'another@example.com' };
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(newUser); // Now logged in as different user
      return jest.fn();
    });
    
    // Simulate login
    fireEvent.click(screen.getByText('Log In'));
    
    // Force re-render by navigating home
    await waitFor(() => {
      expect(screen.getByText('Favorites')).toBeInTheDocument();
    });
    
    // Navigate to favorites
    fireEvent.click(screen.getByText('Favorites'));
    
    // Should see empty favorites for the new user
    await waitFor(() => {
      expect(screen.getByText('No favorite countries yet')).toBeInTheDocument();
    });
  });

  test('favorites persist across sessions', async () => {
    // Setup initial favorites
    localStorage.setItem(`favorites_${mockUser.uid}`, JSON.stringify(['DEU', 'JPN']));
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Wait for app to load
    await waitFor(() => {
      expect(screen.getByText(/countries displayed/i)).toBeInTheDocument();
    });
    
    // Switch to list view
    fireEvent.click(screen.getByText('List'));
    
    // Both countries should show as favorited
    const favoriteButtons = screen.getAllByLabelText(/remove from favorites/i);
    expect(favoriteButtons.length).toBe(2);
    
    // Navigate to favorites
    fireEvent.click(screen.getByText('Favorites'));
    
    // Switch to list view
    fireEvent.click(screen.getByText('List'));
    
    // Both countries should be in favorites
    await waitFor(() => {
      expect(screen.getByText('Germany')).toBeInTheDocument();
      expect(screen.getByText('Japan')).toBeInTheDocument();
    });
    
    // Simulate app refresh by remounting component
    // (This is a simplified way to test persistence)
    const { unmount } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    unmount();
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Navigate to favorites after "refresh"
    await waitFor(() => {
      expect(screen.getByText('Favorites')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Favorites'));
    
    // Switch to list view
    fireEvent.click(screen.getByText('List'));
    
    // Both countries should still be in favorites
    await waitFor(() => {
      expect(screen.getByText('Germany')).toBeInTheDocument();
      expect(screen.getByText('Japan')).toBeInTheDocument();
    });
  });
});