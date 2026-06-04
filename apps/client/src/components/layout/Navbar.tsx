import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/modules/shared/auth/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useCurrentCity } from '@/hooks/useCurrentCity';
import { useUnreadCount } from '@/modules/buyer/chat/hooks/useChat';
import { useBecomeSeller } from '@/modules/shared/auth/hooks/useAuth';
import { useCartCount } from '@/modules/buyer/cart/hooks/useCart';
import { useNotificationUnreadCount } from '@/modules/shared/notification/hooks/useNotifications';

export function Navbar() {
  const { isAuthenticated, user } = useAuthStore();
  const logout = useLogout();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const isSeller = user?.role === 'SELLER' || user?.role === 'ADMIN';

  const [searchParams, setSearchParams] = useSearchParams();
  const [locationOpen, setLocationOpen] = useState(false);
  const [cityInput, setCityInput] = useState(searchParams.get('city') ?? '');
  const locationRef = useRef<HTMLDivElement>(null);
  const geo = useCurrentCity();

  const activeCity = searchParams.get('city') ?? '';

  useEffect(() => {
    if (geo.city) {
      setCityInput(geo.city);
      applyCity(geo.city);
    }
  }, [geo.city]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const applyCity = (val: string) => {
    const trimmed = val.trim();
    if (window.location.pathname !== '/') {
      navigate(trimmed ? `/?city=${encodeURIComponent(trimmed)}` : '/');
    } else {
      setSearchParams((p) => { trimmed ? p.set('city', trimmed) : p.delete('city'); return p; }, { replace: true });
    }
    setLocationOpen(false);
  };

  const clearCity = () => {
    setCityInput('');
    geo.clear();
    if (window.location.pathname === '/') {
      setSearchParams((p) => { p.delete('city'); return p; }, { replace: true });
    }
    setLocationOpen(false);
  };

  const becomeSeller = useBecomeSeller();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;
  const { data: cartData } = useCartCount();
  const cartCount = cartData?.count ?? 0;
  const { data: notifData } = useNotificationUnreadCount();
  const notifCount = notifData?.count ?? 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header
      className="sticky top-0 shadow-md"
      style={{ backgroundColor: theme.colors.brand.DEFAULT, zIndex: theme.zIndex.sticky }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        {/* Logo */}
        <Link to="/" className="shrink-0 flex items-center gap-1">
          <span
            className="text-2xl font-black tracking-tighter"
            style={{ color: theme.colors.accent.DEFAULT }}
          >
            withSell
          </span>
        </Link>

        {/* Location pill */}
        <div ref={locationRef} className="relative hidden md:block shrink-0">
          <button
            onClick={() => setLocationOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition"
            style={activeCity ? { borderColor: 'rgba(255,202,40,0.5)', color: '#ffca28' } : undefined}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="max-w-[100px] truncate">{activeCity || 'India'}</span>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {locationOpen && (
            <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl" style={{ zIndex: 50 }}>
              <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Set Location</p>

              {/* GPS button */}
              <button
                onClick={geo.detect}
                disabled={geo.isLoading}
                className="mb-3 flex w-full items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                style={geo.city ? { borderColor: theme.colors.brand.DEFAULT + '40', color: theme.colors.brand.DEFAULT } : undefined}
              >
                {geo.isLoading ? (
                  <svg className="h-4 w-4 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                    <path strokeLinecap="round" d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                  </svg>
                )}
                {geo.isLoading ? 'Detecting...' : geo.city ? `Near ${geo.city}` : 'Use my location'}
              </button>

              {geo.error && (
                <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{geo.error}</p>
              )}

              {/* Manual input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyCity(cityInput)}
                  placeholder="Type a city..."
                  autoFocus
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-300"
                />
                <button
                  onClick={() => applyCity(cityInput)}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                  style={{ backgroundColor: theme.colors.brand.DEFAULT }}
                >
                  Go
                </button>
              </div>

              {/* Clear */}
              {activeCity && (
                <button
                  onClick={clearCity}
                  className="mt-2 w-full rounded-xl border border-gray-200 py-2 text-xs text-gray-500 hover:bg-gray-50 transition"
                >
                  Clear location filter
                </button>
              )}
            </div>
          )}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find Cars, Mobile Phones and more..."
            className="flex-1 rounded-l-xl border-0 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
            style={{ '--tw-ring-color': theme.colors.accent.DEFAULT } as React.CSSProperties}
          />
          <button
            type="submit"
            className="rounded-r-xl px-4 py-2.5 transition hover:opacity-90"
            style={{
              backgroundColor: theme.colors.accent.DEFAULT,
              color: theme.colors.brand.DEFAULT,
            }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        {/* Right actions */}
        <nav className="flex shrink-0 items-center gap-2">
          {isAuthenticated ? (
            <>
              {isSeller ? (
                <Link
                  to="/seller/ads/new"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border-2 px-4 py-2 text-sm font-bold transition hover:opacity-90"
                  style={{ borderColor: theme.colors.accent.DEFAULT, color: theme.colors.accent.DEFAULT }}
                >
                  + SELL
                </Link>
              ) : (
                <button
                  onClick={() => becomeSeller.mutate()}
                  disabled={becomeSeller.isPending}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: theme.colors.accent.DEFAULT, color: theme.colors.brand.DEFAULT }}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  {becomeSeller.isPending ? 'Upgrading...' : 'Become a Seller'}
                </button>
              )}

              {/* Notifications */}
              <Link
                to="/notifications"
                className="hidden sm:flex relative items-center justify-center h-9 w-9 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
                title="Notifications"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: theme.colors.status.error }}
                  >
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="hidden sm:flex relative items-center justify-center h-9 w-9 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
                title="My Cart"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: theme.colors.accent.DEFAULT, color: theme.colors.brand.DEFAULT }}
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Saved */}
              <Link
                to="/saved"
                className="hidden sm:flex items-center justify-center h-9 w-9 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
                title="Saved Ads"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>

              {/* Chat */}
              <Link
                to="/chats"
                className="hidden sm:flex relative items-center justify-center h-9 w-9 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
                title="Chats"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: theme.colors.status.error }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white hover:bg-white/10 transition"
                >
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: theme.colors.accent.DEFAULT,
                      color: theme.colors.brand.DEFAULT,
                    }}
                  >
                    {(user?.profile?.name ?? user?.email ?? 'U')[0]!.toUpperCase()}
                  </div>
                  <span className="hidden sm:block">{user?.profile?.name ?? user?.email?.split('@')[0]}</span>
                  <svg className="h-3.5 w-3.5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div
                      className="absolute right-0 top-full mt-2 z-20 w-48 rounded-2xl border border-gray-100 bg-white shadow-xl py-1 overflow-hidden"
                      style={{ zIndex: theme.zIndex.dropdown }}
                    >
                      {(user?.role === 'ADMIN' || user?.role === 'MODERATOR') && (
                        <Link
                          to="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
                          style={{ color: theme.colors.brand.DEFAULT }}
                        >
                          <span>🛡</span> Admin Panel
                        </Link>
                      )}
                      {isSeller ? (
                        <>
                          <Link
                            to="/seller"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <span>📊</span> Dashboard
                          </Link>
                          <Link
                            to="/seller/ads/new"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <span>➕</span> Post an Ad
                          </Link>
                        </>
                      ) : (
                        <button
                          onClick={() => { setMenuOpen(false); becomeSeller.mutate(); }}
                          disabled={becomeSeller.isPending}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
                          style={{ color: theme.colors.brand.DEFAULT }}
                        >
                          <span>🏪</span>
                          {becomeSeller.isPending ? 'Upgrading...' : 'Become a Seller'}
                        </button>
                      )}
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <span>👤</span> My Profile
                      </Link>
                      <Link
                        to="/notifications"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 sm:hidden"
                      >
                        <span className="flex items-center gap-3"><span>🔔</span> Notifications</span>
                        {notifCount > 0 && (
                          <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: theme.colors.status.error }}>
                            {notifCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/saved"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 sm:hidden"
                      >
                        <span>❤️</span> Saved Ads
                      </Link>
                      <Link
                        to="/cart"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 sm:hidden"
                      >
                        <span className="flex items-center gap-3"><span>🛒</span> My Cart</span>
                        {cartCount > 0 && (
                          <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: theme.colors.brand.DEFAULT }}>
                            {cartCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/chats"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 sm:hidden"
                      >
                        <span className="flex items-center gap-3"><span>💬</span> Chats</span>
                        {unreadCount > 0 && (
                          <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: theme.colors.status.error }}>
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                      <div className="my-1 border-t border-gray-100" />
                      <button
                        onClick={() => { setMenuOpen(false); void logout(); }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <span>🚪</span> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="text-sm font-medium text-white/80 hover:text-white transition px-3 py-2"
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                className="rounded-xl border-2 px-4 py-2 text-sm font-bold transition hover:opacity-90"
                style={{ borderColor: theme.colors.accent.DEFAULT, color: theme.colors.accent.DEFAULT }}
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
