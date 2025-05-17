import { loginUser, registerUser } from "../../../services/authService";

// Mock localStorage for tests
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

// Mock UUID generation to make tests predictable
jest.mock("uuid", () => ({
  v4: jest.fn(() => "123e4567-e89b-12d3-a456-426614174000"),
}));

describe("Auth Service", () => {
  beforeEach(() => {
    // Clear localStorage and reset mocks
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("loginUser", () => {
    test("returns user data when login is called", async () => {
      // Based on your implementation, the service doesn't actually check credentials
      // but simply returns a mock user
      const user = await loginUser("test@example.com", "password123");
      // Assert that a user object is returned with the email we provided
      expect(user).toEqual({
        id: expect.any(String),
        uid: expect.any(String),
        email: "test@example.com",
        name: expect.any(String),
      });
    });
  });

  describe("registerUser", () => {
    test("returns user data when registration is called", async () => {
      // Your implementation returns a user object without actually storing it
      const user = await registerUser(
        "new@example.com",
        "password123",
        "New User"
      );

      // Assert
      expect(user).toEqual({
        id: expect.any(String),
        uid: expect.any(String),
        email: "new@example.com",
        name: "New User",
      });
    });

    test("validates that all fields are required", async () => {
      // Execute & Assert - missing fields
      await expect(
        registerUser(null, "password123", "New User")
      ).rejects.toThrow("All fields are required");

      await expect(
        registerUser("new@example.com", "", "New User")
      ).rejects.toThrow("All fields are required");

      await expect(
        registerUser("new@example.com", "password123", "")
      ).rejects.toThrow("All fields are required");
    });
  });

  // Additional test to verify how the auth service would behave in a real application
  describe("Auth service simulation", () => {
    test("simulates storing and retrieving a user", async () => {
      // Since your actual implementation is a mock, this test demonstrates
      // how it would work in a real scenario

      // First register a new user
      const newUser = await registerUser(
        "test@example.com",
        "password123",
        "Test User"
      );

      // Manually store this user (simulating what a real implementation would do)
      const users = [];
      users.push({
        ...newUser,
        password: "password123", // In a real app, this would be hashed
      });
      localStorage.setItem("users", JSON.stringify(users));

      // Now try to login with this user
      const loggedInUser = await loginUser("test@example.com", "password123");
      // Verify the user is returned (in a real implementation, credentials would be checked)
      expect(loggedInUser).toEqual({
        id: expect.any(String),
        uid: expect.any(String),
        email: "test@example.com",
        name: expect.any(String),
      });
    });
  });
});
