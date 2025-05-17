// This is a mock authentication service since we're not implementing a real backend
export const loginUser = (email, password) => {
  // In a real app, this would make an API call to authenticate
  return new Promise((resolve, reject) => {
    // For demo purposes, accept any non-empty credentials
    if (email && password) {
      setTimeout(() => {
        // Generate a deterministic ID based on email to ensure consistency across sessions
        // This ensures the same user will always have the same ID
        const id = `user_${email.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
        const user = {
          id,
          uid: id, // Add a uid field to ensure compatibility with both id and uid references
          email,
          name: email.split("@")[0],
        };
        resolve(user);
      }, 500);
    } else {
      reject(new Error("Email and password are required"));
    }
  });
};

export const registerUser = (email, password, name) => {
  // In a real app, this would make an API call to register a new user
  return new Promise((resolve, reject) => {
    if (email && password && name) {
      setTimeout(() => {
        // Generate a deterministic ID based on email to ensure consistency across sessions
        const id = `user_${email.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
        const user = {
          id,
          uid: id, // Add a uid field to ensure compatibility with both id and uid references
          email,
          name,
        };
        resolve(user);
      }, 500);
    } else {
      reject(new Error("All fields are required"));
    }
  });
};
