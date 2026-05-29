import { io } from 'socket.io-client';
import { SOCKET_URL } from '@/utils/constants';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: false,
});

export function connectSocket(token: string): void {
  socket.auth = { token };
  socket.connect();
}

export function disconnectSocket(): void {
  socket.disconnect();
}
