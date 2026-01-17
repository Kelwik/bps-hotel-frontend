import { useState, useRef, useEffect } from 'react';
import { CircleUser, LogOut, ChevronDown, KeyRound } from 'lucide-react'; // Import KeyRound
import { useLogout } from '../hooks/useLogout';
import ChangePasswordModal from './ChangePasswordModal'; // Import Modal

const UserDropdown = ({ username }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // Modal State
  const dropdownRef = useRef(null);
  const { mutate: handleLogout } = useLogout();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 text-white hover:bg-white/10 p-2 rounded-lg transition-colors outline-none"
        >
          <div className="text-right hidden lg:block">
            <div className="text-xs opacity-70">Welcome,</div>
            <div className="text-sm font-semibold">{username}</div>
          </div>
          <CircleUser className="w-8 h-8" />
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 border border-gray-100">
            <div className="px-4 py-2 border-b border-gray-100 mb-1 lg:hidden">
              <p className="text-xs text-gray-500">Signed in as</p>
              <p className="font-semibold text-gray-900 truncate">{username}</p>
            </div>

            {/* Change Password Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                setIsPasswordModalOpen(true);
              }}
              className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
            >
              <KeyRound size={16} />
              Ganti Password
            </button>

            <button
              onClick={() => handleLogout()}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Render Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};

export default UserDropdown;
