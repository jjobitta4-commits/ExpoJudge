import express from 'express';
import { getGridReport, exportScoresCSV } from '../controllers/report.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/grid', getGridReport);
router.get('/export', exportScoresCSV);

export default router;
