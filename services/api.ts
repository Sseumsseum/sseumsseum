import type { ApiResponse } from '@/types';

export type ApiHeaders = Record<string, string> | undefined;

const DEFAULT_HEADERS: ApiHeaders = {
  'Content-Type': 'application/json',
};

const API_ROOT_URL = 'https://handgun-replay-absolve.ngrok-free.dev';
const API_BASE_URL = `${API_ROOT_URL}/api`;

// 상대 경로를 서버 루트 기준 절대 이미지 URL로 변환
export function resolveImageUrl(path: string) {
  return path.startsWith('http') ? path : `${API_ROOT_URL}/${path}`;
}

// 응답 content-type에 따라 JSON 또는 텍스트로 파싱 (204는 null)
async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  if (response.status === 204) {
    return null as unknown as T;
  }

  if (contentType?.includes('application/json')) {
    return (await response.json()) as T;
  }

  const text = await response.text();
  return text as unknown as T;
}

// 상대 경로를 API_BASE_URL 기준 요청 URL로 변환
function buildUrl(path: string) {
  return path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
}

// 에러 응답 바디에서 메시지를 추출하고, 없으면 기본 에러 메시지 반환
function parseError<T>(response: Response, data: T | null) {
  const defaultMessage = `API request failed: ${response.status}`;

  if (!data || typeof data !== 'object') {
    return defaultMessage;
  }

  const body = data as Record<string, unknown>;
  return (body.message as string) || (body.error as string) || defaultMessage;
}

// 401 응답을 받았을 때 새 accessToken을 발급받아오는 콜백. AuthProvider가 등록합니다.
type UnauthorizedHandler = () => Promise<string | null>;
let unauthorizedHandler: UnauthorizedHandler | null = null;

// 401 처리 핸들러를 등록/해제
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

const REQUEST_TIMEOUT_MS = 10000;

// accessToken을 넘겨줄 함수. AuthProvider가 등록합니다.
let getAuthToken: (() => string | null) | null = null;
export function setAuthTokenGetter(fn: (() => string | null) | null) {
  getAuthToken = fn;
}

// fetch 요청 실행, 타임아웃/401 재시도/에러 파싱을 처리하는 공통 요청 함수
export async function request<T>(
  path: string,
  options: { method: string; headers?: ApiHeaders; body?: unknown },
  retryOnUnauthorized = true,
): Promise<T> {
  const url = buildUrl(path);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // 요청 보낼 때마다 최신 토큰을 헤더에 자동으로 붙임 (options.headers가 있으면 그게 우선)
  const token = getAuthToken?.();
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method,
      headers: { ...DEFAULT_HEADERS, ...authHeader, ...options.headers },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError')
      throw new Error(
        `요청 시간이 초과됐어요. 서버(${API_ROOT_URL})에 연결할 수 있는지 확인해주세요.`,
      );

    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  console.log('[api]', options.method, url, response.status);

  if (
    response.status === 401 &&
    retryOnUnauthorized &&
    unauthorizedHandler &&
    options.headers?.Authorization
  ) {
    const newToken = await unauthorizedHandler();
    if (newToken) {
      return request<T>(
        path,
        { ...options, headers: { ...options.headers, Authorization: `Bearer ${newToken}` } },
        false,
      );
    }
  }

  const data = await parseResponse<T>(response).catch(() => null);

  if (!response.ok) {
    throw new Error(parseError(response, data));
  }

  return data as T;
}

// GET 요청
export function get<T>(path: string, headers?: ApiHeaders) {
  return request<T>(path, { method: 'GET', headers });
}

// GET 요청 후 ApiResponse 래핑을 벗기고 data만 반환 (실패 시 에러 throw)
export async function getData<T>(path: string, headers?: ApiHeaders): Promise<T> {
  const response = await get<ApiResponse<T>>(path, headers);
  if (!response.success) throw new Error(response.message);
  return response.data;
}

// POST 요청
export function post<T>(path: string, body: unknown, headers?: ApiHeaders) {
  return request<T>(path, { method: 'POST', headers, body });
}

// POST 요청 후 ApiResponse 래핑을 벗기고 data만 반환 (실패 시 에러 throw)
export async function postData<T>(path: string, body: unknown, headers?: ApiHeaders): Promise<T> {
  const response = await post<ApiResponse<T>>(path, body, headers);
  if (!response.success) throw new Error(response.message);
  return response.data;
}

// PUT 요청
export function put<T>(path: string, body: unknown, headers?: ApiHeaders) {
  return request<T>(path, { method: 'PUT', headers, body });
}

// DELETE 요청
export function del<T>(path: string, headers?: ApiHeaders) {
  return request<T>(path, { method: 'DELETE', headers });
}

// DELETE 요청 후 ApiResponse 래핑을 벗기고 성공 여부만 확인 (실패 시 에러 throw)
export async function deleteData(path: string, headers?: ApiHeaders): Promise<void> {
  const response = await del<ApiResponse<null>>(path, headers);
  if (!response.success) throw new Error(response.message);
}
