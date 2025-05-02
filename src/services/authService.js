// This is a mock authentication service since we're not implementing a real backend
export const loginUser = (email, password) => {
    // In a real app, this would make an API call to authenticate
    return new Promise((resolve, reject) => {
      // For demo purposes, accept any non-empty credentials
      if (email && password) {
        setTimeout(() => {
          const user = {
            id: Date.now().toString(),
            email,
            name: email.split('@')[0]
          };
          resolve(user);
        }, 500);
      } else {
        reject(new Error('Email and password are required'));
      }
    });
  };
  
  export const registerUser = (email, password, name) => {
    // In a real app, this would make an API call to register a new user
    return new Promise((resolve, reject) => {
      if (email && password && name) {
        setTimeout(() => {
          const user = {
            id: Date.now().toString(),
            email,
            name
          };
          resolve(user);
        }, 500);
      } else {
        reject(new Error('All fields are required'));
      }
    });
  };