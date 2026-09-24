import { DEMO_TEAMS, INITIAL_EVENT_CONFIG } from '../constants/demoData';
import { CRITERIA } from '../constants/criteria';

const STORAGE_KEYS = {
  APP_DATA: 'expojudge_app_data_v1',
};

// Clean decimal formatting: avoids 7.300000000000001 while preserving decimals up to 2 places
export const formatDecimal = (num) => {
  if (num === null || num === undefined || num === '' || isNaN(num)) return '0';
  const val = Math.round(Number(num) * 100) / 100;
  return val.toString();
};

export const roundScore = (num) => {
  if (num === null || num === undefined || isNaN(num)) return 0;
  return Math.round(Number(num) * 100) / 100;
};

// Calculate total score for given marks record
export const calculateTotalScore = (marksObj = {}) => {
  if (!marksObj) return 0;
  let total = 0;
  for (const criterion of CRITERIA) {
    const val = marksObj[criterion.id];
    if (val !== undefined && val !== null && !isNaN(val)) {
      total += Number(val);
    }
  }
  return roundScore(total);
};

// Load initial or stored app state
export const loadAppData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APP_DATA);
    if (!raw) {
      const initial = {
        eventConfig: INITIAL_EVENT_CONFIG,
        judges: [
          {
            id: 'judge_demo',
            name: 'Dr. Evelyn Mercer',
            panelNumber: 'Panel A - Robotics & Embedded',
            createdAt: Date.now(),
          },
        ],
        currentJudgeId: 'judge_demo',
        teams: DEMO_TEAMS,
        // scores schema: { [judgeId]: { [teamId]: { marks: {}, remarks: '', isCompleted: false, updatedAt: 123 } } }
        scores: {
          judge_demo: {
            team_01: {
              marks: {
                innovation: 13.5,
                problem_relevance: 9,
                technical_knowledge: 18.5,
                functionality_model: 19,
                design_implementation: 9,
                presentation_communication: 9.5,
                qa_handling: 8.5,
                cost_scalability: 4.5,
              },
              remarks: 'Outstanding working prototype with impressive computer vision latency. Great answers during Q&A.',
              isCompleted: true,
              updatedAt: Date.now() - 3600000,
            },
          },
        },
      };
      saveAppData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    // Ensure critical arrays and objects exist
    if (!parsed.teams || parsed.teams.length === 0) parsed.teams = DEMO_TEAMS;
    if (!parsed.judges) parsed.judges = [];
    if (!parsed.scores) parsed.scores = {};
    if (!parsed.eventConfig) parsed.eventConfig = INITIAL_EVENT_CONFIG;
    return parsed;
  } catch (err) {
    console.error('Failed to parse app data from localStorage', err);
    return {
      eventConfig: INITIAL_EVENT_CONFIG,
      judges: [],
      currentJudgeId: null,
      teams: DEMO_TEAMS,
      scores: {},
    };
  }
};

export const saveAppData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEYS.APP_DATA, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
};

// Get current judge
export const getCurrentJudge = (appData) => {
  if (!appData || !appData.judges) return null;
  return appData.judges.find((j) => j.id === appData.currentJudgeId) || null;
};

// Helper to download a string file
export const downloadFile = (content, filename, mimeType = 'text/plain;charset=utf-8;') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export all scores as CSV
export const generateJudgeScoresCSV = (appData, judgeId) => {
  const judge = appData.judges.find((j) => j.id === judgeId);
  const judgeName = judge ? judge.name : 'Unknown Judge';
  const judgeScores = (appData.scores && appData.scores[judgeId]) || {};

  const headers = [
    'Judge Name',
    'Panel',
    'Team / Table No.',
    'Team Name',
    'Project Title',
    ...CRITERIA.map((c) => `${c.name} (Max ${c.maxMarks})`),
    'Total Score (Max 100)',
    'Status',
    'Remarks',
  ];

  const rows = appData.teams.map((team) => {
    const scoreRecord = judgeScores[team.id] || { marks: {}, remarks: '', isCompleted: false };
    const marks = scoreRecord.marks || {};
    const total = calculateTotalScore(marks);
    const status = scoreRecord.isCompleted ? 'Scored' : 'Pending';

    const criteriaValues = CRITERIA.map((c) => (marks[c.id] !== undefined ? marks[c.id] : ''));

    return [
      `"${judgeName.replace(/"/g, '""')}"`,
      `"${(judge?.panelNumber || '').replace(/"/g, '""')}"`,
      `"${(team.identifier || '').replace(/"/g, '""')}"`,
      `"${(team.teamName || '').replace(/"/g, '""')}"`,
      `"${(team.projectTitle || '').replace(/"/g, '""')}"`,
      ...criteriaValues,
      scoreRecord.isCompleted ? total : '',
      status,
      `"${(scoreRecord.remarks || '').replace(/"/g, '""')}"`,
    ];
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
};

// Generate Aggregated Leaderboard across ALL judges
export const generateAggregatedLeaderboard = (appData) => {
  const teams = appData.teams || [];
  const judges = appData.judges || [];
  const scores = appData.scores || {};

  const leaderboard = teams.map((team) => {
    let judgeCount = 0;
    let totalScoreSum = 0;
    const judgeBreakdown = [];

    judges.forEach((judge) => {
      const record = scores[judge.id]?.[team.id];
      if (record && record.isCompleted) {
        const total = calculateTotalScore(record.marks);
        judgeCount++;
        totalScoreSum += total;
        judgeBreakdown.push({
          judgeId: judge.id,
          judgeName: judge.name,
          panel: judge.panelNumber,
          totalScore: total,
          marks: record.marks,
          remarks: record.remarks,
        });
      }
    });

    const averageScore = judgeCount > 0 ? roundScore(totalScoreSum / judgeCount) : 0;

    return {
      team,
      judgeCount,
      totalScoreSum: roundScore(totalScoreSum),
      averageScore,
      judgeBreakdown,
    };
  });

  // Rank by average score descending, then by judgeCount descending
  leaderboard.sort((a, b) => {
    if (b.averageScore !== a.averageScore) {
      return b.averageScore - a.averageScore;
    }
    return b.judgeCount - a.judgeCount;
  });

  return leaderboard;
};

// Generate Leaderboard CSV
export const generateLeaderboardCSV = (appData) => {
  const leaderboard = generateAggregatedLeaderboard(appData);

  const headers = [
    'Rank',
    'Team / Table No.',
    'Team Name',
    'Project Title',
    'Team Members',
    'Judges Evaluated',
    'Average Score (out of 100)',
    'Total Score Sum',
  ];

  const rows = leaderboard.map((item, index) => {
    return [
      index + 1,
      `"${(item.team.identifier || '').replace(/"/g, '""')}"`,
      `"${(item.team.teamName || '').replace(/"/g, '""')}"`,
      `"${(item.team.projectTitle || '').replace(/"/g, '""')}"`,
      `"${(item.team.members || '').replace(/"/g, '""')}"`,
      item.judgeCount,
      item.judgeCount > 0 ? item.averageScore : 'Pending',
      item.totalScoreSum,
    ];
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
};
