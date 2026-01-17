import { useState } from 'react';
import { Menu, X, CircleUser, LogOut, KeyRound } from 'lucide-react'; // Import KeyRound
import { NavLink } from 'react-router';
import { useMe } from '../hooks/useMe';
import { useLogout } from '../hooks/useLogout';
import UserDropdown from './UserDropdown';
import ChangePasswordModal from './ChangePasswordModal'; // Import Modal

const Navbar = () => {
  const { data } = useMe();
  const { mutate: logout } = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // Modal State

  const navItems = [
    { name: 'Dashboard', route: '/' },
    { name: 'Tabel Dinamis', route: '/tabel' },
    { name: 'Hotel', route: '/hotel' },
    { name: 'Input Data', route: '/input' },
  ];

  return (
    <div className="w-full relative z-50">
      <div className="bg-[#0093DD] pb-2 rounded-bl-[30px] md:rounded-bl-[60px] shadow-md transition-all duration-300">
        <nav className="bg-[#183683] w-full rounded-bl-[35px] md:rounded-bl-[65px] px-4 md:px-8 relative">
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* ... Logo Section ... */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center p-1">
                <img
                  src="/LogoBps.svg"
                  alt="Logo BPS"
                  className="object-contain w-full h-full"
                />
              </div>
              <h1 className="font-bold text-xl md:text-2xl italic text-white leading-tight">
                VHTS <span className="text-orange-500">ONLINE</span>
              </h1>
            </div>

            {/* ... Desktop Nav ... */}
            <div className="hidden md:flex items-center h-full gap-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.route}
                  to={item.route}
                  end={item.route === '/'}
                  className="relative h-full flex items-center px-2 group"
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`text-sm lg:text-md font-montserrat font-medium transition-colors duration-200 ${isActive ? 'text-white font-bold' : 'text-white/70 group-hover:text-white'}`}
                      >
                        {item.name}
                      </span>
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-1.5 bg-white rounded-t-full w-full mx-auto animate-fadeIn" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* ... Right Section ... */}
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <UserDropdown username={data?.username || 'Guest'} />
              </div>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden text-white p-1 hover:bg-white/10 rounded-md transition"
              >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>

          {/* MOBILE MENU */}
          {isOpen && (
            <div className="md:hidden border-t border-white/10 py-4 space-y-2 animate-in slide-in-from-top-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.route}
                  to={item.route}
                  end={item.route === '/'}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-lg text-white font-medium transition-colors ${isActive ? 'bg-white/20 font-bold border-l-4 border-orange-500' : 'hover:bg-white/10 text-white/80'}`
                  }
                >
                  {item.name}
                </NavLink>
              ))}

              <div className="border-t border-white/10 mt-4 pt-4 px-4">
                <div className="flex items-center gap-3 text-white/90 mb-4">
                  <CircleUser className="w-8 h-8" />
                  <span className="font-semibold">{data?.username}</span>
                </div>

                {/* Mobile Change Password Button */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsPasswordModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 text-white/80 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-colors mb-1"
                >
                  <KeyRound size={20} />
                  <span>Ganti Password</span>
                </button>

                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-3 text-red-300 hover:text-red-100 hover:bg-white/5 p-2 rounded-lg transition-colors"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Render Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

export default Navbar;
