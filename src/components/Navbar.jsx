import { CircleUser } from 'lucide-react';
import { NavLink } from 'react-router';

const Navbar = () => {
  const navItems = [
    { name: 'Dashboard', route: '/' },
    { name: 'Tabel Dinamis', route: '/tabel' },
    { name: 'Hotel', route: '/hotel' },
    { name: 'Input Data', route: '/input' },
  ];

  return (
    <div className="w-full">
      {/* Light blue effect */}
      <nav className="bg-[#0093DD] text-white pb-2 shadow-md rounded-bl-[55px] relative overflow-visible">
        {/* Nav Container */}
        <div className="w-full rounded-bl-[60px] bg-[#183683] relative p-4 pr-28 flex items-center justify-between overflow-visible">
          {/* Left side */}
          <div className="flex ml-4 items-center gap-2">
            <div className="w-14 h-14 p-1 shrink-0 flex items-center justify-center">
              <img
                src="/LogoBps.svg"
                alt="Logo BPS"
                className="object-contain"
              />
            </div>

            <h1 className="font-bold text-3xl italic">
              VHTS <span className="text-bpsOrange">ONLINE</span>
            </h1>
          </div>

          {/* Right side */}
          <div className="flex gap-12 items-center">
            {/* Nav items */}
            <div className="flex gap-9 overflow-visible">
              {navItems.map((item) => (
                <NavLink
                  key={item.route}
                  to={item.route}
                  end={item.route === '/'}
                  className="relative px-5 py-2 text-md overflow-visible font-montserrat font-medium"
                >
                  {({ isActive }) => (
                    <>
                      {/* Text */}
                      <span
                        className={`relative z-30 transition ${
                          isActive
                            ? 'font-semibold text-white'
                            : 'text-white/80 hover:text-white'
                        }`}
                      >
                        {item.name}
                      </span>

                      {/* Active pill */}
                      {isActive && (
                        <span
                          className="
                            absolute
                            left-1/2
                            -translate-x-1/2
                            bottom-[-24px]
                            h-1.5
                            w-32
                            rounded-t-full
                            bg-white
                            z-20
                          "
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Account info */}
            <div className="flex gap-2 items-center">
              <CircleUser />
              <div>Ka Firli</div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
