import { createContext, useContext, useState, useEffect } from "react";

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Initially no user
  const [token, setToken] = useState(null);

  // Load token and user data from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("bearerToken");
    const storedUser = localStorage.getItem("userData");
    
    if (storedToken) {
      setToken(storedToken);
    }
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("userData");
      }
    }
  }, []);

  const login = (userData, jwtToken) => {
    setUser(userData);
    localStorage.setItem("userData", JSON.stringify(userData));
    if (jwtToken) {
      setToken(jwtToken);
      localStorage.setItem("bearerToken", jwtToken);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("bearerToken");
    localStorage.removeItem("userData");
  };

  return (
    // The 'setUser' function has been added to the value object here
    <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the context
export const useAuth = () => {
  return useContext(AuthContext);
};