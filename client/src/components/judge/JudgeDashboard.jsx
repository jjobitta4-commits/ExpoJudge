import React, { useState, useEffect } from 'react';
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
  Edit2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateTotalScore, formatDecimal, generateJudgeScoresCSV, downloadFile } from '../utils/storage';
import { TOTAL_MAX_MARKS } from '../constants/criteria';

export default function JudgeDashboard({
  currentJudge,
  teams,
  judgeScores = {},
  onSelectTeamToScore,
  onOpenTeamSetup,
  onOpenPrintSheet,
  appData,
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'scored' | 'pending'
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate statistics
  const totalTeams = teams.length;
  let scoredCount = 0;
  let totalPointsAccumulated = 0;

  teams.forEach((team) => {
    const record = judgeScores[team.id];
    if (record && record.isCompleted) {
      scoredCount++;
      totalPointsAccumulated += calculateTotalScore(record.marks);
    }
  });

  const isAllCompleted = totalTeams > 0 && scoredCount === totalTeams;
  const averageGiven = scoredCount > 0 ? (totalPointsAccumulated / scoredCount).toFixed(1) : '—';
  const progressPercent = totalTeams > 0 ? Math.round((scoredCount / totalTeams) * 100) : 0;

  // Trigger celebratory confetti once when all teams reach 100% completion
  useEffect(() => {
    if (isAllCompleted) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback if canvas not available
      }
    }
  }, [isAllCompleted]);

  // Filtered teams list
  const filteredTeams = teams.filter((team) => {
    const record = judgeScores[team.id];
    const isCompleted = record && record.isCompleted;

    if (filter === 'scored' && !isCompleted) return false;
    if (filter === 'pending' && isCompleted) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = team.teamName.toLowerCase().includes(q);
      const matchTitle = team.projectTitle.toLowerCase().includes(q);
      const matchId = (team.identifier || '').toLowerCase().includes(q);
      const matchMembers = (team.members || '').toLowerCase().includes(q);
      return matchName || matchTitle || matchId || matchMembers;
    }

    return true;
  });

  const handleExportJudgeCSV = () => {
    if (!currentJudge) return;
    const csvContent = generateJudgeScoresCSV(appData, currentJudge.id);
    const filename = `${currentJudge.name.replace(/\s+/g, '_')}_expo_scores.csv`;
    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Judge Evaluation Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome, {currentJudge?.name || 'Judge'}
            </h1>
            <p className="text-sm text-slate-300">
              {currentJudge?.panelNumber
                ? `Assigned: ${currentJudge.panelNumber}`
                : 'General Expo Evaluator'}
              {' — '}Review each booth, enter decimal scores across 8 criteria, and generate your signed judging sheets once complete.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 text-center border border-white/10">
              <p className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold">
                Progress
              </p>
              <p className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                {scoredCount}/{totalTeams}
              </p>
              <p className="text-[10px] text-indigo-300 font-medium">{progressPercent}% complete</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 text-center border border-white/10">
              <p className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold">
                Pending
              </p>
              <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-0.5">
                {totalTeams - scoredCount}
              </p>
              <p className="text-[10px] text-slate-300 font-medium">booths left</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 text-center border border-white/10">
              <p className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold">
                Avg Score
              </p>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-0.5">
                {averageGiven}
              </p>
              <p className="text-[10px] text-slate-300 font-medium">out of {TOTAL_MAX_MARKS}</p>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1.5">
            <span>Judging Completion Status</span>
            <span>{scoredCount} of {totalTeams} Teams Scored ({progressPercent}%)</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-violet-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* REQUIREMENT 5: Once all entries for a judge are marked done, show "Generate Judging Sheet" button */}
      {isAllCompleted ? (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-scaleUp">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">All Evaluations Complete!</h3>
              <p className="text-xs text-emerald-100 max-w-lg">
                You have evaluated all {totalTeams} teams. You can now generate, print, or download your official signed judging sheets for submission to the expo committee.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenPrintSheet}
            className="shrink-0 flex items-center space-x-2 px-6 py-3 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl font-black text-sm shadow-md hover:shadow-xl transition transform active:scale-95"
          >
            <Printer className="w-5 h-5 text-emerald-700" />
            <span>Generate Judging Sheet</span>
          </button>
        </div>
      ) : (
        /* Preview / In-Progress Sheet Generation link */
        <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-2.5 text-xs text-slate-600">
            <Printer className="w-4 h-4 text-slate-500" />
            <span>
              You can preview or generate print sheets at any point, even while scoring is in progress.
            </span>
          </div>
          <button
            onClick={onOpenPrintSheet}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Preview Judging Sheets ({scoredCount}/{totalTeams})</span>
          </button>
        </div>
      )}

      {/* Control Bar: Filters, Search & Tools */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center bg-slate-200/80 p-1 rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Projects ({totalTeams})
          </button>
          <button
            onClick={() => setFilter('scored')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'scored'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Scored ({scoredCount})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'pending'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({totalTeams - scoredCount})
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team, table, project..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={handleExportJudgeCSV}
            title="Export this judge's evaluations to CSV"
            className="p-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-slate-700 hover:text-indigo-600 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenTeamSetup}
            title="Add more teams on the fly"
            className="p-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-slate-700 hover:text-indigo-600 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Teams Grid / List */}
      <div className="space-y-3.5">
        {filteredTeams.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700">No teams matching current filter</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search query or tab filter.
            </p>
          </div>
        ) : (
          filteredTeams.map((team) => {
            const originalIndex = teams.findIndex((t) => t.id === team.id);
            const scoreRecord = judgeScores[team.id];
            const isCompleted = scoreRecord && scoreRecord.isCompleted;
            const totalScore = isCompleted ? calculateTotalScore(scoreRecord.marks) : 0;

            return (
              <div
                key={team.id}
                onClick={() => onSelectTeamToScore(originalIndex)}
                className={`group bg-white rounded-2xl p-5 border transition-all cursor-pointer hover:shadow-md ${
                  isCompleted
                    ? 'border-slate-200 hover:border-emerald-300'
                    : 'border-slate-200 hover:border-indigo-400'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Team & Project Details */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        Booth #{originalIndex + 1}
                      </span>

                      {/* CRITICAL REQUIREMENT: Show whichever identifier was provided (team no. or table no.); 
                          hide the field entirely if blank, don't show "N/A" */}
                      {team.identifier && team.identifier.trim() !== '' && (
                        <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                          {team.identifier}
                        </span>
                      )}

                      {isCompleted ? (
                        <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-md flex items-center">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completed
                        </span>
                      ) : (
                        <span className="text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-md flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1" /> Not Scored
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                      {team.teamName}
                    </h3>

                    <p className="text-sm text-slate-600 line-clamp-1">
                      {team.projectTitle}
                    </p>

                    {team.members && (
                      <p className="text-xs text-slate-400 truncate">
                        <span className="font-medium text-slate-500">Members:</span> {team.members}
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
                          <span className="text-xs font-bold text-slate-400">
                            / {TOTAL_MAX_MARKS}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-600 flex items-center justify-end">
                          <Edit2 className="w-3 h-3 mr-1" /> Click to Revise
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white px-3.5 py-2 rounded-xl transition flex items-center">
                        <span>Evaluate Booth</span>
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
    </div>
  );
}
