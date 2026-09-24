import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import {
  Printer,
  ArrowLeft,
  FileSpreadsheet,
  Table,
} from 'lucide-react';
import { CRITERIA, TOTAL_MAX_MARKS } from '../../constants/criteria';

export default function JudgingSheetsPage() {
  const { user } = useAuth();
  const { activeEvent, criteria = CRITERIA, teams = [], judgeScoreMap = {} } = useEvent();

  const handlePrint = () => {
    window.print();
  };

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalMaxMarks = criteria && criteria.length > 0
    ? criteria.reduce((sum, c) => sum + (c.maxMarks || 0), 0)
    : TOTAL_MAX_MARKS;

  const currentCriteria = criteria && criteria.length >= 8 ? criteria : CRITERIA;
  const groupA = currentCriteria.slice(0, 4);
  const groupB = currentCriteria.slice(4, 8);

  return (
    <div className="font-sans min-h-screen bg-slate-100 py-6 px-4 text-slate-900">
      {/* ─────────────────────────────────────────────────────────────
          ON-SCREEN TOOLBAR (Hidden when printed via .no-print)
      ────────────────────────────────────────────────────────────── */}
      <div className="no-print max-w-4xl mx-auto mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-4 z-40">
        <div className="flex items-center space-x-3">
          <Link
            to="/judge/dashboard"
            className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              <h2 className="font-extrabold text-slate-900 text-base">
                Consolidated Judging Sheet (A4 Portrait)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              All {teams.length} teams formatted for clean A4 Portrait printing. Full criteria names with stacked 4-column sub-rows and zero clipping.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/judge/grid"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Table className="w-3.5 h-3.5" />
            <span>Open Grid View</span>
          </Link>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-2 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95"
            title="Click to print or save as A4 portrait PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export A4 Portrait PDF</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PRINT CONTAINER — CONSOLIDATED A4 PORTRAIT DOCUMENT
          Event Header appears ONCE at top of page 1.
          Each team occupies a non-splitting block with Sub-row A, Sub-row B, and Remarks.
      ────────────────────────────────────────────────────────────── */}
      <div className="print-container max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        {/* DOCUMENT HEADER BLOCK (Appears ONCE at top of document on page 1) */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="inline-block px-2.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[9px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Official Consolidated Judging Sheet • A4 Portrait
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight">
                {activeEvent?.name || 'Project Expo 2026'}
              </h1>
            </div>

            <div className="text-left sm:text-right text-xs space-y-0.5">
              <p>
                Judge: <strong className="text-slate-900">{user?.name || 'Official Evaluator'}</strong>
                {user?.email && <span className="text-slate-500"> ({user.email})</span>}
              </p>
              <p className="text-slate-500">Date: {currentDateStr}</p>
              <p className="text-slate-500 font-medium">Total Teams: {teams.length}</p>
            </div>
          </div>
        </div>

        {/* LIST OF TEAMS — EACH TEAM IN A SELF-CONTAINED NON-SPLITTING BLOCK */}
        <div className="space-y-3.5 print:space-y-3">
          {teams.map((team, idx) => {
            const scoreRecord = judgeScoreMap[team._id || team.id] || {};
            const marksList = scoreRecord.marks || [];
            const total = scoreRecord.totalScore !== undefined && scoreRecord.totalScore !== null
              ? Number(scoreRecord.totalScore)
              : null;

            const getMarkVal = (crit) => {
              if (Array.isArray(marksList)) {
                const found = marksList.find(
                  (m) => m.criterionName === crit.name || m.criterionId === crit.id
                );
                return found !== undefined && found.value !== undefined && found.value !== null && found.value !== ''
                  ? Number(found.value)
                  : null;
              } else if (typeof marksList === 'object' && marksList !== null) {
                const v = marksList[crit.id] ?? marksList[crit.name];
                return v !== undefined && v !== null && v !== '' ? Number(v) : null;
              }
              return null;
            };

            return (
              <div
                key={team._id || team.id || idx}
                className="team-scoring-block border border-slate-300 rounded-xl p-3.5 bg-white print:border-slate-500 print:p-2.5"
              >
                {/* Line 1: Team Name, Identifier, Project Title */}
                <div className="pb-2 border-b border-slate-200 print:border-slate-300">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded print:bg-slate-200 print:text-slate-900">
                        #{idx + 1}
                      </span>
                      <h3 className="font-extrabold text-slate-950 text-sm leading-tight break-words">
                        {team.teamName}
                      </h3>
                      {team.identifier && (
                        <span className="text-[11px] font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 print:border-slate-400 print:bg-slate-100 print:text-slate-900">
                          {typeof team.identifier === 'object'
                            ? `${team.identifier.type === 'table' ? 'Table' : 'Team'} #${team.identifier.value}`
                            : team.identifier}
                        </span>
                      )}
                    </div>
                  </div>
                  {team.projectTitle && (
                    <div className="text-xs text-slate-600 font-medium italic break-words leading-snug mt-1">
                      Project: <span className="text-slate-800 font-normal">{team.projectTitle}</span>
                    </div>
                  )}
                </div>

                {/* Sub-row A: 4 Criteria */}
                <div className="mt-2.5">
                  <table className="portrait-subtable w-full table-fixed border-collapse border border-slate-400 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 print:bg-slate-100">
                        <th style={{ width: '25%' }} className="p-1.5 text-center font-bold text-[10px] leading-tight border border-slate-400">
                          Innovation &amp; Originality (15)
                        </th>
                        <th style={{ width: '25%' }} className="p-1.5 text-center font-bold text-[10px] leading-tight border border-slate-400">
                          Problem Relevance &amp; Objective Clarity (10)
                        </th>
                        <th style={{ width: '25%' }} className="p-1.5 text-center font-bold text-[10px] leading-tight border border-slate-400">
                          Technical Knowledge &amp; Feasibility (20)
                        </th>
                        <th style={{ width: '25%' }} className="p-1.5 text-center font-bold text-[10px] leading-tight border border-slate-400">
                          Functionality &amp; Working Model / Prototype (20)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {groupA.map((crit) => {
                          const markVal = getMarkVal(crit);
                          return (
                            <td
                              key={crit.name || crit.id}
                              className="p-1.5 text-center font-mono font-bold text-xs border border-slate-400"
                            >
                              {markVal !== null ? (
                                <span className="text-slate-950 font-bold">{markVal.toFixed(2)}</span>
                              ) : (
                                <span className="text-slate-300 font-normal">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Sub-row B: 4 Criteria + TOTAL */}
                <div className="mt-1.5">
                  <table className="portrait-subtable w-full table-fixed border-collapse border border-slate-400 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 print:bg-slate-100">
                        <th style={{ width: '20%' }} className="p-1.5 text-center font-bold text-[10px] leading-tight border border-slate-400">
                          Design &amp; Implementation (10)
                        </th>
                        <th style={{ width: '21%' }} className="p-1.5 text-center font-bold text-[10px] leading-tight border border-slate-400">
                          Presentation &amp; Communication Skills (10)
                        </th>
                        <th style={{ width: '21%' }} className="p-1.5 text-center font-bold text-[10px] leading-tight border border-slate-400">
                          Q&amp;A Handling / Depth of Understanding (10)
                        </th>
                        <th style={{ width: '20%' }} className="p-1.5 text-center font-bold text-[10px] leading-tight border border-slate-400">
                          Cost Effectiveness &amp; Scalability (5)
                        </th>
                        <th style={{ width: '18%' }} className="p-1.5 text-center font-black text-[10.5px] leading-tight border border-slate-400 bg-indigo-50/80 print:bg-slate-200">
                          TOTAL ({totalMaxMarks})
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {groupB.map((crit) => {
                          const markVal = getMarkVal(crit);
                          return (
                            <td
                              key={crit.name || crit.id}
                              className="p-1.5 text-center font-mono font-bold text-xs border border-slate-400"
                            >
                              {markVal !== null ? (
                                <span className="text-slate-950 font-bold">{markVal.toFixed(2)}</span>
                              ) : (
                                <span className="text-slate-300 font-normal">—</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="p-1.5 text-center font-mono font-black text-xs border border-slate-400 bg-indigo-50/70 print:bg-slate-200">
                          {total !== null ? (
                            <span className="font-extrabold text-slate-950">{total.toFixed(2)}</span>
                          ) : (
                            <span className="text-slate-400 font-normal italic text-[10px]">Pending</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Remarks */}
                <div className="mt-2 pt-1.5 text-xs text-slate-700 border-t border-slate-200 print:border-slate-300 flex items-baseline gap-1.5">
                  <span className="font-bold text-slate-900 shrink-0 text-[11px]">Remarks:</span>
                  <span className="italic text-slate-800 break-words leading-relaxed text-[11px]">
                    {scoreRecord?.remarks && scoreRecord.remarks.trim() ? scoreRecord.remarks : '—'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* SINGLE SIGN-OFF BLOCK AT THE END OF THE DOCUMENT */}
        <div className="print-signature-block mt-8 pt-4 border-t-2 border-slate-800 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 text-xs">
          <div>
            <p className="font-bold text-slate-900 uppercase tracking-wide text-[10.5px]">Official Evaluator Certification:</p>
            <p className="text-slate-600 text-[10px] max-w-md mt-0.5 leading-relaxed">
              I hereby certify that the scores recorded above represent my complete, independent, and rigorous evaluation of all exhibited projects.
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="border-b border-slate-900 w-56 mb-1"></div>
            <p className="font-bold uppercase tracking-wider text-[10.5px] text-slate-900">
              Judge Signature &amp; Date
            </p>
            <p className="text-[9.5px] text-slate-600 font-mono">
              Evaluator: {user?.name || 'Official Judge'}
            </p>
          </div>
        </div>

        {/* RUNNING PAGE FOOTER */}
        <div className="print-page-footer print-only hidden items-center justify-between text-[7.5pt] text-slate-500 font-mono pt-1 border-t border-slate-300 mt-4">
          <span>{activeEvent?.name || 'Project Expo 2026'} — Official Consolidated Sheet</span>
          <span>Evaluator: {user?.name || 'Official Judge'} • {currentDateStr}</span>
        </div>
      </div>
    </div>
  );
}
