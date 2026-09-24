import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Event } from '../models/Event.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'expojudge_secure_jwt_secret_key_2026';

export async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'User belonging to this token no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token', error: err.message });
  }
}

export async function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  // Global super-admin check
  if (req.user.role === 'admin') {
    return next();
  }

  // Per-event authority check
  const eventId =
    req.params.eventId ||
    req.params.id ||
    req.query.eventId ||
    req.body.eventId ||
    req.user.activeEventId;

  if (eventId) {
    try {
      const event = await Event.findById(eventId);
      if (
        event &&
        ((event.organizerIds &&
          event.organizerIds.some((id) => id.toString() === req.user._id.toString())) ||
         (event.judgeIds &&
          event.judgeIds.some((id) => id.toString() === req.user._id.toString())))
      ) {
        req.event = event;
        return next();
      }
    } catch (err) {
      console.error('Error verifying event organizer:', err);
    }
  }

  return res.status(403).json({
    message: 'Access denied. Organizer or administrator privileges required.',
  });
}

export const requireOrganizerOrAdmin = requireAdmin;

export function requireJudgeOrAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'judge')) {
    return res.status(403).json({ message: 'Access denied. Authorized judge or admin role required.' });
  }
  next();
}
