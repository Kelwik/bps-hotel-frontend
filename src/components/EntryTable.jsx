import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';

// Helper to generate days in a month
const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

const EntryTable = ({ month, year, onDataChange, existingData }) => {
  // Track previous props to detect changes during render
  const [prevMonth, setPrevMonth] = useState(month);
  const [prevYear, setPrevYear] = useState(year);
  const [prevExistingData, setPrevExistingData] = useState(null);

  const [initialValues, setInitialValues] = useState({
    rooms: 0,
    foreign: 0,
    local: 0,
  });

  // Main state for table data
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

  // --- ADJUST STATE DURING RENDER PATTERN ---
  // If inputs change (month/year) OR we receive new data from backend
  if (
    month !== prevMonth ||
    year !== prevYear ||
    existingData !== prevExistingData
  ) {
    const newDays = getDaysInMonth(month, year);

    // 1. Prepare blank movements
    let newMovements = Array.from({ length: newDays }, () => ({
      roomsIn: 0,
      roomsOut: 0,
      foreignIn: 0,
      foreignOut: 0,
      localIn: 0,
      localOut: 0,
    }));

    // 2. Prepare default initial values (start of month)
    let newInitialValues = { rooms: 0, foreign: 0, local: 0 };

    // 3. Fill with existing data if available
    if (
      existingData &&
      Array.isArray(existingData) &&
      existingData.length > 0
    ) {
      existingData.forEach((record) => {
        // Parse date from DB string
        const dateObj = new Date(record.tanggal_laporan);
        const dayIndex = dateObj.getUTCDate() - 1; // 0-indexed

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

      // 4. Reverse calculate "Initial" (Yesterday of Day 1)
      // Logic: Today = Yesterday + In - Out
      // Therefore: Yesterday = Today - In + Out
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

    // Update state synchronously to avoid flash
    setPrevMonth(month);
    setPrevYear(year);
    setPrevExistingData(existingData);
    setMovements(newMovements);
    setInitialValues(newInitialValues);
  }

  // Handle Input Changes
  const handleMovementChange = (dayIndex, field, value) => {
    const numValue = parseInt(value) || 0;
    setMovements((prev) => {
      const newMovements = [...prev];
      newMovements[dayIndex] = { ...newMovements[dayIndex], [field]: numValue };
      return newMovements;
    });
  };

  const handleInitialChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    setInitialValues((prev) => ({ ...prev, [field]: numValue }));
  };

  // --- Chain Calculation Logic ---
  const calculatedData = useMemo(() => {
    const results = [];

    // Initialize running totals with Day 1 "Yesterday" values
    let currentRooms = initialValues.rooms;
    let currentForeign = initialValues.foreign;
    let currentLocal = initialValues.local;

    for (let i = 0; i < movements.length; i++) {
      const move = movements[i];

      // Snapshot "Yesterday" (Start of Day)
      const yesterdayRooms = currentRooms;
      const yesterdayForeign = currentForeign;
      const yesterdayLocal = currentLocal;

      // Calculate "Hari Ini" (End of Day)
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

      // Update accumulators for next iteration
      currentRooms = todayRooms;
      currentForeign = todayForeign;
      currentLocal = todayLocal;
    }

    return results;
  }, [initialValues, movements]);

  // Pass data back to parent
  useEffect(() => {
    onDataChange(calculatedData);
  }, [calculatedData, onDataChange]);

  return (
    <div className="w-full border rounded-lg shadow-sm bg-white overflow-hidden flex flex-col font-montserrat">
      <div className="p-4 bg-yellow-50 border-b border-yellow-100 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-medium">Information</p>
          <p>
            Columns "Kemarin" (Yesterday) are calculated automatically based on
            the previous day's data.
          </p>
          <p>
            For <strong>Date 1</strong>, please enter the values manually (from
            the last day of the previous month).
          </p>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10">
            <tr>
              <th
                rowSpan="2"
                className="px-4 py-3 border sticky left-0 bg-gray-100 z-20 w-16 text-center shadow-[1px_0_0_0_rgba(0,0,0,0.1)]"
              >
                Tgl
              </th>
              <th
                colSpan="4"
                className="px-4 py-2 border text-center bg-blue-50 text-blue-800"
              >
                Kamar (Rooms)
              </th>
              <th
                colSpan="4"
                className="px-4 py-2 border text-center bg-green-50 text-green-800"
              >
                Pengunjung Asing (Intl)
              </th>
              <th
                colSpan="4"
                className="px-4 py-2 border text-center bg-purple-50 text-purple-800"
              >
                Pengunjung Indonesia (Local)
              </th>
            </tr>
            <tr>
              {/* Kamar */}
              <th className="px-2 py-2 border text-center min-w-[80px] text-gray-500 font-medium">
                Kemarin
              </th>
              <th className="px-2 py-2 border text-center min-w-[80px]">
                Masuk
              </th>
              <th className="px-2 py-2 border text-center min-w-[80px]">
                Keluar
              </th>
              <th className="px-2 py-2 border text-center min-w-[80px] bg-blue-50 font-bold">
                Ditempati
              </th>

              {/* Asing */}
              <th className="px-2 py-2 border text-center min-w-[80px] text-gray-500 font-medium">
                Kemarin
              </th>
              <th className="px-2 py-2 border text-center min-w-[80px]">
                Masuk
              </th>
              <th className="px-2 py-2 border text-center min-w-[80px]">
                Keluar
              </th>
              <th className="px-2 py-2 border text-center min-w-[80px] bg-green-50 font-bold">
                Menetap
              </th>

              {/* Local */}
              <th className="px-2 py-2 border text-center min-w-[80px] text-gray-500 font-medium">
                Kemarin
              </th>
              <th className="px-2 py-2 border text-center min-w-[80px]">
                Masuk
              </th>
              <th className="px-2 py-2 border text-center min-w-[80px]">
                Keluar
              </th>
              <th className="px-2 py-2 border text-center min-w-[80px] bg-purple-50 font-bold">
                Menetap
              </th>
            </tr>
          </thead>
          <tbody>
            {calculatedData.map((row, index) => (
              <tr
                key={index}
                className="hover:bg-slate-50 border-b last:border-0"
              >
                <td className="px-4 py-2 font-medium text-center border-r sticky left-0 bg-white z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.1)]">
                  {row.date}
                </td>

                {/* --- Kamar --- */}
                <td className="p-1 border text-center bg-gray-50">
                  {index === 0 ? (
                    <input
                      type="number"
                      className="w-full h-8 px-1 text-center bg-white border border-yellow-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={initialValues.rooms}
                      onChange={(e) =>
                        handleInitialChange('rooms', e.target.value)
                      }
                    />
                  ) : (
                    <span className="text-gray-500">{row.yesterdayRooms}</span>
                  )}
                </td>
                <td className="p-1 border">
                  <input
                    type="number"
                    min="0"
                    className="w-full h-8 text-center border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                    value={row.roomsIn || ''}
                    onChange={(e) =>
                      handleMovementChange(index, 'roomsIn', e.target.value)
                    }
                  />
                </td>
                <td className="p-1 border">
                  <input
                    type="number"
                    min="0"
                    className="w-full h-8 text-center border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                    value={row.roomsOut || ''}
                    onChange={(e) =>
                      handleMovementChange(index, 'roomsOut', e.target.value)
                    }
                  />
                </td>
                <td className="px-2 py-1 border text-center font-bold text-blue-700 bg-blue-50">
                  {row.todayRooms}
                </td>

                {/* --- Asing --- */}
                <td className="p-1 border text-center bg-gray-50">
                  {index === 0 ? (
                    <input
                      type="number"
                      className="w-full h-8 px-1 text-center bg-white border border-yellow-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={initialValues.foreign}
                      onChange={(e) =>
                        handleInitialChange('foreign', e.target.value)
                      }
                    />
                  ) : (
                    <span className="text-gray-500">
                      {row.yesterdayForeign}
                    </span>
                  )}
                </td>
                <td className="p-1 border">
                  <input
                    type="number"
                    min="0"
                    className="w-full h-8 text-center border-gray-200 rounded focus:ring-2 focus:ring-green-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                    value={row.foreignIn || ''}
                    onChange={(e) =>
                      handleMovementChange(index, 'foreignIn', e.target.value)
                    }
                  />
                </td>
                <td className="p-1 border">
                  <input
                    type="number"
                    min="0"
                    className="w-full h-8 text-center border-gray-200 rounded focus:ring-2 focus:ring-green-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                    value={row.foreignOut || ''}
                    onChange={(e) =>
                      handleMovementChange(index, 'foreignOut', e.target.value)
                    }
                  />
                </td>
                <td className="px-2 py-1 border text-center font-bold text-green-700 bg-green-50">
                  {row.todayForeign}
                </td>

                {/* --- Local --- */}
                <td className="p-1 border text-center bg-gray-50">
                  {index === 0 ? (
                    <input
                      type="number"
                      className="w-full h-8 px-1 text-center bg-white border border-yellow-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={initialValues.local}
                      onChange={(e) =>
                        handleInitialChange('local', e.target.value)
                      }
                    />
                  ) : (
                    <span className="text-gray-500">{row.yesterdayLocal}</span>
                  )}
                </td>
                <td className="p-1 border">
                  <input
                    type="number"
                    min="0"
                    className="w-full h-8 text-center border-gray-200 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                    value={row.localIn || ''}
                    onChange={(e) =>
                      handleMovementChange(index, 'localIn', e.target.value)
                    }
                  />
                </td>
                <td className="p-1 border">
                  <input
                    type="number"
                    min="0"
                    className="w-full h-8 text-center border-gray-200 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                    value={row.localOut || ''}
                    onChange={(e) =>
                      handleMovementChange(index, 'localOut', e.target.value)
                    }
                  />
                </td>
                <td className="px-2 py-1 border text-center font-bold text-purple-700 bg-purple-50">
                  {row.todayLocal}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EntryTable;
