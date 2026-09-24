import React, { useState, useEffect } from 'react';
import { getJudgesApi, removeJudgeFromEventApi } from '../../api/judge.api.js';
import { useEvent } from '../../context/EventContext.jsx';
import {
  Users,
  UserX,
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminJudgesPage() {
  const { activeEvent } = useEvent();
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [confirmRemoveJudge, setConfirmRemoveJudge] = useState(null);
  const [removing, setRemoving] = useState(false);

  const fetchJudges = async () => {
    if (!activeEvent?._id) return;
    try {
      setLoading(true);
      setError('');
      const data = await getJudgesApi(activeEvent._id);
      setJudges(data.judges || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load judges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJudges();
  }, [activeEvent?._id]);

  const handleCopyJoinCode = () => {
    if (!activeEvent?.joinCode) return;
    navigator.clipboard.writeText(activeEvent.joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRemoveJudge = async () => {
    if (!confirmRemoveJudge || !activeEvent?._id) return;
    setRemoving(true);
    try {
      await removeJudgeFromEventApi(confirmRemoveJudge.id, activeEvent._id);
      setConfirmRemoveJudge(null);
      await fetchJudges();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove judge.');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans text-slate-800">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Organizer Leaderboard
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Event Judges &amp; Evaluators
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage authorized judges, track evaluation completion, and distribute the join code.
          </p>
        </div>

        {/* Join Code Card with 1-click copy */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center gap-3 shadow-xs shrink-0">
          <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Join Code
            </p>
            <p className="font-mono font-black text-base text-slate-900 tracking-widest">
              {activeEvent?.joinCode || '------'}
            </p>
          </div>
          <button
            onClick={handleCopyJoinCode}
            className="p-2 hover:bg-slate-200 rounded-xl transition text-slate-600 ml-1"
            title="Copy join code"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Loading judges list...</p>
        </div>
      ) : judges.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">No judges have joined yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Share the 6-character code <span className="font-mono font-bold text-indigo-600">{activeEvent?.joinCode}</span> with your evaluating panel to have them appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Stacked Cards (below md) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {judges.map((judge) => (
              <div
                key={judge.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {judge.name}
                    </h3>
                    <p className="text-xs text-slate-400">{judge.email}</p>
                    {judge.panelLabel && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {judge.panelLabel}
                      </span>
                    )}
                  </div>
                  {judge.isOrganizer && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      Organizer
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs pt-2 border-t border-slate-100 text-slate-600">
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {judge.completedCount} Completed
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    {judge.draftCount} Drafts
                  </span>
                </div>

                {!judge.isOrganizer && (
                  <button
                    type="button"
                    onClick={() => setConfirmRemoveJudge(judge)}
                    className="w-full py-2.5 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition flex items-center justify-center gap-1.5 min-h-[44px]"
                  >
                    <UserX className="w-4 h-4" />
                    Remove from Event
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table (md+) */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-bold text-slate-800">Judge Name</th>
                  <th className="p-4 font-bold text-slate-800">Email</th>
                  <th className="p-4 font-bold text-slate-800">Panel / Assignment</th>
                  <th className="p-4 font-bold text-slate-800 text-center">Evaluations</th>
                  <th className="p-4 font-bold text-slate-800 text-center">Role</th>
                  <th className="p-4 font-bold text-slate-800 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {judges.map((judge) => (
                  <tr key={judge.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-bold text-slate-900">{judge.name}</td>
                    <td className="p-4 text-slate-500 font-mono text-[11px]">{judge.email}</td>
                    <td className="p-4">
                      {judge.panelLabel ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {judge.panelLabel}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-3">
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {judge.completedCount}
                        </span>
                        <span className="text-amber-500 font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {judge.draftCount}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {judge.isOrganizer ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                          Organizer
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                          Judge
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {!judge.isOrganizer ? (
                        <button
                          type="button"
                          onClick={() => setConfirmRemoveJudge(judge)}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
                        >
                          Remove
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Confirmation Dialog */}
      {confirmRemoveJudge && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Remove Judge from Event?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to remove <span className="font-bold text-slate-800">{confirmRemoveJudge.name}</span> from this event? They will lose access to scoring teams in this expo.
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setConfirmRemoveJudge(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 text-xs min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={removing}
                onClick={handleRemoveJudge}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition flex items-center gap-1.5 min-h-[44px]"
              >
                {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
