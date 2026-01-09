import React from 'react';
import { Outlet } from 'react-router';
import Navbar from '../components/Navbar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Main Content Area */}
      {/* This renders the child route components (Dashboard, Entri, etc.) */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
