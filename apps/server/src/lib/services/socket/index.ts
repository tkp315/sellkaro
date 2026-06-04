import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketServer | null = null;

export function initSocket(server: HttpServer): SocketServer {
  // Derive allowed origins from the same env var used by the HTTP CORS config.
  // '*' with credentials is rejected by browsers, so we must use explicit origins.
  const originsEnv = process.env.CORS_ORIGINS || '';
  const allowedOrigins = originsEnv
    ? originsEnv.split(',').map((o) => o.trim()).filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:8081'];

  io = new SocketServer(server, {
    cors: { origin: allowedOrigins, credentials: true },
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
