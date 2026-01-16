import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2, Plus, Trash2, Bed } from 'lucide-react';

// Opsi sesuai Enum di Prisma Schema
const ROOM_NAMES = [
  { value: 'standar', label: 'Standar' },
  { value: 'superior', label: 'Superior' },
  { value: 'deluxe', label: 'Deluxe' },
  { value: 'junior_suite', label: 'Junior Suite' },
  { value: 'suite', label: 'Suite' },
  { value: 'president_suite', label: 'President Suite' },
];

const ROOM_CATEGORIES = [
  { value: 'non_suite', label: 'Non-Suite' },
  { value: 'suite', label: 'Suite' },
];

const HotelFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}) => {
  // [FIX] Gunakan Lazy Initializer untuk state
  // Ini menggantikan useEffect yang menyebabkan render ganda
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        ...initialData,
        // Pastikan tipe_kamars ada, jika tidak set array kosong
        tipe_kamars: initialData.tipe_kamars || [],
      };
    }

    // Default state untuk data baru
    return {
      nama_hotel: '',
      kecamatan: '',
      kel_desa: '',
      rt: '',
      jmlh_kamar: '',
      jmlh_tmpt_tdur: '',
      tipe_kamars: [],
    };
  });

  // Hapus useEffect "Inisialisasi Data" yang sebelumnya ada di sini
  // Karena 'key' di parent component sudah menangani reset state saat ganti hotel

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addRoomType = () => {
    setFormData((prev) => ({
      ...prev,
      tipe_kamars: [
        ...prev.tipe_kamars,
        {
          nama_tipekamar: 'standar',
          kategori_kamar: 'non_suite',
          harga_kamar: 0,
        },
      ],
    }));
  };

  const removeRoomType = (index) => {
    setFormData((prev) => ({
      ...prev,
      tipe_kamars: prev.tipe_kamars.filter((_, i) => i !== index),
    }));
  };

  const handleRoomTypeChange = (index, field, value) => {
    const newRoomTypes = [...formData.tipe_kamars];
    newRoomTypes[index] = { ...newRoomTypes[index], [field]: value };
    setFormData((prev) => ({ ...prev, tipe_kamars: newRoomTypes }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      jmlh_kamar: parseInt(formData.jmlh_kamar),
      jmlh_tmpt_tdur: parseInt(formData.jmlh_tmpt_tdur),
      tipe_kamars: formData.tipe_kamars.map((t) => ({
        ...t,
        harga_kamar: parseInt(t.harga_kamar),
      })),
    };
    onSubmit(payload);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-[10000] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-slate-800">
            {initialData ? 'Edit Data Hotel' : 'Tambah Hotel Baru'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Informasi Dasar */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-800 border-b pb-2 mb-3">
              Informasi Umum
            </h4>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nama Hotel
              </label>
              <input
                type="text"
                name="nama_hotel"
                required
                value={formData.nama_hotel}
                onChange={handleChange}
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Contoh: Grand Hotel"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kecamatan
                </label>
                <input
                  type="text"
                  name="kecamatan"
                  required
                  value={formData.kecamatan}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Desa/Kelurahan
                </label>
                <input
                  type="text"
                  name="kel_desa"
                  required
                  value={formData.kel_desa}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  RT
                </label>
                <input
                  type="text"
                  name="rt"
                  required
                  value={formData.rt}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Total Kamar
                </label>
                <input
                  type="number"
                  name="jmlh_kamar"
                  required
                  min="0"
                  value={formData.jmlh_kamar}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Total Tempat Tidur
                </label>
                <input
                  type="number"
                  name="jmlh_tmpt_tdur"
                  required
                  min="0"
                  value={formData.jmlh_tmpt_tdur}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Tipe Kamar (Dynamic Form) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                <Bed className="w-4 h-4" />
                Daftar Tipe & Harga Kamar
              </h4>
              <button
                type="button"
                onClick={addRoomType}
                className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md font-medium hover:bg-blue-100 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Tambah Tipe
              </button>
            </div>

            <div className="space-y-3">
              {formData.tipe_kamars.length === 0 ? (
                <p className="text-sm text-slate-400 italic text-center py-4 bg-slate-50 rounded-lg">
                  Belum ada tipe kamar. Klik "Tambah Tipe" untuk mengisi.
                </p>
              ) : (
                formData.tipe_kamars.map((kamar, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row gap-3 items-end bg-slate-50 p-3 rounded-lg border border-slate-100 animate-in slide-in-from-left-2 duration-300"
                  >
                    <div className="flex-1 w-full">
                      <label className="text-xs font-medium text-slate-500 mb-1 block">
                        Nama Tipe
                      </label>
                      <select
                        value={kamar.nama_tipekamar}
                        onChange={(e) =>
                          handleRoomTypeChange(
                            index,
                            'nama_tipekamar',
                            e.target.value
                          )
                        }
                        className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        {ROOM_NAMES.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full md:w-1/3">
                      <label className="text-xs font-medium text-slate-500 mb-1 block">
                        Kategori
                      </label>
                      <select
                        value={kamar.kategori_kamar}
                        onChange={(e) =>
                          handleRoomTypeChange(
                            index,
                            'kategori_kamar',
                            e.target.value
                          )
                        }
                        className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        {ROOM_CATEGORIES.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full md:w-1/3">
                      <label className="text-xs font-medium text-slate-500 mb-1 block">
                        Harga (Rp)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={kamar.harga_kamar}
                        onChange={(e) =>
                          handleRoomTypeChange(
                            index,
                            'harga_kamar',
                            e.target.value
                          )
                        }
                        className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="0"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeRoomType(index)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-md transition-colors mb-[1px]"
                      title="Hapus baris ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t sticky bottom-0 bg-white pb-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {initialData ? 'Simpan Perubahan' : 'Simpan Hotel'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default HotelFormModal;
