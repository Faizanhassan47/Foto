import mongoose from 'mongoose';
import { env } from './env.js';

let hasConnected = false;

export async function connectDatabase() {
  if (env.dataProvider !== 'mongo') {
    return {
      provider: 'local'
    };
  }

  if (hasConnected || mongoose.connection.readyState === 1) {
    return {
      provider: 'mongo',
      name: mongoose.connection.name
    };
  }

  if (!env.mongodbUri) {
    throw new Error('MONGODB_URI is required when DATA_PROVIDER is set to mongo.');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongodbUri);
  hasConnected = true;

  return {
    provider: 'mongo',
    name: mongoose.connection.name
  };
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  hasConnected = false;
}
