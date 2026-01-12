import React from 'react';
import { Pencil, Trash2, MapPin, BedDouble } from 'lucide-react';

function HotelTable({ hotels, onEdit, onDelete }) {
  if (!hotels || hotels.length === 0) {
    return (
      <div className="p-10 text-center text-slate-500">
        No hotels found. Click "Add New Hotel" to create one.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-slate-600">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
          <tr>
            <th className="px-6 py-4">Hotel Name</th>
            <th className="px-6 py-4">Location</th>
            <th className="px-6 py-4 text-center">Capacity</th>
            <th className="px-6 py-4 text-center">RT</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {hotels.map((hotel) => (
            <tr
              key={hotel.hotel_id}
              className="bg-white border-b hover:bg-slate-50 transition-colors"
            >
              <td className="px-6 py-4 font-medium text-slate-900">
                {hotel.nama_hotel}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-medium text-slate-700">
                    {hotel.kecamatan}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {hotel.kel_desa}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {hotel.jmlh_kamar} Rooms
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <BedDouble className="w-3 h-3" />
                    {hotel.jmlh_tmpt_tdur} Beds
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">{hotel.rt}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(hotel)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Hotel"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(hotel)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Hotel"
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
