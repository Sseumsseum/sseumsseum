import { getData } from '@/services/api';
import { Payment } from '@/types';

export function fetchPayments() {
  return getData<Payment[]>('/payments');
}
