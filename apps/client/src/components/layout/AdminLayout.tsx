import { NavLink, Outlet } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/users', label: 'Users', icon: '👥', end: false },
  { to: '/admin/listings', label: 'Listings', icon: '📋', end: false },
  { to: '/admin/reports', label: 'Reports', icon: '🚩', end: false },
];

export default function AdminLayout() {
  const { theme } = useTheme();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className="hidden md:flex w-56 shrink-0 flex-col shadow-lg"
        style={{ backgroundColor: theme.colors.brand.DEFAULT }}
      >
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
          <span className="text-xl font-black tracking-tighter" style={{ color: theme.colors.accent.DEFAULT }}>OLX</span>
          <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Admin</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <NavLink to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition">
            <span>←</span> Back to Site
          </NavLink>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="flex md:hidden items-center gap-3 px-4 py-3 shadow-sm" style={{ backgroundColor: theme.colors.brand.DEFAULT }}>
          <span className="text-lg font-black tracking-tighter" style={{ color: theme.colors.accent.DEFAULT }}>OLX Admin</span>
          <div className="ml-auto flex gap-1">
            {NAV.map(({ to, icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `flex h-9 w-9 items-center justify-center rounded-xl text-base transition ${isActive ? 'bg-white/15' : 'hover:bg-white/10'}`
                }
              >
                {icon}
              </NavLink>
            ))}
          </div>
        </div>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
