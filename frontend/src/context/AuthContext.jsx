import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const loginTime = localStorage.getItem('loginTime');
      const threeHours = 3 * 60 * 60 * 1000;
      
      if (loginTime && Date.now() - parseInt(loginTime, 10) > threeHours) {
        logout();
        setLoading(false);
        return;
      }
      
      const timeRemaining = loginTime ? threeHours - (Date.now() - parseInt(loginTime, 10)) : threeHours;
      const timer = setTimeout(() => {
        logout();
      }, timeRemaining);

      fetch((import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Invalid token');
          return res.json();
        })
        .then((data) => {
          setUser(data.user);
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));

      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('loginTime', Date.now().toString());
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loginTime');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
