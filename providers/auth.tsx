import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import * as SecureStore from 'expo-secure-store';

import { post } from '@/services/api';

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_USER_EMAIL_KEY = 'authUserEmail';

export type AuthUser = {
  email: string;
  name?: string;
};

export type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nickname: string) => Promise<void>;
  signOut: () => Promise<void>;
};

type AuthSuccessResponse = {
  token?: string;
  accessToken?: string;
  email?: string;
  name?: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function saveAuthData(token: string, email: string) {
  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  await SecureStore.setItemAsync(AUTH_USER_EMAIL_KEY, email);
}

async function clearAuthData() {
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(AUTH_USER_EMAIL_KEY);
}

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const storedToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        const storedEmail = await SecureStore.getItemAsync(AUTH_USER_EMAIL_KEY);

        if (storedToken && storedEmail) {
          setToken(storedToken);
          setUser({ email: storedEmail });
        }
      } catch {
        await clearAuthData();
      } finally {
        setInitializing(false);
      }
    }

    restoreSession();
  }, []);

  async function handleAuthSuccess(result: AuthSuccessResponse, email: string, defaultName?: string) {
    const jwt = result.token || result.accessToken;
    const userEmail = result.email || email;

    if (!jwt) {
      throw new Error('서버에서 토큰을 받지 못했습니다.');
    }

    await saveAuthData(jwt, userEmail);
    setToken(jwt);
    setUser({ email: userEmail, name: result.name || defaultName });
  }

  async function signIn(email: string, password: string) {
    setLoading(true);

    try {
      const result = await post<AuthSuccessResponse>('/auth/login', { email, password });
      await handleAuthSuccess(result, email);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, nickname: string) {
    setLoading(true);

    try {
      await post<AuthSuccessResponse>('/auth/signup', {
        email,
        password,
        username: nickname,
      });
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    setLoading(true);
    try {
      await clearAuthData();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, initializing, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
