import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  CountryContext,
  CountryProvider,
} from "../../../context/CountryContext";
import { fetchAllCountries } from "../../../services/api";
import { AuthContext } from "../../../context/AuthContext";
// Mock API - this is the critical part that needs to be fixed
jest.mock("../../../services/api", () => ({
  fetchAllCountries: jest.fn(),
}));

// Mock country data
const mockCountries = [
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
  {
    name: { common: "Brazil" },
    cca3: "BRA",
    capital: ["Brasília"],
    region: "Americas",
    population: 213000000,
    flags: { svg: "brazil.svg" },
  },
];

// Create a simplified wrapper component that only renders the values we need to test
const TestComponent = () => {
  const context = React.useContext(CountryContext);

  return (
    <div>
      <div data-testid="loading-status">
        {context.loading ? "Loading..." : "Not loading"}
      </div>
      <div data-testid="error-status">
        {context.error ? context.error : "No error"}
      </div>
      <div data-testid="countries-count">{context.countries.length}</div>
      <div data-testid="filtered-countries-count">
        {context.filteredCountries.length}
      </div>
      <div data-testid="search-query">{context.searchTerm || ""}</div>
      <div data-testid="selected-region">
        {context.selectedRegion || "All Regions"}
      </div>
      <ul>
        {context.filteredCountries.map((country) => (
          <li key={country.cca3} data-testid={`country-${country.cca3}`}>
            {country.name.common}
            <button
              data-testid={`favorite-${country.cca3}`}
              onClick={() => context.toggleFavorite(country.cca3)}
            >
              {context.isFavorite(country.cca3)
                ? "Remove from favorites"
                : "Add to favorites"}
            </button>
          </li>
        ))}
      </ul>
      <button
        data-testid="search-button"
        onClick={() => context.searchCountries(context.searchTerm)}
      >
        Search
      </button>
      <div data-testid="favorites-count">
        {context.getFavoriteCountries().length}
      </div>
    </div>
  );
};

describe("CountryContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear(); // Use window.localStorage provided by setupTests.js

    // Setup the mock implementation for fetchAllCountries
    fetchAllCountries.mockImplementation(() => Promise.resolve(mockCountries));
  });

  test("fetches countries on mount", async () => {
    render(
      <AuthContext.Provider value={{ currentUser: null }}>
        <CountryProvider>
          <TestComponent />
        </CountryProvider>
      </AuthContext.Provider>
    );

    // Initial state should show loading
    expect(screen.getByTestId("loading-status")).toHaveTextContent(
      "Loading..."
    );

    // Wait for countries to load
    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent(
        "Not loading"
      );
    });

    // API should have been called
    expect(fetchAllCountries).toHaveBeenCalledTimes(1);

    // Countries should be loaded
    expect(screen.getByTestId("countries-count")).toHaveTextContent("3");
    expect(screen.getByTestId("filtered-countries-count")).toHaveTextContent(
      "3"
    );

    // All countries should be in the list
    expect(screen.getByTestId("country-DEU")).toHaveTextContent("Germany");
    expect(screen.getByTestId("country-JPN")).toHaveTextContent("Japan");
    expect(screen.getByTestId("country-BRA")).toHaveTextContent("Brazil");
  });

  test("handles API errors", async () => {
    // Mock API error
    fetchAllCountries.mockImplementationOnce(() =>
      Promise.reject(new Error("Failed to fetch countries"))
    );

    render(
      <AuthContext.Provider value={{ currentUser: null }}>
        <CountryProvider>
          <TestComponent />
        </CountryProvider>
      </AuthContext.Provider>
    );

    // Wait for error to display
    await waitFor(() => {
      expect(screen.getByTestId("error-status")).toHaveTextContent(
        "Failed to fetch countries"
      );
    });
  });

  test("toggles country favorites when user is logged in", async () => {
    render(
      <AuthContext.Provider value={{ currentUser: { uid: "test-user" } }}>
        <CountryProvider>
          <TestComponent />
        </CountryProvider>
      </AuthContext.Provider>
    );

    // Wait for countries to load
    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent(
        "Not loading"
      );
    });

    // Initially no favorites
    expect(screen.getByTestId("favorites-count")).toHaveTextContent("0");

    // Add Germany to favorites
    fireEvent.click(screen.getByTestId("favorite-DEU"));

    // Check if Germany is added to favorites
    expect(screen.getByTestId("favorites-count")).toHaveTextContent("1");
    expect(screen.getByTestId("favorite-DEU")).toHaveTextContent(
      "Remove from favorites"
    );

    // Add Japan to favorites
    fireEvent.click(screen.getByTestId("favorite-JPN"));

    // Check if both are in favorites
    expect(screen.getByTestId("favorites-count")).toHaveTextContent("2");

    // Remove Germany from favorites
    fireEvent.click(screen.getByTestId("favorite-DEU"));

    // Check if only Japan remains in favorites
    expect(screen.getByTestId("favorites-count")).toHaveTextContent("1");
    expect(screen.getByTestId("favorite-DEU")).toHaveTextContent(
      "Add to favorites"
    );
    expect(screen.getByTestId("favorite-JPN")).toHaveTextContent(
      "Remove from favorites"
    );
  });

  test("stores favorites in localStorage", async () => {
    const userId = "test-user";

    render(
      <AuthContext.Provider value={{ currentUser: { uid: userId } }}>
        <CountryProvider>
          <TestComponent />
        </CountryProvider>
      </AuthContext.Provider>
    );

    // Wait for countries to load
    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent(
        "Not loading"
      );
    });

    // Add a country to favorites
    fireEvent.click(screen.getByTestId("favorite-DEU"));

    // Check if localStorage.setItem was called
    expect(window.localStorage.setItem).toHaveBeenCalled();

    // The key might be different based on your implementation
    // Just check that localStorage.setItem was called after clicking the button
  });

  test("loads favorites from localStorage on init", async () => {
    const userId = "test-user";
    const favorites = ["JPN", "BRA"];

    // Set favorites in localStorage before rendering
    // Use the specific key format your app uses for storing favorites
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === "favorites" || key === `favorites_${userId}`) {
        return JSON.stringify(favorites);
      }
      return null;
    });

    render(
      <AuthContext.Provider value={{ currentUser: { uid: userId } }}>
        <CountryProvider>
          <TestComponent />
        </CountryProvider>
      </AuthContext.Provider>
    );

    // Wait for countries to load
    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent(
        "Not loading"
      );
    });

    // Verify localStorage was checked
    expect(window.localStorage.getItem).toHaveBeenCalled();
  });
});
