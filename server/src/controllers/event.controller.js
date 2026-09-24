import { Event, DEFAULT_CRITERIA, generateJoinCode } from '../models/Event.js';
import { User } from '../models/User.js';

// POST /api/events - Create a new event
export const createEvent = async (req, res) => {
  try {
    const { name, collegeName, date, criteria } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Event name is required.' });
    }

    // Generate unique join code
    let joinCode = '';
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      joinCode = generateJoinCode();
      const existing = await Event.findOne({ joinCode });
      if (!existing) isUnique = true;
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ message: 'Failed to generate unique join code. Please try again.' });
    }

    // Criteria validation: if custom provided, ensure sum of maxMarks > 0
    let eventCriteria = DEFAULT_CRITERIA;
    if (Array.isArray(criteria) && criteria.length > 0) {
      const sum = criteria.reduce((acc, c) => acc + (Number(c.maxMarks) || 0), 0);
      if (sum <= 0) {
        return res.status(400).json({ message: 'Total criteria max marks must be greater than zero.' });
      }
      eventCriteria = criteria.map((c, idx) => ({
        id: c.id || `crit_${idx + 1}`,
        name: c.name || `Criterion ${idx + 1}`,
        maxMarks: Number(c.maxMarks) || 10,
        order: c.order ?? idx + 1,
        description: c.description || '',
      }));
    }

    const newEvent = await Event.create({
      name: name.trim(),
      collegeName: (collegeName || '').trim(),
      date: date ? new Date(date) : new Date(),
      criteria: eventCriteria,
      joinCode,
      organizerIds: [req.user._id],
      judgeIds: [req.user._id],
      isActive: true,
    });

    // Automatically set as user's active event
    await User.findByIdAndUpdate(req.user._id, { activeEventId: newEvent._id });

    return res.status(201).json({
      message: 'Event created successfully',
      event: newEvent,
    });
  } catch (err) {
    console.error('Error creating event:', err);
    return res.status(500).json({ message: 'Failed to create event', details: err.message });
  }
};

// POST /api/events/join - Join an event via joinCode
export const joinEvent = async (req, res) => {
  try {
    const { joinCode } = req.body;

    if (!joinCode || !joinCode.trim()) {
      return res.status(400).json({ message: 'Join code is required.' });
    }

    const cleanCode = joinCode.toUpperCase().trim();
    const event = await Event.findOne({ joinCode: cleanCode, isActive: true });

    if (!event) {
      return res.status(404).json({ message: 'Invalid or inactive event join code.' });
    }

    // Add user to judgeIds if not already added
    const userIdStr = req.user._id.toString();
    const isJudge = event.judgeIds.some((id) => id.toString() === userIdStr);
    if (!isJudge) {
      event.judgeIds.push(req.user._id);
      await event.save();
    }

    // Set as active event
    await User.findByIdAndUpdate(req.user._id, { activeEventId: event._id });

    return res.json({
      message: 'Successfully joined event',
      event,
    });
  } catch (err) {
    console.error('Error joining event:', err);
    return res.status(500).json({ message: 'Failed to join event', details: err.message });
  }
};

// GET /api/events/mine - Get all events the user is part of (as organizer or judge)
export const getMyEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    const events = await Event.find({
      $or: [{ organizerIds: userId }, { judgeIds: userId }],
    }).sort({ createdAt: -1 });

    return res.json({ events });
  } catch (err) {
    console.error('Error fetching my events:', err);
    return res.status(500).json({ message: 'Failed to fetch user events', details: err.message });
  }
};

// GET /api/events/active - Get the user's currently active event
export const getActiveEvent = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('activeEventId');

    if (!user || !user.activeEventId) {
      return res.json({ event: null });
    }

    return res.json({ event: user.activeEventId });
  } catch (err) {
    console.error('Error fetching active event:', err);
    return res.status(500).json({ message: 'Failed to fetch active event', details: err.message });
  }
};

// PATCH /api/events/active - Switch the user's active event
export const setActiveEvent = async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required.' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const userIdStr = req.user._id.toString();
    const isMember =
      req.user.role === 'admin' ||
      event.organizerIds.some((id) => id.toString() === userIdStr) ||
      event.judgeIds.some((id) => id.toString() === userIdStr);

    if (!isMember) {
      return res.status(403).json({ message: 'You have not joined this event.' });
    }

    await User.findByIdAndUpdate(req.user._id, { activeEventId: event._id });

    return res.json({
      message: 'Active event updated successfully',
      event,
    });
  } catch (err) {
    console.error('Error switching active event:', err);
    return res.status(500).json({ message: 'Failed to switch active event', details: err.message });
  }
};

// PATCH /api/events/:id - Update event settings / criteria (organizer/admin only)
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const { name, collegeName, date, criteria, isActive } = req.body;

    if (name) event.name = name.trim();
    if (collegeName !== undefined) event.collegeName = collegeName.trim();
    if (date) event.date = new Date(date);
    if (typeof isActive === 'boolean') event.isActive = isActive;

    if (Array.isArray(criteria)) {
      const sum = criteria.reduce((acc, c) => acc + (Number(c.maxMarks) || 0), 0);
      if (sum <= 0) {
        return res.status(400).json({ message: 'Total criteria max marks must be greater than zero.' });
      }
      event.criteria = criteria.map((c, idx) => ({
        id: c.id || `crit_${idx + 1}`,
        name: c.name || `Criterion ${idx + 1}`,
        maxMarks: Number(c.maxMarks) || 10,
        order: c.order ?? idx + 1,
        description: c.description || '',
      }));
    }

    await event.save();

    return res.json({
      message: 'Event updated successfully',
      event,
    });
  } catch (err) {
    console.error('Error updating event:', err);
    return res.status(500).json({ message: 'Failed to update event', details: err.message });
  }
};
