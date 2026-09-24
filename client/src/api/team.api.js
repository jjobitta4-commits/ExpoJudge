import axiosClient from './axiosClient.js';

export const getTeamsApi = async (eventId) => {
  const response = await axiosClient.get('/teams', {
    params: eventId ? { eventId } : {},
  });
  return response.data;
};

export const createTeamApi = async (teamData) => {
  const response = await axiosClient.post('/teams', teamData);
  return response.data;
};

export const updateTeamApi = async (id, teamData) => {
  const response = await axiosClient.patch(`/teams/${id}`, teamData);
  return response.data;
};

export const deleteTeamApi = async (id) => {
  const response = await axiosClient.delete(`/teams/${id}`);
  return response.data;
};
