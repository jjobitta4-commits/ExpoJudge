import { Event } from '../models/Event.js';
import { User } from '../models/User.js';
import { Score } from '../models/Score.js';

// GET /api/judges?eventId= - List all judges for an event (organizer/admin)
export const getEventJudges = async (req, res) => {
  try {
    const eventId = req.query.eventId || req.user.activeEventId;
    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required.' });
    }

    const event = await Event.findById(eventId).populate('judgeIds', 'name email role panelLabel createdAt');
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Check organizer/admin
    const userIdStr = req.user._id.toString();
    const isOrganizer =
      req.user.role === 'admin' ||
      event.organizerIds.some((id) => id.toString() === userIdStr);

    if (!isOrganizer) {
      return res.status(403).json({ message: 'Access denied. Organizer authority required.' });
    }

    // Attach evaluation counts for each judge
    const judgesWithStats = await Promise.all(
      (event.judgeIds || []).map(async (judge) => {
        const completedCount = await Score.countDocuments({
          eventId,
          judgeId: judge._id,
          isCompleted: true,
        });
        const draftCount = await Score.countDocuments({
          eventId,
          judgeId: judge._id,
          isCompleted: false,
        });

        const isEventOrganizer = event.organizerIds.some(
          (orgId) => orgId.toString() === judge._id.toString()
        );

        return {
          id: judge._id,
          name: judge.name,
          email: judge.email,
          role: judge.role,
          panelLabel: judge.panelLabel || '',
          isOrganizer: isEventOrganizer,
          completedCount,
          draftCount,
          createdAt: judge.createdAt,
        };
      })
    );

    return res.json({ judges: judgesWithStats });
  } catch (err) {
    console.error('Error fetching judges:', err);
    return res.status(500).json({ message: 'Failed to fetch judges', details: err.message });
  }
};

// DELETE /api/judges/:userId?eventId= - Remove judge from event (organizer/admin)
export const removeJudgeFromEvent = async (req, res) => {
  try {
    const { userId } = req.params;
    const eventId = req.query.eventId || req.body.eventId || req.user.activeEventId;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required.' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Check organizer authority
    const currentUserIdStr = req.user._id.toString();
    const isOrganizer =
      req.user.role === 'admin' ||
      event.organizerIds.some((id) => id.toString() === currentUserIdStr);

    if (!isOrganizer) {
      return res.status(403).json({ message: 'Access denied. Organizer authority required.' });
    }

    // Prevent removing the sole organizer
    const isTargetOrganizer = event.organizerIds.some((id) => id.toString() === userId);
    if (isTargetOrganizer && event.organizerIds.length <= 1) {
      return res.status(400).json({ message: 'Cannot remove the only organizer of this event.' });
    }

    event.judgeIds = event.judgeIds.filter((id) => id.toString() !== userId);
    event.organizerIds = event.organizerIds.filter((id) => id.toString() !== userId);
    await event.save();

    // Reset active event for target user if it matches this event
    await User.findOneAndUpdate(
      { _id: userId, activeEventId: event._id },
      { activeEventId: null }
    );

    return res.json({ message: 'Judge removed from event successfully.' });
  } catch (err) {
    console.error('Error removing judge:', err);
    return res.status(500).json({ message: 'Failed to remove judge', details: err.message });
  }
};
