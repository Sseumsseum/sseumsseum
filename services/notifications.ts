import { getData } from '@/services/api';
import type { Notification } from '@/types';

function authHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export function fetchNotifications(cursor: number | null, size: number, token: string | null) {
  const params = new URLSearchParams();
  if (cursor !== null) params.set('cursor', String(cursor));
  params.set('size', String(size));
  return getData<Notification[]>(`/notifications?${params.toString()}`, authHeaders(token));
}
