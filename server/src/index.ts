import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
import routes from './routes/index.js';
import { initSocket } from './socket/index.js';
import { prisma } from './config/database.js';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://checkout.razorpay.com'],
        frameSrc: ["'self'", 'https://api.razorpay.com', 'https://checkout.razorpay.com'],
        connectSrc: ["'self'", 'ws:', 'wss:', 'https://api.razorpay.com', 'https://lumberjack.razorpay.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Secure CORS configuration: production Vercel, preview domains, local dev (no wildcards with credentials)
const allowedOrigins = [
  env.CLIENT_URL?.replace(/\/$/, ''),
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
].filter(Boolean) as string[];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    try {
      const parsed = new URL(normalizedOrigin);
      if (parsed.hostname.endsWith('.vercel.app')) {
        return callback(null, true);
      }
    } catch {
      // ignore parse error
    }
    return callback(new Error(`CORS policy rejection: Origin ${origin} is not authorized`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Don't parse JSON for Razorpay webhooks as we need raw body for signature verification
app.use('/api/webhooks/razorpay', express.raw({ type: 'application/json' }));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
});
app.use('/api', limiter);

app.use('/api', routes);

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Database Health Probe Failed:', err.message || err);
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

app.use(errorHandler);

const httpServer = createServer(app);
initSocket(httpServer);

const PORT = process.env.PORT ? Number(process.env.PORT) : env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down server...');
  httpServer.close(async () => {
    await prisma.$disconnect();
    console.log('Server stopped');
    process.exit(0);
  });
  
  // Force close after 10s
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
