import React from 'react';
import { Pencil, Trash2, MapPin, BedDouble } from 'lucide-react';

function HotelTable({ hotels, onEdit, onDelete }) {
  // Cek jika data kosong
  if (!hotels || hotels.length === 0) {
    return (
      <div className="p-10 text-center text-slate-500 bg-slate-50 border-t border-slate-100">
        <p>Belum ada data hotel.</p>
        <p className="text-xs mt-1">
          Klik "Tambah Hotel Baru" untuk mulai mengisi.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-slate-600">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
          <tr>
            <th className="px-6 py-4 w-1/3">Nama Hotel</th>
            <th className="px-6 py-4">Lokasi</th>
            <th className="px-6 py-4 text-center">Kapasitas</th>
            <th className="px-6 py-4 text-center">RT</th>
            <th className="px-6 py-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {hotels.map((hotel) => (
            <tr
              key={hotel.hotel_id}
              className="bg-white hover:bg-slate-50 transition-colors"
            >
              {/* Kolom Nama Hotel & Tipe Kamar */}
              <td className="px-6 py-4 align-top">
                <div className="flex flex-col gap-1.5">
                  <span className="font-semibold text-slate-900 text-base">
                    {hotel.nama_hotel}
                  </span>

                  {/* Tampilkan Pills/Badges Tipe Kamar */}
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {hotel.tipe_kamars && hotel.tipe_kamars.length > 0 ? (
                      hotel.tipe_kamars.map((tk, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100 capitalize"
                        >
                          {/* Ubah 'junior_suite' menjadi 'junior suite' */}
                          {tk.nama_tipekamar.replace(/_/g, ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic flex items-center gap-1">
                        - Tidak ada tipe kamar -
                      </span>
                    )}
                  </div>
                </div>
              </td>

              {/* Kolom Lokasi */}
              <td className="px-6 py-4 align-top">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-slate-700 block">
                    {hotel.kecamatan}
                  </span>
                  <div className="flex items-center gap-1 text-slate-500 text-xs">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{hotel.kel_desa}</span>
                  </div>
                </div>
              </td>

              {/* Kolom Kapasitas */}
              <td className="px-6 py-4 text-center align-top">
                <div className="flex flex-col items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {hotel.jmlh_kamar} Kamar
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                    {hotel.jmlh_tmpt_tdur} Bed
                  </span>
                </div>
              </td>

              {/* Kolom RT */}
              <td className="px-6 py-4 text-center font-medium text-slate-600 align-top pt-6">
                {hotel.rt}
              </td>

              {/* Kolom Aksi */}
              <td className="px-6 py-4 text-right align-top pt-5">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(hotel)}
                    className="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all border border-transparent hover:border-blue-100"
                    title="Edit Data Hotel"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(hotel)}
                    className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all border border-transparent hover:border-red-100"
                    title="Hapus Hotel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HotelTable;
