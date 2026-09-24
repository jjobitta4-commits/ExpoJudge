import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/event.routes.js';
import teamRoutes from './routes/team.routes.js';
import scoreRoutes from './routes/score.routes.js';
import judgeRoutes from './routes/judge.routes.js';
import reportRoutes from './routes/report.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/judges', judgeRoutes);
app.use('/api/reports', reportRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use(errorHandler);

export default app;
