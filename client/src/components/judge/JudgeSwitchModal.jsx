import React, { useState } from 'react';
import { User, Shield, Check, Plus, ArrowRight, X, UserCheck } from 'lucide-react';

export default function JudgeSwitchModal({
  isOpen,
  onClose,
  allJudges,
  currentJudge,
  onSelectJudge,
  onCreateJudge,
  isMandatory = false,
}) {
  const [isCreatingNew, setIsCreatingNew] = useState(allJudges.length === 0);
  const [judgeName, setJudgeName] = useState('');
  const [panelNumber, setPanelNumber] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmitNew = (e) => {
    e.preventDefault();
    if (!judgeName.trim()) {
      setError('Please enter your name.');
      return;
    }

    const newJudge = onCreateJudge({
      name: judgeName.trim(),
      panelNumber: panelNumber.trim(),
    });

    setJudgeName('');
    setPanelNumber('');
    setError('');
    setIsCreatingNew(false);
    onSelectJudge(newJudge.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white relative">
          {!isMandatory && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center mb-3">
            <UserCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Judge Profile & Access</h2>
          <p className="text-xs text-slate-300 mt-1">
            Scores are linked individually to your judge profile so multiple evaluators can work on this event.
          </p>
        </div>

        <div className="p-6">
          {/* Switcher Tabs if existing judges exist */}
          {allJudges.length > 0 && (
            <div className="flex rounded-lg bg-slate-100 p-1 mb-5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(false);
                  setError('');
                }}
                className={`flex-1 py-2 text-center rounded-md transition ${
                  !isCreatingNew
                    ? 'bg-white text-indigo-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Existing Judges ({allJudges.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(true);
                  setError('');
                }}
                className={`flex-1 py-2 text-center rounded-md transition ${
                  isCreatingNew
                    ? 'bg-white text-indigo-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                + Register New Judge
              </button>
            </div>
          )}

          {!isCreatingNew && allJudges.length > 0 ? (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Select your name to continue:
              </p>
              {allJudges.map((judge) => {
                const isSelected = currentJudge?.id === judge.id;
                return (
                  <button
                    key={judge.id}
                    onClick={() => {
                      onSelectJudge(judge.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-1 ring-indigo-600'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {judge.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{judge.name}</p>
                        <p className="text-xs text-slate-500">
                          {judge.panelNumber ? `Panel: ${judge.panelNumber}` : 'General Evaluator'}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="flex items-center text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                        <Check className="w-3.5 h-3.5 mr-1" /> Active
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="w-full mt-3 py-2.5 px-4 border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:border-indigo-400 flex items-center justify-center space-x-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Judge Profile</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitNew} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Judge Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={judgeName}
                    onChange={(e) => setJudgeName(e.target.value)}
                    placeholder="e.g. Prof. Alan Turing / Dr. Evelyn Mercer"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Panel Number / ID <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={panelNumber}
                    onChange={(e) => setPanelNumber(e.target.value)}
                    placeholder="e.g. Panel 3, Stall Track A, J-12"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Printed on the evaluation sheets alongside your name.
                </p>
              </div>

              {error && (
                <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium">
                  {error}
                </div>
              )}

              <div className="pt-2 flex items-center space-x-2">
                {allJudges.length > 0 && !isMandatory && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow transition"
                >
                  <span>Start Judging as this Evaluator</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
