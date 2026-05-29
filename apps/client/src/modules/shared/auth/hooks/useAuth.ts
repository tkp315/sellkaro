import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { QUERY_KEYS } from '@/utils/constants';
import { authApi } from '../services/authApi';
import type { LoginDto, RegisterDto } from '../types';

export function useCurrentUser() {
  const { isAuthenticated, user } = useAuthStore();
  const query = useQuery({
    queryKey: QUERY_KEYS.AUTH.ME,
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10,
  });
  return { user: query.data ?? user, isLoading: query.isLoading };
}

export function useLogin() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (dto: LoginDto) => authApi.login(dto),
    onSuccess: (data) => {
      login(data.user, data.tokens);
      navigate(data.user.role === 'SELLER' ? '/seller' : '/');
    },
  });
}

export function useRegister() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (dto: RegisterDto) => authApi.register(dto),
    onSuccess: (data) => {
      login(data.user, data.tokens);
      navigate(data.user.role === 'SELLER' ? '/seller' : '/');
    },
  });
}

export function useBecomeSeller() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: authApi.becomeSeller,
    onSuccess: (data) => {
      login(data.user, data.tokens);
      navigate('/seller');
    },
  });
}

export function useGoogleAuth() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (accessToken: string) => authApi.googleAuth(accessToken),
    onSuccess: (data) => {
      login(data.user, data.tokens);
      navigate(data.user.role === 'SELLER' ? '/seller' : '/');
    },
  });
}

export function useLogout() {
  const { refreshToken, logout } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  return useCallback(async () => {
    if (refreshToken) await authApi.logout(refreshToken).catch(() => {});
    logout();
    qc.clear();
    navigate('/auth/login');
  }, [refreshToken, logout, navigate, qc]);
}

export function useForgotPassword() {
  return useMutation({ mutationFn: authApi.forgotPassword });
}

export function useUpdateProfile() {
  const { setUser } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (user) => {
      setUser(user);
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.ME });
    },
  });
}
