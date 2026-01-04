import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me').then((res) => res.data),
    retry: false,
  });
}
