import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

const HotelFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}) => {
  // FIX: Initialize state directly from props.
  // We rely on the parent to reset this component using the 'key' prop.
  const [formData, setFormData] = useState({
    nama_hotel: initialData?.nama_hotel || '',
    kecamatan: initialData?.kecamatan || '',
    kel_desa: initialData?.kel_desa || '',
    rt: initialData?.rt || '',
    jmlh_kamar: initialData?.jmlh_kamar || '',
    jmlh_tmpt_tdur: initialData?.jmlh_tmpt_tdur || '',
    tipe_kamars: [],
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-lg font-bold text-slate-800">
            {initialData ? 'Edit Hotel' : 'Add New Hotel'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Hotel Name
            </label>
            <input
              type="text"
              name="nama_hotel"
              required
              value={formData.nama_hotel}
              onChange={handleChange}
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Grand Hotel"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Kecamatan */}
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
            {/* Kel/Desa */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Desa / Kelurahan
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
          </div>

          {/* RT */}
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
              placeholder="e.g. 5"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Rooms */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Total Rooms
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
            {/* Beds */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Total Beds
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

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
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
              {initialData ? 'Update Hotel' : 'Save Hotel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HotelFormModal;
