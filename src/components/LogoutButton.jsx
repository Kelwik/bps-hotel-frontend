import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '../authHelper';
import { useNavigate } from 'react-router';

function LogoutButton() {
  const queryClient = useQueryClient();

  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: () => logout(),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      navigate('/login');
    },
  });
  return <button onClick={() => mutation.mutate()}>Logout</button>;
}

export default LogoutButton;
