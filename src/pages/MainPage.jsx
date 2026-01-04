import { Navigate } from 'react-router';
import LogoutButton from '../components/LogoutButton';

function MainPage() {
  return (
    <>
      <h1>This is the main page</h1>
      <LogoutButton />
    </>
  );
}

export default MainPage;
