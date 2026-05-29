import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVerifyOtp, useResendOtp } from '@/modules/shared/auth/hooks/useAuth';
import { getApiError } from '@/utils/apiError';
import { useTheme } from '@/hooks/useTheme';

export default function OtpVerificationPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? '';

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();

  // Redirect if no email in state
  useEffect(() => {
    if (!email) navigate('/auth/login', { replace: true });
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const otp = digits.join('');
  const isComplete = otp.length === 6;

  const handleChange = (idx: number, val: string) => {
    // Allow paste of full OTP
    if (val.length > 1) {
      const clean = val.replace(/\D/g, '').slice(0, 6);
      const next = [...digits];
      for (let i = 0; i < 6; i++) next[i] = clean[i] ?? '';
      setDigits(next);
      inputs.current[Math.min(clean.length, 5)]?.focus();
      return;
    }
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete || verifyOtp.isPending) return;
    verifyOtp.mutate({ email, otp });
  };

  const handleResend = () => {
    if (!canResend || resendOtp.isPending) return;
    resendOtp.mutate(email, {
      onSuccess: () => {
        setDigits(['', '', '', '', '', '']);
        setCountdown(60);
        setCanResend(false);
        inputs.current[0]?.focus();
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span
            className="text-4xl font-black tracking-tighter"
            style={{ color: theme.colors.brand.DEFAULT }}
          >
            OLX
          </span>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
          {/* Icon */}
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: theme.colors.brand.DEFAULT + '12' }}
          >
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke={theme.colors.brand.DEFAULT} strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="mb-1 text-center text-xl font-bold text-gray-900">Check your email</h1>
          <p className="mb-6 text-center text-sm text-gray-500">
            We sent a 6-digit code to<br />
            <span className="font-semibold text-gray-700">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* OTP inputs */}
            <div className="flex justify-center gap-2">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onFocus={(e) => e.target.select()}
                  className="h-12 w-11 rounded-xl border-2 text-center text-lg font-bold text-gray-900 transition focus:outline-none"
                  style={{
                    borderColor: d ? theme.colors.brand.DEFAULT : '#e5e7eb',
                    backgroundColor: d ? theme.colors.brand.DEFAULT + '08' : 'white',
                  }}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {verifyOtp.isError && (
              <p className="rounded-xl bg-red-50 px-4 py-2.5 text-center text-sm text-red-600">
                {getApiError(verifyOtp.error)}
              </p>
            )}

            <button
              type="submit"
              disabled={!isComplete || verifyOtp.isPending}
              className="w-full rounded-xl py-3 text-sm font-bold text-white transition disabled:opacity-50"
              style={{ backgroundColor: theme.colors.brand.DEFAULT }}
            >
              {verifyOtp.isPending ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-5 text-center text-sm text-gray-500">
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={resendOtp.isPending}
                className="font-semibold transition hover:opacity-80 disabled:opacity-50"
                style={{ color: theme.colors.brand.DEFAULT }}
              >
                {resendOtp.isPending ? 'Sending...' : 'Resend OTP'}
              </button>
            ) : (
              <>
                Resend code in{' '}
                <span className="font-semibold" style={{ color: theme.colors.brand.DEFAULT }}>
                  {countdown}s
                </span>
              </>
            )}
          </div>

          {resendOtp.isSuccess && (
            <p className="mt-3 text-center text-xs text-green-600">New OTP sent to your email.</p>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/auth/login')}
              className="text-xs text-gray-400 hover:text-gray-600 transition"
            >
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
