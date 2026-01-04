import { useQuery } from '@tanstack/react-query';
import LogoutButton from '../components/LogoutButton';
import { api } from '../api';

function MainPage() {
  const { data: hotels } = useQuery({
    queryKey: ['hotels'],
    queryFn: () => api.get('/hotels').then((res) => res.data),
  });
  console.log(hotels);

  return (
    <>
      <h1>This is the main page</h1>
      <LogoutButton />
    </>
  );
}

export default MainPage;
