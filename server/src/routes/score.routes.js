import express from 'express';
import { upsertScore, getMyScores } from '../controllers/score.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/mine', getMyScores);
router.put('/:teamId', upsertScore);

export default router;
