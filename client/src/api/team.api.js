import axiosClient from './axiosClient.js';

export const getTeamsApi = () => axiosClient.get('/teams');
export const getTeamByIdApi = (id) => axiosClient.get(`/teams/${id}`);
export const createTeamApi = (data) => axiosClient.post('/teams', data);
export const updateTeamApi = (id, data) => axiosClient.put(`/teams/${id}`, data);
export const deleteTeamApi = (id) => axiosClient.delete(`/teams/${id}`);
