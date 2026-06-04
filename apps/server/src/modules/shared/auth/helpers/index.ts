import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import SK from '@globals/index.js';
import { getMailService } from '@lib/services/mail/index.js';
import type { JwtPayload, AuthTokens } from '../types/index.js';

function getEnv(): Record<string, string | number> {
  return (SK.config.app as Record<string, unknown>)['env'] as Record<string, string | number>;
}

// ─── JWT ─────────────────────────────────────────────────────────────────────

export function signTokens(payload: JwtPayload): AuthTokens {
  const env = getEnv();
  const accessToken = jwt.sign(payload, String(env['JWT_ACCESS_SECRET']), {
    expiresIn: String(env['JWT_ACCESS_EXPIRY']) as jwt.SignOptions['expiresIn'],
  });
  const refreshToken = jwt.sign(payload, String(env['JWT_REFRESH_SECRET']), {
    expiresIn: String(env['JWT_REFRESH_EXPIRY']) as jwt.SignOptions['expiresIn'],
  });
  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): JwtPayload {
  const env = getEnv();
  return jwt.verify(token, String(env['JWT_ACCESS_SECRET'])) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  const env = getEnv();
  return jwt.verify(token, String(env['JWT_REFRESH_SECRET'])) as JwtPayload;
}

export function getRefreshTokenExpiry(): Date {
  const env = getEnv();
  const expiry = String(env['JWT_REFRESH_EXPIRY'] || '7d');
  const match = expiry.match(/^(\d+)([dhms])$/);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const value = parseInt(match[1]!, 10);
  const unit = match[2];
  const ms =
    unit === 'd' ? value * 24 * 60 * 60 * 1000 :
    unit === 'h' ? value * 60 * 60 * 1000 :
    unit === 'm' ? value * 60 * 1000 :
    value * 1000;
  return new Date(Date.now() + ms);
}

// ─── Password ─────────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

// ─── Tokens ───────────────────────────────────────────────────────────────────

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateOtp(): string {
  return String(crypto.randomInt(100000, 1000000));
}

// ─── Email ────────────────────────────────────────────────────────────────────

function emailLayout(title: string, previewText: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${title}</title>
  <!--[if mso]><style>td,th,div,p,a,h1,h2,h3,h4,h5,h6{font-family:Arial,sans-serif!important}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <!-- Preview text (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#f1f5f9;">${previewText}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#002f34;border-radius:16px 16px 0 0;padding:28px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <span style="font-size:26px;font-weight:800;color:#ffca28;letter-spacing:-0.5px;">with</span><span style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Sell</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:40px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              ${body}

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
                <tr><td style="border-top:1px solid #e2e8f0;"></td></tr>
              </table>

              <!-- Footer -->
              <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;line-height:1.6;text-align:center;">
                This email was sent by <strong style="color:#64748b;">withSell</strong>. If you didn't request this, you can safely ignore it.<br/>
                &copy; ${new Date().getFullYear()} withSell. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const env = getEnv();
  const { client, from } = getMailService();
  const url = `${env['CLIENT_URL']}/verify-email?token=${encodeURIComponent(token)}`;

  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#002f34;">Verify your email address</h1>
    <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
      Welcome to withSell! Click the button below to verify your email and activate your account.
      This link expires in <strong style="color:#0f172a;">24 hours</strong>.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <a href="${url}"
             style="display:inline-block;background-color:#ffca28;color:#002f34;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.2px;">
            Verify Email Address
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;word-break:break-all;">
      Or copy this link into your browser:<br/>
      <a href="${url}" style="color:#002f34;">${url}</a>
    </p>`;

  await client.emails.send({
    from,
    to: [to],
    subject: 'Verify your email – withSell',
    html: emailLayout('Verify your email – withSell', 'Tap to verify your withSell account.', body),
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const env = getEnv();
  const { client, from } = getMailService();
  const url = `${env['CLIENT_URL']}/auth/reset-password?token=${encodeURIComponent(token)}`;

  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#002f34;">Reset your password</h1>
    <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
      We received a request to reset the password for your withSell account.
      Click the button below to choose a new password.
      This link expires in <strong style="color:#0f172a;">1 hour</strong>.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <a href="${url}"
             style="display:inline-block;background-color:#ffca28;color:#002f34;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.2px;">
            Reset Password
          </a>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;">
          <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
            ⚠️ <strong>Didn't request this?</strong> Your password will remain unchanged.
            Please ignore this email and consider changing your password if you're concerned.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;word-break:break-all;">
      Or copy this link into your browser:<br/>
      <a href="${url}" style="color:#002f34;">${url}</a>
    </p>`;

  await client.emails.send({
    from,
    to: [to],
    subject: 'Reset your password – withSell',
    html: emailLayout('Reset your password – withSell', 'Reset your withSell account password.', body),
  });
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const { client, from } = getMailService();

  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#002f34;">Your verification code</h1>
    <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
      Use the code below to complete your sign-in to withSell.
      It expires in <strong style="color:#0f172a;">10 minutes</strong>.
    </p>

    <!-- OTP box -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
      <tr>
        <td align="center" style="background-color:#f8fafc;border:2px dashed #e2e8f0;border-radius:14px;padding:32px 24px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;">One-Time Code</p>
          <span style="font-size:48px;font-weight:800;letter-spacing:14px;color:#002f34;font-variant-numeric:tabular-nums;">${otp}</span>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;">
          <p style="margin:0;font-size:13px;color:#166534;line-height:1.5;">
            🔒 <strong>Never share this code</strong> with anyone, including withSell support.
            We will never ask for your OTP.
          </p>
        </td>
      </tr>
    </table>`;

  await client.emails.send({
    from,
    to: [to],
    subject: 'Your sign-in code – withSell',
    html: emailLayout('Your sign-in code – withSell', `Your withSell verification code is ${otp}. It expires in 10 minutes.`, body),
  });
}

// ─── Auth Middleware ───────────────────────────────────────────────────────────

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  try {
    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);
    req.user = payload as { userId: string; email: string; role: string };
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}
