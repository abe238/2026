import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useMomentum() {
  return useQuery({ queryKey: ['momentum'], queryFn: api.momentum.get, refetchInterval: 60000 });
}
