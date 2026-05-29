export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000';

export const ROLES = {
  BUYER: 'BUYER',
  SELLER: 'SELLER',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
} as const;

export const QUERY_KEYS = {
  AUTH: {
    ME: ['auth', 'me'] as const,
  },
  FEED: {
    LIST: (filters?: Record<string, unknown>) => ['feed', 'list', filters] as const,
  },
  PRODUCT: {
    DETAIL: (id: string) => ['product', 'detail', id] as const,
  },
} as const;
