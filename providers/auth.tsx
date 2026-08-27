import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import { post, setAuthTokenGetter, setUnauthorizedHandler } from '@/services/api';

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_REFRESH_TOKEN_KEY = 'authRefreshToken';
const AUTH_USER_EMAIL_KEY = 'authUserEmail';
const AUTH_USER_NICKNAME_KEY = 'authUserNickname';

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
  refreshToken?: string;
  nickname?: string;
};

type ApiResponseWrapper<T> = {
  success: boolean;
  message: string;
  data: T;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function saveAuthData(token: string, refreshToken: string, email: string, nickname?: string) {
  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  await SecureStore.setItemAsync(AUTH_REFRESH_TOKEN_KEY, refreshToken);
  await SecureStore.setItemAsync(AUTH_USER_EMAIL_KEY, email);
  if (nickname) {
    await SecureStore.setItemAsync(AUTH_USER_NICKNAME_KEY, nickname);
  }
}

async function clearAuthData() {
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(AUTH_REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(AUTH_USER_EMAIL_KEY);
  await SecureStore.deleteItemAsync(AUTH_USER_NICKNAME_KEY);
}

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  // refreshToken으로 새 accessToken을 발급받습니다. 실패하면 세션을 정리하고 null을 반환합니다.
  async function refreshAccessToken(): Promise<string | null> {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    refreshPromiseRef.current = (async () => {
      try {
        const storedRefreshToken = await SecureStore.getItemAsync(AUTH_REFRESH_TOKEN_KEY);
        const storedEmail = await SecureStore.getItemAsync(AUTH_USER_EMAIL_KEY);
        const storedNickname = await SecureStore.getItemAsync(AUTH_USER_NICKNAME_KEY);
        if (!storedRefreshToken || !storedEmail) {
          return null;
        }

        const response = await post<ApiResponseWrapper<AuthSuccessResponse>>('/auth/refresh', {
          refreshToken: storedRefreshToken,
        });
        if (!response.success || !response.data.accessToken) return null;

        const { accessToken, refreshToken: newRefreshToken, nickname } = response.data;
        const resolvedNickname = nickname ?? storedNickname ?? undefined;
        await saveAuthData(
          accessToken,
          newRefreshToken ?? storedRefreshToken,
          storedEmail,
          resolvedNickname,
        );
        setToken(accessToken);
        setUser({ email: storedEmail, name: resolvedNickname });
        return accessToken;
      } catch {
        return null;
      }
    })();

    try {
      return await refreshPromiseRef.current;
    } finally {
      refreshPromiseRef.current = null;
    }
  }

  // API 요청이 401을 받으면 이 핸들러로 accessToken 재발급을 시도합니다.
  useEffect(() => {
    setUnauthorizedHandler(async () => {
      const newToken = await refreshAccessToken();
      if (!newToken) {
        await clearAuthData();
        setToken(null);
        setUser(null);
      }
      return newToken;
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  // 앱 시작 시, refreshToken으로 세션을 검증/복원합니다.
  useEffect(() => {
    async function restoreSession() {
      const newToken = await refreshAccessToken();
      if (!newToken) {
        await clearAuthData();
      }
      setInitializing(false);
    }

    restoreSession();
  }, []);

  // auth.tsx — 앱 시작할 때 "내 토큰 값은 이렇게 가져가" 라고 등록
  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);

  // 인증 성공 시, 토큰과 이메일을 저장하고 상태를 업데이트합니다.
  async function handleAuthSuccess(
    result: AuthSuccessResponse,
    email: string,
    fallbackNickname?: string,
  ) {
    const jwt = result.accessToken;
    const refreshToken = result.refreshToken;

    if (!jwt || !refreshToken) {
      throw new Error('서버에서 토큰을 받지 못했습니다.');
    }

    const nickname = result.nickname ?? fallbackNickname;
    await saveAuthData(jwt, refreshToken, email, nickname);
    setToken(jwt);
    setUser({ email, name: nickname });
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
      await handleAuthSuccess(response.data, email);
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
      await handleAuthSuccess(response.data, email, nickname);
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
