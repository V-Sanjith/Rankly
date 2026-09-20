import { Server as SocketServer } from 'socket.io';
import { Server } from 'http';
import { env } from '../config/env.js';
import { getLeaderboard } from '../services/ranking.service.js';

let io: SocketServer;
let updateTimeout: NodeJS.Timeout | null = null;

export const initSocket = (server: Server) => {
  const allowedOrigins = [
    env.CLIENT_URL?.replace(/\/$/, ''),
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000',
  ].filter(Boolean) as string[];

  io = new SocketServer(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const normalized = origin.replace(/\/$/, '');
        if (allowedOrigins.includes(normalized)) return callback(null, true);
        try {
          const parsed = new URL(normalized);
          if (parsed.hostname.endsWith('.vercel.app')) return callback(null, true);
        } catch {
          // ignore
        }
        return callback(new Error(`Socket CORS rejection: ${origin}`));
      },
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    socket.on('leaderboard:join', (category?: string) => {
      if (category) {
        socket.join(`leaderboard:${category}`);
      } else {
        socket.join('leaderboard:all');
      }
    });

    socket.on('leaderboard:leave', (category?: string) => {
      if (category) {
        socket.leave(`leaderboard:${category}`);
      } else {
        socket.leave('leaderboard:all');
      }
    });
  });

  return io;
};

export const broadcastRankingUpdate = () => {
  if (!io) return;
  
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }

  // Debounce the broadcast by 500ms
  updateTimeout = setTimeout(async () => {
    try {
      const allLeaderboard = await getLeaderboard({ limit: 100 });
      io.to('leaderboard:all').emit('ranking:update', allLeaderboard);
      
      // Ideally we would also emit category-specific updates here if needed
    } catch (error) {
      console.error('Failed to broadcast ranking update', error);
    }
  }, 500);
};
