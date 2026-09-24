import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useEvent } from '../../context/EventContext.jsx';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({
  children,
  requireEvent = true,
  requireOrganizer = false,
}) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { activeEvent, isOrganizer, loading: eventLoading } = useEvent();
  const location = useLocation();

  if (authLoading || (isAuthenticated && eventLoading && !activeEvent)) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-slate-50 text-slate-600">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-medium animate-pulse">Loading ExpoJudge...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireEvent && !activeEvent) {
    return <Navigate to="/event-setup" replace />;
  }

  if (requireOrganizer && !isOrganizer) {
    return <Navigate to="/" replace />;
  }

  return children;
}
