import api from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type {
  AuthResponse,
  AuthUser,
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateProfileDto,
} from '../types';

export const authApi = {
  register: (dto: RegisterDto) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', dto).then((r) => r.data.data!),

  login: (dto: LoginDto) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', dto).then((r) => r.data.data!),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),

  googleAuth: (accessToken: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/google', { accessToken }).then((r) => r.data.data!),

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
