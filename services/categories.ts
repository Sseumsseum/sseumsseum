import { getData } from '@/services/api';
import type { Category, CategoryGroupType } from '@/types';

function authHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export function fetchCategories(groupType: CategoryGroupType, token: string | null) {
  const params = new URLSearchParams({ groupType });
  return getData<Category[]>(`/categories?${params.toString()}`, authHeaders(token));
}
