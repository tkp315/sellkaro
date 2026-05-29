import prisma from '@utils/prisma.js';
import SK from '@globals/index.js';
import ApiError from '@utils/apiError.js';
import {
  hashPassword,
  comparePassword,
  signTokens,
  verifyRefreshToken,
  generateToken,
  getRefreshTokenExpiry,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../helpers/index.js';
import { notifyWelcome } from '../../notification/services/index.js';
import type {
  RegisterDto,
  LoginDto,
  GoogleAuthDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateProfileDto,
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

export async function register(dto: RegisterDto): Promise<AuthResponse> {
  const existing = await prisma.user.findUnique({ where: { email: dto.email } });
  if (existing) throw ApiError.conflict('Email already in use');

  const hashed = await hashPassword(dto.password);
  const emailToken = generateToken();

  const env = getEnv();
  const adminEmail = String(env['ADMIN_EMAIL'] ?? '');
  const autoRole = adminEmail && dto.email.toLowerCase() === adminEmail.toLowerCase()
    ? 'ADMIN'
    : (dto.role ?? 'BUYER');

  const user = await prisma.user.create({
    data: {
      email: dto.email,
      password: hashed,
      phone: dto.phone ?? null,
      role: autoRole as any,
      emailVerifyToken: emailToken,
      profile: { create: { name: dto.name } },
    },
    include: { profile: true },
  });

  await sendVerificationEmail(user.email, emailToken).catch(() => {});
  void notifyWelcome(user.id, dto.name, user.email);

  const jwtPayload = { userId: user.id, email: user.email, role: user.role };
  const tokens = signTokens(jwtPayload);
  await prisma.refreshToken.create({
    data: { token: tokens.refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() },
  });

  return { user: toSafeUser(user), tokens };
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
  await prisma.refreshToken.create({
    data: { token: tokens.refreshToken, userId: updated.id, expiresAt: getRefreshTokenExpiry() },
  });

  return { user: toSafeUser(updated), tokens };
}

export async function login(dto: LoginDto): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: { email: dto.email },
    include: { profile: true },
  });
  if (!user) throw ApiError.unauthorized('Invalid credentials');
  if (user.isBanned) throw ApiError.forbidden('Account has been banned');

  const valid = await comparePassword(dto.password, user.password);
  if (!valid) throw ApiError.unauthorized('Invalid credentials');

  const jwtPayload = { userId: user.id, email: user.email, role: user.role };
  const tokens = signTokens(jwtPayload);
  await prisma.refreshToken.create({
    data: { token: tokens.refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() },
  });

  return { user: toSafeUser(user), tokens };
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

  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const { user } = stored;
  const jwtPayload = { userId: user.id, email: user.email, role: user.role };
  const tokens = signTokens(jwtPayload);
  await prisma.refreshToken.create({
    data: { token: tokens.refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() },
  });

  return { user: toSafeUser(user), tokens };
}

export async function googleAuth(dto: GoogleAuthDto): Promise<AuthResponse> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${dto.accessToken}` },
  });
  if (!res.ok) throw ApiError.unauthorized('Invalid Google access token');

  const googlePayload = await res.json() as {
    email?: string;
    name?: string;
    picture?: string;
  };
  if (!googlePayload.email) throw ApiError.badRequest('Google account has no email');

  let user = await prisma.user.findUnique({
    where: { email: googlePayload.email },
    include: { profile: true },
  });

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

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, emailVerifyToken: null },
  });
}
