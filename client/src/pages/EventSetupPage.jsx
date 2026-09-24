import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvent } from '../context/EventContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Calendar,
  Building,
  KeyRound,
  PlusCircle,
  LogIn,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle,
  Award,
  Sparkles,
} from 'lucide-react';

export default function EventSetupPage() {
  const { createEvent, joinEvent, switchEvent, myEvents } = useEvent();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Default to 'create' so the judge can set event name, date, and college name immediately
  const [mode, setMode] = useState('create'); // 'create' | 'join'
  const [joinCode, setJoinCode] = useState('');
  const [createForm, setCreateForm] = useState({
    name: '',
    collegeName: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [createdEvent, setCreatedEvent] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await joinEvent(joinCode);
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Could not find an active event with this join code.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const event = await createEvent(createForm);
      setCreatedEvent(event);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create event. Please verify your inputs.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExisting = async (eventId) => {
    setError('');
    setLoading(true);
    try {
      await switchEvent(eventId);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to switch event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 text-slate-800">
      <div className="w-full max-w-xl bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl mb-1 shadow-xs">
            <Award className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Event Setup
          </h1>
          <p className="text-sm text-slate-500">
            Welcome, <span className="font-bold text-slate-800">{user?.name}</span>! Set your exhibition event details to begin judging.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Success Modal after Create */}
        {createdEvent ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{createdEvent.name}</h3>
              {createdEvent.collegeName && (
                <p className="text-sm text-slate-600 mt-0.5">{createdEvent.collegeName}</p>
              )}
              <p className="text-xs text-emerald-700 font-semibold mt-1">Event created & ready for evaluation!</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-emerald-200 inline-block shadow-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Shareable Join Code
              </p>
              <p className="text-3xl font-mono font-black tracking-widest text-indigo-600">
                {createdEvent.joinCode}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Other judges can enter this code to score the same event independently.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => navigate('/add-team', { replace: true })}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
              >
                Add &amp; Evaluate Teams Now
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/', { replace: true })}
                className="py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold transition"
              >
                Dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mode Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setMode('create')}
                className={`py-2.5 px-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 min-h-[44px] ${
                  mode === 'create'
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Set Event Details
              </button>
              <button
                type="button"
                onClick={() => setMode('join')}
                className={`py-2.5 px-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 min-h-[44px] ${
                  mode === 'join'
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-4 h-4" />
                Join with Code
              </button>
            </div>

            {/* Create Mode (Primary: Event Name, College Name, Event Date) */}
            {mode === 'create' && (
              <form onSubmit={handleCreate} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="eventName">
                    Event Name *
                  </label>
                  <input
                    id="eventName"
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="e.g. National Project Expo 2026"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[44px] text-base"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="collegeName">
                      College / Institution
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="collegeName"
                        type="text"
                        value={createForm.collegeName}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, collegeName: e.target.value })
                        }
                        placeholder="e.g. MIT College of Engineering"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="eventDate">
                      Event Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="eventDate"
                        type="date"
                        value={createForm.date}
                        onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-start gap-2 text-xs text-indigo-900">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    A fixed standard 100-mark evaluation rubric will be pre-configured. You will be able to add teams and evaluate them immediately in a continuous panel.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading || !createForm.name.trim()}
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px] text-base shadow-md shadow-indigo-600/20 active:scale-98"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving Event...
                    </>
                  ) : (
                    <>
                      Save Event &amp; Start Evaluation
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Join Mode */}
            {mode === 'join' && (
              <form onSubmit={handleJoin} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="joinCode">
                    6-Character Join Code
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="joinCode"
                      type="text"
                      required
                      maxLength={6}
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="e.g. EXPO26"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 font-mono uppercase tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-center sm:text-left min-h-[48px]"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">
                    Enter the code provided by your exhibition coordinator.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || joinCode.trim().length !== 6}
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px] text-base shadow-md shadow-indigo-600/20 active:scale-98"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Joining Event...
                    </>
                  ) : (
                    <>
                      Join Event
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* List of previously joined events if any */}
            {myEvents && myEvents.length > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Previously Joined Events:
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {myEvents.map((evt) => (
                    <button
                      key={evt._id}
                      type="button"
                      onClick={() => handleSelectExisting(evt._id)}
                      className="w-full p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 text-left transition flex items-center justify-between group min-h-[48px]"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-700">
                          {evt.name}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">
                          Code: {evt.joinCode} {evt.collegeName ? `• ${evt.collegeName}` : ''}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
