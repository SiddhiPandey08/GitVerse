import { createContext, useContext, useEffect, useState } from "react";
import client from "./api/client";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currUser, setCurrUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (userId && token) {
      setCurrUser({ _id: userId, id: userId });
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    delete client.defaults.headers.common.Authorization;
    setCurrUser(null);
  };

  return (
    <AuthContext.Provider value={{ currUser, setCurrUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
