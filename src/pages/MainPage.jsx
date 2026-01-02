import { Navigate } from 'react-router';

function MainPage() {
  const user = false;
  if (!user) {
    return <Navigate to={'/login'} replace />;
  }
  return (
    <>
      <h1>This is the main page</h1>
    </>
  );
}

export default MainPage;
