import { Link } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';

const LINKS = [
  {
    heading: 'Popular Categories',
    items: ['Electronics', 'Cars', 'Furniture', 'Mobiles', 'Fashion'],
  },
  {
    heading: 'Company',
    items: ['About OLX', 'Careers', 'Press', 'Blog'],
  },
  {
    heading: 'Help',
    items: ['Safety Tips', 'Help Center', 'Terms of Use', 'Privacy Policy'],
  },
];

export function Footer() {
  const { theme } = useTheme();

  return (
    <footer className="text-white mt-12" style={{ backgroundColor: theme.colors.brand.DEFAULT }}>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <span
              className="text-3xl font-black tracking-tighter"
              style={{ color: theme.colors.accent.DEFAULT }}
            >
              OLX
            </span>
            <p className="mt-3 text-sm text-white/60 leading-relaxed">
              India's #1 marketplace for buying and selling used goods. Free to list, zero commission.
            </p>
            <div className="mt-4 flex gap-3">
              {['🐦', '📘', '📷', '▶️'].map((icon, i) => (
                <button key={i} className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-sm hover:bg-white/20 transition">
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {LINKS.map((col) => (
            <div key={col.heading}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
                {col.heading}
              </h4>
              <ul className="space-y-2">
                {col.items.map((item) => (
                  <li key={item}>
                    <Link to="/" className="text-sm text-white/60 hover:text-white transition">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} OLX Clone. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <Link to="/" className="hover:text-white transition">Terms</Link>
            <Link to="/" className="hover:text-white transition">Privacy</Link>
            <Link to="/" className="hover:text-white transition">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
