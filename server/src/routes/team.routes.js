import express from 'express';
import {
  createTeam,
  getTeams,
  updateTeam,
  deleteTeam,
} from '../controllers/team.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', createTeam);
router.get('/', getTeams);
router.patch('/:id', updateTeam);
router.delete('/:id', deleteTeam);

export default router;
