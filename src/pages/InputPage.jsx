import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../api';
import EntryTable from '../components/EntryTable';
import { Save, Building2, Calendar, Loader2 } from 'lucide-react';

function InputPage() {
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState([]);

  // Fetch Hotels for Dropdown
  const { data: hotels, isLoading: isLoadingHotels } = useQuery({
    queryKey: ['hotels'],
    queryFn: () => api.get('/hotels').then((res) => res.data),
  });

  // Mutation to Save Data
  const saveMutation = useMutation({
    mutationFn: (data) =>
      api.post(`/laporan/${selectedHotelId}`, { laporanBulanan: data }),
    onSuccess: () => {
      alert('Report saved successfully!');
    },
    onError: (err) => {
      console.error(err);
      alert(
        'Failed to save report: ' + (err.response?.data?.message || err.message)
      );
    },
  });

  // Handle Form Submission
  const handleSave = () => {
    if (!selectedHotelId) return alert('Please select a hotel first.');

    // Transform calculated table data into API payload format
    const payload = reportData.map((row) => ({
      tanggal_laporan: new Date(Date.UTC(year, month, row.date)).toISOString(), // Use UTC to avoid timezone shifts

      // Room Data
      kamar_checkin: row.roomsIn,
      kamar_checkout: row.roomsOut,
      kamar_ditempati: row.todayRooms,

      // International Guests
      pengunjung_international_checkin: row.foreignIn,
      pengunjung_international_checkout: row.foreignOut,
      pengunjung_international_menetap: row.todayForeign,

      // Local Guests
      pengunjung_lokal_checkin: row.localIn,
      pengunjung_lokal_checkout: row.localOut,
      pengunjung_lokal_menetap: row.todayLocal,
    }));

    saveMutation.mutate(payload);
  };

  if (isLoadingHotels)
    return (
      <div className="flex justify-center p-10 font-montserrat">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6 font-montserrat">
      {/* --- Page Header & Controls --- */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Monthly Entry Input
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage daily hotel statistics for VHTS.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saveMutation.isPending || !selectedHotelId}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Data
          </button>
        </div>

        {/* --- Filters / Selectors --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Hotel Selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              Select Hotel
            </label>
            <select
              value={selectedHotelId}
              onChange={(e) => setSelectedHotelId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">-- Choose a Hotel --</option>
              {hotels?.map((hotel) => (
                <option key={hotel.hotel_id} value={hotel.hotel_id}>
                  {hotel.nama_hotel}
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              Month
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* --- Main Table Component --- */}
      {selectedHotelId ? (
        <EntryTable month={month} year={year} onDataChange={setReportData} />
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">
            No Hotel Selected
          </h3>
          <p className="text-slate-500">
            Please select a hotel above to start entering data.
          </p>
        </div>
      )}
    </div>
  );
}

export default InputPage;
