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
  const expiry = String(env['JWT_REFRESH_EXPIRY']);
  const days = parseInt(expiry.replace('d', '')) || 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
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
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ─── Email ────────────────────────────────────────────────────────────────────

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const env = getEnv();
  const { client, from } = getMailService();
  const url = `${env['CLIENT_URL']}/verify-email?token=${token}`;
  await client.emails.send({
    from,
    to: [to],
    subject: 'Verify your email – OLX',
    html: `<p>Hi! Click <a href="${url}">here</a> to verify your email address. This link expires in 24 hours.</p>`,
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const env = getEnv();
  const { client, from } = getMailService();
  const url = `${env['CLIENT_URL']}/auth/reset-password?token=${token}`;
  await client.emails.send({
    from,
    to: [to],
    subject: 'Reset your password – OLX',
    html: `<p>Click <a href="${url}">here</a> to reset your password. This link expires in 1 hour.</p>`,
  });
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const { client, from } = getMailService();
  await client.emails.send({
    from,
    to: [to],
    subject: 'Your OTP Code – OLX',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:420px;margin:0 auto;padding:24px">
        <h2 style="color:#002f34;margin-bottom:8px">Your Verification Code</h2>
        <p style="color:#555;font-size:14px;margin-bottom:24px">
          Use the code below to complete your sign-in. It expires in <strong>10 minutes</strong>.
        </p>
        <div style="background:#f4f4f4;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px">
          <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#002f34">${otp}</span>
        </div>
        <p style="color:#999;font-size:12px">
          If you didn't request this code, you can safely ignore this email.
        </p>
      </div>
    `,
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
