import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const VALID_USERNAME = 'MONSTER';
const VALID_PASSWORD = 'MONSTER9';

export function AuthProvider({ children }: { children: ReactNode }): ReactNode {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Aquí podrías verificar si hay sesión almacenada
    // Por ahora, comenzamos sin autenticación
  }, []);

  const login = (username: string, password: string): boolean => {
    const cleanUser = username?.trim().toUpperCase();
    const cleanPass = password?.trim();
    if (cleanUser === VALID_USERNAME && cleanPass === VALID_PASSWORD) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}
