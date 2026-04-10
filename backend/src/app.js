import mongoose from 'mongoose';
import cors from 'cors';
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import photoRoutes from './routes/photoRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { env } from './config/env.js';
import { usesLocalUploads } from './storage/objectStorage.js';

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = (env.clientOrigin || '').split(',').map(o => o.trim());
      // Allow requests with no origin (like mobile apps or curl) 
      // or if the origin is in our allowed list
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (usesLocalUploads()) {
  app.use('/uploads', express.static(env.uploadDir));
}

app.get('/api/health', async (_req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const uptime = process.uptime();
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
    services: {
      database: {
        provider: env.dataProvider,
        status: dbStatus,
        latency: dbStatus === 'connected' ? 'stable' : 'n/a'
      },
      storage: {
        provider: env.storageProvider,
        status: env.storageProvider === 'cloudinary' && !env.cloudinary.apiKey ? 'error' : 'active',
        config: env.storageProvider === 'cloudinary' ? 'cloud-configured' : 'local-configured'
      }
    },
    environment: env.nodeEnv,
    version: '2.5.0-ultra-premium'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ratings', ratingRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
