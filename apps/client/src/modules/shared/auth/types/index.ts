export type Role = 'BUYER' | 'SELLER' | 'ADMIN' | 'MODERATOR';

export interface AuthProfile {
  name: string;
  avatar?: string | null;
  city?: string | null;
  area?: string | null;
  lat?: number | null;
  lng?: number | null;
  bio?: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  phone?: string | null;
  role: Role;
  isVerified: boolean;
  profile?: AuthProfile | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface OtpSentResponse {
  requiresOtp: true;
  email: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
  city?: string;
  area?: string;
  lat?: number;
  lng?: number;
  bio?: string;
  avatar?: string;
}
