import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { logout } from '../authHelper';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear specific queries or the entire cache
      queryClient.invalidateQueries({ queryKey: ['me'] });
      navigate('/login');
    },
  });
};
