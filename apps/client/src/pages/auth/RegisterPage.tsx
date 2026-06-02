import { RegisterForm } from '@/modules/shared/auth/components/RegisterForm';
import { Link, useSearchParams } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';

export default function RegisterPage() {
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

        <div className="relative z-10 max-w-sm text-center">
          <span
            className="mb-8 block text-6xl font-black tracking-tighter"
            style={{ color: theme.colors.accent.DEFAULT }}
          >
            withSell
          </span>
          <h2 className="text-3xl font-bold leading-snug">
            Start selling &<br />
            <span style={{ color: theme.colors.accent.DEFAULT }}>earning today</span>
          </h2>
          <p className="mt-4 text-base text-white/70 leading-relaxed">
            List your items in under 2 minutes. Reach buyers across India. Zero commission, always.
          </p>

          <div className="mt-10 space-y-3 text-left">
            {[
              '✓ Free to list, no hidden charges',
              '✓ Reach buyers in your city',
              '✓ Chat directly with buyers',
              '✓ Verified buyer network',
            ].map((f) => (
              <p key={f} className="text-sm text-white/80 flex items-center gap-2">{f}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-sm">
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
                <span>🏪</span> Registering as a Seller
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {asSeller ? 'Create Seller Account' : 'Create your account'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {asSeller ? 'Start selling on withSell for free' : 'Sign up to start buying and selling'}
            </p>
          </div>

          <div className="card p-6">
            <RegisterForm />
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              to={asSeller ? '/auth/login?as=seller' : '/auth/login'}
              className="font-semibold hover:underline"
              style={{ color: theme.colors.brand.DEFAULT }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
