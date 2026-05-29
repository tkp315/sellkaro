import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams } from 'react-router-dom';
import { useResetPassword } from '@/modules/shared/auth/hooks/useAuth';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/modules/shared/auth/validators';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const resetPw = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPw.mutate({ token, password: data.password });
  };

  // No token in URL — invalid link
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-sm text-center">
          <Link to="/" className="inline-block mb-6">
            <span className="text-4xl font-black tracking-tighter text-[#002f34]">OLX</span>
          </Link>
          <div className="card p-8">
            <p className="text-4xl mb-3">🔗</p>
            <h2 className="text-lg font-bold text-gray-900">Invalid link</h2>
            <p className="mt-1 text-sm text-gray-500">This password reset link is invalid or has expired.</p>
            <Link to="/auth/forgot-password" className="mt-5 inline-block btn-primary px-6">
              Request a new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block mb-4">
            <span className="text-4xl font-black tracking-tighter text-[#002f34]">OLX</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Set a new password</h1>
          <p className="mt-2 text-sm text-gray-500">Must be at least 8 characters.</p>
        </div>

        <div className="card p-6">
          {resetPw.isSuccess ? (
            <div className="text-center py-4">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-sm font-medium text-gray-800">Password updated!</p>
              <p className="mt-1 text-xs text-gray-500">You can now log in with your new password.</p>
              <Link
                to="/auth/login"
                className="mt-5 inline-block btn-primary px-8"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {resetPw.isError && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                  This reset link has expired or is invalid. Please request a new one.
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    {...register('confirmPassword')}
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirm ? '🙈' : '👁'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={resetPw.isPending}
                className="btn-primary w-full"
              >
                {resetPw.isPending ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>

        {!resetPw.isSuccess && (
          <div className="mt-5 text-center">
            <Link to="/auth/login" className="text-sm text-[#002f34] font-medium hover:underline">
              ← Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
