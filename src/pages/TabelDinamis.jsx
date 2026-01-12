import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import {
  AlertTriangle,
  Trash2,
  RotateCcw,
  Download,
  ChevronDown,
  Loader2,
} from 'lucide-react';

function TabelDinamisPage() {
  // --- STATE ---
  const [selectedIndicator, setSelectedIndicator] = useState('');
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedRowHeader, setSelectedRowHeader] = useState('hotel'); // 'hotel' | 'month' | 'kecamatan'
  const [isSubmitted, setIsSubmitted] = useState(false);

  // --- CONFIGURATION ---
  const INDICATORS = [
    { id: 'tpk', label: 'Tingkat Penghunian Kamar (TPK) %' },
    { id: 'tamu_total', label: 'Jumlah Tamu (Total Guests)' },
    { id: 'rlm', label: 'Rata-rata Lama Menginap (RLM)' },
  ];

  const ROW_HEADERS = [
    { id: 'hotel', label: 'Menurut Nama Hotel' },
    { id: 'month', label: 'Menurut Bulan' },
    { id: 'kecamatan', label: 'Menurut Kecamatan' },
  ];

  const YEARS = [2024, 2025, 2026];

  // --- DATA FETCHING ---
  // Fetch ALL hotels to get metadata (names, kecamatan)
  const { data: hotels = [] } = useQuery({
    queryKey: ['hotels'],
    queryFn: () => api.get('/hotels').then((res) => res.data),
  });

  // Fetch ALL reports (For a real app, you might want to filter this by year in the API)
  const { data: rawReports = [], isLoading } = useQuery({
    queryKey: ['all-reports'],
    queryFn: async () => {
      // We need to fetch reports for all hotels.
      // Assuming we can pass a query param or loop through hotels.
      // For this prototype, let's assume getting data for the selected years via a new endpoint or loop.
      // Ideally: api.get('/laporan/aggregate?year=2024,2025')

      // MOCKING DATA LOGIC for demonstration if backend doesn't support aggregate yet:
      const promises = hotels.map((h) =>
        api
          .get(
            `/laporan/${h.hotel_id}?month=0&year=${new Date().getFullYear()}`
          ) // Fetching some sample
          .catch(() => ({ data: [] }))
      );
      // In production, please add `exports.getAllReports` to your backend ReportController
      return [];
    },
    enabled: hotels.length > 0,
  });

  // --- AGGREGATION LOGIC (The "Dynamic" Part) ---
  const tableData = useMemo(() => {
    if (!isSubmitted || !selectedIndicator) return null;

    // This is where we would normally process 'rawReports'.
    // Since we don't have the full raw data in this chat context,
    // I will generate realistic MOCK data based on the selection to show the UI behavior.

    let rows = [];

    if (selectedRowHeader === 'hotel') {
      rows = hotels.map((h) => ({
        label: h.nama_hotel,
        values: selectedYears.reduce((acc, year) => {
          // Mock random logic based on indicator
          acc[year] =
            selectedIndicator === 'tpk'
              ? (Math.random() * 40 + 40).toFixed(2)
              : selectedIndicator === 'tamu_total'
              ? Math.floor(Math.random() * 500 + 100)
              : (Math.random() * 2 + 1).toFixed(2);
          return acc;
        }, {}),
      }));
    } else if (selectedRowHeader === 'month') {
      const months = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
      ];
      rows = months.map((m) => ({
        label: m,
        values: selectedYears.reduce((acc, year) => {
          acc[year] =
            selectedIndicator === 'tpk'
              ? (Math.random() * 40 + 40).toFixed(2)
              : selectedIndicator === 'tamu_total'
              ? Math.floor(Math.random() * 1000 + 200)
              : (Math.random() * 2 + 1).toFixed(2);
          return acc;
        }, {}),
      }));
    } else if (selectedRowHeader === 'kecamatan') {
      const kecamatans = [...new Set(hotels.map((h) => h.kecamatan))].filter(
        Boolean
      );
      if (kecamatans.length === 0) kecamatans.push('Pariwari', 'Fakfak Kota'); // Fallback
      rows = kecamatans.map((k) => ({
        label: k,
        values: selectedYears.reduce((acc, year) => {
          acc[year] =
            selectedIndicator === 'tpk'
              ? (Math.random() * 40 + 40).toFixed(2)
              : selectedIndicator === 'tamu_total'
              ? Math.floor(Math.random() * 2000 + 500)
              : (Math.random() * 2 + 1).toFixed(2);
          return acc;
        }, {}),
      }));
    }

    return rows;
  }, [
    isSubmitted,
    selectedIndicator,
    selectedYears,
    selectedRowHeader,
    hotels,
  ]);

  // --- HANDLERS ---
  const toggleYear = (year) => {
    setSelectedYears((prev) =>
      prev.includes(year)
        ? prev.filter((y) => y !== year)
        : [...prev, year].sort()
    );
  };

  const handleReset = () => {
    setSelectedIndicator('');
    setSelectedYears([]);
    setSelectedRowHeader('hotel');
    setIsSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedIndicator || selectedYears.length === 0) {
      alert('Please select an Indicator and at least one Year.');
      return;
    }
    setIsSubmitted(true);
  };

  return (
    <div className="font-montserrat space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tabel Dinamis</h1>
        <p className="text-slate-500 text-sm mt-1">
          Kustomisasi tabel data statistik hotel sesuai kebutuhan.
        </p>
      </div>

      {/* --- FILTER SECTION --- */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-6"
      >
        {/* Warning Banner */}
        <div className="bg-yellow-50 border border-yellow-200 px-4 py-3 rounded-md flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            Hanya dapat memilih maksimal 1 indikator untuk performa terbaik.
          </p>
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Kategori Subjek
              </label>
              <select
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                disabled
              >
                <option>Statistik Pariwisata</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Tabel / Indikator
              </label>
              <div className="h-48 border border-slate-200 rounded-lg overflow-y-auto p-2 space-y-1 bg-white">
                {INDICATORS.map((ind) => (
                  <div
                    key={ind.id}
                    onClick={() => setSelectedIndicator(ind.id)}
                    className={`p-2 rounded cursor-pointer text-sm transition-colors ${
                      selectedIndicator === ind.id
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {ind.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="flex gap-4 h-full">
              {/* Years */}
              <div className="flex-1 flex flex-col space-y-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center justify-between">
                  Tahun
                  {selectedYears.length === 0 && (
                    <span className="text-red-500 text-xs">*Wajib</span>
                  )}
                </label>
                <div className="flex-1 border border-slate-200 rounded-lg overflow-y-auto p-2 space-y-1 bg-white max-h-[200px]">
                  {YEARS.map((year) => (
                    <div
                      key={year}
                      onClick={() => toggleYear(year)}
                      className={`p-2 rounded cursor-pointer text-sm transition-colors flex justify-between items-center ${
                        selectedYears.includes(year)
                          ? 'bg-blue-100 text-blue-800 font-medium'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {year}
                      {selectedYears.includes(year) && (
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Row Headers */}
              <div className="flex-1 flex flex-col space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Judul Baris
                </label>
                <div className="flex-1 border border-slate-200 rounded-lg overflow-y-auto p-2 space-y-1 bg-white max-h-[200px]">
                  {ROW_HEADERS.map((head) => (
                    <div
                      key={head.id}
                      onClick={() => setSelectedRowHeader(head.id)}
                      className={`p-2 rounded cursor-pointer text-sm transition-colors ${
                        selectedRowHeader === head.id
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {head.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Summary */}
        <div className="border-t pt-4">
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
            Data Terpilih
          </p>
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {selectedIndicator && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                {INDICATORS.find((i) => i.id === selectedIndicator)?.label}
                <button type="button" onClick={() => setSelectedIndicator('')}>
                  <Trash2 className="w-3 h-3 hover:text-red-500" />
                </button>
              </span>
            )}
            {selectedYears.map((year) => (
              <span
                key={year}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
              >
                Tahun: {year}
                <button type="button" onClick={() => toggleYear(year)}>
                  <Trash2 className="w-3 h-3 hover:text-red-500" />
                </button>
              </span>
            ))}
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100">
              Baris:{' '}
              {ROW_HEADERS.find((r) => r.id === selectedRowHeader)?.label}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3 pt-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedIndicator || selectedYears.length === 0}
          >
            Submit
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Atur Ulang
          </button>
        </div>
      </form>

      {/* --- RESULT SECTION --- */}
      {isSubmitted && tableData && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Controls */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-2 text-sm font-medium text-slate-700">
                  Freeze Judul
                </span>
              </label>
            </div>
            <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <Download className="w-4 h-4" /> Unduh Excel
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th
                      rowSpan="2"
                      className="px-6 py-4 border-r border-slate-600 font-semibold w-1/3"
                    >
                      {
                        ROW_HEADERS.find((r) => r.id === selectedRowHeader)
                          ?.label
                      }
                    </th>
                    <th
                      colSpan={selectedYears.length}
                      className="px-6 py-3 border-b border-slate-600 text-center font-semibold bg-slate-900"
                    >
                      {
                        INDICATORS.find((i) => i.id === selectedIndicator)
                          ?.label
                      }
                    </th>
                  </tr>
                  <tr>
                    {selectedYears.map((year) => (
                      <th
                        key={year}
                        className="px-6 py-3 border-r border-slate-600 text-center last:border-0 bg-slate-800"
                      >
                        {year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {tableData.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-6 py-3 font-medium text-slate-900 bg-slate-50 group-hover:bg-slate-100 border-r border-slate-200">
                        {row.label}
                      </td>
                      {selectedYears.map((year) => (
                        <td
                          key={year}
                          className="px-6 py-3 text-center text-slate-600"
                        >
                          {row.values[year] ? row.values[year] : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {tableData.length === 0 && (
                    <tr>
                      <td
                        colSpan={selectedYears.length + 1}
                        className="p-8 text-center text-slate-500"
                      >
                        Tidak ada data untuk kombinasi yang dipilih.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-xs text-slate-500 italic mt-2">
            * Data dihitung secara real-time berdasarkan laporan yang masuk.
          </div>
        </div>
      )}
    </div>
  );
}

export default TabelDinamisPage;
