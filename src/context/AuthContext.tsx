import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authApi } from '../api/authApi';
import { setAccessToken } from '../api/client';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  register: (name: string, email: string, pass: string) => Promise<User>;
  logout: () => Promise<void>;
  loginDemo: (role?: 'user' | 'admin') => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session on mount
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const data = await authApi.refresh();
        if (isMounted && data.accessToken) {
          setAccessToken(data.accessToken);
          setUser(data.user);
        }
      } catch {
        // Not authenticated or expired session, silent fail
        if (isMounted) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await authApi.login(email, pass);
      setAccessToken(data.accessToken);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.fullName.split(' ')[0]}!`);
      return data.user;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await authApi.register(name, email, pass);
      setAccessToken(data.accessToken);
      setUser(data.user);
      toast.success('Account created successfully!');
      return data.user;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      setAccessToken(null);
      setUser(null);
      toast.success('Logged out successfully');
    }
  }, []);

  const loginDemo = useCallback(async (role: 'user' | 'admin' = 'user') => {
    const email = role === 'admin' ? 'admin@basketly.app' : 'demo@basketly.app';
    const password = 'Password@123';
    return await login(email, password);
  }, [login]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        loginDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
