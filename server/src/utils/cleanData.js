import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';

async function cleanAllDemoData() {
  try {
    await connectDB();
    console.log('[Clean] Connected to MongoDB');

    const db = mongoose.connection.db;

    const teamRes = await db.collection('teams').deleteMany({});
    console.log(`[Clean] Deleted ${teamRes.deletedCount} teams.`);

    const scoreRes = await db.collection('scores').deleteMany({});
    console.log(`[Clean] Deleted ${scoreRes.deletedCount} scores.`);

    const eventRes = await db.collection('events').deleteMany({});
    console.log(`[Clean] Deleted ${eventRes.deletedCount} events.`);

    const userRes = await db.collection('users').updateMany(
      {},
      { $set: { activeEventId: null } }
    );
    console.log(`[Clean] Reset activeEventId on ${userRes.modifiedCount} users.`);

    console.log('[Clean] All demo data successfully removed!');
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Clean] Error cleaning demo data:', err);
    process.exit(1);
  }
}

cleanAllDemoData();
