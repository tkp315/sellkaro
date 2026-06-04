import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketServer | null = null;

export function initSocket(server: HttpServer): SocketServer {
  io = new SocketServer(server, {
    cors: { origin: '*', credentials: true },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    socket.on('join_chat', (chatId: string) => {
      socket.join(`chat:${chatId}`);
    });
    socket.on('leave_chat', (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });
    socket.on('disconnect', () => {});
  });

  return io;
}

export function getIo(): SocketServer | null {
  return io;
}

export default { initSocket, getIo };
