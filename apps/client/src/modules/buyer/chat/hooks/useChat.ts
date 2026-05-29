import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { chatApi } from '../services/chatApi';

export function useMyChats() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['chats'],
    queryFn: chatApi.getMyChats,
    enabled: isAuthenticated,
    refetchInterval: 10_000,
  });
}

export function useChatDetail(chatId: string) {
  return useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => chatApi.getChat(chatId),
    refetchInterval: 5_000,
  });
}

export function useStartChat() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  return useMutation({
    mutationFn: (adId: string) => chatApi.getOrCreate(adId),
    onSuccess: (chat) => navigate(`/chats/${chat.id}`),
    onError: () => {
      if (!isAuthenticated) navigate('/auth/login');
    },
  });
}

export function useSendMessage(chatId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => chatApi.sendMessage(chatId, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
      void queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}

export function useUnreadCount() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['chats', 'unread'],
    queryFn: chatApi.getUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: 15_000,
  });
}
