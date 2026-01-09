import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { login } from '../authHelper';

const LoginPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Keep UI state structure
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // React Query Logic
  const mutation = useMutation({
    mutationFn: ({ username, password }) => login(username, password),
    onSuccess: async () => {
      // FIX: Use resetQueries instead of invalidateQueries.
      // This clears any cached "Error" state immediately, forcing the
      // ProtectedRoute to show the 'Loading' spinner instead of
      // redirecting back to login immediately.
      await queryClient.resetQueries({ queryKey: ['me'] });

      // Navigate using 'replace' to prevent back-button loops
      navigate('/', { replace: true });
    },
  });

  // Derived loading state from mutation
  const isLoading = mutation.isPending;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      username: formData.username,
      password: formData.password,
    });
  };

  return (
    <div className="min-h-screen flex w-full font-sans text-slate-800">
      {/* LEFT SIDE: Brand Identity */}
      <div className="hidden lg:flex w-7/12 bg-bpsBlue-dark relative items-center justify-center overflow-hidden">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-bpsBlue to-bpsBlue-dark opacity-90"></div>

        {/* Abstract Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        ></div>

        <div className="relative z-10 p-16 text-white max-w-xl">
          <div className="flex items-center gap-4 mb-8 opacity-90">
            {/* Logo Placeholder */}
            <div className="w-14 h-14 p-1 shrink-0 flex items-center justify-center ">
              <img
                src="/LogoBps.svg"
                alt="logo"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Hierarchy Container */}
            <div className="flex flex-col">
              <h2 className="text-lg font-lato font-bold tracking-widest uppercase leading-tight">
                Badan Pusat Statistik
              </h2>
              <h3 className="text-sm font-inter font-medium text-blue-200 tracking-wide mt-0.5">
                Kabupaten Fakfak
              </h3>
            </div>
          </div>

          <h1 className="text-5xl font-extrabold mb-8 leading-tight font-lato">
            Sistem VHTS <br />
            <span className="text-bpsOrange">Online</span>
          </h1>

          <div className="h-1.5 w-24 bg-bpsOrange mb-8 rounded-full"></div>

          <p className="text-xl text-blue-50 font-light leading-relaxed">
            Portal Entri Data Tingkat Penghunian Kamar Hotel.
            <br />
            <span className="opacity-75 text-base">
              Pelayanan Statistik Terpadu.
            </span>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-5/12 flex items-center justify-center bg-white p-8 md:p-12 relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-bpsBlue lg:hidden"></div>

        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h2 className="text-3xl font-lato font-bold text-bpsBlue-dark">
              Selamat Datang
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Silakan masuk menggunakan akun BPS Anda.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="group">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
                Username / NIP
              </label>
              <div className="relative">
                <input
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-bpsBlue focus:border-bpsBlue focus:bg-white outline-none transition-all placeholder:text-gray-400"
                  placeholder="Masukkan username"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-bpsBlue focus:border-bpsBlue focus:bg-white outline-none transition-all placeholder:text-gray-400 pr-10"
                  placeholder="••••••••"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-bpsBlue transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-bpsBlue hover:bg-bpsBlue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bpsBlue disabled:opacity-70 disabled:cursor-not-allowed transition-all uppercase tracking-wide"
              >
                {isLoading ? (
                  // Using BPS Orange for the spinner to make it pop against the blue button
                  <svg
                    className="animate-spin h-5 w-5 text-bpsOrange"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="white"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  'Masuk Aplikasi'
                )}
              </button>
            </div>

            <div className="flex items-center justify-center mt-6">
              <a
                href="#"
                className="text-xs text-bpsBlue font-semibold hover:text-bpsBlue-dark hover:underline transition-colors"
              >
                Lupa kata sandi?
              </a>
            </div>
          </form>

          <div className="mt-16 border-t border-slate-100 pt-6 text-center">
            <p className="text-xs text-slate-400 font-medium">
              &copy; 2026 Badan Pusat Statistik Kabupaten Fakfak
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
