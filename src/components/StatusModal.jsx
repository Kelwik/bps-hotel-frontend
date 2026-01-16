import React from 'react';
import { createPortal } from 'react-dom'; // [1] Import createPortal
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const StatusModal = ({ isOpen, onClose, type = 'success', title, message }) => {
  if (!isOpen) return null;

  const config = {
    success: {
      icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      btnColor: 'bg-green-600 hover:bg-green-700',
    },
    error: {
      icon: <XCircle className="w-12 h-12 text-red-500" />,
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      btnColor: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: <AlertCircle className="w-12 h-12 text-amber-500" />,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-800',
      btnColor: 'bg-amber-600 hover:bg-amber-700',
    },
  };

  const currentConfig = config[type] || config.success;

  // [2] Gunakan createPortal untuk merender ke document.body
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 relative z-[10000]">
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className={`p-3 rounded-full ${currentConfig.bgColor}`}>
            {currentConfig.icon}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
          </div>

          <button
            onClick={onClose}
            className={`w-full py-2.5 px-4 rounded-xl text-white font-medium transition-colors shadow-sm ${currentConfig.btnColor} focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body // Target render
  );
};

export default StatusModal;
