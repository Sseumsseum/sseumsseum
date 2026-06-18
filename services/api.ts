export type ApiHeaders = Record<string, string> | undefined;

const DEFAULT_HEADERS: ApiHeaders = {
  'Content-Type': 'application/json',
};

const API_BASE_URL = 'http://172.30.1.72:8080/api';

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

export async function request<T>(
  path: string,
  options: { method: string; headers?: ApiHeaders; body?: unknown },
): Promise<T> {
  const url = buildUrl(path);
  const response = await fetch(url, {
    method: options.method,
    headers: { ...DEFAULT_HEADERS, ...options.headers },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await parseResponse<T>(response).catch(() => null);

  if (!response.ok) {
    throw new Error(parseError(response, data));
  }

  return data as T;
}

export function get<T>(path: string, headers?: ApiHeaders) {
  return request<T>(path, { method: 'GET', headers });
}

export function post<T>(path: string, body: unknown, headers?: ApiHeaders) {
  return request<T>(path, { method: 'POST', headers, body });
}

export function put<T>(path: string, body: unknown, headers?: ApiHeaders) {
  return request<T>(path, { method: 'PUT', headers, body });
}

export function del<T>(path: string, headers?: ApiHeaders) {
  return request<T>(path, { method: 'DELETE', headers });
}
