import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    const userToLogout = currentUser; // Capture currentUser before setting it to null
    setCurrentUser(null);
    localStorage.removeItem("user");
    // If you need to clear user-specific favorites on logout, do it based on the logged-out user's ID.
    // However, CountryContext already handles favorites based on currentUser, so removing them here
    // might be redundant or could be more targeted if needed.
    // For now, let's remove the generic 'favorites' removal as it's incorrect.
    // If user-specific cleanup is desired here:
    // if (userToLogout && userToLogout.uid) {
    //   localStorage.removeItem(`favorites_${userToLogout.uid}`);
    // }
  };

  const register = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const value = {
    currentUser,
    login,
    logout,
    register,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
