import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../../components/auth/Login';
import { AuthContext } from '../../../context/AuthContext';
import * as authService from '../../../services/authService';


const originalConsoleWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (args[0] && args[0].includes && args[0].includes('React Router')) {
      return;
    }
    originalConsoleWarn(...args);
  };
});

afterAll(() => {
  console.warn = originalConsoleWarn;
});



// Mock the auth service
jest.mock('../../../services/authService', () => ({
  loginUser: jest.fn()
}));

// Mock the useNavigate hook
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}));

// Test component wrapper with auth context
const renderWithAuthContext = (ui) => {
  const mockLogin = jest.fn();
  
  return render(
    <AuthContext.Provider value={{ login: mockLogin }}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form correctly', () => {
    renderWithAuthContext(<Login />);
    
    // Check if form elements are present
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/create a new account/i)).toBeInTheDocument();
  });

  test('shows validation error when form is submitted empty', async () => {
    renderWithAuthContext(<Login />);
    
    // Get form elements
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Submit the form without filling it
    fireEvent.click(submitButton);
    
    // Check if validation error is displayed
    await waitFor(() => {
      expect(screen.getByText(/email and password are required/i)).toBeInTheDocument();
    });
    
    // Ensure service was not called
    expect(authService.loginUser).not.toHaveBeenCalled();
  });

  test('calls loginUser service and navigates on successful login', async () => {
    const mockUserData = { id: '123', email: 'test@example.com', name: 'Test User' };
    authService.loginUser.mockResolvedValueOnce(mockUserData);
    
    renderWithAuthContext(<Login />);
    
    // Get form elements
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Fill and submit the form
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    // Check if the service was called with correct parameters
    await waitFor(() => {
      expect(authService.loginUser).toHaveBeenCalledWith('test@example.com', 'password123');
    });
    
    // Check if navigation happened
    expect(mockedNavigate).toHaveBeenCalledWith('/');
  });

  test('shows error message on login failure', async () => {
    authService.loginUser.mockRejectedValueOnce(new Error('Invalid credentials'));
    
    renderWithAuthContext(<Login />);
    
    // Get form elements
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Fill and submit the form
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('shows loading state during form submission', async () => {
    // Delay the promise resolution to test loading state
    authService.loginUser.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ id: '123', email: 'test@example.com', name: 'Test User' });
        }, 100);
      });
    });
    
    renderWithAuthContext(<Login />);
    
    // Get form elements
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Fill and submit the form
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    // Button should be disabled and show loading state
    expect(submitButton).toBeDisabled();
    
    // Wait for the operation to complete
    await waitFor(() => {
      expect(authService.loginUser).toHaveBeenCalled();
    });
  });
});