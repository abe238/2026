import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useGoalAreas() {
  return useQuery({ queryKey: ['goalAreas'], queryFn: api.goalAreas.list });
}

export function useUpdateGoalArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.goalAreas.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goalAreas'] }),
  });
}
