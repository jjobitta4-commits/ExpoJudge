import { Event } from '../models/Event.js';
import { Team } from '../models/Team.js';
import { User } from '../models/User.js';
import { Score } from '../models/Score.js';

// Helper to escape CSV values cleanly for Excel compatibility
function escapeCSV(field) {
  if (field === null || field === undefined) return '""';
  const str = String(field).replace(/"/g, '""');
  return `"${str}"`;
}

// GET /api/reports/grid?eventId= - Matrix of teams × judges
export const getGridReport = async (req, res) => {
  try {
    const eventId = req.query.eventId || req.user.activeEventId;
    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required.' });
    }

    const event = await Event.findById(eventId).populate('judgeIds', 'name email panelLabel');
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Verify organizer/admin
    const userIdStr = req.user._id.toString();
    const isOrganizer =
      req.user.role === 'admin' ||
      event.organizerIds.some((id) => id.toString() === userIdStr);

    if (!isOrganizer) {
      return res.status(403).json({ message: 'Access denied. Organizer authority required.' });
    }

    const teams = await Team.find({ eventId }).sort({ createdAt: 1 });
    const scores = await Score.find({ eventId });

    // Build matrix
    const matrix = {};
    const teamStats = {};

    teams.forEach((t) => {
      matrix[t._id] = {};
      teamStats[t._id] = {
        completedScores: [],
        draftScores: [],
      };
    });

    scores.forEach((s) => {
      if (matrix[s.teamId]) {
        matrix[s.teamId][s.judgeId] = {
          totalScore: s.totalScore,
          isCompleted: s.isCompleted,
          updatedAt: s.updatedAt,
          marksCount: s.marks?.length || 0,
        };

        if (s.isCompleted) {
          teamStats[s.teamId].completedScores.push(s.totalScore);
        } else {
          teamStats[s.teamId].draftScores.push(s.totalScore);
        }
      }
    });

    // Compute averages & ranking
    const summary = teams.map((team) => {
      const stats = teamStats[team._id];
      const count = stats.completedScores.length;
      const avg = count > 0 ? stats.completedScores.reduce((a, b) => a + b, 0) / count : 0;
      return {
        teamId: team._id,
        teamName: team.teamName,
        projectTitle: team.projectTitle,
        identifier: team.identifier,
        completedEvaluations: count,
        draftEvaluations: stats.draftScores.length,
        averageScore: Math.round(avg * 100) / 100,
      };
    });

    // Sort summary descending by averageScore to assign rank
    summary.sort((a, b) => b.averageScore - a.averageScore);
    summary.forEach((item, index) => {
      item.rank = item.completedEvaluations > 0 ? index + 1 : '-';
    });

    return res.json({
      event: {
        id: event._id,
        name: event.name,
        joinCode: event.joinCode,
        criteria: event.criteria,
      },
      teams,
      judges: event.judgeIds || [],
      matrix,
      summary,
    });
  } catch (err) {
    console.error('Error fetching grid report:', err);
    return res.status(500).json({ message: 'Failed to fetch grid report', details: err.message });
  }
};

// GET /api/reports/export?eventId=&scope= - CSV export for Excel with UTF-8 BOM
export const exportScoresCSV = async (req, res) => {
  try {
    const eventId = req.query.eventId || req.user.activeEventId;
    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required.' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const userIdStr = req.user._id.toString();
    const isOrganizer =
      req.user.role === 'admin' ||
      event.organizerIds.some((id) => id.toString() === userIdStr);

    const scope = req.query.scope;
    const filter = { eventId };

    // If scope is 'mine' or user is not an organizer, limit to own scores
    if (scope === 'mine' || !isOrganizer) {
      filter.judgeId = req.user._id;
    }

    const scores = await Score.find(filter)
      .populate('teamId', 'teamName projectTitle identifier members')
      .populate('judgeId', 'name panelLabel email');

    const criteriaHeaders = (event.criteria || []).map((c) => `${c.name} (Max ${c.maxMarks})`);

    const headers = [
      'Team Name',
      'Project Title',
      'Identifier',
      'Members',
      'Judge Name',
      'Panel',
      ...criteriaHeaders,
      'Total Score',
      'Status',
      'Remarks',
      'Last Evaluated',
    ];

    const rows = scores.map((score) => {
      const team = score.teamId || {};
      const judge = score.judgeId || {};

      const idDisplay = team.identifier?.value
        ? `${team.identifier.type === 'table' ? 'Table' : 'Team #'}: ${team.identifier.value}`
        : '';

      const membersList = Array.isArray(team.members) ? team.members.join(', ') : '';

      const marksMap = new Map();
      (score.marks || []).forEach((m) => {
        marksMap.set(m.criterionId, m.value);
      });

      const criteriaValues = (event.criteria || []).map((c) => {
        const val = marksMap.get(c.id);
        return val !== undefined && val !== null ? val : '';
      });

      return [
        escapeCSV(team.teamName || 'Unknown Team'),
        escapeCSV(team.projectTitle || ''),
        escapeCSV(idDisplay),
        escapeCSV(membersList),
        escapeCSV(judge.name || 'Unknown Judge'),
        escapeCSV(judge.panelLabel || ''),
        ...criteriaValues.map((v) => escapeCSV(v)),
        escapeCSV(score.totalScore),
        escapeCSV(score.isCompleted ? 'Completed' : 'Draft'),
        escapeCSV(score.remarks || ''),
        escapeCSV(score.updatedAt ? new Date(score.updatedAt).toISOString() : ''),
      ].join(',');
    });

    // Add UTF-8 BOM (\uFEFF) for Excel compatibility
    const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows].join('\r\n');

    const fileName = `ExpoJudge-${event.name.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.status(200).send(csvContent);
  } catch (err) {
    console.error('Error exporting scores CSV:', err);
    return res.status(500).json({ message: 'Failed to export CSV', details: err.message });
  }
};
