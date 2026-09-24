import express from 'express';
import {
  createEvent,
  joinEvent,
  getMyEvents,
  getActiveEvent,
  setActiveEvent,
  updateEvent,
} from '../controllers/event.controller.js';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', createEvent);
router.post('/join', joinEvent);
router.get('/mine', getMyEvents);
router.get('/active', getActiveEvent);
router.patch('/active', setActiveEvent);
router.patch('/:id', requireAdmin, updateEvent);

export default router;
