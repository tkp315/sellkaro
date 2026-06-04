import api from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type {
  AuthResponse,
  OtpSentResponse,
  VerifyOtpDto,
  AuthUser,
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateProfileDto,
} from '../types';

export const authApi = {
  register: (dto: RegisterDto) =>
    api.post<ApiResponse<OtpSentResponse>>('/auth/register', dto).then((r) => r.data.data!),

  login: (dto: LoginDto) =>
    api.post<ApiResponse<OtpSentResponse>>('/auth/login', dto).then((r) => r.data.data!),

  verifyOtp: (dto: VerifyOtpDto) =>
    api.post<ApiResponse<AuthResponse>>('/auth/verify-otp', dto).then((r) => r.data.data!),

  resendOtp: (email: string) =>
    api.post('/auth/resend-otp', { email }),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),

  googleAuth: (credential: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/google', { credential }).then((r) => r.data.data!),

  becomeSeller: () =>
    api.post<ApiResponse<AuthResponse>>('/auth/become-seller').then((r) => r.data.data!),

  getProfile: () =>
    api.get<ApiResponse<AuthUser>>('/auth/profile').then((r) => r.data.data!),

  updateProfile: (dto: UpdateProfileDto) =>
    api.patch<ApiResponse<AuthUser>>('/auth/profile', dto).then((r) => r.data.data!),

  forgotPassword: (dto: ForgotPasswordDto) =>
    api.post('/auth/forgot-password', dto),

  resetPassword: (dto: ResetPasswordDto) =>
    api.post('/auth/reset-password', dto),

  verifyEmail: (token: string) =>
    api.get(`/auth/verify-email?token=${token}`),
};
