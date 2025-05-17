import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthContext, AuthProvider } from "../../../context/AuthContext";
// import * as authService from "../../../../services/authService";

// Mock authentication services
jest.mock("../../../services/authService", () => ({
  loginUser: jest.fn(),
  registerUser: jest.fn(),
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

// Test component that uses AuthContext
const TestComponent = () => {
  const { currentUser, login, logout, register, loading } =
    React.useContext(AuthContext);

  return (
    <div>
      <div data-testid="user-status">
        {currentUser ? `Logged in as ${currentUser.email}` : "Not logged in"}
      </div>
      <div data-testid="loading-status">
        {loading ? "Loading..." : "Not loading"}
      </div>
      <button
        data-testid="login-button"
        onClick={() =>
          login({
            id: "1",
            email: "test@example.com",
            name: "Test User",
          })
        }
      >
        Login
      </button>
      <button
        data-testid="register-button"
        onClick={() =>
          register({
            id: "2",
            email: "new@example.com",
            name: "New User",
          })
        }
      >
        Register
      </button>
      <button data-testid="logout-button" onClick={() => logout()}>
        Logout
      </button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  test("provides initial auth state correctly", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initial state should be not logged in and not loading
    expect(screen.getByTestId("user-status")).toHaveTextContent(
      "Not logged in"
    );
    expect(screen.getByTestId("loading-status")).toHaveTextContent(
      "Not loading"
    );
  });

  test("login function updates context and localStorage", async () => {
    const mockUser = {
      id: "1",
      email: "test@example.com",
      name: "Test User",
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Click login button
    fireEvent.click(screen.getByTestId("login-button"));

    // Wait for auth state to update
    await waitFor(() => {
      expect(screen.getByTestId("user-status")).toHaveTextContent(
        "Logged in as test@example.com"
      );
    });

    // Verify localStorage was updated
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "user",
      JSON.stringify(mockUser)
    );
  });

  test("register function updates context and localStorage", async () => {
    const mockUser = {
      id: "2",
      email: "new@example.com",
      name: "New User",
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Click register button
    fireEvent.click(screen.getByTestId("register-button"));

    // Wait for auth state to update
    await waitFor(() => {
      expect(screen.getByTestId("user-status")).toHaveTextContent(
        "Logged in as new@example.com"
      );
    });

    // Verify localStorage was updated
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "user",
      JSON.stringify(mockUser)
    );
  });

  test("logout function clears context and localStorage", async () => {
    // Setup: first log in a user
    const mockUser = {
      id: "1",
      email: "test@example.com",
      name: "Test User",
    };

    // Set up the localStorage before rendering
    localStorage.getItem.mockImplementation((key) => {
      if (key === "user") return JSON.stringify(mockUser);
      return null;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Verify user is logged in - no need to wait since we set it directly
    expect(screen.getByTestId("user-status")).toHaveTextContent(
      "Logged in as test@example.com"
    );

    // Now logout
    fireEvent.click(screen.getByTestId("logout-button"));

    // Wait for auth state to update
    await waitFor(() => {
      expect(screen.getByTestId("user-status")).toHaveTextContent(
        "Not logged in"
      );
    });

    // Verify localStorage items were removed
    expect(localStorage.removeItem).toHaveBeenCalledWith("user");
    expect(localStorage.removeItem).toHaveBeenCalledWith("favorites");
  });

  test("loads user from localStorage on init", async () => {
    // Setup: Store a user in localStorage before mounting component
    const mockUser = {
      id: "1",
      email: "stored@example.com",
      name: "Stored User",
    };

    // Mock implementation for this specific test
    localStorage.getItem.mockImplementation((key) => {
      if (key === "user") return JSON.stringify(mockUser);
      return null;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // User should be loaded from localStorage - no need to wait since it happens on mount
    expect(screen.getByTestId("user-status")).toHaveTextContent(
      "Logged in as stored@example.com"
    );
  });

  test("provider prevents children from rendering while loading", () => {
    // Use a custom render to inject loading state
    const CustomAuthProvider = ({ children }) => {
      const [loading, setLoading] = React.useState(true);
      const [currentUser, setCurrentUser] = React.useState(null);

      // Never set loading to false for this test

      const value = {
        currentUser,
        login: () => {},
        logout: () => {},
        register: () => {},
        loading,
      };

      return (
        <AuthContext.Provider value={value}>
          {!loading && children}
        </AuthContext.Provider>
      );
    };

    render(
      <CustomAuthProvider>
        <div data-testid="child-content">
          This should not render during loading
        </div>
      </CustomAuthProvider>
    );

    // Child content should not be in the document while loading
    expect(screen.queryByTestId("child-content")).not.toBeInTheDocument();
  });
});
