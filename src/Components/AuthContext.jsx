import React, { useContext, createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Ensure you import it correctly

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null); // State to hold the user's role

  useEffect(() => {
    const userId = localStorage.getItem('userId'); // Adjust the key as needed
    const role = localStorage.getItem('role'); // Adjust the key as needed

    if (userId) {
      try {
        setIsAuthenticated(true);
        setRole(role); // Assuming the role is stored in the token
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
  }, []);

  const login = (userId, role) => {
    try {
      localStorage.setItem('userId', userId); // Store token in local storage
      setIsAuthenticated(true); // Set to true after successful login
      setRole(role); // Set the role from the decoded token
    } catch (error) {
      console.error("Invalid token", error);
    }
  };

  const logout = () => {
    localStorage.removeItem('userId'); // Clear token from local storage
    setIsAuthenticated(false); // Clear authentication on logout
    setRole(null); // Clear the role on logout
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, role }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
