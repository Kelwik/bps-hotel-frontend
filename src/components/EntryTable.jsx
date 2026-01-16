import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, Calculator } from 'lucide-react';

// Helper untuk mendapatkan jumlah hari dalam sebulan
const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

const EntryTable = ({
  month,
  year,
  onDataChange,
  existingData,
  hotelCapacity,
}) => {
  // ... (State dan logika existing tidak berubah sampai useMemo) ...
  const [prevMonth, setPrevMonth] = useState(month);
  const [prevYear, setPrevYear] = useState(year);
  const [prevExistingData, setPrevExistingData] = useState(null);

  const [initialValues, setInitialValues] = useState({
    rooms: 0,
    foreign: 0,
    local: 0,
  });

  const [movements, setMovements] = useState(() =>
    Array.from({ length: getDaysInMonth(month, year) }, () => ({
      roomsIn: 0,
      roomsOut: 0,
      foreignIn: 0,
      foreignOut: 0,
      localIn: 0,
      localOut: 0,
    }))
  );

  if (
    month !== prevMonth ||
    year !== prevYear ||
    existingData !== prevExistingData
  ) {
    const newDays = getDaysInMonth(month, year);
    let newMovements = Array.from({ length: newDays }, () => ({
      roomsIn: 0,
      roomsOut: 0,
      foreignIn: 0,
      foreignOut: 0,
      localIn: 0,
      localOut: 0,
    }));
    let newInitialValues = { rooms: 0, foreign: 0, local: 0 };

    if (
      existingData &&
      Array.isArray(existingData) &&
      existingData.length > 0
    ) {
      existingData.forEach((record) => {
        const dateObj = new Date(record.tanggal_laporan);
        const dayIndex = dateObj.getUTCDate() - 1;
        if (dayIndex >= 0 && dayIndex < newDays) {
          newMovements[dayIndex] = {
            roomsIn: record.kamar_checkin,
            roomsOut: record.kamar_checkout,
            foreignIn: record.pengunjung_international_checkin,
            foreignOut: record.pengunjung_international_checkout,
            localIn: record.pengunjung_lokal_checkin,
            localOut: record.pengunjung_lokal_checkout,
          };
        }
      });

      const day1 = existingData.find(
        (d) => new Date(d.tanggal_laporan).getUTCDate() === 1
      );
      if (day1) {
        newInitialValues = {
          rooms:
            day1.kamar_ditempati - day1.kamar_checkin + day1.kamar_checkout,
          foreign:
            day1.pengunjung_international_menetap -
            day1.pengunjung_international_checkin +
            day1.pengunjung_international_checkout,
          local:
            day1.pengunjung_lokal_menetap -
            day1.pengunjung_lokal_checkin +
            day1.pengunjung_lokal_checkout,
        };
      }
    }

    setPrevMonth(month);
    setPrevYear(year);
    setPrevExistingData(existingData);
    setMovements(newMovements);
    setInitialValues(newInitialValues);
  }

  const handleMovementChange = (dayIndex, field, value) => {
    let numValue = value === '' ? 0 : parseInt(value);
    if (isNaN(numValue)) numValue = 0;
    setMovements((prev) => {
      const newMovements = [...prev];
      newMovements[dayIndex] = { ...newMovements[dayIndex], [field]: numValue };
      return newMovements;
    });
  };

  const handleInitialChange = (field, value) => {
    let numValue = value === '' ? 0 : parseInt(value);
    if (isNaN(numValue)) numValue = 0;
    setInitialValues((prev) => ({ ...prev, [field]: numValue }));
  };

  // --- 1. Hitung Data Harian (Calculated Data) ---
  const calculatedData = useMemo(() => {
    const results = [];
    let currentRooms = initialValues.rooms;
    let currentForeign = initialValues.foreign;
    let currentLocal = initialValues.local;

    for (let i = 0; i < movements.length; i++) {
      const move = movements[i];
      const yesterdayRooms = currentRooms;
      const yesterdayForeign = currentForeign;
      const yesterdayLocal = currentLocal;

      const todayRooms = yesterdayRooms + move.roomsIn - move.roomsOut;
      const todayForeign = yesterdayForeign + move.foreignIn - move.foreignOut;
      const todayLocal = yesterdayLocal + move.localIn - move.localOut;

      results.push({
        date: i + 1,
        ...move,
        yesterdayRooms,
        yesterdayForeign,
        yesterdayLocal,
        todayRooms,
        todayForeign,
        todayLocal,
      });

      currentRooms = todayRooms;
      currentForeign = todayForeign;
      currentLocal = todayLocal;
    }
    return results;
  }, [initialValues, movements]);

  // --- 2. Hitung Total Kolom (Untuk Footer) ---
  const totals = useMemo(() => {
    return calculatedData.reduce(
      (acc, curr) => ({
        roomsIn: acc.roomsIn + curr.roomsIn,
        roomsOut: acc.roomsOut + curr.roomsOut,
        todayRooms: acc.todayRooms + curr.todayRooms, // Room Nights (Malam Kamar Terpakai)

        foreignIn: acc.foreignIn + curr.foreignIn,
        foreignOut: acc.foreignOut + curr.foreignOut,
        todayForeign: acc.todayForeign + curr.todayForeign, // Guest Nights (Malam Tamu Asing)

        localIn: acc.localIn + curr.localIn,
        localOut: acc.localOut + curr.localOut,
        todayLocal: acc.todayLocal + curr.todayLocal, // Guest Nights (Malam Tamu Lokal)
      }),
      {
        roomsIn: 0,
        roomsOut: 0,
        todayRooms: 0,
        foreignIn: 0,
        foreignOut: 0,
        todayForeign: 0,
        localIn: 0,
        localOut: 0,
        todayLocal: 0,
      }
    );
  }, [calculatedData]);

  // Hitung TPK (Tingkat Penghunian Kamar)
  // Rumus: (Total Malam Kamar Terpakai / (Jumlah Kamar Tersedia x Jumlah Hari)) * 100
  const occupancyRate = useMemo(() => {
    if (!hotelCapacity || hotelCapacity === 0) return 0;
    const totalAvailable = hotelCapacity * getDaysInMonth(month, year);
    return ((totals.todayRooms / totalAvailable) * 100).toFixed(2);
  }, [totals.todayRooms, hotelCapacity, month, year]);

  useEffect(() => {
    onDataChange(calculatedData);
  }, [calculatedData, onDataChange]);

  return (
    <div className="w-full border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden flex flex-col font-montserrat">
      {/* Info Header */}
      <div className="p-4 bg-amber-50 border-b border-amber-100 flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-bold">Informasi Pengisian</p>
            <p className="text-xs opacity-90">
              Kolom "Kemarin" dihitung otomatis. Tanggal 1 isi manual.
            </p>
          </div>
        </div>

        {/* Tampilan TPK Sederhana di Atas */}
        {hotelCapacity > 0 && (
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-sm">
            <Calculator className="w-4 h-4 text-blue-600" />
            <div className="text-sm">
              <span className="text-slate-500 mr-2">Est. TPK:</span>
              <span
                className={`font-bold ${
                  occupancyRate > 100 ? 'text-red-600' : 'text-blue-700'
                }`}
              >
                {occupancyRate}%
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto flex-1 custom-scrollbar max-h-[600px]">
        <table className="w-full text-sm text-left border-collapse relative">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0 z-20 shadow-sm">
            {/* ... (Header Table Sama Seperti Sebelumnya) ... */}
            <tr>
              <th
                rowSpan="2"
                className="px-4 py-3 border-r border-b border-slate-200 sticky left-0 bg-slate-100 z-30 w-16 text-center"
              >
                Tgl
              </th>
              <th
                colSpan="4"
                className="px-4 py-2 border-r border-b border-blue-200 text-center bg-blue-50 text-blue-800 font-bold tracking-wider"
              >
                Kamar
              </th>
              <th
                colSpan="4"
                className="px-4 py-2 border-r border-b border-emerald-200 text-center bg-emerald-50 text-emerald-800 font-bold tracking-wider"
              >
                Mancanegara
              </th>
              <th
                colSpan="4"
                className="px-4 py-2 border-b border-purple-200 text-center bg-purple-50 text-purple-800 font-bold tracking-wider"
              >
                Domestik
              </th>
            </tr>
            <tr>
              {/* Kamar */}
              <th className="px-2 py-2 border-r border-b text-center min-w-[70px] bg-white">
                Kemarin
              </th>
              <th className="px-2 py-2 border-r border-b text-center min-w-[70px] bg-white">
                Masuk
              </th>
              <th className="px-2 py-2 border-r border-b text-center min-w-[70px] bg-white">
                Keluar
              </th>
              <th className="px-2 py-2 border-r border-b text-center min-w-[70px] bg-blue-50 font-bold text-blue-900">
                Terisi
              </th>
              {/* Asing */}
              <th className="px-2 py-2 border-r border-b text-center min-w-[70px] bg-white">
                Kemarin
              </th>
              <th className="px-2 py-2 border-r border-b text-center min-w-[70px] bg-white">
                Masuk
              </th>
              <th className="px-2 py-2 border-r border-b text-center min-w-[70px] bg-white">
                Keluar
              </th>
              <th className="px-2 py-2 border-r border-b text-center min-w-[70px] bg-emerald-50 font-bold text-emerald-900">
                Menetap
              </th>
              {/* Lokal */}
              <th className="px-2 py-2 border-r border-b text-center min-w-[70px] bg-white">
                Kemarin
              </th>
              <th className="px-2 py-2 border-r border-b text-center min-w-[70px] bg-white">
                Masuk
              </th>
              <th className="px-2 py-2 border-r border-b text-center min-w-[70px] bg-white">
                Keluar
              </th>
              <th className="px-2 py-2 border-b text-center min-w-[70px] bg-purple-50 font-bold text-purple-900">
                Menetap
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {calculatedData.map((row, index) => (
              <tr
                key={index}
                className="hover:bg-slate-50 transition-colors group"
              >
                <td className="px-4 py-2 font-semibold text-center border-r border-slate-200 sticky left-0 bg-white group-hover:bg-slate-50 z-10">
                  {row.date}
                </td>

                {/* Kamar */}
                <td className="p-1 border-r text-center text-slate-400 text-xs">
                  {index === 0 ? (
                    <input
                      type="number"
                      className="w-full text-center border-amber-300 rounded bg-amber-50"
                      value={initialValues.rooms || ''}
                      onChange={(e) =>
                        handleInitialChange('rooms', e.target.value)
                      }
                    />
                  ) : (
                    row.yesterdayRooms
                  )}
                </td>
                <td className="p-1 border-r">
                  <input
                    type="number"
                    min="0"
                    onWheel={(e) => e.target.blur()}
                    className="w-full text-center border-slate-200 rounded focus:ring-blue-500 bg-white"
                    value={row.roomsIn || ''}
                    onChange={(e) =>
                      handleMovementChange(index, 'roomsIn', e.target.value)
                    }
                  />
                </td>
                <td className="p-1 border-r">
                  <input
                    type="number"
                    min="0"
                    onWheel={(e) => e.target.blur()}
                    className="w-full text-center border-slate-200 rounded focus:ring-blue-500 bg-white"
                    value={row.roomsOut || ''}
                    onChange={(e) =>
                      handleMovementChange(index, 'roomsOut', e.target.value)
                    }
                  />
                </td>
                <td className="px-2 py-1 border-r text-center font-bold text-blue-700 bg-blue-50/30">
                  {row.todayRooms}
                </td>

                {/* Asing */}
                <td className="p-1 border-r text-center text-slate-400 text-xs">
                  {index === 0 ? (
                    <input
                      type="number"
                      className="w-full text-center border-amber-300 rounded bg-amber-50"
                      value={initialValues.foreign || ''}
                      onChange={(e) =>
                        handleInitialChange('foreign', e.target.value)
                      }
                    />
                  ) : (
                    row.yesterdayForeign
                  )}
                </td>
                <td className="p-1 border-r">
                  <input
                    type="number"
                    min="0"
                    onWheel={(e) => e.target.blur()}
                    className="w-full text-center border-slate-200 rounded focus:ring-emerald-500 bg-white"
                    value={row.foreignIn || ''}
                    onChange={(e) =>
                      handleMovementChange(index, 'foreignIn', e.target.value)
                    }
                  />
                </td>
                <td className="p-1 border-r">
                  <input
                    type="number"
                    min="0"
                    onWheel={(e) => e.target.blur()}
                    className="w-full text-center border-slate-200 rounded focus:ring-emerald-500 bg-white"
                    value={row.foreignOut || ''}
                    onChange={(e) =>
                      handleMovementChange(index, 'foreignOut', e.target.value)
                    }
                  />
                </td>
                <td className="px-2 py-1 border-r text-center font-bold text-emerald-700 bg-emerald-50/30">
                  {row.todayForeign}
                </td>

                {/* Lokal */}
                <td className="p-1 border-r text-center text-slate-400 text-xs">
                  {index === 0 ? (
                    <input
                      type="number"
                      className="w-full text-center border-amber-300 rounded bg-amber-50"
                      value={initialValues.local || ''}
                      onChange={(e) =>
                        handleInitialChange('local', e.target.value)
                      }
                    />
                  ) : (
                    row.yesterdayLocal
                  )}
                </td>
                <td className="p-1 border-r">
                  <input
                    type="number"
                    min="0"
                    onWheel={(e) => e.target.blur()}
                    className="w-full text-center border-slate-200 rounded focus:ring-purple-500 bg-white"
                    value={row.localIn || ''}
                    onChange={(e) =>
                      handleMovementChange(index, 'localIn', e.target.value)
                    }
                  />
                </td>
                <td className="p-1 border-r">
                  <input
                    type="number"
                    min="0"
                    onWheel={(e) => e.target.blur()}
                    className="w-full text-center border-slate-200 rounded focus:ring-purple-500 bg-white"
                    value={row.localOut || ''}
                    onChange={(e) =>
                      handleMovementChange(index, 'localOut', e.target.value)
                    }
                  />
                </td>
                <td className="px-2 py-1 border-r-0 text-center font-bold text-purple-700 bg-purple-50/30">
                  {row.todayLocal}
                </td>
              </tr>
            ))}
          </tbody>

          {/* --- FOOTER TOTAL --- */}
          <tfoot className="sticky bottom-0 z-30 bg-slate-100 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] border-t-2 border-slate-300 font-bold text-slate-800 text-xs uppercase">
            <tr>
              <td className="px-4 py-3 text-center border-r border-slate-300 sticky left-0 bg-slate-100 z-40">
                TOTAL
              </td>

              {/* Kamar Total */}
              <td className="px-2 py-2 border-r bg-slate-50 text-center text-slate-400">
                -
              </td>
              <td className="px-2 py-2 border-r bg-blue-100 text-center text-blue-900">
                {totals.roomsIn}
              </td>
              <td className="px-2 py-2 border-r bg-blue-100 text-center text-blue-900">
                {totals.roomsOut}
              </td>
              <td className="px-2 py-2 border-r bg-blue-200 text-center text-blue-900 text-sm">
                {totals.todayRooms}
              </td>

              {/* Asing Total */}
              <td className="px-2 py-2 border-r bg-slate-50 text-center text-slate-400">
                -
              </td>
              <td className="px-2 py-2 border-r bg-emerald-100 text-center text-emerald-900">
                {totals.foreignIn}
              </td>
              <td className="px-2 py-2 border-r bg-emerald-100 text-center text-emerald-900">
                {totals.foreignOut}
              </td>
              <td className="px-2 py-2 border-r bg-emerald-200 text-center text-emerald-900 text-sm">
                {totals.todayForeign}
              </td>

              {/* Lokal Total */}
              <td className="px-2 py-2 border-r bg-slate-50 text-center text-slate-400">
                -
              </td>
              <td className="px-2 py-2 border-r bg-purple-100 text-center text-purple-900">
                {totals.localIn}
              </td>
              <td className="px-2 py-2 border-r bg-purple-100 text-center text-purple-900">
                {totals.localOut}
              </td>
              <td className="px-2 py-2 border-r-0 bg-purple-200 text-center text-purple-900 text-sm">
                {totals.todayLocal}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default EntryTable;
