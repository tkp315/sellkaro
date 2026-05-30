import api from '@/lib/axios';

export interface ChatMessage {
  id: string;
  content: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  awsUrl?: string | null;
  createdAt: string;
  isRead: boolean;
  senderId: string;
  chatId: string;
}

export interface ChatParticipant {
  id: string;
  profile: { name: string; avatar: string | null } | null;
}

export interface ChatAd {
  id: string;
  title: string;
  images: { url: string }[];
}

export interface Chat {
  id: string;
  createdAt: string;
  updatedAt: string;
  buyerId: string;
  sellerId: string;
  adId: string;
  ad: ChatAd;
  buyer: ChatParticipant;
  seller: ChatParticipant;
  messages: ChatMessage[];
  unreadCount?: number;
}

export const chatApi = {
  getOrCreate: (adId: string) =>
    api.post<{ data: Chat }>(`/buyer/chats/ad/${adId}`).then((r) => r.data.data),

  getChat: (chatId: string) =>
    api.get<{ data: Chat }>(`/buyer/chats/${chatId}`).then((r) => r.data.data),

  sendMessage: (chatId: string, payload: { content?: string; mediaUrl?: string; mediaType?: string; awsUrl?: string }) =>
    api.post<{ data: ChatMessage }>(`/buyer/chats/${chatId}/messages`, payload).then((r) => r.data.data),

  getMyChats: () =>
    api.get<{ data: Chat[] }>('/buyer/chats').then((r) => r.data.data),

  getUnreadCount: () =>
    api.get<{ data: { count: number } }>('/buyer/chats/unread').then((r) => r.data.data),
};
