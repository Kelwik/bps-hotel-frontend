import { Navigate } from 'react-router';
import { useMe } from '../hooks/useMe';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { data: user, isLoading, isError } = useMe();

  if (isLoading) {
    // Center the spinner on the screen
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner className="h-10 w-10" />
      </div>
    );
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
