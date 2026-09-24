import React from 'react';
import {
  Award,
  Users,
  LayoutDashboard,
  Trophy,
  PlusCircle,
  Settings,
  Printer,
  ChevronDown,
  UserCheck,
  FileSpreadsheet
} from 'lucide-react';

export default function Navbar({
  currentJudge,
  allJudges,
  eventConfig,
  currentView,
  setCurrentView,
  onOpenJudgeSwitch,
  onOpenTeamSetup,
  onOpenSettings,
  onOpenPrintSheet,
  completedCount,
  totalTeamsCount,
}) {
  return (
    <header className="no-print bg-slate-900 text-white shadow-md sticky top-0 z-40 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Event Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-violet-500 p-2 rounded-xl shadow-inner">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  ExpoJudge
                </span>
                <span className="text-[10px] uppercase font-semibold bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/40">
                  Official Judging System
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {eventConfig?.eventName || 'Project Expo 2026'}
              </p>
            </div>
          </div>

          {/* Navigation Modes */}
          <div className="hidden md:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentView === 'dashboard' || currentView === 'scoring'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Judging Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentView('organizer')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentView === 'organizer'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Organizer Leaderboard</span>
            </button>
          </div>

          {/* Right Action Icons & Judge Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Print Shortcut */}
            <button
              onClick={onOpenPrintSheet}
              title="Print Judging Sheets"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs sm:text-sm font-medium border border-slate-700 transition"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Judging Sheets</span>
            </button>

            {/* Manage Teams */}
            <button
              onClick={onOpenTeamSetup}
              title="Add or Manage Teams"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition"
            >
              <Users className="w-4 h-4" />
            </button>

            {/* Event Settings */}
            <button
              onClick={onOpenSettings}
              title="Event Settings & Data"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Judge Selector Dropdown / Button */}
            <button
              onClick={onOpenJudgeSwitch}
              className="flex items-center space-x-2 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 px-3 py-1.5 rounded-lg border border-slate-600/70 shadow-sm text-left transition"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-500/30 border border-indigo-400/50 flex items-center justify-center text-indigo-300 font-bold text-xs">
                {currentJudge?.name ? currentJudge.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="max-w-[110px] sm:max-w-[150px] leading-tight">
                <p className="text-xs font-semibold text-white truncate">
                  {currentJudge?.name || 'Select Judge'}
                </p>
                <p className="text-[10px] text-slate-300 truncate">
                  {currentJudge?.panelNumber || 'No Panel Assigned'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center space-x-1.5 py-1 px-3 rounded-md font-medium ${
              currentView === 'dashboard' || currentView === 'scoring'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Judging ({completedCount}/{totalTeamsCount})</span>
          </button>
          <button
            onClick={() => setCurrentView('organizer')}
            className={`flex items-center space-x-1.5 py-1 px-3 rounded-md font-medium ${
              currentView === 'organizer'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Leaderboard</span>
          </button>
        </div>
      </div>
    </header>
  );
}
