import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Save,
  ChevronLeft,
  Lightbulb,
  Target,
  Cpu,
  LayoutTemplate,
  Mic,
  HelpCircle,
  TrendingUp,
  Sparkles,
  Info
} from 'lucide-react';
import { CRITERIA, TOTAL_MAX_MARKS } from '../constants/criteria';
import { formatDecimal, roundScore, calculateTotalScore } from '../utils/storage';

const CRITERION_ICONS = {
  Lightbulb,
  Target,
  Cpu,
  CheckCircle2,
  LayoutTemplate,
  Mic,
  HelpCircle,
  TrendingUp,
};

export default function ScoringView({
  team,
  teamIndex,
  totalTeams,
  existingScoreRecord,
  judge,
  onSaveScore,
  onNavigateTeam,
  onBackToDashboard,
  onOpenPrintSheet,
}) {
  // Local state for criterion marks
  const [marks, setMarks] = useState({});
  const [remarks, setRemarks] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Sync state when team or existingScoreRecord changes
  useEffect(() => {
    if (existingScoreRecord) {
      setMarks(existingScoreRecord.marks ? { ...existingScoreRecord.marks } : {});
      setRemarks(existingScoreRecord.remarks || '');
    } else {
      setMarks({});
      setRemarks('');
    }
    setValidationErrors({});
    setShowErrorBanner(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [team.id, existingScoreRecord]);

  // Live running total calculation
  const runningTotal = calculateTotalScore(marks);

  // Count how many criteria have valid numbers filled
  const filledCriteriaCount = CRITERIA.filter(
    (c) => marks[c.id] !== undefined && marks[c.id] !== '' && !isNaN(marks[c.id])
  ).length;

  const isAllCriteriaFilled = filledCriteriaCount === CRITERIA.length;

  // Handle direct score change
  const handleScoreChange = (criterionId, rawValue, maxMarks) => {
    if (rawValue === '') {
      const next = { ...marks };
      delete next[criterionId];
      setMarks(next);
      return;
    }

    const num = parseFloat(rawValue);
    if (isNaN(num)) return;

    // Constrain to 0 - maxMarks (clamp)
    const clamped = Math.max(0, Math.min(maxMarks, num));
    // Clean to max 2 decimals
    const rounded = roundScore(clamped);

    setMarks((prev) => ({
      ...prev,
      [criterionId]: rounded,
    }));

    // Clear error for this criterion
    if (validationErrors[criterionId]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[criterionId];
        return next;
      });
    }
  };

  // Stepper helper (+0.5, +1, -0.5, -1)
  const handleStep = (criterionId, delta, maxMarks) => {
    const current = marks[criterionId] !== undefined ? Number(marks[criterionId]) : 0;
    const nextVal = Math.max(0, Math.min(maxMarks, roundScore(current + delta)));
    setMarks((prev) => ({
      ...prev,
      [criterionId]: nextVal,
    }));

    if (validationErrors[criterionId]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[criterionId];
        return next;
      });
    }
  };

  // Quick Preset setter (e.g. 25%, 50%, 75%, 100%)
  const handleSetPresetPercentage = (criterionId, pct, maxMarks) => {
    const val = roundScore((pct / 100) * maxMarks);
    setMarks((prev) => ({
      ...prev,
      [criterionId]: val,
    }));

    if (validationErrors[criterionId]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[criterionId];
        return next;
      });
    }
  };

  // Validate all criteria
  const validateForm = () => {
    const errors = {};
    for (const c of CRITERIA) {
      const val = marks[c.id];
      if (val === undefined || val === '' || isNaN(val)) {
        errors[c.id] = `Marks required for ${c.name}`;
      } else if (val < 0 || val > c.maxMarks) {
        errors[c.id] = `Score must be between 0 and ${c.maxMarks}`;
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save as Complete and go to Next
  const handleSaveAndNext = () => {
    const isValid = validateForm();
    if (!isValid) {
      setShowErrorBanner(true);
      return;
    }

    onSaveScore(team.id, marks, remarks, true);
    setSavedFeedback(true);

    if (teamIndex < totalTeams - 1) {
      onNavigateTeam(teamIndex + 1);
    } else {
      // Completed last team!
      onBackToDashboard();
    }
  };

  // Save draft without enforcing all criteria
  const handleSaveDraft = () => {
    const isValid = isAllCriteriaFilled && Object.keys(validationErrors).length === 0;
    onSaveScore(team.id, marks, remarks, isValid);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28">
      {/* Top Breadcrumb & Progress Bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span>Back to All Teams</span>
        </button>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-700">
              Team {teamIndex + 1} of {totalTeams}
            </span>
            <div className="w-36 h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${((teamIndex + 1) / totalTeams) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Team Info Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md border border-slate-200">
                Booth #{teamIndex + 1}
              </span>

              {/* CRITICAL REQUIREMENT: Show whichever identifier was provided (team no. or table no.); 
                  hide the field entirely if blank, don't show "N/A" */}
              {team.identifier && team.identifier.trim() !== '' && (
                <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-0.5 rounded-md">
                  {team.identifier}
                </span>
              )}

              {existingScoreRecord?.isCompleted ? (
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-md flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Scored
                </span>
              ) : (
                <span className="text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-md">
                  Under Evaluation
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {team.teamName}
            </h1>

            <p className="text-sm sm:text-base font-medium text-slate-700 leading-snug">
              {team.projectTitle}
            </p>

            {team.members && (
              <p className="text-xs text-slate-500 pt-1">
                <span className="font-semibold text-slate-600">Team Members:</span> {team.members}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner if missing scores upon save */}
      {showErrorBanner && !isAllCriteriaFilled && (
        <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-xl flex items-start space-x-3 text-rose-800 animate-shake">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-sm">Incomplete Evaluation</p>
            <p className="mt-0.5">
              Please enter valid scores for all 8 criteria before marking this team as complete.
              Missing {CRITERIA.length - filledCriteriaCount} of {CRITERIA.length} criteria.
            </p>
          </div>
        </div>
      )}

      {/* Criteria Scoring Cards */}
      <div className="space-y-4">
        {CRITERIA.map((criterion, idx) => {
          const IconComponent = CRITERION_ICONS[criterion.iconName] || Lightbulb;
          const currentVal = marks[criterion.id];
          const hasError = !!validationErrors[criterion.id];
          const isFilled = currentVal !== undefined && currentVal !== '' && !isNaN(currentVal);

          return (
            <div
              key={criterion.id}
              className={`bg-white rounded-2xl p-5 border transition-all ${
                hasError
                  ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400'
                  : isFilled
                  ? 'border-slate-300 shadow-sm'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Criterion Info */}
                <div className="flex items-start space-x-3.5 flex-1">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      isFilled
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-indigo-600">
                        0{idx + 1}.
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        {criterion.name}
                      </h3>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Max {criterion.maxMarks} pts
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {criterion.description}
                    </p>
                  </div>
                </div>

                {/* Score Input Box with Steppers & Quick Chips */}
                <div className="flex flex-col items-end shrink-0 sm:w-64">
                  {/* Numeric Input & Steppers Row */}
                  <div className="flex items-center space-x-1.5 w-full justify-end">
                    <button
                      type="button"
                      onClick={() => handleStep(criterion.id, -1, criterion.maxMarks)}
                      className="w-8 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition active:scale-95"
                      title="Decrease by 1"
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep(criterion.id, -0.5, criterion.maxMarks)}
                      className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition active:scale-95"
                      title="Decrease by 0.5"
                    >
                      -0.5
                    </button>

                    {/* Number input accepting decimals (step 0.25) */}
                    <div className="relative">
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        max={criterion.maxMarks}
                        value={currentVal !== undefined ? currentVal : ''}
                        onChange={(e) =>
                          handleScoreChange(criterion.id, e.target.value, criterion.maxMarks)
                        }
                        placeholder="0.0"
                        className={`w-20 h-10 text-center font-bold text-base rounded-xl border transition focus:outline-none focus:ring-2 ${
                          hasError
                            ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-rose-500'
                            : isFilled
                            ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 focus:ring-indigo-500'
                            : 'border-slate-300 bg-white text-slate-900 focus:ring-indigo-500'
                        }`}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStep(criterion.id, 0.5, criterion.maxMarks)}
                      className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition active:scale-95"
                      title="Increase by 0.5"
                    >
                      +0.5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep(criterion.id, 1, criterion.maxMarks)}
                      className="w-8 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition active:scale-95"
                      title="Increase by 1"
                    >
                      +1
                    </button>
                  </div>

                  {/* Range Slider for tactile tablet input */}
                  <div className="w-full mt-2.5 px-1">
                    <input
                      type="range"
                      min="0"
                      max={criterion.maxMarks}
                      step="0.25"
                      value={currentVal !== undefined ? currentVal : 0}
                      onChange={(e) =>
                        handleScoreChange(criterion.id, e.target.value, criterion.maxMarks)
                      }
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Quick percentage shortcuts */}
                  <div className="flex items-center space-x-1 mt-2 text-[10px] text-slate-500">
                    <span className="text-[9px] uppercase font-semibold text-slate-400 mr-1">Quick:</span>
                    <button
                      type="button"
                      onClick={() => handleSetPresetPercentage(criterion.id, 25, criterion.maxMarks)}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition"
                    >
                      25%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPresetPercentage(criterion.id, 50, criterion.maxMarks)}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPresetPercentage(criterion.id, 75, criterion.maxMarks)}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition"
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPresetPercentage(criterion.id, 100, criterion.maxMarks)}
                      className="px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded transition"
                    >
                      Max
                    </button>
                  </div>

                  {/* Form error text if any */}
                  {hasError && (
                    <span className="text-[11px] font-semibold text-rose-600 mt-1 text-right">
                      {validationErrors[criterion.id]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Optional Remarks Section */}
      <div className="mt-6 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
        <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center">
          <FileText className="w-4 h-4 mr-2 text-indigo-600" />
          Judge Remarks & Qualitative Feedback{' '}
          <span className="text-xs text-slate-400 font-normal lowercase ml-1.5">(optional)</span>
        </label>
        <textarea
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Constructive feedback, technical strengths, scalability notes, prototype observations..."
          className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition leading-relaxed"
        />
      </div>

      {/* Floating Bottom Action Bar with Live Subtotal & Running Total */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3.5 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Running Total & Status */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="bg-slate-900 text-white px-3.5 py-1.5 rounded-xl flex items-baseline space-x-1.5 shadow-sm">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight font-mono">
                {formatDecimal(runningTotal)}
              </span>
              <span className="text-xs text-slate-400 font-semibold">/ {TOTAL_MAX_MARKS}</span>
            </div>

            <div className="hidden sm:block text-xs text-slate-500">
              <p className="font-semibold text-slate-700">
                {filledCriteriaCount} of {CRITERIA.length} Scored
              </p>
              <p className="text-[11px] text-slate-400">
                {isAllCriteriaFilled ? '✓ All criteria filled' : 'Pending some criteria'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Previous Team */}
            {teamIndex > 0 && (
              <button
                type="button"
                onClick={() => {
                  handleSaveDraft();
                  onNavigateTeam(teamIndex - 1);
                }}
                className="hidden sm:inline-flex items-center space-x-1 px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
            )}

            {/* Save Draft */}
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center space-x-1 px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              title="Save current marks as draft without leaving"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">{savedFeedback ? 'Saved!' : 'Save Draft'}</span>
            </button>

            {/* Save & Next Team */}
            <button
              type="button"
              onClick={handleSaveAndNext}
              className="inline-flex items-center space-x-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition active:scale-95"
            >
              <span>
                {teamIndex < totalTeams - 1 ? 'Save & Next Team' : 'Save & Finish All'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
