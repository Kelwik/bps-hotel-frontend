import { Navigate } from 'react-router';
import { useMe } from '../hooks/useMe';

function ProtectedRoute({ children }) {
  const { isLoading, isError } = useMe();

  if (isLoading) return;

  if (isError) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
