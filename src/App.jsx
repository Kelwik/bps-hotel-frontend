import { BrowserRouter, Route, Routes } from 'react-router';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect, useState } from 'react';
import { api } from './api';
import { tokenStore } from './token';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    async function refresh() {
      try {
        setIsLoading(true);
        const res = await api.post('/auth/refresh').then((res) => res.data);
        tokenStore.set(res.accessToken);
      } catch {
        tokenStore.clear();
      } finally {
        setIsLoading(false);
      }
    }
    refresh();
  }, []);

  if (isLoading) {
    return <h1>Loading....</h1>;
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
