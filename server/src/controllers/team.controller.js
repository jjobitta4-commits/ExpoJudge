import { Team } from '../models/Team.js';
import { Event } from '../models/Event.js';
import { Score } from '../models/Score.js';
import { normalizeTeamName, findPotentialDuplicates } from '../utils/similarity.js';

// POST /api/teams - Add a team to an event
export const createTeam = async (req, res) => {
  try {
    const { eventId, teamName, projectTitle, members, identifier, confirmDuplicate } = req.body;

    const targetEventId = eventId || req.user.activeEventId;
    if (!targetEventId) {
      return res.status(400).json({ message: 'Event ID is required to add a team.' });
    }

    if (!teamName || !teamName.trim()) {
      return res.status(400).json({ message: 'Team name is required.' });
    }

    const event = await Event.findById(targetEventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Verify user is in event
    const userIdStr = req.user._id.toString();
    const isMember =
      req.user.role === 'admin' ||
      event.organizerIds.some((id) => id.toString() === userIdStr) ||
      event.judgeIds.some((id) => id.toString() === userIdStr);

    if (!isMember) {
      return res.status(403).json({ message: 'You must join this event before adding teams.' });
    }

    // Fetch existing teams for this event to check for duplicates
    const existingTeams = await Team.find({ eventId: targetEventId });

    if (!confirmDuplicate) {
      const duplicates = findPotentialDuplicates(teamName, existingTeams);
      if (duplicates.length > 0) {
        return res.status(409).json({
          message: 'Potential duplicate team name detected.',
          duplicates: duplicates.map((d) => ({
            id: d.team._id,
            teamName: d.team.teamName,
            projectTitle: d.team.projectTitle,
            similarity: d.similarity,
            isExact: d.isExact,
          })),
        });
      }
    }

    // Normalize members
    let memberList = [];
    if (Array.isArray(members)) {
      memberList = members.map((m) => (typeof m === 'string' ? m.trim() : '')).filter(Boolean);
    } else if (typeof members === 'string') {
      memberList = members.split(',').map((m) => m.trim()).filter(Boolean);
    }

    const newTeam = await Team.create({
      eventId: targetEventId,
      teamName: teamName.trim(),
      teamNameNormalized: normalizeTeamName(teamName),
      projectTitle: (projectTitle || '').trim(),
      members: memberList,
      identifier: {
        type: identifier?.type && ['table', 'teamNo'].includes(identifier.type) ? identifier.type : null,
        value: identifier?.value ? String(identifier.value).trim() : '',
      },
      addedBy: {
        userId: req.user._id,
        role: req.user.role,
        name: req.user.name,
      },
    });

    return res.status(201).json({
      message: 'Team created successfully',
      team: newTeam,
    });
  } catch (err) {
    console.error('Error creating team:', err);
    return res.status(500).json({ message: 'Failed to create team', details: err.message });
  }
};

// GET /api/teams?eventId= - Get teams for an event
export const getTeams = async (req, res) => {
  try {
    const eventId = req.query.eventId || req.user.activeEventId;
    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required.' });
    }

    const teams = await Team.find({ eventId }).sort({ createdAt: 1 });
    return res.json({ teams });
  } catch (err) {
    console.error('Error fetching teams:', err);
    return res.status(500).json({ message: 'Failed to fetch teams', details: err.message });
  }
};

// PATCH /api/teams/:id - Update a team (organizer/admin)
export const updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    // Check organizer authority for team's event
    const event = await Event.findById(team.eventId);
    const userIdStr = req.user._id.toString();
    const isOrganizer =
      req.user.role === 'admin' ||
      (event && event.organizerIds.some((id) => id.toString() === userIdStr));

    if (!isOrganizer) {
      return res.status(403).json({ message: 'Access denied. Organizer authority required.' });
    }

    const { teamName, projectTitle, members, identifier } = req.body;

    if (teamName) {
      team.teamName = teamName.trim();
      team.teamNameNormalized = normalizeTeamName(teamName);
    }
    if (projectTitle !== undefined) {
      team.projectTitle = projectTitle.trim();
    }
    if (members !== undefined) {
      if (Array.isArray(members)) {
        team.members = members.map((m) => (typeof m === 'string' ? m.trim() : '')).filter(Boolean);
      } else if (typeof members === 'string') {
        team.members = members.split(',').map((m) => m.trim()).filter(Boolean);
      }
    }
    if (identifier !== undefined) {
      team.identifier = {
        type: identifier?.type && ['table', 'teamNo'].includes(identifier.type) ? identifier.type : null,
        value: identifier?.value ? String(identifier.value).trim() : '',
      };
    }

    await team.save();

    return res.json({
      message: 'Team updated successfully',
      team,
    });
  } catch (err) {
    console.error('Error updating team:', err);
    return res.status(500).json({ message: 'Failed to update team', details: err.message });
  }
};

// DELETE /api/teams/:id - Delete a team and its scores (organizer/admin)
export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    // Check organizer authority for team's event
    const event = await Event.findById(team.eventId);
    const userIdStr = req.user._id.toString();
    const isOrganizer =
      req.user.role === 'admin' ||
      (event && event.organizerIds.some((id) => id.toString() === userIdStr));

    if (!isOrganizer) {
      return res.status(403).json({ message: 'Access denied. Organizer authority required.' });
    }

    // Delete associated scores
    await Score.deleteMany({ teamId: team._id });
    await Team.findByIdAndDelete(team._id);

    return res.json({
      message: 'Team and all associated scores deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting team:', err);
    return res.status(500).json({ message: 'Failed to delete team', details: err.message });
  }
};
