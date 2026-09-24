import React, { useState } from 'react';
import {
  Trophy,
  Medal,
  Award,
  FileSpreadsheet,
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  Download,
  CheckCircle2,
  Clock,
  Printer
} from 'lucide-react';
import {
  generateAggregatedLeaderboard,
  generateLeaderboardCSV,
  downloadFile,
  formatDecimal,
  formatIdentifier,
} from '../../utils/storage';
import { CRITERIA, TOTAL_MAX_MARKS } from '../../constants/criteria';

export default function OrganizerView({ appData, onBackToJudging, onOpenPrintSheet }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTeamId, setExpandedTeamId] = useState(null);

  const leaderboard = generateAggregatedLeaderboard(appData);

  // Filtered leaderboard
  const filtered = leaderboard.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchName = item.team.teamName.toLowerCase().includes(q);
    const matchTitle = item.team.projectTitle.toLowerCase().includes(q);
    const matchId = (item.team.identifier || '').toLowerCase().includes(q);
    return matchName || matchTitle || matchId;
  });

  const handleExportCSV = () => {
    const csv = generateLeaderboardCSV(appData);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(csv, `expo_final_leaderboard_${dateStr}.csv`, 'text/csv;charset=utf-8;');
  };

  const toggleExpand = (teamId) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
  };

  const top3 = leaderboard.filter((item) => item.judgeCount > 0).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Organizer Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full text-xs font-semibold text-amber-300">
            <Trophy className="w-3.5 h-3.5" />
            <span>Exhibition Administration & Grand Jury</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Final Rankings & Winner Consensus
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Live aggregated scores across all evaluators. Calculates weighted averages, handles multi-judge panels, and exports official jury records.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Leaderboard (CSV)</span>
          </button>

          <button
            onClick={onBackToJudging}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs sm:text-sm font-semibold transition"
          >
            <span>Return to Scoring</span>
          </button>
        </div>
      </div>

      {/* Top 3 Podium (if scores exist) */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rank 2 (Silver) */}
          {top3[1] && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between order-2 md:order-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100 rounded-bl-full -z-0 opacity-60" />
              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center">
                    2
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    1st Runner Up
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {top3[1].team.teamName}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {top3[1].team.projectTitle}
                </p>
                {top3[1].team.identifier && (
                  <span className="inline-block text-[11px] font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {top3[1].team.identifier}
                  </span>
                )}
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  {top3[1].judgeCount} Judge{top3[1].judgeCount > 1 ? 's' : ''}
                </span>
                <span className="text-2xl font-black text-slate-800 font-mono">
                  {formatDecimal(top3[1].averageScore)} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                </span>
              </div>
            </div>
          )}

          {/* Rank 1 (Gold) */}
          {top3[0] && (
            <div className="bg-gradient-to-b from-amber-50 to-white rounded-2xl p-6 border-2 border-amber-400 shadow-md flex flex-col justify-between order-1 md:order-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/40 rounded-bl-full -z-0" />
              <div className="relative z-10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-10 h-10 rounded-full bg-amber-400 text-amber-950 font-black text-base flex items-center justify-center shadow-sm">
                      1
                    </span>
                    <Trophy className="w-5 h-5 text-amber-500" />
                  </div>
                  <span className="text-xs font-black text-amber-800 uppercase tracking-wider bg-amber-100/80 px-2.5 py-1 rounded-full">
                    Winner / Gold
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-950 text-lg">
                  {top3[0].team.teamName}
                </h3>
                <p className="text-xs text-slate-700 line-clamp-2 font-medium">
                  {top3[0].team.projectTitle}
                </p>
                {top3[0].team.identifier && (
                  <span className="inline-block text-[11px] font-mono font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded">
                    {top3[0].team.identifier}
                  </span>
                )}
              </div>
              <div className="pt-4 mt-4 border-t border-amber-200/60 flex items-baseline justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {top3[0].judgeCount} Judge{top3[0].judgeCount > 1 ? 's' : ''}
                </span>
                <span className="text-3xl font-black text-amber-600 font-mono">
                  {formatDecimal(top3[0].averageScore)} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                </span>
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {top3[2] && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between order-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/30 rounded-bl-full -z-0" />
              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center">
                    3
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    2nd Runner Up
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {top3[2].team.teamName}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {top3[2].team.projectTitle}
                </p>
                {top3[2].team.identifier && (
                  <span className="inline-block text-[11px] font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {top3[2].team.identifier}
                  </span>
                )}
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  {top3[2].judgeCount} Judge{top3[2].judgeCount > 1 ? 's' : ''}
                </span>
                <span className="text-2xl font-black text-slate-800 font-mono">
                  {formatDecimal(top3[2].averageScore)} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Table Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Master Exhibition Leaderboard
            </h3>
            <p className="text-xs text-slate-500">
              Click any team row to inspect individual judge breakdowns and rubric scoring.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter leaderboard..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4 w-12 text-center">Rank</th>
                <th className="py-3 px-4">Project / Team</th>
                <th className="py-3 px-4">Identifier</th>
                <th className="py-3 px-4 text-center">Evaluators</th>
                <th className="py-3 px-4 text-right">Average Score</th>
                <th className="py-3 px-4 text-center w-12">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item, idx) => {
                const isExpanded = expandedTeamId === item.team.id;
                const hasScores = item.judgeCount > 0;

                return (
                  <React.Fragment key={item.team.id}>
                    <tr
                      onClick={() => toggleExpand(item.team.id)}
                      className={`hover:bg-slate-50/80 transition cursor-pointer ${
                        isExpanded ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center font-bold font-mono">
                        {hasScores ? (
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                              idx === 0
                                ? 'bg-amber-400 text-amber-950 font-black'
                                : idx === 1
                                ? 'bg-slate-300 text-slate-800'
                                : idx === 2
                                ? 'bg-amber-700 text-white'
                                : 'text-slate-600 bg-slate-100'
                            }`}
                          >
                            {idx + 1}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-sm">
                          {item.team.teamName}
                        </p>
                        <p className="text-slate-500 line-clamp-1">{item.team.projectTitle}</p>
                        {item.team.members && (
                          <p className="text-[11px] text-slate-400">
                            {item.team.members}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {/* Clean display rule: hide cleanly if blank, don't show N/A */}
                        {formatIdentifier(item.team.identifier) ? (
                          <span className="font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-semibold text-[11px]">
                            {formatIdentifier(item.team.identifier)}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {hasScores ? (
                          <span className="inline-flex items-center text-slate-700 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full">
                            <Users className="w-3 h-3 mr-1 text-slate-500" />
                            {item.judgeCount} Judge{item.judgeCount > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-amber-600 font-medium">Pending</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {hasScores ? (
                          <div className="font-mono">
                            <span className="text-base font-black text-slate-900">
                              {formatDecimal(item.averageScore)}
                            </span>
                            <span className="text-slate-400 text-xs"> / {TOTAL_MAX_MARKS}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono">Not scored</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button className="text-slate-400 hover:text-slate-600 p-1">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Detailed Judge Score Breakdown Row */}
                    {isExpanded && (
                      <tr className="bg-slate-50/70">
                        <td colSpan={6} className="p-4 sm:p-6 border-y border-indigo-100">
                          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-4">
                            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center">
                              <Award className="w-4 h-4 mr-1.5 text-indigo-600" />
                              Individual Judge Rubric Marks ({item.judgeBreakdown.length} evaluators)
                            </h4>

                            {item.judgeBreakdown.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">
                                No completed evaluations recorded for this team yet.
                              </p>
                            ) : (
                              <div className="space-y-4">
                                {item.judgeBreakdown.map((jb, jIdx) => (
                                  <div
                                    key={jIdx}
                                    className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2"
                                  >
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
                                          {jb.judgeName.charAt(0)}
                                        </div>
                                        <span className="font-bold text-slate-900">
                                          {jb.judgeName}
                                        </span>
                                        {jb.panel && (
                                          <span className="text-slate-500 text-[11px]">
                                            ({jb.panel})
                                          </span>
                                        )}
                                      </div>

                                      <div className="font-mono font-bold text-slate-900">
                                        Total: {formatDecimal(jb.totalScore)} / {TOTAL_MAX_MARKS}
                                      </div>
                                    </div>

                                    {/* Criteria Pills */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                                      {CRITERIA.map((c) => (
                                        <div
                                          key={c.id}
                                          className="p-1.5 bg-white rounded border border-slate-200 flex justify-between"
                                        >
                                          <span className="text-slate-500 truncate mr-1" title={c.name}>
                                            {c.name}
                                          </span>
                                          <span className="font-mono font-bold text-slate-800">
                                            {jb.marks[c.id] !== undefined
                                              ? formatDecimal(jb.marks[c.id])
                                              : '—'}
                                            /{c.maxMarks}
                                          </span>
                                        </div>
                                      ))}
                                    </div>

                                    {jb.remarks && (
                                      <div className="text-slate-600 italic bg-white p-2 rounded border border-slate-200 text-[11px]">
                                        <span className="font-semibold text-slate-700 not-italic">Remarks: </span>
                                        {jb.remarks}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
