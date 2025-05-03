import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from '../../services/auth';

// Mock Firebase auth
jest.mock('../../services/auth');

// Mock API service
jest.mock('../../services/api', () => ({
  fetchAllCountries: jest.fn().mockResolvedValue([
    { 
      name: { common: 'Test Country' }, 
      cca3: 'TST',
      capital: ['Test City'],
      region: 'Test Region',
      population: 1000000,
      flags: { svg: 'test.svg' }
    }
  ])
}));

describe('Authentication Integration', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock auth state listener
    let authCallback = null;
    onAuthStateChanged.mockImplementation((auth, callback) => {
      authCallback = callback;
      callback(null); // Start with not logged in
      return jest.fn(); // Unsubscribe function
    });
    
    // Save authCallback for later use
    global.authCallback = authCallback;
  });

  test('user can register, login, and logout', async () => {
    // Mock successful registration
    createUserWithEmailAndPassword.mockResolvedValueOnce({
      user: { uid: 'new-user', email: 'new@example.com' }
    });
    
    // Mock successful login
    signInWithEmailAndPassword.mockResolvedValueOnce({
      user: { uid: 'new-user', email: 'new@example.com' }
    });
    
    // Mock successful logout
    signOut.mockResolvedValueOnce();
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Wait for app to load
    await waitFor(() => {
      expect(screen.getByText('Log In')).toBeInTheDocument();
    });
    
    // Go to register page
    fireEvent.click(screen.getByText('Register'));
    
    // Fill out registration form
    await waitFor(() => {
      expect(screen.getByText('Create an Account')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'new@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    // Submit registration form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Wait for registration to complete and auth state to update
    await waitFor(() => {
      // Simulate auth state change
      global.authCallback({ uid: 'new-user', email: 'new@example.com' });
    });
    
    // Should be redirected to home page and logged in
    await waitFor(() => {
      expect(screen.getByText('Log Out')).toBeInTheDocument();
    });
    
    // Log out
    fireEvent.click(screen.getByText('Log Out'));
    
    // Wait for logout to complete
    await waitFor(() => {
      // Simulate auth state change
      global.authCallback(null);
    });
    
    // Should be logged out
    await waitFor(() => {
      expect(screen.getByText('Log In')).toBeInTheDocument();
    });
    
    // Log in again
    fireEvent.click(screen.getByText('Log In'));
    
    // Fill out login form
    await waitFor(() => {
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'new@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    // Submit login form
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    // Wait for login to complete and auth state to update
    await waitFor(() => {
      // Simulate auth state change
      global.authCallback({ uid: 'new-user', email: 'new@example.com' });
    });
    
    // Should be redirected to home page and logged in
    await waitFor(() => {
      expect(screen.getByText('Log Out')).toBeInTheDocument();
    });
  });

  test('displays error messages for authentication failures', async () => {
    // Mock failed login
    signInWithEmailAndPassword.mockRejectedValueOnce({
      code: 'auth/wrong-password',
      message: 'Invalid email or password'
    });
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Go to login page
    await waitFor(() => {
      expect(screen.getByText('Log In')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Log In'));
    
    // Fill out login form
    await waitFor(() => {
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrong-password' }
    });
    
    // Submit login form
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    // Should display error message
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });

  test('redirects protected routes to login when not authenticated', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Wait for app to load
    await waitFor(() => {
      expect(screen.getByText('Log In')).toBeInTheDocument();
    });
    
    // Try to navigate to favorites (protected route)
    window.history.pushState({}, '', '/favorites');
    fireEvent.popState(window);
    
    // Should be redirected to login
    await waitFor(() => {
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });
  });
});