import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Search,
  Printer,
  ChevronRight,
  Sparkles,
  Award,
  Plus,
  FileSpreadsheet,
  AlertCircle,
  Edit2,
  FileEdit,
  Building,
  Calendar,
  KeyRound,
  Settings,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateTotalScore, formatDecimal } from '../../utils/storage.js';
import { TOTAL_MAX_MARKS } from '../../constants/criteria.js';
import { downloadScoresCSV } from '../../api/report.api.js';
import EventSettingsModal from '../organizer/EventSettingsModal.jsx';

export default function JudgeDashboard({
  currentJudge,
  teams = [],
  judgeScores = {},
  onSelectTeamToScore,
  onOpenTeamSetup,
  onOpenPrintSheet,
  appData,
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'completed' | 'draft' | 'pending'
  const [searchQuery, setSearchQuery] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const eventConfig = appData?.eventConfig;

  // Calculate statistics
  const totalTeams = teams.length;
  let scoredCount = 0;
  let draftCount = 0;
  let totalPointsAccumulated = 0;

  teams.forEach((team) => {
    const teamId = team._id || team.id;
    const record = judgeScores[teamId];
    if (record) {
      if (record.isCompleted) {
        scoredCount++;
        totalPointsAccumulated += record.totalScore ?? calculateTotalScore(record.marks);
      } else {
        draftCount++;
      }
    }
  });

  const pendingCount = totalTeams - scoredCount - draftCount;
  const isAllCompleted = totalTeams > 0 && scoredCount === totalTeams;
  const averageGiven = scoredCount > 0 ? (totalPointsAccumulated / scoredCount).toFixed(1) : '—';
  const progressPercent = totalTeams > 0 ? Math.round((scoredCount / totalTeams) * 100) : 0;

  // Trigger celebratory confetti once when all teams reach 100% completion
  useEffect(() => {
    if (isAllCompleted) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [isAllCompleted]);

  // Filtered teams list
  const filteredTeams = teams.filter((team) => {
    const teamId = team._id || team.id;
    const record = judgeScores[teamId];
    const isCompleted = record && record.isCompleted;
    const isDraft = record && !record.isCompleted;

    if (filter === 'completed' && !isCompleted) return false;
    if (filter === 'draft' && !isDraft) return false;
    if (filter === 'pending' && (isCompleted || isDraft)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (team.teamName || '').toLowerCase().includes(q);
      const matchTitle = (team.projectTitle || '').toLowerCase().includes(q);
      const idVal = typeof team.identifier === 'object' ? team.identifier?.value || '' : team.identifier || '';
      const matchId = idVal.toLowerCase().includes(q);
      const membersStr = Array.isArray(team.members) ? team.members.join(' ') : team.members || '';
      const matchMembers = membersStr.toLowerCase().includes(q);
      return matchName || matchTitle || matchId || matchMembers;
    }

    return true;
  });

  const handleExportJudgeCSV = async () => {
    const eventId = eventConfig?._id || eventConfig?.id;
    if (eventId) {
      await downloadScoresCSV(eventId, 'mine');
    }
  };

  const formattedEventDate = eventConfig?.date
    ? new Date(eventConfig.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans text-slate-800">
      {/* ─────────────────────────────────────────────────────────────
          EVENT DETAILS HEADER (Light Theme)
          Prominently displays Event Name, College Name, Event Date
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Event Details & Judge Welcome */}
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold text-indigo-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Active Exhibition Event</span>
              </span>

              {eventConfig?.joinCode && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-mono font-bold text-slate-700">
                  <KeyRound className="w-3 h-3 text-slate-500" />
                  Code: {eventConfig.joinCode}
                </span>
              )}

              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 ml-1"
                title="Edit Event Name, College, Date"
              >
                <Settings className="w-3.5 h-3.5" />
                Edit Details
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {eventConfig?.name || 'Project Expo 2026'}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
              {eventConfig?.collegeName && (
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Building className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{eventConfig.collegeName}</span>
                </div>
              )}

              {formattedEventDate && (
                <div className="flex items-center gap-1.5 font-medium text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{formattedEventDate}</span>
                </div>
              )}

              <div className="text-slate-500">
                Judge: <strong className="text-slate-800">{currentJudge?.name}</strong>
                {currentJudge?.panelLabel ? ` (${currentJudge.panelLabel})` : ''}
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            {/* Progress */}
            <div className="bg-slate-50 rounded-2xl p-3.5 text-center border border-slate-200 min-w-[95px] shadow-xs">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Evaluated
              </p>
              <p className="text-xl sm:text-2xl font-black text-emerald-700 font-mono mt-0.5">
                {scoredCount}/{totalTeams}
              </p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Avg Score */}
            <div className="bg-slate-50 rounded-2xl p-3.5 text-center border border-slate-200 min-w-[95px] shadow-xs">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Avg Score
              </p>
              <p className="text-xl sm:text-2xl font-black text-indigo-700 font-mono mt-0.5">
                {averageGiven}
              </p>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">/ {TOTAL_MAX_MARKS} Max</p>
            </div>

            {/* Drafts / Pending */}
            <div className="bg-slate-50 rounded-2xl p-3.5 text-center border border-slate-200 min-w-[95px] shadow-xs">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Drafts
              </p>
              <p className="text-xl sm:text-2xl font-black text-amber-600 font-mono mt-0.5">
                {draftCount}
              </p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">Pending Submit</p>
            </div>
          </div>
        </div>

        {/* Exhibition Rule Clarification Banner */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Judgement Sheet Status:</strong> Exactly{' '}
              <strong className="text-emerald-700">{scoredCount} evaluated {scoredCount === 1 ? 'team' : 'teams'}</strong> will appear on your printable sheet. Unevaluated teams remain excluded.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/add-team"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add &amp; Evaluate Team
            </Link>

            <Link
              to="/sheets"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              View Judgement Sheet ({scoredCount})
            </Link>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CONTROL BAR: FILTERS, SEARCH, ACTIONS
      ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition min-h-[40px] ${
              filter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Teams ({totalTeams})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition min-h-[40px] ${
              filter === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Evaluated ({scoredCount})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition min-h-[40px] ${
              filter === 'draft'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Drafts ({draftCount})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition min-h-[40px] ${
              filter === 'pending'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending ({pendingCount})
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team, table, project..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[40px]"
            />
          </div>

          <button
            onClick={handleExportJudgeCSV}
            title="Export your evaluations to CSV (Excel compatible)"
            className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-700 hover:text-indigo-600 transition min-w-[40px] min-h-[40px] flex items-center justify-center shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>

          <Link
            to="/add-team"
            title="Add & Evaluate a new team"
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition min-w-[40px] min-h-[40px] flex items-center justify-center shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TEAMS LIST / CARDS
      ────────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {filteredTeams.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
            <Award className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-700">
              No teams matching current criteria
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your first exhibiting team and score them directly using our continuous single-panel evaluator.
            </p>
            <div className="pt-2">
              <Link
                to="/add-team"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" />
                Add &amp; Evaluate Team
              </Link>
            </div>
          </div>
        ) : (
          filteredTeams.map((team) => {
            const teamId = team._id || team.id;
            const originalIndex = teams.findIndex((t) => (t._id || t.id) === teamId);
            const scoreRecord = judgeScores[teamId];
            const isCompleted = scoreRecord && scoreRecord.isCompleted;
            const isDraft = scoreRecord && !scoreRecord.isCompleted;
            const totalScore = scoreRecord ? (scoreRecord.totalScore ?? calculateTotalScore(scoreRecord.marks)) : 0;

            const idDisplay =
              typeof team.identifier === 'object' && team.identifier?.value
                ? `${team.identifier.type === 'table' ? 'Table' : 'Team'} #${team.identifier.value}`
                : team.identifier || '';

            const membersDisplay = Array.isArray(team.members)
              ? team.members.join(', ')
              : team.members || '';

            return (
              <div
                key={teamId}
                onClick={() => onSelectTeamToScore(originalIndex)}
                className={`group bg-white rounded-2xl p-5 border transition-all cursor-pointer hover:shadow-md ${
                  isCompleted
                    ? 'border-slate-200 hover:border-emerald-500'
                    : isDraft
                    ? 'border-slate-200 hover:border-amber-400'
                    : 'border-slate-200 hover:border-indigo-400'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Team & Project Details */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {idDisplay && (
                        <span className="text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-lg">
                          {idDisplay}
                        </span>
                      )}

                      {isCompleted ? (
                        <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-lg flex items-center">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Evaluated • Visible on Sheet
                        </span>
                      ) : isDraft ? (
                        <span className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-lg flex items-center">
                          <FileEdit className="w-3.5 h-3.5 mr-1 text-amber-600" />
                          Draft ({scoreRecord.marks?.length || 0} scored)
                        </span>
                      ) : (
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-lg flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          Not Evaluated Yet (Excluded from Sheet)
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                      {team.teamName}
                    </h3>

                    {team.projectTitle && (
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-1">
                        {team.projectTitle}
                      </p>
                    )}

                    {membersDisplay && (
                      <p className="text-xs text-slate-500 truncate">
                        <span className="font-semibold text-slate-600">Members:</span> {membersDisplay}
                      </p>
                    )}
                  </div>

                  {/* Right: Score Breakdown or CTA Button */}
                  <div className="flex items-center space-x-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    {isCompleted ? (
                      <div className="text-right">
                        <div className="flex items-baseline space-x-1 justify-end">
                          <span className="text-2xl font-black text-slate-900 font-mono">
                            {formatDecimal(totalScore)}
                          </span>
                          <span className="text-xs font-bold text-slate-400 font-mono">
                            / {TOTAL_MAX_MARKS}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center justify-end">
                          <Edit2 className="w-3 h-3 mr-1" /> Edit Marks
                        </span>
                      </div>
                    ) : isDraft ? (
                      <div className="text-right">
                        <div className="flex items-baseline space-x-1 justify-end">
                          <span className="text-2xl font-black text-amber-600 font-mono">
                            {formatDecimal(totalScore)}
                          </span>
                          <span className="text-xs font-bold text-slate-400 font-mono">
                            / {TOTAL_MAX_MARKS}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-amber-600 flex items-center justify-end">
                          <Edit2 className="w-3 h-3 mr-1" /> Resume Draft
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white px-4 py-2.5 rounded-xl transition flex items-center min-h-[44px] shadow-xs">
                        <span>Evaluate Now</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Event Details Settings Modal */}
      <EventSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        eventConfig={eventConfig}
      />
    </div>
  );
}
