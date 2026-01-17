import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import EntryTable from '../components/EntryTable';
import StatusModal from '../components/StatusModal';
import * as XLSX from 'xlsx'; // Import XLSX
import {
  Save,
  Building2,
  Calendar,
  Loader2,
  ChevronDown,
  ChevronUp,
  BedDouble,
  DoorOpen,
  Banknote,
  Info,
  Download, // Import Download Icon
} from 'lucide-react';

// Daftar nama bulan dalam Bahasa Indonesia
const INDONESIAN_MONTHS = [
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

function InputPage() {
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState([]);

  // State untuk Accordion Info Hotel
  const [isHotelInfoOpen, setIsHotelInfoOpen] = useState(false);

  // State untuk Modal Notifikasi
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const queryClient = useQueryClient();

  // 1. Ambil Data Hotel
  const { data: hotels, isLoading: isLoadingHotels } = useQuery({
    queryKey: ['hotels'],
    queryFn: () => api.get('/hotels').then((res) => res.data),
  });

  // Helper: Cari data hotel yang sedang dipilih
  const selectedHotel = hotels?.find(
    (h) => h.hotel_id === parseInt(selectedHotelId)
  );

  // 2. Ambil Data Laporan
  const { data: existingData, isLoading: isLoadingReport } = useQuery({
    queryKey: ['report', selectedHotelId, month, year],
    queryFn: () =>
      api
        .get(`/laporan/${selectedHotelId}`, { params: { month, year } })
        .then((res) => res.data),
    enabled: !!selectedHotelId,
    retry: false,
  });

  // 3. Mutasi Simpan
  const saveMutation = useMutation({
    mutationFn: (data) =>
      api.post(`/laporan/${selectedHotelId}`, { laporanBulanan: data }),
    onSuccess: () => {
      setModalState({
        isOpen: true,
        type: 'success',
        title: 'Berhasil Disimpan',
        message: 'Data laporan bulanan berhasil disimpan ke sistem.',
      });
      queryClient.invalidateQueries(['report', selectedHotelId, month, year]);
    },
    onError: (err) => {
      console.error(err);
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Gagal Menyimpan',
        message:
          err.response?.data?.message || 'Terjadi kesalahan pada server.',
      });
    },
  });

  const handleSave = () => {
    if (!selectedHotelId) {
      setModalState({
        isOpen: true,
        type: 'warning',
        title: 'Hotel Belum Dipilih',
        message: 'Silakan pilih hotel terlebih dahulu.',
      });
      return;
    }

    const payload = reportData.map((row) => ({
      tanggal_laporan: new Date(Date.UTC(year, month, row.date)).toISOString(),
      kamar_checkin: row.roomsIn,
      kamar_checkout: row.roomsOut,
      kamar_ditempati: row.todayRooms,
      pengunjung_international_checkin: row.foreignIn,
      pengunjung_international_checkout: row.foreignOut,
      pengunjung_international_menetap: row.todayForeign,
      pengunjung_lokal_checkin: row.localIn,
      pengunjung_lokal_checkout: row.localOut,
      pengunjung_lokal_menetap: row.todayLocal,
    }));

    saveMutation.mutate(payload);
  };

  // --- EXPORT TO EXCEL FUNCTION ---
  const handleExportExcel = () => {
    if (!reportData || reportData.length === 0 || !selectedHotel) return;

    // 1. Prepare Headers (Double Row Header)
    // Row 1: Group Headers
    const headerRow1 = [
      'Tanggal',
      'Kamar',
      '',
      '',
      '',
      'Mancanegara',
      '',
      '',
      '',
      'Domestik',
      '',
      '',
      '',
    ];
    // Row 2: Detail Headers
    const headerRow2 = [
      '',
      'Kemarin',
      'Masuk',
      'Keluar',
      'Terisi',
      'Kemarin',
      'Masuk',
      'Keluar',
      'Menetap',
      'Kemarin',
      'Masuk',
      'Keluar',
      'Menetap',
    ];

    // 2. Map Data Rows
    const dataRows = reportData.map((row) => [
      row.date,
      row.yesterdayRooms,
      row.roomsIn,
      row.roomsOut,
      row.todayRooms,
      row.yesterdayForeign,
      row.foreignIn,
      row.foreignOut,
      row.todayForeign,
      row.yesterdayLocal,
      row.localIn,
      row.localOut,
      row.todayLocal,
    ]);

    // 3. Create Worksheet from Array of Arrays
    const ws = XLSX.utils.aoa_to_sheet([headerRow1, headerRow2, ...dataRows]);

    // 4. Define Merges
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // Tanggal (Merge Vertical)
      { s: { r: 0, c: 1 }, e: { r: 0, c: 4 } }, // Kamar (Merge Horizontal)
      { s: { r: 0, c: 5 }, e: { r: 0, c: 8 } }, // Mancanegara (Merge Horizontal)
      { s: { r: 0, c: 9 }, e: { r: 0, c: 12 } }, // Domestik (Merge Horizontal)
    ];

    // 5. Create Workbook and Download
    const wb = XLSX.utils.book_new();
    const sheetName = 'Laporan Bulanan';
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const fileName = `Laporan_${selectedHotel.nama_hotel.replace(
      /\s+/g,
      '_'
    )}_${INDONESIAN_MONTHS[month]}_${year}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const closeModal = () => setModalState({ ...modalState, isOpen: false });

  // Formatter Rupiah
  const formatRupiah = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoadingHotels)
    return (
      <div className="flex justify-center p-10 font-montserrat">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="space-y-6 font-montserrat pb-20">
      <StatusModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
      />

      {/* --- Header & Kontrol Utama --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Input Data Bulanan
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Kelola statistik harian hotel untuk VHTS.
            </p>
          </div>

          <div className="flex gap-3">
            {/* Tombol Export Excel */}
            <button
              onClick={handleExportExcel}
              disabled={!selectedHotelId || reportData.length === 0}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>

            {/* Tombol Simpan */}
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending || !selectedHotelId}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Simpan Data
            </button>
          </div>
        </div>

        {/* --- Filters --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              Pilih Hotel
            </label>
            <div className="relative">
              <select
                value={selectedHotelId}
                onChange={(e) => setSelectedHotelId(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
              >
                <option value="">-- Pilih Hotel --</option>
                {hotels?.map((hotel) => (
                  <option key={hotel.hotel_id} value={hotel.hotel_id}>
                    {hotel.nama_hotel}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              Bulan
            </label>
            <div className="relative">
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
              >
                {INDONESIAN_MONTHS.map((namaBulan, i) => (
                  <option key={i} value={i}>
                    {namaBulan}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              Tahun
            </label>
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* --- ACCORDION INFO HOTEL --- */}
      {selectedHotel && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <button
            onClick={() => setIsHotelInfoOpen(!isHotelInfoOpen)}
            className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  Detail Hotel: {selectedHotel.nama_hotel}
                </h3>
                <p className="text-xs text-slate-500">
                  Klik untuk melihat total kamar, tempat tidur, dan daftar
                  harga.
                </p>
              </div>
            </div>
            {isHotelInfoOpen ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {isHotelInfoOpen && (
            <div className="p-5 border-t border-slate-200 bg-white">
              {/* Statistik Ringkas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-xs text-blue-600 font-medium flex items-center gap-1 mb-1">
                    <DoorOpen className="w-3 h-3" /> Total Kamar
                  </span>
                  <p className="text-xl font-bold text-blue-800">
                    {selectedHotel.jmlh_kamar}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mb-1">
                    <BedDouble className="w-3 h-3" /> Total Tempat Tidur
                  </span>
                  <p className="text-xl font-bold text-emerald-800">
                    {selectedHotel.jmlh_tmpt_tdur}
                  </p>
                </div>
              </div>

              {/* Daftar Tipe Kamar */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Daftar Tipe Kamar & Harga
                </h4>
                {selectedHotel.tipe_kamars &&
                selectedHotel.tipe_kamars.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {selectedHotel.tipe_kamars.map((tk) => (
                      <div
                        key={tk.tipekamar_id}
                        className="flex flex-col p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-sm hover:border-blue-200 transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-semibold text-slate-800 capitalize">
                            {tk.nama_tipekamar.replace(/_/g, ' ')}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded border ${
                              tk.kategori_kamar === 'suite'
                                ? 'bg-purple-100 text-purple-700 border-purple-200'
                                : 'bg-slate-200 text-slate-600 border-slate-300'
                            }`}
                          >
                            {tk.kategori_kamar === 'suite'
                              ? 'Suite'
                              : 'Non-Suite'}
                          </span>
                        </div>
                        <div className="mt-auto flex items-center gap-1 text-slate-600 text-xs font-medium">
                          <Banknote className="w-3.5 h-3.5 text-green-600" />
                          {formatRupiah(tk.harga_kamar)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    Belum ada data tipe kamar.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Tabel Input Utama --- */}
      {selectedHotelId ? (
        isLoadingReport ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
            <p className="text-slate-500">Memuat data laporan...</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <EntryTable
              month={month}
              year={year}
              onDataChange={setReportData}
              existingData={existingData}
              hotelCapacity={selectedHotel?.jmlh_kamar || 0}
            />
          </div>
        )
      ) : (
        <div className="text-center py-24 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center">
          <div className="p-4 bg-white rounded-full shadow-sm mb-4">
            <Building2 className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">
            Belum Ada Hotel Dipilih
          </h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">
            Silakan pilih hotel pada menu di atas untuk mulai memasukkan atau
            mengedit data laporan.
          </p>
        </div>
      )}
    </div>
  );
}

export default InputPage;
