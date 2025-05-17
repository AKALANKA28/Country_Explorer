import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "../../App";
import { fetchAllCountries } from "../../services/api";
import { onAuthStateChanged } from "../../services/authService";

// Mock auth
jest.mock("../../services/authService", () => ({
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

// Mock API
jest.mock("../../services/api", () => ({
  fetchAllCountries: jest.fn(),
  fetchCountryByCode: jest.fn(),
  fetchCountryByName: jest.fn(),
  fetchCountriesByRegion: jest.fn(),
  fetchCountriesByLanguage: jest.fn(),
}));

// Mock map components to avoid Leaflet issues in tests
jest.mock("../../components/countries/WorldMap", () => {
  return function MockWorldMap() {
    return <div data-testid="world-map">World Map Component</div>;
  };
});

jest.mock("../../components/countries/CountryLocationMap", () => {
  return function MockCountryLocationMap() {
    return <div data-testid="country-location-map">Country Location Map</div>;
  };
});

// Mock localStorage with enhanced debugging
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => {
      console.log(
        `[MockStorage] getItem called with key: ${key}, returning:`,
        store[key]
      );
      return store[key] || null;
    }),
    setItem: jest.fn((key, value) => {
      console.log(
        `[MockStorage] setItem called with key: ${key}, value:`,
        value
      );
      store[key] = value;
    }),
    clear: jest.fn(() => {
      console.log("[MockStorage] clear called, emptying store");
      store = {};
    }),
    removeItem: jest.fn((key) => {
      console.log(`[MockStorage] removeItem called with key: ${key}`);
      delete store[key];
    }),
    // For debugging in tests
    _getStore: () => ({ ...store }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

describe("Favorites Integration", () => {
  const mockUser = { uid: "test-user", email: "test@example.com" };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    // Mock countries data
    fetchAllCountries.mockResolvedValue([
      {
        name: { common: "Germany" },
        cca3: "DEU",
        capital: ["Berlin"],
        region: "Europe",
        population: 83000000,
        flags: { svg: "germany.svg" },
      },
      {
        name: { common: "Japan" },
        cca3: "JPN",
        capital: ["Tokyo"],
        region: "Asia",
        population: 126000000,
        flags: { svg: "japan.svg" },
      },
    ]);

    // Setup auth state listener to start as logged in
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser); // Start logged in
      return jest.fn(); // Return unsubscribe function
    });
  });
  test("user can add and remove countries from favorites", async () => {
    // Reset localStorage before test
    localStorage.clear();

    const { container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Wait for app to load with map and countries
    await waitFor(
      () => {
        expect(screen.getByTestId("world-map")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Wait longer to ensure the countries have been fetched
    await waitFor(
      () => {
        expect(fetchAllCountries).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );

    // Make sure we're logged in
    expect(onAuthStateChanged).toHaveBeenCalled();
    console.log("Mock user in test:", mockUser);

    // Switch to list view for easier testing
    const listViewButton = screen.getByText("List");
    expect(listViewButton).toBeInTheDocument();
    fireEvent.click(listViewButton);

    // Wait for list to render with sufficient timeout
    await waitFor(
      () => {
        expect(screen.getByText("Germany")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    console.log("DOM after loading list view:", container.innerHTML);

    // Find all favorite buttons
    const favoriteButtons = screen.getAllByLabelText(
      /add to favorites|remove from favorites/i
    );
    expect(favoriteButtons.length).toBeGreaterThan(0);

    // Add Germany to favorites - clicking the first button (Germany)
    fireEvent.click(favoriteButtons[0]);

    // Give time for localStorage operations to complete
    await waitFor(
      () => {
        // Check localStorage was updated
        expect(localStorage.setItem).toHaveBeenCalledWith(
          `favorites_${mockUser.uid}`,
          expect.stringContaining("DEU")
        );
      },
      { timeout: 1000 }
    );

    // Log the localStorage state for debugging
    console.log(
      "localStorage after adding favorite:",
      localStorage._getStore()
    );

    // Navigate to favorites page
    const favoritesLink = screen.getByText("Favorites");
    expect(favoritesLink).toBeInTheDocument();
    fireEvent.click(favoritesLink);

    // Wait for favorites page to load with a longer timeout
    await waitFor(
      () => {
        expect(
          screen.getByText(/Your Favorite Countries|Favorite Countries/i)
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Switch to list view in favorites
    const favoritesListButton = screen.getByText("List");
    expect(favoritesListButton).toBeInTheDocument();
    fireEvent.click(favoritesListButton);

    // Should see Germany in favorites
    await waitFor(
      () => {
        // The actual text matching for Germany
        const germanyElements = Array.from(
          container.querySelectorAll("*")
        ).filter((el) => el.textContent && el.textContent.trim() === "Germany");
        expect(germanyElements.length).toBeGreaterThan(0);

        // Make sure Japan is not shown
        const japanElements = Array.from(
          container.querySelectorAll("*")
        ).filter((el) => el.textContent && el.textContent.trim() === "Japan");
        expect(japanElements.length).toBe(0);
      },
      { timeout: 3000 }
    );

    // Find and click the remove from favorites button
    const removeFavoriteButtons = screen.getAllByLabelText(
      /remove from favorites/i
    );
    expect(removeFavoriteButtons.length).toBeGreaterThan(0);
    fireEvent.click(removeFavoriteButtons[0]);

    // Should see empty state after removing the favorite
    await waitFor(
      () => {
        expect(
          screen.getByText("No favorite countries yet")
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Check localStorage was updated to remove favorite
    await waitFor(
      () => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          `favorites_${mockUser.uid}`,
          "[]"
        );
      },
      { timeout: 1000 }
    );
  });

  test("favorites are user-specific", async () => {
    // Setup initial favorites for test-user
    localStorage.setItem(`favorites_${mockUser.uid}`, JSON.stringify(["DEU"]));

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    ); // Wait for app to load with test-user
    await waitFor(() => {
      expect(screen.getByTestId("world-map")).toBeInTheDocument();
    });

    // Navigate to favorites
    fireEvent.click(screen.getByText("Favorites"));

    // Switch to list view
    fireEvent.click(screen.getByText("List"));

    // Should see Germany in favorites for test-user
    await waitFor(() => {
      expect(screen.getByText("Germany")).toBeInTheDocument();
    });

    // Now simulate logout
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null); // Now logged out
      return jest.fn();
    });

    // Force re-render by navigating home
    fireEvent.click(screen.getByText("Back"));

    // Wait for home to load
    await waitFor(() => {
      expect(screen.getByText("Log In")).toBeInTheDocument();
    });

    // Login as different user
    const newUser = { uid: "another-user", email: "another@example.com" };
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(newUser); // Now logged in as different user
      return jest.fn();
    });

    // Simulate login
    fireEvent.click(screen.getByText("Log In"));

    // Force re-render by navigating home
    await waitFor(() => {
      expect(screen.getByText("Favorites")).toBeInTheDocument();
    });

    // Navigate to favorites
    fireEvent.click(screen.getByText("Favorites"));

    // Should see empty favorites for the new user
    await waitFor(() => {
      expect(screen.getByText("No favorite countries yet")).toBeInTheDocument();
    });
  });

  test("favorites persist across sessions", async () => {
    // Setup initial favorites
    localStorage.setItem(
      `favorites_${mockUser.uid}`,
      JSON.stringify(["DEU", "JPN"])
    );

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    ); // Wait for app to load
    await waitFor(() => {
      expect(screen.getByTestId("world-map")).toBeInTheDocument();
    });

    // Switch to list view
    fireEvent.click(screen.getByText("List"));

    // Both countries should show as favorited
    const favoriteButtons = screen.getAllByLabelText(/remove from favorites/i);
    expect(favoriteButtons.length).toBe(2);

    // Navigate to favorites
    fireEvent.click(screen.getByText("Favorites"));

    // Switch to list view
    fireEvent.click(screen.getByText("List"));

    // Both countries should be in favorites
    await waitFor(() => {
      expect(screen.getByText("Germany")).toBeInTheDocument();
      expect(screen.getByText("Japan")).toBeInTheDocument();
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
      expect(screen.getByText("Favorites")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Favorites"));

    // Switch to list view
    fireEvent.click(screen.getByText("List"));

    // Both countries should still be in favorites
    await waitFor(() => {
      expect(screen.getByText("Germany")).toBeInTheDocument();
      expect(screen.getByText("Japan")).toBeInTheDocument();
    });
  });
});
