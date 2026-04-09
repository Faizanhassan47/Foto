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
    origin: env.clientOrigin
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (usesLocalUploads()) {
  app.use('/uploads', express.static(env.uploadDir));
}

app.get('/api/health', async (_req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: {
        provider: env.dataProvider,
        status: dbStatus
      },
      storage: {
        provider: env.storageProvider,
        status: 'active'
      }
    },
    version: '2.0.0-premium'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ratings', ratingRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
