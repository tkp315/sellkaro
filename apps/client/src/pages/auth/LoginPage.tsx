import { LoginForm } from '@/modules/shared/auth/components/LoginForm';
import { Link, useSearchParams } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';

export default function LoginPage() {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const asSeller = searchParams.get('as') === 'seller';

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center px-12 text-white relative overflow-hidden"
        style={{ backgroundColor: theme.colors.brand.DEFAULT }}
      >
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-white/5" />
        <div
          className="absolute top-1/2 -right-10 h-48 w-48 rounded-full"
          style={{ backgroundColor: theme.colors.accent.DEFAULT + '1a' }}
        />

        <div className="relative z-10 max-w-sm text-center">
          <div className="mb-8 flex justify-center">
            <span
              className="text-6xl font-black tracking-tighter"
              style={{ color: theme.colors.accent.DEFAULT }}
            >
              withSell
            </span>
          </div>
          <h2 className="text-3xl font-bold leading-snug">
            {asSeller ? (
              <>Start Selling on<br /><span style={{ color: theme.colors.accent.DEFAULT }}>withSell Today</span></>
            ) : (
              <>India's #1<br /><span style={{ color: theme.colors.accent.DEFAULT }}>Used Goods</span> Marketplace</>
            )}
          </h2>
          <p className="mt-4 text-base text-white/70 leading-relaxed">
            {asSeller
              ? 'List your items for free, reach crores of buyers, and sell faster with zero commission.'
              : 'Buy & sell anything — from electronics to cars, furniture to fashion. Millions of listings, zero commission.'}
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {(asSeller
              ? [{ val: 'Free', label: 'Listing' }, { val: '0%', label: 'Commission' }, { val: '1000+', label: 'Cities' }]
              : [{ val: '50M+', label: 'Active Users' }, { val: '100M+', label: 'Listings' }, { val: '1000+', label: 'Cities' }]
            ).map((s) => (
              <div key={s.label} className="rounded-xl bg-white/10 p-3">
                <p className="text-xl font-bold" style={{ color: theme.colors.accent.DEFAULT }}>{s.val}</p>
                <p className="mt-0.5 text-xs text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 text-center lg:hidden">
            <span
              className="text-4xl font-black tracking-tighter"
              style={{ color: theme.colors.brand.DEFAULT }}
            >
              withSell
            </span>
          </div>

          <div className="mb-6">
            {asSeller && (
              <div
                className="mb-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
                style={{ backgroundColor: theme.colors.brand.DEFAULT + '10', color: theme.colors.brand.DEFAULT }}
              >
                <span>🏪</span> Signing in as a Seller
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {asSeller ? 'Login to Start Selling' : 'Welcome back'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {asSeller ? 'Sign in to access your seller dashboard' : 'Sign in to continue to withSell'}
            </p>
          </div>

          <div className="card p-6">
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            New to withSell?{' '}
            <Link
              to={asSeller ? '/auth/register?as=seller' : '/auth/register'}
              className="font-semibold hover:underline"
              style={{ color: theme.colors.brand.DEFAULT }}
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
