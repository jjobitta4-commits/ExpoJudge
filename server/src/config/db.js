import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expojudge';

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[Database] Connected successfully to MongoDB at ${uri}`);
    return;
  } catch (err) {
    console.warn(`[Database] Could not connect to local/configured MongoDB (${err.message}).`);
    console.log(`[Database] Initializing embedded MongoDB Memory Server...`);

    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Connected successfully to In-Memory MongoDB at ${memoryUri}`);
    } catch (memErr) {
      console.error(`[Database] Failed to start MongoDB Memory Server:`, memErr);
      throw memErr;
    }
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
}
