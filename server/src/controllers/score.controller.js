import { Score } from '../models/Score.js';
import { Team } from '../models/Team.js';
import { Event } from '../models/Event.js';

// PUT /api/scores/:teamId - Upsert score for a team by the authenticated judge
export const upsertScore = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { marks = [], remarks = '', isCompleted = false } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    const event = await Event.findById(team.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event for this team not found.' });
    }

    // Verify judge belongs to this event
    const userIdStr = req.user._id.toString();
    const isMember =
      req.user.role === 'admin' ||
      event.judgeIds.some((id) => id.toString() === userIdStr) ||
      event.organizerIds.some((id) => id.toString() === userIdStr);

    if (!isMember) {
      return res.status(403).json({ message: 'You have not joined the event for this team.' });
    }

    // Map criteria for fast lookup
    const criteriaMap = new Map();
    for (const c of event.criteria) {
      criteriaMap.set(c.id, c);
    }

    // Validate marks
    const validatedMarks = [];
    const submittedCriterionIds = new Set();

    for (const item of marks) {
      if (!item || !item.criterionId) continue;

      const criterion = criteriaMap.get(item.criterionId);
      if (!criterion) {
        return res.status(400).json({
          message: `Invalid criterion ID: "${item.criterionId}".`,
        });
      }

      const val = Number(item.value);
      if (isNaN(val) || val < 0 || val > criterion.maxMarks) {
        return res.status(400).json({
          message: `Score for "${criterion.name}" must be a number between 0 and ${criterion.maxMarks}. Received: ${item.value}`,
        });
      }

      submittedCriterionIds.add(item.criterionId);
      validatedMarks.push({
        criterionId: criterion.id,
        criterionName: criterion.name,
        value: Math.round(val * 100) / 100,
      });
    }

    // If isCompleted is true, every criterion in event.criteria must be scored
    if (isCompleted) {
      for (const crit of event.criteria) {
        if (!submittedCriterionIds.has(crit.id)) {
          return res.status(400).json({
            message: `Submission requires all criteria to be evaluated. Missing: "${crit.name}".`,
          });
        }
      }
    }

    // Server-authoritative total score
    const totalScore = validatedMarks.reduce((sum, m) => sum + m.value, 0);

    const score = await Score.findOneAndUpdate(
      { judgeId: req.user._id, teamId: team._id },
      {
        eventId: team.eventId,
        judgeId: req.user._id,
        teamId: team._id,
        marks: validatedMarks,
        totalScore: Math.round(totalScore * 100) / 100,
        remarks: (remarks || '').trim(),
        isCompleted: Boolean(isCompleted),
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.json({
      message: isCompleted ? 'Score submitted successfully' : 'Draft saved successfully',
      score,
    });
  } catch (err) {
    console.error('Error saving score:', err);
    return res.status(500).json({ message: 'Failed to save score', details: err.message });
  }
};

// GET /api/scores/mine?eventId= - Get current judge's scores for an event
export const getMyScores = async (req, res) => {
  try {
    const eventId = req.query.eventId || req.user.activeEventId;
    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required.' });
    }

    const scores = await Score.find({
      judgeId: req.user._id,
      eventId,
    });

    return res.json({ scores });
  } catch (err) {
    console.error('Error fetching judge scores:', err);
    return res.status(500).json({ message: 'Failed to fetch your scores', details: err.message });
  }
};
