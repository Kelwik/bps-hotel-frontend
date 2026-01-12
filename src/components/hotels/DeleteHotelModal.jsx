import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

const DeleteHotelModal = ({
  isOpen,
  hotelName,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) return;
    onConfirm(password);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Delete Hotel?
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Are you sure you want to delete <strong>{hotelName}</strong>? <br />
            <span className="text-red-600 font-medium">
              Warning: This will delete ALL reports associated with this hotel.
              This action cannot be undone.
            </span>
          </p>

          <form onSubmit={handleSubmit} className="text-left space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Enter your password to confirm
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                placeholder="Your password"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isDeleting || !password}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Delete Hotel'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeleteHotelModal;
