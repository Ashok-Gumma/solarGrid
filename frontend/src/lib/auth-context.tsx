import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchApi } from './api';

export type Role = 'ADMIN' | 'WAREHOUSE' | 'TECHNICIAN' | 'CUSTOMER';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatarUrl?: string;
  customerType?: 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
  businessName?: string;
  gstNumber?: string;
}

interface AuthContextType {
  user: UserSession | null;
  role: Role;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserSession | null>;
  register: (data: { name: string; email: string; password: string; phone?: string; customerType?: string; businessName?: string; gstNumber?: string }) => Promise<UserSession | null>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string; businessName?: string; gstNumber?: string }) => Promise<UserSession | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [role, setRole] = useState<Role>('CUSTOMER');
  const [token, setToken] = useState<string | null>(localStorage.getItem('solargrid_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (token) {
        const res = await fetchApi<UserSession>('/auth/me');
        if (res.success && res.data) {
          setUser(res.data);
          setRole(res.data.role);
        } else {
          logout();
        }
      } else {
        setUser(null);
        setRole('CUSTOMER');
      }
      setLoading(false);
    }
    checkAuth();
  }, [token]);

  const login = async (email: string, password: string): Promise<UserSession | null> => {
    setLoading(true);
    const res = await fetchApi<{ token: string; user: UserSession }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data) {
      localStorage.setItem('solargrid_token', res.data.token);
      localStorage.setItem('solargrid_role', res.data.user.role);
      setToken(res.data.token);
      setUser(res.data.user);
      setRole(res.data.user.role);
      setLoading(false);
      return res.data.user;
    }

    setLoading(false);
    return null;
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string; customerType?: string; businessName?: string; gstNumber?: string }): Promise<UserSession | null> => {
    setLoading(true);
    const res = await fetchApi<{ token: string; user: UserSession }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      localStorage.setItem('solargrid_token', res.data.token);
      localStorage.setItem('solargrid_role', res.data.user.role);
      setToken(res.data.token);
      setUser(res.data.user);
      setRole(res.data.user.role);
      setLoading(false);
      return res.data.user;
    }

    setLoading(false);
    if (res.message) {
      throw new Error(res.message);
    }
    return null;
  };

  const updateProfile = async (data: { name?: string; phone?: string; businessName?: string; gstNumber?: string }): Promise<UserSession | null> => {
    const res = await fetchApi<UserSession>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      setUser(res.data);
      return res.data;
    }
    return null;
  };

  const logout = () => {
    localStorage.removeItem('solargrid_token');
    localStorage.removeItem('solargrid_role');
    setToken(null);
    setUser(null);
    setRole('CUSTOMER');
  };

  return (
    <AuthContext.Provider value={{ user, role, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
