import prisma from '@utils/prisma.js';
import SK from '@globals/index.js';
import ApiError from '@utils/apiError.js';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import {
  hashPassword,
  comparePassword,
  signTokens,
  verifyRefreshToken,
  generateToken,
  generateOtp,
  getRefreshTokenExpiry,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOtpEmail,
} from '../helpers/index.js';
import { notifyWelcome } from '../../notification/services/index.js';
import type {
  RegisterDto,
  LoginDto,
  GoogleAuthDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateProfileDto,
  VerifyOtpDto,
  OtpSentResponse,
  AuthResponse,
  SafeUser,
} from '../types/index.js';

function getEnv(): Record<string, string | number> {
  return (SK.config.app as Record<string, unknown>)['env'] as Record<string, string | number>;
}

function toSafeUser(user: {
  id: string;
  email: string;
  phone?: string | null;
  role: string;
  isVerified: boolean;
  profile?: {
    name: string;
    avatar?: string | null;
    city?: string | null;
    area?: string | null;
    lat?: number | null;
    lng?: number | null;
    bio?: string | null;
  } | null;
}): SafeUser {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isVerified: user.isVerified,
    profile: user.profile
      ? {
          name: user.profile.name,
          avatar: user.profile.avatar,
          city: user.profile.city,
          area: user.profile.area,
          lat: user.profile.lat,
          lng: user.profile.lng,
          bio: user.profile.bio,
        }
      : null,
  };
}

export async function register(dto: RegisterDto): Promise<OtpSentResponse> {
  const hashed = await hashPassword(dto.password);
  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const env = getEnv();
  const adminEmail = String(env['ADMIN_EMAIL'] ?? '');
  // Role is always server-assigned — never trust client-supplied role
  const autoRole = adminEmail && dto.email.toLowerCase() === adminEmail.toLowerCase()
    ? 'ADMIN'
    : 'BUYER';

  try {
    await prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        phone: dto.phone?.trim() || null,
        role: autoRole as any,
        otpCode: otp,
        otpExpiry,
        profile: { create: { name: dto.name } },
      },
    });
  } catch (e: any) {
    if (e?.code === 'P2002') throw ApiError.conflict('Email already in use');
    throw e;
  }

  await sendOtpEmail(dto.email, otp).catch(() => {});

  return { requiresOtp: true, email: dto.email };
}

export async function becomeSeller(userId: string): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === 'SELLER' || user.role === 'ADMIN') {
    throw ApiError.badRequest('Account is already a seller');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role: 'SELLER' },
    include: { profile: true },
  });

  const jwtPayload = { userId: updated.id, email: updated.email, role: updated.role };
  const tokens = signTokens(jwtPayload);

  // Revoke all old tokens (which had BUYER role) and issue a fresh one
  await prisma.refreshToken.deleteMany({ where: { userId } });
  await prisma.refreshToken.create({
    data: { token: tokens.refreshToken, userId: updated.id, expiresAt: getRefreshTokenExpiry() },
  });

  return { user: toSafeUser(updated), tokens };
}

export async function login(dto: LoginDto): Promise<OtpSentResponse> {
  const user = await prisma.user.findUnique({ where: { email: dto.email } });
  if (!user) throw ApiError.unauthorized('Invalid credentials');
  if (user.isBanned) throw ApiError.forbidden('Account has been banned');

  const valid = await comparePassword(dto.password, user.password);
  if (!valid) throw ApiError.unauthorized('Invalid credentials');

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: otp, otpExpiry },
  });

  await sendOtpEmail(user.email, otp);

  return { requiresOtp: true, email: user.email };
}

export async function verifyOtp(dto: VerifyOtpDto): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: { email: dto.email },
    include: { profile: true },
  });

  if (!user) throw ApiError.badRequest('Invalid request');
  if (!user.otpCode || !user.otpExpiry) throw ApiError.badRequest('No OTP pending. Please login again.');
  if (new Date() > user.otpExpiry) throw ApiError.badRequest('OTP expired. Please login again to get a new one.');
  // Timing-safe comparison prevents brute-force timing oracle attacks
  const otpMatch = crypto.timingSafeEqual(
    Buffer.from(user.otpCode, 'utf8'),
    Buffer.from(dto.otp, 'utf8'),
  );
  if (!otpMatch) throw ApiError.badRequest('Incorrect OTP. Please try again.');

  const wasFirstVerification = !user.isVerified;

  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: null, otpExpiry: null, isVerified: true },
  });

  if (wasFirstVerification) {
    void notifyWelcome(user.id, user.profile?.name ?? user.email, user.email);
  }

  const jwtPayload = { userId: user.id, email: user.email, role: user.role };
  const tokens = signTokens(jwtPayload);
  await prisma.refreshToken.create({
    data: { token: tokens.refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() },
  });

  return { user: toSafeUser({ ...user, isVerified: true }), tokens };
}

