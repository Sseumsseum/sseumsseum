import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

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
  accessToken?: string;
  email: string;
  nickname?: string;
};

type ApiResponseWrapper<T> = {
  success: boolean;
  message: string;
  data: T;
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

  // 앱 시작 시, SecureStore에서 토큰과 이메일을 가져와 세션을 복원합니다.
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

  // 인증 성공 시, 토큰과 이메일을 저장하고 상태를 업데이트합니다.
  async function handleAuthSuccess(result: AuthSuccessResponse) {
    const jwt = result.accessToken;

    if (!jwt) {
      throw new Error('서버에서 토큰을 받지 못했습니다.');
    }

    await saveAuthData(jwt, result.email);
    setToken(jwt);
    setUser({ email: result.email, name: result.nickname });
  }

  // 로그인
  async function signIn(email: string, password: string) {
    setLoading(true);

    try {
      const response = await post<ApiResponseWrapper<AuthSuccessResponse>>('/auth/login', {
        email,
        password,
      });
      if (!response.success) throw new Error(response.message);
      await handleAuthSuccess(response.data);
    } finally {
      setLoading(false);
    }
  }

  // 회원가입
  async function signUp(email: string, password: string, nickname: string) {
    setLoading(true);

    try {
      const response = await post<ApiResponseWrapper<AuthSuccessResponse>>('/auth/signup', {
        email,
        password,
        nickname,
      });
      if (!response.success) throw new Error(response.message);
      await handleAuthSuccess(response.data);
    } finally {
      setLoading(false);
    }
  }

  // 로그아웃
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
