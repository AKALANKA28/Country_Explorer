import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AuthContext, AuthProvider } from '../../context/AuthContext';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from '../../services/auth';

// Mock Firebase auth services
jest.mock('../../services/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(callback => {
    callback(null); // Initial state: not logged in
    return jest.fn(); // return unsubscribe function
  })
}));

// Test component that uses AuthContext
const TestComponent = () => {
  const { 
    currentUser, 
    login, 
    signup, 
    logout, 
    loading, 
    error 
  } = React.useContext(AuthContext);
  
  return (
    <div>
      <div data-testid="user-status">
        {currentUser ? `Logged in as ${currentUser.email}` : 'Not logged in'}
      </div>
      <div data-testid="loading-status">
        {loading ? 'Loading...' : 'Not loading'}
      </div>
      <div data-testid="error-status">
        {error ? error : 'No error'}
      </div>
      <button 
        data-testid="login-button" 
        onClick={() => login('test@example.com', 'password123')}
      >
        Login
      </button>
      <button 
        data-testid="signup-button" 
        onClick={() => signup('new@example.com', 'password123')}
      >
        Sign Up
      </button>
      <button 
        data-testid="logout-button" 
        onClick={() => logout()}
      >
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mocks to their default behavior
    createUserWithEmailAndPassword.mockReset();
    signInWithEmailAndPassword.mockReset();
    firebaseSignOut.mockReset();
  });

  test('provides initial auth state correctly', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Initial state should be not logged in and not loading
    expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
    expect(screen.getByTestId('loading-status')).toHaveTextContent('Not loading');
    expect(screen.getByTestId('error-status')).toHaveTextContent('No error');
  });

  test('login function works correctly', async () => {
    // Mock successful login
    signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'test-uid', email: 'test@example.com' }
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Click login button
    fireEvent.click(screen.getByTestId('login-button'));
    
    // Should call signInWithEmailAndPassword with correct args
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith('test@example.com', 'password123');
    
    // Wait for auth state to update
    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as test@example.com');
    });
  });

  test('handles login errors correctly', async () => {
    // Mock failed login
    signInWithEmailAndPassword.mockRejectedValue(new Error('Invalid credentials'));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Click login button
    fireEvent.click(screen.getByTestId('login-button'));
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('error-status')).toHaveTextContent('Invalid credentials');
    });
  });

  test('signup function works correctly', async () => {
    // Mock successful signup
    createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'new-uid', email: 'new@example.com' }
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Click signup button
    fireEvent.click(screen.getByTestId('signup-button'));
    
    // Should call createUserWithEmailAndPassword with correct args
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith('new@example.com', 'password123');
    
    // Wait for auth state to update
    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as new@example.com');
    });
  });

  test('handles signup errors correctly', async () => {
    // Mock failed signup
    createUserWithEmailAndPassword.mockRejectedValue(new Error('Email already in use'));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Click signup button
    fireEvent.click(screen.getByTestId('signup-button'));
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('error-status')).toHaveTextContent('Email already in use');
    });
  });

  test('logout function works correctly', async () => {
    // First login
    signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'test-uid', email: 'test@example.com' }
    });
    
    // Then successfully logout
    firebaseSignOut.mockResolvedValue();
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Login first
    fireEvent.click(screen.getByTestId('login-button'));
    
    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as test@example.com');
    });
    
    // Now logout
    fireEvent.click(screen.getByTestId('logout-button'));
    
    // Wait for logout to complete
    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
    });
    
    // Check if signOut was called
    expect(firebaseSignOut).toHaveBeenCalled();
  });

  test('handles logout errors correctly', async () => {
    // Mock failed logout
    firebaseSignOut.mockRejectedValue(new Error('Logout failed'));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Click logout button
    fireEvent.click(screen.getByTestId('logout-button'));
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('error-status')).toHaveTextContent('Logout failed');
    });
  });
});