import { Link } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';

const LINKS = [
  {
    heading: 'Popular Categories',
    items: [
      { label: 'Mobiles & Tablets', to: '/?category=mobiles-tablets' },
      { label: 'Electronics', to: '/?category=electronics-appliances' },
      { label: 'Cars & Vehicles', to: '/?category=vehicles' },
      { label: 'Furniture', to: '/?category=furniture' },
      { label: 'Fashion & Beauty', to: '/?category=fashion-beauty' },
    ],
  },
  {
    heading: 'Company',
    items: [
      { label: 'About Us', to: '/about' },
      { label: 'Contact Us', to: '/contact' },
    ],
  },
  {
    heading: 'Help & Legal',
    items: [
      { label: 'Help Center', to: '/help' },
      { label: 'Safety Tips', to: '/safety' },
      { label: 'Terms & Conditions', to: '/terms' },
      { label: 'Privacy Policy', to: '/privacy' },
    ],
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
                  <li key={item.label}>
                    <Link to={item.to} className="text-sm text-white/60 hover:text-white transition">
                      {item.label}
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
            <Link to="/terms" className="hover:text-white transition">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link to="/safety" className="hover:text-white transition">Safety</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
