import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useEvent } from '../../context/EventContext.jsx';
import { createTeamApi } from '../../api/team.api.js';
import { upsertScoreApi } from '../../api/score.api.js';
import { findPotentialDuplicates } from '../../utils/similarity.js';
import { CRITERIA, TOTAL_MAX_MARKS } from '../../constants/criteria.js';
import {
  ArrowLeft,
  Users,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Hash,
  Sparkles,
  Loader2,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  Layers,
  Building,
  MessageSquare,
  Award,
  Sliders,
} from 'lucide-react';
import EventSettingsModal from '../../components/organizer/EventSettingsModal.jsx';

export default function AddTeamPage() {
  const { activeEvent, teams, refreshTeams, refreshScores } = useEvent();
  const navigate = useNavigate();

  // Active criteria from event or default 100-mark rubric
  const activeCriteria = activeEvent?.criteria?.length ? activeEvent.criteria : CRITERIA;
  const totalMaxMarks = activeCriteria.reduce((sum, c) => sum + (Number(c.maxMarks) || 0), 0);

  // Form states
  const [form, setForm] = useState({
    teamName: '',
    projectTitle: '',
    identifierType: 'table', // 'table' | 'teamNo' | ''
    identifierValue: '',
  });
  const [members, setMembers] = useState(['']);

  // Continuous evaluation section state
  // Toggle: Evaluate Now (true) vs Evaluate Later (false)
  const [evaluateNow, setEvaluateNow] = useState(true);
  const [marks, setMarks] = useState({});
  const [remarks, setRemarks] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [successTeam, setSuccessTeam] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Client-side live duplicate detection as user types
  const liveDuplicates = useMemo(() => {
    if (!form.teamName || form.teamName.trim().length < 3) return [];
    return findPotentialDuplicates(form.teamName, teams).slice(0, 3);
  }, [form.teamName, teams]);

  // Running total calculation
  const runningTotal = useMemo(() => {
    return Object.values(marks).reduce((sum, val) => {
      const num = parseFloat(val);
      return sum + (!isNaN(num) ? num : 0);
    }, 0);
  }, [marks]);

  const handleMemberChange = (index, value) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const handleAddMemberSlot = () => {
    setMembers([...members, '']);
  };

  const handleRemoveMemberSlot = (index) => {
    if (members.length === 1) {
      setMembers(['']);
      return;
    }
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleScoreChange = (criterionId, rawValue, maxMarks) => {
    if (rawValue === '') {
      const next = { ...marks };
      delete next[criterionId];
      setMarks(next);
      return;
    }
    const num = parseFloat(rawValue);
    if (isNaN(num)) return;
    const clamped = Math.max(0, Math.min(maxMarks, num));
    setMarks((prev) => ({
      ...prev,
      [criterionId]: Math.round(clamped * 100) / 100,
    }));
  };

  const handleQuickPreset = (criterionId, maxMarks, percentage) => {
    const val = Math.round(((maxMarks * percentage) / 100) * 10) / 10;
    setMarks((prev) => ({
      ...prev,
      [criterionId]: val,
    }));
  };

  const submitTeamAndEvaluation = async (confirmDuplicate = false, isCompletedScore = true) => {
    if (!form.teamName.trim()) {
      setError('Team name is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If evaluateNow is ON and submitting completed score, ensure all criteria are scored
    if (evaluateNow && isCompletedScore) {
      const missingCrit = activeCriteria.filter(
        (c) => marks[c.id] === undefined || marks[c.id] === '' || isNaN(marks[c.id])
      );
      if (missingCrit.length > 0) {
        setError(`Please assign scores for all criteria before submitting (Missing: ${missingCrit.map(c => c.name).join(', ')}). Or choose 'Save Draft' / toggle off evaluation.`);
        return;
      }
    }

    setError('');
    setLoading(true);

    try {
      const cleanedMembers = members.map((m) => m.trim()).filter(Boolean);
      const teamPayload = {
        eventId: activeEvent?._id,
        teamName: form.teamName.trim(),
        projectTitle: form.projectTitle.trim(),
        members: cleanedMembers,
        identifier: {
          type: form.identifierType || null,
          value: form.identifierValue.trim(),
        },
        confirmDuplicate,
      };

      // 1. Create team record
      const teamRes = await createTeamApi(teamPayload);
      const newTeam = teamRes.team;

      // 2. If evaluateNow is active, save evaluation score record
      let savedScore = null;
      if (evaluateNow) {
        const criteriaMap = new Map(activeCriteria.map((c) => [c.id, c.name]));
        const marksArray = Object.entries(marks)
          .filter(([_, val]) => val !== undefined && val !== '' && !isNaN(val))
          .map(([cId, val]) => ({
            criterionId: cId,
            criterionName: criteriaMap.get(cId) || cId,
            value: Number(val),
          }));

        savedScore = await upsertScoreApi(newTeam._id || newTeam.id, {
          marks: marksArray,
          remarks: remarks.trim(),
          isCompleted: isCompletedScore,
        });

        await refreshScores();
      }

      await refreshTeams();

      // Show success state
      setSuccessTeam({
        team: newTeam,
        evaluated: evaluateNow,
        isCompleted: isCompletedScore,
        totalScore: evaluateNow ? runningTotal : null,
      });

      // Clear duplicate warning
      setDuplicateWarning(null);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setDuplicateWarning(err.response.data.duplicates || []);
      } else {
        setError(err.response?.data?.message || 'Failed to save team details and evaluation.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetForNextTeam = () => {
    setForm({
      teamName: '',
      projectTitle: '',
      identifierType: 'table',
      identifierValue: '',
    });
    setMembers(['']);
    setMarks({});
    setRemarks('');
    setError('');
    setDuplicateWarning(null);
    setSuccessTeam(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 text-slate-800 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb & Event Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition min-w-[40px] min-h-[40px] flex items-center justify-center"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">
                Add &amp; Evaluate Team
              </h1>
              <p className="text-xs text-slate-500">
                Continuous single panel team registration and scoring
              </p>
            </div>
          </div>

          {activeEvent && (
            <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-xl border sm:border-0 border-slate-200 text-xs">
              <span className="font-bold text-slate-800">{activeEvent.name}</span>
              <p className="text-[11px] text-slate-500 font-mono">
                {activeEvent.collegeName ? `${activeEvent.collegeName} • ` : ''}Code: {activeEvent.joinCode}
              </p>
            </div>
          )}
        </div>

        {/* Success Modal / Banner */}
        {successTeam && (
          <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-200 text-center space-y-4 shadow-sm animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Team &ldquo;{successTeam.team.teamName}&rdquo; Added Successfully!
              </h2>
              {successTeam.evaluated ? (
                <p className="text-sm font-semibold text-emerald-800 mt-1">
                  Evaluated: {successTeam.totalScore} / {totalMaxMarks} points
                  {successTeam.isCompleted ? ' (Completed & Visible on Judgement Sheet)' : ' (Saved as Draft)'}
                </p>
              ) : (
                <p className="text-sm text-slate-600 mt-1">
                  Registered for later evaluation. (Unevaluated teams will not appear on the Judgement Sheet until scored).
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetForNextTeam}
                className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add &amp; Evaluate Next Team
              </button>

              <Link
                to="/sheets"
                className="py-3 px-5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center gap-2 shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                View Judgement Sheet
              </Link>

              <Link
                to="/"
                className="py-3 px-5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <p className="leading-relaxed font-medium">{error}</p>
          </div>
        )}

        {/* Server 409 Duplicate Warning Confirmation Modal */}
        {duplicateWarning && (
          <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <h3 className="font-extrabold text-sm">Similar Team Name Detected</h3>
            </div>
            <p className="text-xs text-amber-800">
              One or more teams with a very similar name already exist in this event:
            </p>
            <div className="space-y-1.5 pl-2 border-l-2 border-amber-300">
              {duplicateWarning.map((cand, i) => (
                <p key={i} className="text-xs font-semibold text-amber-950">
                  • {cand.teamName} {cand.identifier?.value ? `(${cand.identifier.type} #${cand.identifier.value})` : ''}
                </p>
              ))}
            </div>
            <p className="text-xs text-amber-700 italic">
              Exhibition rule: Similar team names trigger a warning, but you can proceed if this is an intentional separate booth.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => submitTeamAndEvaluation(true, true)}
                className="py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Add Anyway &amp; Save
              </button>
              <button
                type="button"
                onClick={() => setDuplicateWarning(null)}
                className="py-2.5 px-4 bg-white border border-amber-300 hover:bg-amber-100/60 text-amber-800 rounded-xl text-xs font-semibold transition"
              >
                Cancel / Edit Name
              </button>
            </div>
          </div>
        )}

        {!successTeam && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitTeamAndEvaluation(false, true);
            }}
            className="space-y-6"
          >
            {/* ─────────────────────────────────────────────────────────────
                SECTION 1: TEAM & PROJECT DETAILS
            ────────────────────────────────────────────────────────────── */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    1. Team &amp; Project Details
                  </h2>
                  <p className="text-xs text-slate-500">
                    Basic information about the exhibiting team
                  </p>
                </div>
              </div>

              {/* Team Name with Live Similarity Hint */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1" htmlFor="teamName">
                  Team Name *
                </label>
                <input
                  id="teamName"
                  type="text"
                  required
                  value={form.teamName}
                  onChange={(e) => setForm({ ...form, teamName: e.target.value })}
                  placeholder="e.g. EcoPulse IoT"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-base min-h-[48px]"
                />

                {/* Client Live Duplicate Hint */}
                {liveDuplicates.length > 0 && (
                  <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Notice:</span> A team with a similar name already exists ({liveDuplicates.map((d) => d.teamName).join(', ')}). You can still proceed if intended.
                    </div>
                  </div>
                )}
              </div>

              {/* Project Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1" htmlFor="projectTitle">
                  Project Title
                </label>
                <input
                  id="projectTitle"
                  type="text"
                  value={form.projectTitle}
                  onChange={(e) => setForm({ ...form, projectTitle: e.target.value })}
                  placeholder="e.g. Smart IoT Water Quality Monitoring &amp; Purification"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[44px]"
                />
              </div>

              {/* Booth / Table Identifier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1" htmlFor="idType">
                    Identifier Type
                  </label>
                  <select
                    id="idType"
                    value={form.identifierType}
                    onChange={(e) => setForm({ ...form, identifierType: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[44px]"
                  >
                    <option value="table">Table / Booth Number</option>
                    <option value="teamNo">Team Number</option>
                    <option value="">Other / None</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1" htmlFor="idValue">
                    Identifier Number / Code
                  </label>
                  <input
                    id="idValue"
                    type="text"
                    value={form.identifierValue}
                    onChange={(e) => setForm({ ...form, identifierValue: e.target.value })}
                    placeholder="e.g. 14 or B-07"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[44px]"
                  />
                </div>
              </div>

              {/* Member Names */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Team Members
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMemberSlot}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Member
                  </button>
                </div>
                <div className="space-y-2">
                  {members.map((member, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={member}
                        onChange={(e) => handleMemberChange(index, e.target.value)}
                        placeholder={`Member ${index + 1} name`}
                        className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[40px]"
                      />
                      {members.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMemberSlot(index)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          title="Remove member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                SECTION 2: CONTINUOUS EVALUATION SECTION WITH TOGGLE BUTTON
                Per prompt: "continuous single panel evaluation section add a
                toggle button if he want to evaluate now means he can continue
                else he will toggle with that. If any of the team detail is
                registered but not evaluated then it won't be displayed in the
                judgement sheet."
            ────────────────────────────────────────────────────────────── */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              {/* Section Header with Prominent Evaluation Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl border transition shadow-xs ${
                    evaluateNow
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      : 'bg-slate-100 border-slate-200 text-slate-500'
                  }`}>
                    {evaluateNow ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      2. Continuous Evaluation Panel
                    </h2>
                    <p className="text-xs text-slate-500">
                      {evaluateNow
                        ? 'Evaluate now directly in this panel, or toggle off to register team only.'
                        : 'Evaluation toggled off. Team will be saved for later scoring.'}
                    </p>
                  </div>
                </div>

                {/* THE TOGGLE BUTTON & CUSTOMIZE CRITERIA */}
                <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition shadow-2xs min-h-[40px]"
                    title="Change, add, or remove judging criteria and marks"
                  >
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Customize Criteria</span>
                  </button>

                  <div className="flex items-center gap-2.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-700 pl-1.5">
                      {evaluateNow ? 'Evaluate Now' : 'Evaluate Later'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEvaluateNow(!evaluateNow)}
                      className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                        evaluateNow ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                      role="switch"
                      aria-checked={evaluateNow}
                      title="Toggle to evaluate now or save team details only"
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          evaluateNow ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* WHEN EVALUATE NOW IS TOGGLED ON */}
              {evaluateNow ? (
                <div className="space-y-5 animate-fadeIn">
                  {/* Running Total Sticky/Top Pill */}
                  <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-600" />
                      <div>
                        <p className="text-xs font-bold text-indigo-950">
                          Live Total Score
                        </p>
                        <p className="text-[11px] text-indigo-700">
                          Server-authoritative calculation based on 100-mark rubric
                        </p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1.5 self-end sm:self-auto">
                      <span className="text-3xl font-black font-mono text-indigo-700">
                        {runningTotal}
                      </span>
                      <span className="text-xs font-bold text-indigo-500 font-mono">
                        / {totalMaxMarks} Max
                      </span>
                    </div>
                  </div>

                  {/* 8 Criteria Scoring Items */}
                  <div className="space-y-4">
                    {activeCriteria.map((criterion, idx) => {
                      const currentVal = marks[criterion.id] ?? '';
                      const max = Number(criterion.maxMarks) || 10;
                      return (
                        <div
                          key={criterion.id || idx}
                          className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition space-y-3"
                        >
                          {/* Criterion Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-black text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                  #{idx + 1}
                                </span>
                                <h3 className="text-sm font-bold text-slate-900">
                                  {criterion.name}
                                </h3>
                              </div>
                              {criterion.description && (
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                  {criterion.description}
                                </p>
                              )}
                            </div>

                            <span className="text-xs font-mono font-bold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-xl shrink-0">
                              Max {max} pts
                            </span>
                          </div>

                          {/* Controls: Slider + Number Input + Quick Presets */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                            {/* Slider */}
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="range"
                                min="0"
                                max={max}
                                step="0.5"
                                value={currentVal !== '' ? currentVal : 0}
                                onChange={(e) =>
                                  handleScoreChange(criterion.id, e.target.value, max)
                                }
                                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                              />
                            </div>

                            {/* Direct Number Input */}
                            <div className="flex items-center gap-2 shrink-0">
                              <input
                                type="number"
                                min="0"
                                max={max}
                                step="0.5"
                                value={currentVal}
                                onChange={(e) =>
                                  handleScoreChange(criterion.id, e.target.value, max)
                                }
                                placeholder="0"
                                className="w-20 px-2 py-2 bg-white border border-slate-300 rounded-xl text-center font-mono font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[40px]"
                              />
                              <span className="text-xs font-bold text-slate-400 font-mono">
                                / {max}
                              </span>
                            </div>

                            {/* Quick Presets */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleQuickPreset(criterion.id, max, 100)}
                                className="px-2 py-1 text-[10px] font-bold bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition"
                                title="Full Marks"
                              >
                                Max
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickPreset(criterion.id, max, 75)}
                                className="px-2 py-1 text-[10px] font-bold bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition"
                              >
                                75%
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickPreset(criterion.id, max, 50)}
                                className="px-2 py-1 text-[10px] font-bold bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition"
                              >
                                50%
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Remarks / Feedback */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1" htmlFor="remarks">
                      Judge Remarks &amp; Feedback (Optional)
                    </label>
                    <textarea
                      id="remarks"
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Feedback on innovation, prototype working status, pitch clarity, or suggested improvements..."
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    />
                  </div>

                  {/* Action Buttons for Evaluate Now */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 min-h-[48px] active:scale-98"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Submitting Team &amp; Evaluation...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Save Team &amp; Complete Evaluation ({runningTotal} pts)
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => submitTeamAndEvaluation(false, false)}
                      className="py-3.5 px-5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-2 min-h-[48px]"
                    >
                      Save Team with Draft Scores
                    </button>
                  </div>
                </div>
              ) : (
                /* WHEN EVALUATE NOW IS TOGGLED OFF */
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Register Team for Later Evaluation
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        The team will be added to your event queue. You can evaluate it anytime directly from the Dashboard.
                      </p>
                      <p className="text-xs font-semibold text-amber-700 mt-2 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                        Important: Per exhibition rules, any team detail that is registered but not evaluated will NOT be displayed in the judgement sheet until evaluated.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 min-h-[48px] active:scale-98"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Registering Team...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Register Team (Evaluate Later)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        )}

        {/* Criteria & Event Settings Modal for Judges */}
        <EventSettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
      </div>
    </div>
  );
}

