import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useEvent } from '../../context/EventContext.jsx';
import JudgeDashboard from '../../components/judge/JudgeDashboard.jsx';

export default function JudgeDashboardPage() {
  const { user } = useAuth();
  const { activeEvent, teams, myScores } = useEvent();
  const navigate = useNavigate();

  const handleSelectTeamToScore = (teamIndex) => {
    const targetTeam = teams[teamIndex];
    if (targetTeam) {
      navigate(`/scoring/${targetTeam._id || targetTeam.id}`);
    }
  };

  const handleOpenTeamSetup = () => {
    navigate('/add-team');
  };

  const handleOpenPrintSheet = () => {
    navigate('/sheets');
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)]">
      <JudgeDashboard
        currentJudge={user}
        teams={teams}
        judgeScores={myScores}
        onSelectTeamToScore={handleSelectTeamToScore}
        onOpenTeamSetup={handleOpenTeamSetup}
        onOpenPrintSheet={handleOpenPrintSheet}
        appData={{
          eventConfig: activeEvent,
          teams,
          scores: myScores,
        }}
      />
    </div>
  );
}
