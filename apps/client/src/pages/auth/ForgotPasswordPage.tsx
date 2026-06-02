import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '@/modules/shared/auth/hooks/useAuth';
import { forgotPasswordSchema } from '@/modules/shared/auth/validators';
import type { ForgotPasswordFormData } from '@/modules/shared/auth/validators';

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const forgotPw = useForgotPassword();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block mb-4">
            <span className="text-4xl font-black tracking-tighter text-[#002f34]">withSell</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Forgot your password?</h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your email and we'll send a reset link.
          </p>
        </div>

        <div className="card p-6">
          {forgotPw.isSuccess ? (
            <div className="text-center py-4">
              <p className="text-4xl mb-3">📬</p>
              <p className="text-sm font-medium text-gray-800">Check your inbox</p>
              <p className="mt-1 text-xs text-gray-500">
                If this email is registered, a reset link has been sent.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit((d) => forgotPw.mutate(d))} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="input-field"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={forgotPw.isPending}
                className="btn-primary w-full"
              >
                {forgotPw.isPending ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>

        <div className="mt-5 text-center">
          <Link to="/auth/login" className="text-sm text-[#002f34] font-medium hover:underline">
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
