import { BrowserRouter, Route, Routes } from 'react-router';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect, useState } from 'react';
import { api } from './api';
import { tokenStore } from './token';
import DashboardLayout from './layouts/DashboardLayout';
import LoadingSpinner from './components/LoadingSpinner';
import HotelPage from './pages/HotelPage';
import InputPage from './pages/InputPage';

function App() {
  const [isLoading, setIsLoading] = useState(true);
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
    return <LoadingSpinner />;
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<MainPage />} />
          <Route path="/tabel" element={<MainPage />} />
          <Route path="/hotel" element={<HotelPage />} />
          <Route path="/input" element={<InputPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
