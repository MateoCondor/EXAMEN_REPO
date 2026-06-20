import React, { createContext, useContext, useState, ReactNode } from 'react';
import { loginUser, registrarCliente, LoginResponse, RegistroRequest } from '@/lib/ticketera-api';

export type UserInfo = {
  username: string;
  rol: 'admin' | 'cliente';
  cedula: string | null;
};

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo | null;
  login: (username: string, password: string) => Promise<UserInfo>;
  register: (data: RegistroRequest) => Promise<UserInfo>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): ReactNode {
  const [user, setUser] = useState<UserInfo | null>(null);

  const login = async (username: string, password: string): Promise<UserInfo> => {
    const response: LoginResponse = await loginUser({ username: username.trim(), password: password.trim() });
    const userInfo: UserInfo = {
      username: response.username,
      rol: response.rol as 'admin' | 'cliente',
      cedula: response.cedula,
    };
    setUser(userInfo);
    return userInfo;
  };

  const register = async (data: RegistroRequest): Promise<UserInfo> => {
    const response: LoginResponse = await registrarCliente(data);
    const userInfo: UserInfo = {
      username: response.username,
      rol: response.rol as 'admin' | 'cliente',
      cedula: response.cedula,
    };
    setUser(userInfo);
    return userInfo;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: user !== null, user, login, register, logout }}>
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
