import express from 'express';
import { getEventJudges, removeJudgeFromEvent } from '../controllers/judge.controller.js';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireAdmin);

router.get('/', getEventJudges);
router.delete('/:userId', removeJudgeFromEvent);

export default router;
