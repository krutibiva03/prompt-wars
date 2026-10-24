import mongoose from 'mongoose';
import { config } from './config.js';
import { MISSIONS } from './engine/missions.js';
import { MissionModel } from './models/Mission.js';

let isConnected = false;

function cleanMongoUri(uri: string): string {
  if (!uri) return '';
  let cleaned = uri.trim();
  // Strip trailing "this is my mongodb uri" or similar comments if user appended them
  cleaned = cleaned.replace(/\s*this is my mongodb uri\s*$/i, '');
  // Remove angle brackets around password if present, e.g. <73fOOoGjU6I0038T> -> 73fOOoGjU6I0038T
  cleaned = cleaned.replace(/<([^>]+)>/, '$1');
  // Ensure default database name if URI ends with '/' or empty path
  if (/mongodb(\+srv)?:\/\/[^/]+\/?(\?.*)?$/.test(cleaned)) {
    cleaned = cleaned.replace(/(mongodb(?:\+srv)?:\/\/[^/?]+)\/?(\?.*)?$/, '$1/promptwars$2');
  }
  return cleaned;
}

export async function connectDatabase(): Promise<boolean> {
  const rawUri = config.mongodbUri;
  if (!rawUri) {
    console.warn('[MongoDB] No MONGODB_URI configured in environment variables.');
    return false;
  }

  const cleanUri = cleanMongoUri(rawUri);

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(cleanUri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });

    isConnected = true;
    console.log('[MongoDB] ✅ Successfully connected to MongoDB Atlas database cluster');

    // Seed missions if not present in MongoDB
    await seedMissionsIfEmpty();

    return true;
  } catch (error) {
    isConnected = false;
    console.error('[MongoDB] ❌ MongoDB Connection Error:', error instanceof Error ? error.message : error);
    return false;
  }
}

async function seedMissionsIfEmpty(): Promise<void> {
  try {
    if (mongoose.connection.readyState !== 1) {
      await new Promise<void>((resolve) => {
        mongoose.connection.once('open', () => resolve());
      });
    }
    const count = await MissionModel.countDocuments();
    if (count === 0) {
      console.log('[MongoDB] 📦 Seeding initial 5 mission definitions into MongoDB...');
      await MissionModel.insertMany(MISSIONS);
      console.log('[MongoDB] ✅ Initial mission catalog successfully seeded in MongoDB.');
    } else {
      console.log(`[MongoDB] ℹ️ Mission catalog present in MongoDB (${count} missions).`);
    }
  } catch (err) {
    console.warn('[MongoDB] Warning: Could not seed missions:', err instanceof Error ? err.message : err);
  }
}

export function isDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export { mongoose };
