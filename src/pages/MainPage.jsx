import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import {
  Building2,
  Users,
  BedDouble,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';

function MainPage() {
  // --- STATE ---
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Year Options (You can expand this range as needed)
  const YEARS = [2024, 2025, 2026];

  // --- 1. FETCH TOTAL HOTELS & CAPACITY ---
  // (Hotels are static/master data, so they don't depend on year usually,
  // unless you want to track active hotels per year. Keeping it simple for now.)
  const { data: hotels = [], isLoading: isLoadingHotels } = useQuery({
    queryKey: ['hotels'],
    queryFn: () => api.get('/hotels').then((res) => res.data),
  });

  // Calculate Capacity
  const totalRooms = hotels.reduce((acc, curr) => acc + curr.jmlh_kamar, 0);
  const totalBeds = hotels.reduce((acc, curr) => acc + curr.jmlh_tmpt_tdur, 0);

  // --- 2. FETCH TPK STATS (Dynamic Year) ---
  const { data: tpkData = [], isLoading: isLoadingTPK } = useQuery({
    queryKey: ['stats', 'tpk', 'month', selectedYear], // Add selectedYear to key
    queryFn: () =>
      api
        .get('/laporan/stats', {
          params: {
            indicator: 'tpk',
            groupBy: 'month',
            years: selectedYear, // Pass dynamic year
          },
        })
        .then((res) => res.data),
  });

  // --- 3. FETCH GUEST STATS (Dynamic Year) ---
  const { data: guestData = [], isLoading: isLoadingGuests } = useQuery({
    queryKey: ['stats', 'tamu_total', 'month', selectedYear], // Add selectedYear to key
    queryFn: () =>
      api
        .get('/laporan/stats', {
          params: {
            indicator: 'tamu_total',
            groupBy: 'month',
            years: selectedYear, // Pass dynamic year
          },
        })
        .then((res) => res.data),
  });

  // --- DATA PROCESSING ---
  const isLoading = isLoadingHotels || isLoadingTPK || isLoadingGuests;

  // Transform Data for Charts
  const chartData = tpkData.map((item) => {
    const guestItem = guestData.find((g) => g.label === item.label);
    return {
      name: item.label.substring(0, 3), // 'Januari' -> 'Jan'
      fullLabel: item.label,
      // Access value dynamically using selectedYear
      tpk: item.values[selectedYear] || 0,
      guests: guestItem ? guestItem.values[selectedYear] || 0 : 0,
    };
  });

  // Calculate Summary Metrics (Year-to-Date for selected year)
  const avgTPK =
    chartData.length > 0
      ? (
          chartData.reduce((acc, curr) => acc + curr.tpk, 0) / chartData.length
        ).toFixed(2)
      : 0;

  const totalGuestsYTD = chartData.reduce((acc, curr) => acc + curr.guests, 0);

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="space-y-8 font-montserrat pb-10">
      {/* Header with Year Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Dashboard Eksekutif
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Ringkasan performa akomodasi hotel tahun {selectedYear}.
          </p>
        </div>

        {/* Year Dropdown */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          <span className="text-sm text-slate-600 font-medium">Tahun:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-1.5 outline-none font-semibold cursor-pointer"
          >
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Akomodasi"
          value={hotels.length}
          subtitle={`${hotels.length} Hotel Terdaftar`}
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Kapasitas Kamar"
          value={totalRooms.toLocaleString()}
          subtitle={`${totalBeds.toLocaleString()} Tempat Tidur`}
          icon={BedDouble}
          color="indigo"
        />
        <StatCard
          title={`Rata-rata TPK ${selectedYear}`}
          value={`${avgTPK}%`}
          subtitle="Sepanjang Tahun"
          icon={TrendingUp}
          color="green"
          trend="up"
        />
        <StatCard
          title={`Total Tamu ${selectedYear}`}
          value={totalGuestsYTD.toLocaleString()}
          subtitle="Akumulasi (YTD)"
          icon={Users}
          color="purple"
        />
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: TPK Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                Tren Tingkat Penghunian Kamar (TPK)
              </h3>
              <p className="text-xs text-slate-500">
                Persentase hunian per bulan tahun {selectedYear}
              </p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTpk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tpk"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTpk)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Chart: Guest Counts */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800">
              Kunjungan Tamu
            </h3>
            <p className="text-xs text-slate-500">
              Volume tamu per bulan tahun {selectedYear}
            </p>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  dy={10}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar
                  dataKey="guests"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: STAT CARD ---
function StatCard({ title, value, subtitle, icon: Icon, color, trend }) {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${colorStyles[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs">
        {trend === 'up' && (
          <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
        )}
        {trend === 'down' && (
          <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
        )}
        <span className="text-slate-400 font-medium">{subtitle}</span>
      </div>
    </div>
  );
}

export default MainPage;
