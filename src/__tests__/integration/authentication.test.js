import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "../../App";
import * as authService from "../../services/authService";
import { CountryContext } from "../../context/CountryContext";
import { AuthContext } from "../../context/AuthContext";

// Mock authentication service
jest.mock("../../services/authService");

// Mock WorldMap component directly to avoid leaflet issues
jest.mock("../../components/countries/WorldMap", () => {
  return function DummyWorldMap() {
    return <div data-testid="world-map-mock">World Map Mock</div>;
  };
});

// Mock Leaflet to prevent "Map is not a constructor" error
jest.mock("react-leaflet", () => ({
  MapContainer: () => <div data-testid="map-container">Map Mock</div>,
  TileLayer: () => <div>TileLayer Mock</div>,
  Marker: () => <div>Marker Mock</div>,
  Popup: () => <div>Popup Mock</div>,
  useMap: () => ({ fitBounds: jest.fn() }),
}));

// Mock API service
jest.mock("../../services/api", () => ({
  fetchAllCountries: jest.fn().mockResolvedValue([
    {
      name: { common: "Test Country" },
      cca3: "TST",
      capital: ["Test City"],
      region: "Test Region",
      population: 1000000,
      flags: { svg: "test.svg" },
      latlng: [10, 10],
    },
  ]),
}));

// Create a wrapper with mocked contexts
const renderWithContexts = (ui, { authValue = {}, countryValue = {} } = {}) => {
  // Default auth context values
  const defaultAuthValue = {
    currentUser: null,
    login: jest.fn(authService.loginUser),
    logout: jest.fn(),
    register: jest.fn(authService.registerUser),
    loading: false,
    ...authValue,
  };

  // Default country context values with required properties
  const defaultCountryValue = {
    countries: [
      {
        name: { common: "Test Country" },
        cca3: "TST",
        capital: ["Test City"],
        region: "Test Region",
        population: 1000000,
        flags: { svg: "test.svg" },
        latlng: [10, 10],
      },
    ],
    loading: false,
    searchTerm: "",
    setSearchTerm: jest.fn(),
    regionFilter: "",
    setRegionFilter: jest.fn(),
    filteredCountries: [
      {
        name: { common: "Test Country" },
        cca3: "TST",
        capital: ["Test City"],
        region: "Test Region",
        population: 1000000,
        flags: { svg: "test.svg" },
        latlng: [10, 10],
      },
    ],
    countriesToDisplay: [
      {
        name: { common: "Test Country" },
        cca3: "TST",
        capital: ["Test City"],
        region: "Test Region",
        population: 1000000,
        flags: { svg: "test.svg" },
        latlng: [10, 10],
      },
    ],
    error: null,
    favorites: [],
    addToFavorites: jest.fn(),
    removeFromFavorites: jest.fn(),
    isFavorite: jest.fn().mockReturnValue(false),
    ...countryValue,
  };

  return render(
    <AuthContext.Provider value={defaultAuthValue}>
      <CountryContext.Provider value={defaultCountryValue}>
        <BrowserRouter>{ui}</BrowserRouter>
      </CountryContext.Provider>
    </AuthContext.Provider>
  );
};

describe("Authentication Integration", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Clear any stored auth state
    localStorage.clear();
  });

  test("user can register, login, and logout", async () => {
    // Mock successful registration
    const mockUser = { id: "123", email: "new@example.com", name: "Test User" };
    authService.registerUser.mockResolvedValueOnce(mockUser);

    // Mock successful login
    authService.loginUser.mockResolvedValueOnce(mockUser);

    renderWithContexts(<App />);

    // Wait for app to load with a more reliable selector
    await waitFor(() => {
      // Look for navigation elements that should be visible
      const navElement = screen.queryByRole("navigation");
      expect(navElement).toBeInTheDocument();
    });

    // Find register link using a more flexible approach
    const registerLink = screen.getByRole("link", { name: /register/i });
    fireEvent.click(registerLink);

    // Fill out registration form
    await waitFor(() => {
      expect(screen.getByText(/create your account/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "new@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });
    // Add filling for the confirm password field
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Test User" },
    });

    // Submit registration form
    fireEvent.click(screen.getByRole("button", { name: /sign up|register/i }));

    // Verify registerUser was called with correct arguments
    await waitFor(() => {
      expect(authService.registerUser).toHaveBeenCalledWith(
        "new@example.com",
        "password123",
        "Test User"
      );
    });

    // Should be logged in with a user menu or logout button
    await waitFor(() => {
      const logoutElement =
        screen.queryByRole("button", { name: /logout/i }) ||
        screen.queryByText(/logout/i);
      expect(logoutElement).toBeInTheDocument();
    });

    // Log out
    const logoutButton =
      screen.getByRole("button", { name: /logout/i }) ||
      screen.getByText(/logout/i);
    fireEvent.click(logoutButton);

    // Should be logged out and see login link
    await waitFor(() => {
      const loginLink =
        screen.queryByRole("link", { name: /login/i }) ||
        screen.queryByText(/login/i);
      expect(loginLink).toBeInTheDocument();
    });

    // Log in again
    const loginLink =
      screen.getByRole("link", { name: /login/i }) ||
      screen.getByText(/login/i);
    fireEvent.click(loginLink);

    // Fill out login form
    await waitFor(() => {
      expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "new@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    // Submit login form
    fireEvent.click(screen.getByRole("button", { name: /sign in|log in/i }));

    // Verify loginUser was called with correct arguments
    await waitFor(() => {
      expect(authService.loginUser).toHaveBeenCalledWith(
        "new@example.com",
        "password123"
      );
    });

    // Should be logged in again
    await waitFor(() => {
      const logoutElement =
        screen.queryByRole("button", { name: /logout/i }) ||
        screen.queryByText(/logout/i);
      expect(logoutElement).toBeInTheDocument();
    });
  });

  test("displays error messages for authentication failures", async () => {
    // Mock failed login
    authService.loginUser.mockRejectedValueOnce(
      new Error("Invalid email or password")
    );

    renderWithContexts(<App />);

    // Wait for app to load
    await waitFor(() => {
      // Look for navigation elements that should be visible
      const navElement = screen.queryByRole("navigation");
      expect(navElement).toBeInTheDocument();
    });

    // Find login link using a more flexible approach
    const loginLink =
      screen.getByRole("link", { name: /login/i }) ||
      screen.getByText(/login/i);
    fireEvent.click(loginLink);

    // Fill out login form
    await waitFor(() => {
      expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrong-password" },
    });

    // Submit login form
    fireEvent.click(screen.getByRole("button", { name: /sign in|log in/i }));

    // Verify loginUser was called with the attempted credentials
    await waitFor(() => {
      expect(authService.loginUser).toHaveBeenCalledWith(
        "test@example.com",
        "wrong-password"
      );
    });

    // Should display error message
    await waitFor(() => {
      expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
    });
  });

  test("redirects protected routes to login when not authenticated", async () => {
    renderWithContexts(<App />);

    // Wait for app to load
    await waitFor(() => {
      // Look for navigation elements that should be visible
      const navElement = screen.queryByRole("navigation");
      expect(navElement).toBeInTheDocument();
    });

    // Try to navigate to favorites (protected route)
    window.history.pushState({}, "", "/favorites");
    fireEvent.popState(window);

    // Should be redirected to login
    await waitFor(() => {
      expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
    });
  });
});
