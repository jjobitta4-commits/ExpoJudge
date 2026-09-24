import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvent } from '../../context/EventContext.jsx';
import OrganizerView from '../../components/organizer/OrganizerView.jsx';

export default function AdminDashboardPage() {
  const { activeEvent, teams, myScores } = useEvent();
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100dvh-4rem)]">
      <OrganizerView
        appData={{
          eventConfig: activeEvent,
          teams,
          scores: myScores,
        }}
        onBackToJudging={() => navigate('/')}
        onOpenPrintSheet={() => navigate('/sheets')}
      />
    </div>
  );
}
