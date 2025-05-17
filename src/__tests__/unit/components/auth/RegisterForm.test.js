import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Register from "../../../../components/auth/Register";
import { AuthContext } from "../../../../context/AuthContext";
import * as authService from "../../../../services/authService";

const originalConsoleWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (args[0] && args[0].includes && args[0].includes("React Router")) {
      return;
    }
    originalConsoleWarn(...args);
  };
});

afterAll(() => {
  console.warn = originalConsoleWarn;
});

// Mock the auth service
jest.mock("../../../../services/authService", () => ({
  registerUser: jest.fn(),
}));

// Mock the useNavigate hook
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

// Test component wrapper with auth context
const renderWithAuthContext = (ui) => {
  const mockRegister = jest.fn();

  return render(
    <AuthContext.Provider value={{ register: mockRegister }}>
      <BrowserRouter>{ui}</BrowserRouter>
    </AuthContext.Provider>
  );
};

describe("Register Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders registration form correctly", () => {
    renderWithAuthContext(<Register />);

    // Check if form elements are present
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/sign in to your existing account/i)
    ).toBeInTheDocument();
  });

  test("shows validation error when form is submitted empty", async () => {
    renderWithAuthContext(<Register />);

    // Get form elements
    const submitButton = screen.getByRole("button", { name: /sign up/i });

    // Submit the form without filling it
    fireEvent.click(submitButton);

    // Check if validation error is displayed (this might vary based on HTML5 validation)
    // If HTML5 validation is bypassed in your component:
    await waitFor(() => {
      expect(screen.getByText(/all fields are required/i)).toBeInTheDocument();
    });

    // Ensure service was not called
    expect(authService.registerUser).not.toHaveBeenCalled();
  });

  test("shows error when passwords do not match", async () => {
    renderWithAuthContext(<Register />);

    // Get form elements
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /sign up/i });

    // Fill form with mismatched passwords
    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "different123" },
    });
    fireEvent.click(submitButton);

    // Check if password mismatch error is displayed
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    // Ensure service was not called
    expect(authService.registerUser).not.toHaveBeenCalled();
  });

  test("calls registerUser service and navigates on successful registration", async () => {
    const mockUserData = {
      id: "123",
      email: "test@example.com",
      name: "Test User",
    };
    authService.registerUser.mockResolvedValueOnce(mockUserData);

    renderWithAuthContext(<Register />);

    // Get form elements
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /sign up/i });

    // Fill and submit the form
    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });
    fireEvent.click(submitButton);

    // Check if the service was called with correct parameters
    await waitFor(() => {
      expect(authService.registerUser).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
        "Test User"
      );
    });

    // Check if navigation happened
    expect(mockedNavigate).toHaveBeenCalledWith("/");
  });

  test("shows error message on registration failure", async () => {
    authService.registerUser.mockRejectedValueOnce(
      new Error("Email already in use")
    );

    renderWithAuthContext(<Register />);

    // Get form elements
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /sign up/i });

    // Fill and submit the form
    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });
    fireEvent.click(submitButton);

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/email already in use/i)).toBeInTheDocument();
    });
  });

  test("shows loading state during form submission", async () => {
    // Delay the promise resolution to test loading state
    authService.registerUser.mockImplementationOnce(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id: "123", email: "test@example.com", name: "Test User" });
        }, 100);
      });
    });

    renderWithAuthContext(<Register />);

    // Get form elements
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /sign up/i });

    // Fill and submit the form
    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });
    fireEvent.click(submitButton);

    // Button should be disabled during loading
    expect(submitButton).toBeDisabled();

    // Wait for the operation to complete
    await waitFor(() => {
      expect(authService.registerUser).toHaveBeenCalled();
    });
  });
});
