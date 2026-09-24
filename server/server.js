import 'dotenv/config';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[Server] ExpoJudge backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[Server] Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
