import type { ApiResponse } from '@/types';

export type ApiHeaders = Record<string, string> | undefined;

const DEFAULT_HEADERS: ApiHeaders = {
  'Content-Type': 'application/json',
};

const API_ROOT_URL = 'http://172.30.1.72:8080';
const API_BASE_URL = `${API_ROOT_URL}/api`;

export function resolveImageUrl(path: string) {
  return path.startsWith('http') ? path : `${API_ROOT_URL}/${path}`;
}

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

function buildUrl(path: string) {
  return path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
}

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

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

const REQUEST_TIMEOUT_MS = 10000;

export async function request<T>(
  path: string,
  options: { method: string; headers?: ApiHeaders; body?: unknown },
  retryOnUnauthorized = true,
): Promise<T> {
  const url = buildUrl(path);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method,
      headers: { ...DEFAULT_HEADERS, ...options.headers },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError')
      throw new Error(`요청 시간이 초과됐어요. 서버(${API_ROOT_URL})에 연결할 수 있는지 확인해주세요.`);

    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  console.log('[api]', options.method, url, response.status);

  if (response.status === 401 && retryOnUnauthorized && unauthorizedHandler && options.headers?.Authorization) {
    const newToken = await unauthorizedHandler();
    if (newToken) {
      return request<T>(path, { ...options, headers: { ...options.headers, Authorization: `Bearer ${newToken}` } }, false);
    }
  }

  const data = await parseResponse<T>(response).catch(() => null);

  if (!response.ok) {
    throw new Error(parseError(response, data));
  }

  return data as T;
}

export function get<T>(path: string, headers?: ApiHeaders) {
  return request<T>(path, { method: 'GET', headers });
}

export async function getData<T>(path: string, headers?: ApiHeaders): Promise<T> {
  const response = await get<ApiResponse<T>>(path, headers);
  if (!response.success) throw new Error(response.message);
  return response.data;
}

export function post<T>(path: string, body: unknown, headers?: ApiHeaders) {
  return request<T>(path, { method: 'POST', headers, body });
}

export async function postData<T>(path: string, body: unknown, headers?: ApiHeaders): Promise<T> {
  const response = await post<ApiResponse<T>>(path, body, headers);
  if (!response.success) throw new Error(response.message);
  return response.data;
}

export function put<T>(path: string, body: unknown, headers?: ApiHeaders) {
  return request<T>(path, { method: 'PUT', headers, body });
}

export function del<T>(path: string, headers?: ApiHeaders) {
  return request<T>(path, { method: 'DELETE', headers });
}

export async function deleteData(path: string, headers?: ApiHeaders): Promise<void> {
  const response = await del<ApiResponse<null>>(path, headers);
  if (!response.success) throw new Error(response.message);
}
