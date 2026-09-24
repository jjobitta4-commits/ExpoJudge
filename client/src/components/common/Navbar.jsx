import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useEvent } from '../../context/EventContext.jsx';
import JudgeSwitchModal from '../judge/JudgeSwitchModal.jsx';
import EventSettingsModal from '../organizer/EventSettingsModal.jsx';
import {
  Award,
  LayoutDashboard,
  PlusCircle,
  Settings,
  Printer,
  ChevronDown,
  UserCheck,
  Grid,
  Menu,
  X,
  LogOut,
  Calendar,
  Building,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { activeEvent, myEvents, switchEvent } = useEvent();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [eventPickerOpen, setEventPickerOpen] = useState(false);
  const [judgeSwitchOpen, setJudgeSwitchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleSwitchEvent = async (eventId) => {
    setEventPickerOpen(false);
    setMobileMenuOpen(false);
    await switchEvent(eventId);
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="no-print bg-white text-slate-800 shadow-xs sticky top-0 z-40 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand & Event Info */}
            <div className="flex items-center space-x-3 min-w-0">
              <Link to="/" className="flex items-center space-x-2 shrink-0">
                <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2 rounded-xl shadow-xs">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-indigo-800 bg-clip-text text-transparent hidden sm:inline">
                  ExpoJudge
                </span>
              </Link>

              {/* Active Event Indicator / Dropdown Trigger */}
              {activeEvent && (
                <div className="relative">
                  <button
                    onClick={() => setEventPickerOpen(!eventPickerOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition min-h-[40px] max-w-[170px] sm:max-w-xs"
                    title="Switch active event or view details"
                  >
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {activeEvent.name}
                      </p>
                      <p className="text-[10px] text-indigo-600 font-mono font-medium truncate">
                        {activeEvent.collegeName ? `${activeEvent.collegeName} • ` : ''}Code: {activeEvent.joinCode}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-0.5" />
                  </button>

                  {/* Event Switcher Dropdown */}
                  {eventPickerOpen && (
                    <div className="absolute left-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-fadeIn">
                      <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                        <p className="text-[11px] uppercase font-bold text-slate-400">
                          Active Events
                        </p>
                        <button
                          onClick={() => {
                            setEventPickerOpen(false);
                            setSettingsOpen(true);
                          }}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                          <Settings className="w-3 h-3" />
                          Edit Event Details
                        </button>
                      </div>

                      <div className="space-y-1 max-h-52 overflow-y-auto pt-1">
                        {myEvents.map((evt) => (
                          <button
                            key={evt._id}
                            onClick={() => handleSwitchEvent(evt._id)}
                            className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center justify-between ${
                              evt._id === activeEvent._id
                                ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span className="truncate">{evt.name}</span>
                            <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">{evt.joinCode}</span>
                          </button>
                        ))}
                      </div>
                      <div className="pt-2 mt-1 border-t border-slate-100">
                        <Link
                          to="/event-setup"
                          onClick={() => setEventPickerOpen(false)}
                          className="w-full py-2 px-3 text-xs font-bold text-indigo-600 hover:text-indigo-700 rounded-lg hover:bg-indigo-50/60 flex items-center gap-1.5"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Set or Join Another Event
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Navigation Links (lg+) - Judge Centric & Friendly */}
            <nav className="hidden lg:flex items-center space-x-1 bg-slate-50 p-1 rounded-2xl border border-slate-200">
              <Link
                to="/"
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  isActive('/')
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/add-team"
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  isActive('/add-team')
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add &amp; Evaluate Team</span>
              </Link>

              <Link
                to="/sheets"
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  isActive('/sheets')
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Judgement Sheet</span>
              </Link>

              <Link
                to="/grid"
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  isActive('/grid')
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grid View</span>
              </Link>
            </nav>

            {/* Right: Judge Info, Edit Event & Sign Out */}
            <div className="hidden lg:flex items-center space-x-2">
              <button
                onClick={() => setSettingsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition"
                title="Edit Event Name, Date, or College Name"
              >
                <Settings className="w-3.5 h-3.5 text-indigo-600" />
                <span>Event Details</span>
              </button>

              <button
                onClick={() => setJudgeSwitchOpen(true)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium transition text-left"
                title="Switch judge on shared device"
              >
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <div className="truncate max-w-[120px]">
                  <p className="font-bold text-slate-800 truncate">{user?.name || 'Judge'}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.panelLabel || 'Judge'}</p>
                </div>
              </button>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Actions (< lg) */}
            <div className="flex items-center lg:hidden gap-1.5">
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 rounded-xl bg-slate-50 text-indigo-600 border border-slate-200 min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="Event Details"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={() => setJudgeSwitchOpen(true)}
                className="p-2 rounded-xl bg-slate-50 text-indigo-600 border border-slate-200 min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="Switch Judge"
              >
                <UserCheck className="w-4 h-4" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer (< lg) */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-lg animate-fadeIn">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-indigo-600 font-medium">{user?.panelLabel || user?.email}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold">
                Judge
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 min-h-[44px] ${
                  isActive('/') ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>

              <Link
                to="/add-team"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 min-h-[44px] ${
                  isActive('/add-team') ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Add &amp; Evaluate
              </Link>

              <Link
                to="/sheets"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 min-h-[44px] ${
                  isActive('/sheets') ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                <Printer className="w-4 h-4" />
                Judgement Sheet
              </Link>

              <Link
                to="/grid"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 min-h-[44px] ${
                  isActive('/grid') ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                <Grid className="w-4 h-4" />
                Grid View
              </Link>
            </div>

            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSettingsOpen(true);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <Settings className="w-4 h-4 text-indigo-600" />
                Event Details
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Shared Device Judge Switch Modal */}
      <JudgeSwitchModal
        isOpen={judgeSwitchOpen}
        onClose={() => setJudgeSwitchOpen(false)}
      />

      {/* Event Details & Settings Modal (available directly to judges) */}
      <EventSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        eventConfig={activeEvent}
      />
    </>
  );
}
