import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent } from '../../context/EventContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { upsertScoreApi } from '../../api/score.api.js';
import ScoringView from '../../components/judge/ScoringView.jsx';
import { Loader2 } from 'lucide-react';

export default function ScoringPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeEvent, teams, myScores, refreshScores } = useEvent();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const currentTeamIndex = teams.findIndex(
    (t) => (t._id || t.id).toString() === teamId?.toString()
  );
  const currentTeam = teams[currentTeamIndex] || teams[0];
  const existingScore = currentTeam ? myScores[currentTeam._id || currentTeam.id] : null;

  // Convert marks array from backend to map { [criterionId]: value } for ScoringView
  const formattedScoreRecord = existingScore
    ? {
        ...existingScore,
        marks: Array.isArray(existingScore.marks)
          ? existingScore.marks.reduce((acc, m) => {
              acc[m.criterionId] = m.value;
              return acc;
            }, {})
          : existingScore.marks || {},
      }
    : null;

  const handleSaveScore = async (id, marksMap, remarks, isCompleted) => {
    if (!currentTeam) return;
    setSaving(true);
    setError('');

    try {
      const criteriaList = activeEvent?.criteria || [];
      const criteriaMap = new Map(criteriaList.map((c) => [c.id, c.name]));

      // Convert marksMap to array of objects expected by server
      const marksArray = Object.entries(marksMap)
        .filter(([_, val]) => val !== undefined && val !== '' && !isNaN(val))
        .map(([cId, val]) => ({
          criterionId: cId,
          criterionName: criteriaMap.get(cId) || cId,
          value: Number(val),
        }));

      await upsertScoreApi(currentTeam._id || currentTeam.id, {
        marks: marksArray,
        remarks: remarks || '',
        isCompleted: Boolean(isCompleted),
      });

      await refreshScores();
    } catch (err) {
      console.error('Failed to save score:', err);
      setError(err.response?.data?.message || 'Failed to save score.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleNavigateTeam = (newIndex) => {
    const nextTeam = teams[newIndex];
    if (nextTeam) {
      navigate(`/scoring/${nextTeam._id || nextTeam.id}`);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  const handleOpenPrintSheet = () => {
    navigate('/sheets');
  };

  if (!currentTeam) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6 bg-slate-50">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-sm font-medium text-slate-600">
            Loading team scoring details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      {error && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        </div>
      )}
      <ScoringView
        team={currentTeam}
        teamIndex={currentTeamIndex >= 0 ? currentTeamIndex : 0}
        totalTeams={teams.length}
        existingScoreRecord={formattedScoreRecord}
        judge={user}
        criteria={activeEvent?.criteria}
        onSaveScore={handleSaveScore}
        onNavigateTeam={handleNavigateTeam}
        onBackToDashboard={handleBackToDashboard}
        onOpenPrintSheet={handleOpenPrintSheet}
      />
    </div>
  );
}
