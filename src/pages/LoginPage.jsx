import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { login } from '../authHelper';
import { useNavigate } from 'react-router';

function LoginPage() {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: ({ username, password }) => login(username, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      navigate('/');
    },
  });
  return (
    <>
      <h1>This Is The Login Page My bro</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={() => {
          mutation.mutate({ username, password });
        }}
      >
        Submit
      </button>
    </>
  );
}

export default LoginPage;
