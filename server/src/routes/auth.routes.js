import express from 'express';
import rateLimit from 'express-rate-limit';
import { login, register, getMe } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // Limit each IP to 60 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later.' },
});

router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);
router.get('/me', verifyToken, getMe);

export default router;
