import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import {
  getActiveEventApi,
  getMyEventsApi,
  createEventApi,
  joinEventApi,
  setActiveEventApi,
  updateEventApi,
} from '../api/event.api.js';
import { getTeamsApi } from '../api/team.api.js';
import { getMyScoresApi } from '../api/score.api.js';

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [activeEvent, setActiveEvent] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [myScores, setMyScores] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchActiveEventData = useCallback(async () => {
    if (!isAuthenticated) {
      setActiveEvent(null);
      setTeams([]);
      setMyScores({});
      return;
    }

    try {
      setLoading(true);
      const activeRes = await getActiveEventApi();
      const currentEvt = activeRes.event;
      setActiveEvent(currentEvt);

      if (currentEvt) {
        updateUser({ activeEventId: currentEvt._id });

        const [teamsRes, scoresRes] = await Promise.all([
          getTeamsApi(currentEvt._id),
          getMyScoresApi(currentEvt._id),
        ]);

        setTeams(teamsRes.teams || []);

        const scoreMap = {};
        (scoresRes.scores || []).forEach((s) => {
          scoreMap[s.teamId] = s;
        });
        setMyScores(scoreMap);
      } else {
        setTeams([]);
        setMyScores({});
      }

      // Also fetch user's joined events list
      const mineRes = await getMyEventsApi();
      setMyEvents(mineRes.events || []);
    } catch (err) {
      console.error('Error fetching active event data:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchActiveEventData();
  }, [fetchActiveEventData]);

  const refreshTeams = async () => {
    if (!activeEvent) return;
    try {
      const res = await getTeamsApi(activeEvent._id);
      setTeams(res.teams || []);
    } catch (err) {
      console.error('Error refreshing teams:', err);
    }
  };

  const refreshScores = async () => {
    if (!activeEvent) return;
    try {
      const res = await getMyScoresApi(activeEvent._id);
      const scoreMap = {};
      (res.scores || []).forEach((s) => {
        scoreMap[s.teamId] = s;
      });
      setMyScores(scoreMap);
    } catch (err) {
      console.error('Error refreshing scores:', err);
    }
  };

  const createEvent = async (data) => {
    const res = await createEventApi(data);
    await fetchActiveEventData();
    return res.event;
  };

  const joinEvent = async (joinCode) => {
    const res = await joinEventApi(joinCode);
    await fetchActiveEventData();
    return res.event;
  };

  const switchEvent = async (eventId) => {
    const res = await setActiveEventApi(eventId);
    await fetchActiveEventData();
    return res.event;
  };

  const updateActiveEvent = async (data) => {
    if (!activeEvent) return;
    const res = await updateEventApi(activeEvent._id, data);
    setActiveEvent(res.event);
    return res.event;
  };

  // Check if current user is organizer of active event or global admin
  const isOrganizer = Boolean(
    user &&
      activeEvent &&
      (user.role === 'admin' ||
        (activeEvent.organizerIds &&
          activeEvent.organizerIds.some(
            (id) => (id._id || id).toString() === (user.id || user._id).toString()
          )))
  );

  return (
    <EventContext.Provider
      value={{
        activeEvent,
        myEvents,
        teams,
        myScores,
        isOrganizer,
        loading,
        refreshActiveEventData: fetchActiveEventData,
        refreshTeams,
        refreshScores,
        createEvent,
        joinEvent,
        switchEvent,
        updateActiveEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
}
