import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { Request, Response, NextFunction } from 'express';
import SK from '@globals/index.js';
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

// ─── Email ────────────────────────────────────────────────────────────────────

function createTransporter() {
  const env = getEnv();
  return nodemailer.createTransport({
    host: String(env['SMTP_HOST']),
    port: Number(env['SMTP_PORT']),
    auth: {
      user: String(env['SMTP_USER']),
      pass: String(env['SMTP_PASS']),
    },
  });
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const env = getEnv();
  const url = `${env['CLIENT_URL']}/verify-email?token=${token}`;
  await createTransporter().sendMail({
    from: String(env['EMAIL_FROM']),
    to,
    subject: 'Verify your email – OLX',
    html: `<p>Hi! Click <a href="${url}">here</a> to verify your email address. This link expires in 24 hours.</p>`,
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const env = getEnv();
  const url = `${env['CLIENT_URL']}/reset-password?token=${token}`;
  await createTransporter().sendMail({
    from: String(env['EMAIL_FROM']),
    to,
    subject: 'Reset your password – OLX',
    html: `<p>Click <a href="${url}">here</a> to reset your password. This link expires in 1 hour.</p>`,
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
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}
