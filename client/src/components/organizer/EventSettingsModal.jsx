import React, { useState, useEffect } from 'react';
import { useEvent } from '../../context/EventContext.jsx';
import { CRITERIA } from '../../constants/criteria.js';
import {
  X,
  Settings,
  Calendar,
  Building,
  KeyRound,
  Copy,
  Check,
  Save,
  AlertCircle,
  Loader2,
  Sliders,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export default function EventSettingsModal({ isOpen, onClose }) {
  const { activeEvent, updateActiveEvent } = useEvent();

  const [form, setForm] = useState({
    name: '',
    collegeName: '',
    date: '',
  });

  const [criteria, setCriteria] = useState([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeEvent) {
      setForm({
        name: activeEvent.name || '',
        collegeName: activeEvent.collegeName || '',
        date: activeEvent.date ? new Date(activeEvent.date).toISOString().split('T')[0] : '',
      });
      // Load event criteria or fallback to default 8 criteria
      const loadedCriteria =
        activeEvent.criteria && activeEvent.criteria.length > 0
          ? activeEvent.criteria
          : CRITERIA;
      setCriteria(JSON.parse(JSON.stringify(loadedCriteria)));
    }
  }, [activeEvent]);

  if (!isOpen) return null;

  const totalMaxMarks = criteria.reduce((sum, c) => sum + (Number(c.maxMarks) || 0), 0);

  const handleCopyCode = () => {
    if (!activeEvent?.joinCode) return;
    navigator.clipboard.writeText(activeEvent.joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCriterionChange = (index, field, value) => {
    const updated = [...criteria];
    updated[index][field] = field === 'maxMarks' ? Number(value) || 0 : value;
    setCriteria(updated);
  };

  const handleAddCriterion = () => {
    setError('');
    const newId = `crit_${Date.now()}`;
    setCriteria([
      ...criteria,
      {
        id: newId,
        name: '',
        maxMarks: 10,
        description: '',
        order: criteria.length + 1,
      },
    ]);
  };

  const handleRemoveCriterion = (index) => {
    setError('');
    if (criteria.length <= 1) {
      setError('At least one judging criterion is required.');
      return;
    }
    const updated = criteria.filter((_, i) => i !== index);
    setCriteria(updated);
  };

  const handleResetToDefaultCriteria = () => {
    setError('');
    setCriteria(JSON.parse(JSON.stringify(CRITERIA)));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Event name is required.');
      return;
    }

    // Validate criteria
    if (criteria.length === 0) {
      setError('Please add at least one judging criterion.');
      return;
    }

    const emptyName = criteria.find((c) => !c.name || !c.name.trim());
    if (emptyName) {
      setError('All criteria must have a title/name.');
      return;
    }

    const invalidMarks = criteria.find((c) => Number(c.maxMarks) <= 0);
    if (invalidMarks) {
      setError('Each criterion must have max marks greater than 0.');
      return;
    }

    if (totalMaxMarks <= 0) {
      setError('Sum of criteria max marks must be greater than zero.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await updateActiveEvent({
        name: form.name.trim(),
        collegeName: form.collegeName.trim(),
        date: form.date,
        criteria: criteria.map((c, idx) => ({
          ...c,
          id: c.id || `crit_${idx + 1}`,
          order: idx + 1,
        })),
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update event settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn font-sans text-slate-800">
      {/* Mobile: Fullscreen sheet; Desktop: Centered dialog */}
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Event &amp; Criteria Settings</h2>
              <p className="text-xs text-slate-500">Customize event info, judging criteria &amp; marks allotted</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <p className="font-semibold">{error}</p>
            </div>
          )}

          {/* Join Code Display */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Event Join Code
                </p>
                <p className="font-mono text-xl font-black text-indigo-700 tracking-widest">
                  {activeEvent?.joinCode || '------'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="py-2 px-3 bg-white hover:bg-slate-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700 transition flex items-center gap-1.5 shadow-xs min-h-[40px]"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copiedCode ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          {/* Event Details */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Event Information
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="settingsName">
                Event Name *
              </label>
              <input
                id="settingsName"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. National Project Expo 2026"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="settingsCollege">
                  Institution / College
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="settingsCollege"
                    type="text"
                    value={form.collegeName}
                    onChange={(e) => setForm({ ...form, collegeName: e.target.value })}
                    placeholder="e.g. Engineering College"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="settingsDate">
                  Event Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="settingsDate"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[44px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              2. CRITERIA & RUBRIC EDITOR (Add / Remove / Modify / Reset)
          ────────────────────────────────────────────────────────────── */}
          <div className="space-y-3.5 pt-3 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  2. Judging Criteria &amp; Marks Allotted
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Change, add or remove criteria. Total marks automatically sum up.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-mono font-black bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-xl">
                  Total: {totalMaxMarks} Marks
                </span>

                <button
                  type="button"
                  onClick={handleResetToDefaultCriteria}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-indigo-600 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                  title="Reset to default 8 criteria (100 Marks)"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  Reset to Default
                </button>
              </div>
            </div>

            {/* Criteria List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {criteria.map((crit, idx) => (
                <div
                  key={crit.id || idx}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-300 transition flex items-center gap-2.5 text-xs shadow-2xs"
                >
                  <span className="font-mono text-slate-500 font-black w-6 text-center shrink-0">
                    #{idx + 1}
                  </span>

                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      required
                      value={crit.name}
                      onChange={(e) => handleCriterionChange(idx, 'name', e.target.value)}
                      placeholder="e.g. Innovation & Originality"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[38px]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Marks:</span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={crit.maxMarks}
                      onChange={(e) => handleCriterionChange(idx, 'maxMarks', e.target.value)}
                      className="w-16 bg-white border border-slate-300 rounded-xl px-2 py-2 text-xs text-center font-mono font-black text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[38px]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveCriterion(idx)}
                    disabled={criteria.length <= 1}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 min-w-[36px] min-h-[36px] flex items-center justify-center shrink-0"
                    title="Remove criterion"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Criterion Button */}
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={handleAddCriterion}
                className="py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Add New Criterion
              </button>

              <span className="text-xs text-slate-500">
                {criteria.length} {criteria.length === 1 ? 'criterion' : 'criteria'} configured
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 text-xs min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 min-h-[44px] shadow-md shadow-indigo-600/20 active:scale-98"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : savedSuccess ? (
                <Check className="w-4 h-4 text-emerald-300" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {savedSuccess ? 'Settings Saved!' : 'Save Criteria & Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
