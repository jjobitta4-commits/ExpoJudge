import axiosClient from './axiosClient.js';

export const getMyScoresApi = async (eventId) => {
  const response = await axiosClient.get('/scores/mine', {
    params: eventId ? { eventId } : {},
  });
  return response.data;
};

export const upsertScoreApi = async (teamId, scoreData) => {
  const response = await axiosClient.put(`/scores/${teamId}`, scoreData);
  return response.data;
};