export async function resendOtp(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // silent — don't reveal if email exists

  // Enforce 60-second cooldown: otpExpiry is set 10 min in the future, so
  // if > 9 min remain the OTP was issued less than 60 seconds ago.
  if (user.otpExpiry && user.otpExpiry > new Date(Date.now() + 9 * 60 * 1000)) {
    throw ApiError.tooManyRequests('Please wait 60 seconds before requesting a new OTP');
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: otp, otpExpiry },
  });

  await sendOtpEmail(email, otp);
}

export async function logout(refreshToken: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

export async function refreshTokens(oldToken: string): Promise<AuthResponse> {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
    include: { user: { include: { profile: true } } },
  });

  if (!stored || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  try {
    verifyRefreshToken(oldToken);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const { user } = stored;
  const jwtPayload = { userId: user.id, email: user.email, role: user.role };
  const tokens = signTokens(jwtPayload);

  // Atomic rotation: delete old token and create new one in a single transaction
  // so a DB failure can't leave the user without any valid refresh token.
  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { id: stored.id } }),
    prisma.refreshToken.create({
      data: { token: tokens.refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() },
    }),
  ]);

  return { user: toSafeUser(user), tokens };
}

export async function googleAuth(dto: GoogleAuthDto): Promise<AuthResponse> {
  const env = getEnv();
  const clientId = String(env['GOOGLE_CLIENT_ID']);
  const oauthClient = new OAuth2Client(clientId);

  let googlePayload: { email?: string; name?: string; picture?: string };
  try {
    const ticket = await oauthClient.verifyIdToken({
      idToken: dto.credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    if (!payload) throw new Error('Empty payload');
    googlePayload = { email: payload.email, name: payload.name, picture: payload.picture };
  } catch {
    throw ApiError.unauthorized('Invalid Google credential');
  }

  if (!googlePayload.email) throw ApiError.badRequest('Google account has no email');

  let user = await prisma.user.findUnique({
    where: { email: googlePayload.email },
    include: { profile: true },
  });

  const isNewUser = !user;
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: googlePayload.email,
        password: await hashPassword(generateToken()),
        isVerified: true,
        profile: {
          create: {
            name: googlePayload.name || googlePayload.email,
            avatar: googlePayload.picture,
          },
        },
      },
      include: { profile: true },
    });
  }

  if (user.isBanned) throw ApiError.forbidden('Account has been banned');

  const jwtPayload = { userId: user.id, email: user.email, role: user.role };
  const tokens = signTokens(jwtPayload);
  await prisma.refreshToken.create({
    data: { token: tokens.refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() },
  });

  if (isNewUser) {
    void notifyWelcome(user.id, user.profile?.name ?? user.email, user.email);
  }

  return { user: toSafeUser(user), tokens };
}

export async function getProfile(userId: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  if (!user) throw ApiError.notFound('User not found');
  return toSafeUser(user);
}

export async function updateProfile(userId: string, dto: UpdateProfileDto): Promise<SafeUser> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  if (!existing) throw ApiError.notFound('User not found');

  const { phone, name, ...profileRest } = dto;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(phone !== undefined && { phone }),
      profile: {
        upsert: {
          create: {
            name: name || existing.profile?.name || 'User',
            ...profileRest,
          },
          update: {
            ...(name !== undefined && { name }),
            ...profileRest,
          },
        },
      },
    },
    include: { profile: true },
  });

  return toSafeUser(user);
}

export async function forgotPassword(dto: ForgotPasswordDto): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: dto.email } });
  if (!user) return; // silent — don't reveal if email exists

  const token = generateToken();
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: expiry },
  });

  await sendPasswordResetEmail(user.email, token);
}

export async function resetPassword(dto: ResetPasswordDto): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { resetToken: dto.token, resetTokenExpiry: { gt: new Date() } },
  });
  if (!user) throw ApiError.badRequest('Invalid or expired reset token');

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hashPassword(dto.password),
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
}

export async function verifyEmail(token: string): Promise<void> {
  const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
  if (!user) throw ApiError.badRequest('Invalid verification token');
  if ((user as any).emailVerifyTokenExpiry && (user as any).emailVerifyTokenExpiry < new Date()) {
    throw ApiError.badRequest('Verification link has expired. Please request a new one.');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, emailVerifyToken: null, emailVerifyTokenExpiry: null } as any,
  });
}
