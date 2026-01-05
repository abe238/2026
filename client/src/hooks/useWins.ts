import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useWeeklyWins() {
  return useQuery({ queryKey: ['wins', 'weekly'], queryFn: api.wins.weekly });
}

export function useWinsVault(limit = 50, offset = 0) {
  return useQuery({ queryKey: ['wins', 'vault', limit, offset], queryFn: () => api.wins.vault(limit, offset) });
}

export function useCreateWin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.wins.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wins'] });
      queryClient.invalidateQueries({ queryKey: ['momentum'] });
    },
  });
}
