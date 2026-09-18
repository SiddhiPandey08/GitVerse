import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currUser, setCurrUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (userId) {
      setCurrUser(userId);
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ currUser, setCurrUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
