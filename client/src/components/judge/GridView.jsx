import React, { useState, useEffect } from 'react';
import { getGridReportApi } from '../../api/report.api.js';
import { useEvent } from '../../context/EventContext.jsx';
import {
  Grid,
  CheckCircle2,
  FileEdit,
  Clock,
  Search,
  Users,
  Award,
  Loader2,
  RefreshCw,
  Trophy,
} from 'lucide-react';

export default function GridView() {
  const { activeEvent } = useEvent();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchGrid = async () => {
    if (!activeEvent?._id) return;
    try {
      const res = await getGridReportApi(activeEvent._id);
      setData(res);
    } catch (err) {
      console.error('Failed to load grid report:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGrid();
  }, [activeEvent?._id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchGrid();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500">Generating evaluation matrix...</p>
      </div>
    );
  }

  const teams = data?.teams || [];
  const judges = data?.judges || [];
  const matrix = data?.matrix || {};
  const summaryMap = new Map((data?.summary || []).map((s) => [s.teamId, s]));

  const filteredTeams = teams.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const nameMatch = (t.teamName || '').toLowerCase().includes(q);
    const titleMatch = (t.projectTitle || '').toLowerCase().includes(q);
    const idVal = typeof t.identifier === 'object' ? t.identifier?.value || '' : t.identifier || '';
    const idMatch = idVal.toLowerCase().includes(q);
    return nameMatch || titleMatch || idMatch;
  });

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Top Controls & Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shadow-xs">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Evaluation Matrix
            </h2>
            <p className="text-xs text-slate-500">
              {teams.length} Teams × {judges.length} Judges evaluation coverage
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 flex-wrap">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileEdit className="w-4 h-4 text-amber-500" />
            <span>Draft</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Not Evaluated</span>
          </div>

          <div className="relative w-full sm:w-48 mt-2 sm:mt-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[36px]"
            />
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Refresh Matrix"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid Container with Sticky Column & Row */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full border-collapse text-left text-xs">
            {/* Header Row */}
            <thead className="sticky top-0 z-20 bg-slate-100 border-b border-slate-200 shadow-xs">
              <tr>
                {/* Pinned Top-Left Corner */}
                <th className="sticky left-0 top-0 z-30 bg-slate-100 p-3.5 font-bold text-slate-800 min-w-[200px] border-r border-slate-200">
                  Team Name &amp; Project
                </th>

                {/* Judge Columns */}
                {judges.map((judge) => (
                  <th
                    key={judge._id || judge.id}
                    className="p-3 text-center min-w-[130px] border-r border-slate-200"
                  >
                    <p className="font-bold text-slate-800 truncate max-w-[120px] mx-auto">
                      {judge.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-normal truncate">
                      {judge.panelLabel || 'Judge'}
                    </p>
                  </th>
                ))}

                {/* Summary Columns */}
                <th className="p-3 text-center min-w-[100px] font-bold text-slate-800 border-r border-slate-200">
                  Average
                </th>
                <th className="p-3 text-center min-w-[80px] font-bold text-slate-800">
                  Rank
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-slate-100">
              {filteredTeams.map((team) => {
                const teamId = team._id || team.id;
                const teamSummary = summaryMap.get(teamId) || {};
                const idDisplay =
                  typeof team.identifier === 'object' && team.identifier?.value
                    ? `${team.identifier.type === 'table' ? 'Table' : 'Team #'}: ${team.identifier.value}`
                    : team.identifier || '';

                return (
                  <tr
                    key={teamId}
                    className="hover:bg-slate-50 transition"
                  >
                    {/* Sticky Team Column */}
                    <td className="sticky left-0 z-10 bg-white p-3.5 border-r border-slate-200 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                      <p className="font-bold text-slate-900 truncate max-w-[200px]">
                        {team.teamName}
                      </p>
                      {idDisplay && (
                        <span className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 mt-0.5 border border-slate-200">
                          {idDisplay}
                        </span>
                      )}
                    </td>

                    {/* Judge Cells */}
                    {judges.map((judge) => {
                      const judgeId = judge._id || judge.id;
                      const cell = matrix[teamId]?.[judgeId];
                      const isCompleted = cell && cell.isCompleted;
                      const isDraft = cell && !cell.isCompleted;

                      return (
                        <td
                          key={judgeId}
                          className="p-3 text-center border-r border-slate-100 font-mono"
                        >
                          {isCompleted ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                {Number(cell.totalScore).toFixed(1)}
                              </span>
                            </div>
                          ) : isDraft ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg text-[11px]">
                                <FileEdit className="w-3.5 h-3.5 text-amber-600" />
                                {Number(cell.totalScore).toFixed(1)}
                              </span>
                              <span className="text-[9px] text-amber-600 font-sans mt-0.5">Draft</span>
                            </div>
                          ) : (
                            <span className="text-slate-300 font-sans text-sm">
                              —
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* Average */}
                    <td className="p-3 text-center border-r border-slate-100 font-mono font-bold text-slate-900">
                      {teamSummary.completedEvaluations > 0 ? (
                        <span className="text-indigo-600 font-bold">
                          {Number(teamSummary.averageScore).toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal font-sans">—</span>
                      )}
                    </td>

                    {/* Rank */}
                    <td className="p-3 text-center font-bold font-mono">
                      {teamSummary.rank === 1 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs shadow-xs font-black">
                          1
                        </span>
                      ) : teamSummary.rank === 2 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                          2
                        </span>
                      ) : teamSummary.rank === 3 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                          3
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium">{teamSummary.rank || '-'}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
