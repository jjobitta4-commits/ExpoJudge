import React, { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import JudgeDashboard from './components/judge/JudgeDashboard';
import ScoringView from './components/judge/ScoringView';
import PrintableSheet from './components/shared/PrintableSheet';
import OrganizerView from './components/organizer/OrganizerView';
import JudgeSwitchModal from './components/judge/JudgeSwitchModal';
import TeamManagerModal from './components/organizer/TeamManagerModal';
import EventSettingsModal from './components/organizer/EventSettingsModal';
import {
  loadAppData,
  saveAppData,
  getCurrentJudge,
  calculateTotalScore
} from './utils/storage';
import { DEMO_TEAMS, INITIAL_EVENT_CONFIG } from './constants/demoData';

export default function App() {
  // Main app data loaded from localStorage
  const [appData, setAppData] = useState(() => loadAppData());

  // Views: 'dashboard' | 'scoring' | 'organizer' | 'print'
  const [currentView, setCurrentView] = useState('dashboard');
  const [scoringTeamIndex, setScoringTeamIndex] = useState(0);

  // Modals
  const [isJudgeModalOpen, setIsJudgeModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Save changes to localStorage whenever appData updates
  useEffect(() => {
    saveAppData(appData);
  }, [appData]);

  // Current Judge
  const currentJudge = getCurrentJudge(appData);

  // If no judge is registered/selected, force open Judge Modal
  useEffect(() => {
    if (!currentJudge || !appData.currentJudgeId) {
      setIsJudgeModalOpen(true);
    }
  }, [currentJudge, appData.currentJudgeId]);

  // Scores specific to the active judge
  const currentJudgeScores =
    (currentJudge && appData.scores && appData.scores[currentJudge.id]) || {};

  // Count completed evaluations for active judge
  const completedCount = (appData.teams || []).filter(
    (team) => currentJudgeScores[team.id]?.isCompleted
  ).length;

  // --- Handlers for Judge Management ---
  const handleSelectJudge = (judgeId) => {
    setAppData((prev) => ({
      ...prev,
      currentJudgeId: judgeId,
    }));
  };

  const handleCreateJudge = ({ name, panelNumber }) => {
    const newJudge = {
      id: `judge_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name,
      panelNumber: panelNumber || '',
      createdAt: Date.now(),
    };

    setAppData((prev) => ({
      ...prev,
      judges: [...(prev.judges || []), newJudge],
      currentJudgeId: newJudge.id,
    }));

    return newJudge;
  };

  // --- Handlers for Team Management ---
  const handleAddTeam = (teamData) => {
    const newTeam = {
      id: `team_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      teamName: teamData.teamName,
      projectTitle: teamData.projectTitle,
      identifier: teamData.identifier || '', // Optional! Left blank if not applicable
      members: teamData.members || '',
      createdAt: Date.now(),
    };

    setAppData((prev) => ({
      ...prev,
      teams: [...prev.teams, newTeam],
    }));
  };

  const handleUpdateTeam = (teamId, updatedData) => {
    setAppData((prev) => ({
      ...prev,
      teams: prev.teams.map((t) =>
        t.id === teamId ? { ...t, ...updatedData } : t
      ),
    }));
  };

  const handleDeleteTeam = (teamId) => {
    setAppData((prev) => {
      const nextTeams = prev.teams.filter((t) => t.id !== teamId);
      // Remove team scores across all judges
      const nextScores = { ...prev.scores };
      Object.keys(nextScores).forEach((jId) => {
        if (nextScores[jId] && nextScores[jId][teamId]) {
          const copy = { ...nextScores[jId] };
          delete copy[teamId];
          nextScores[jId] = copy;
        }
      });
      return {
        ...prev,
        teams: nextTeams,
        scores: nextScores,
      };
    });
  };

  const handleResetDemoTeams = () => {
    setAppData((prev) => ({
      ...prev,
      teams: DEMO_TEAMS,
    }));
  };

  // --- Handlers for Scoring ---
  const handleSaveScore = (teamId, marks, remarks, isCompleted = true) => {
    if (!currentJudge) return;

    setAppData((prev) => {
      const judgeId = currentJudge.id;
      const prevJudgeScores = prev.scores[judgeId] || {};

      const updatedRecord = {
        marks,
        remarks: remarks || '',
        isCompleted: Boolean(isCompleted),
        updatedAt: Date.now(),
      };

      return {
        ...prev,
        scores: {
          ...prev.scores,
          [judgeId]: {
            ...prevJudgeScores,
            [teamId]: updatedRecord,
          },
        },
      };
    });
  };

  // Navigation into scoring
  const handleSelectTeamToScore = (teamIndex) => {
    setScoringTeamIndex(teamIndex);
    setCurrentView('scoring');
  };

  // --- Handlers for Event Config & Backups ---
  const handleUpdateEventConfig = (newConfig) => {
    setAppData((prev) => ({
      ...prev,
      eventConfig: newConfig,
    }));
  };

  const handleImportAppData = (imported) => {
    setAppData(imported);
  };

  const handleResetAllData = () => {
    localStorage.clear();
    const initial = loadAppData();
    setAppData(initial);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Persistent Navbar (hidden on print) */}
      <Navbar
        currentJudge={currentJudge}
        allJudges={appData.judges || []}
        eventConfig={appData.eventConfig}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenJudgeSwitch={() => setIsJudgeModalOpen(true)}
        onOpenTeamSetup={() => setIsTeamModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenPrintSheet={() => setCurrentView('print')}
        completedCount={completedCount}
        totalTeamsCount={(appData.teams || []).length}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'dashboard' && (
          <JudgeDashboard
            currentJudge={currentJudge}
            teams={appData.teams || []}
            judgeScores={currentJudgeScores}
            onSelectTeamToScore={handleSelectTeamToScore}
            onOpenTeamSetup={() => setIsTeamModalOpen(true)}
            onOpenPrintSheet={() => setCurrentView('print')}
            appData={appData}
          />
        )}

        {currentView === 'scoring' && appData.teams && appData.teams.length > 0 && (
          <ScoringView
            team={appData.teams[scoringTeamIndex] || appData.teams[0]}
            teamIndex={scoringTeamIndex}
            totalTeams={appData.teams.length}
            existingScoreRecord={
              currentJudgeScores[appData.teams[scoringTeamIndex]?.id]
            }
            judge={currentJudge}
            onSaveScore={handleSaveScore}
            onNavigateTeam={(newIndex) => setScoringTeamIndex(newIndex)}
            onBackToDashboard={() => setCurrentView('dashboard')}
            onOpenPrintSheet={() => setCurrentView('print')}
          />
        )}

        {currentView === 'print' && (
          <PrintableSheet
            judge={currentJudge}
            teams={appData.teams || []}
            judgeScores={currentJudgeScores}
            eventConfig={appData.eventConfig}
            onClose={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'organizer' && (
          <OrganizerView
            appData={appData}
            onBackToJudging={() => setCurrentView('dashboard')}
            onOpenPrintSheet={() => setCurrentView('print')}
          />
        )}
      </main>

      {/* Modals */}
      <JudgeSwitchModal
        isOpen={isJudgeModalOpen}
        onClose={() => setIsJudgeModalOpen(false)}
        allJudges={appData.judges || []}
        currentJudge={currentJudge}
        onSelectJudge={handleSelectJudge}
        onCreateJudge={handleCreateJudge}
        isMandatory={!currentJudge}
      />

      <TeamManagerModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        teams={appData.teams || []}
        onAddTeam={handleAddTeam}
        onUpdateTeam={handleUpdateTeam}
        onDeleteTeam={handleDeleteTeam}
        onResetDemoTeams={handleResetDemoTeams}
      />

      <EventSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        eventConfig={appData.eventConfig}
        onUpdateEventConfig={handleUpdateEventConfig}
        appData={appData}
        onImportAppData={handleImportAppData}
        onResetAllData={handleResetAllData}
      />
    </div>
  );
}
