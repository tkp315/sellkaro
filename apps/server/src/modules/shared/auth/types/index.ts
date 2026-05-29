export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'BUYER' | 'SELLER';
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface GoogleAuthDto {
  accessToken: string;
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
}

export interface VerifyEmailDto {
  token: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SafeProfile {
  name: string;
  avatar?: string | null;
  city?: string | null;
  area?: string | null;
  lat?: number | null;
  lng?: number | null;
  bio?: string | null;
}

export interface SafeUser {
  id: string;
  email: string;
  phone?: string | null;
  role: string;
  isVerified: boolean;
  profile?: SafeProfile | null;
}

export interface AuthResponse {
  user: SafeUser;
  tokens: AuthTokens;
}
