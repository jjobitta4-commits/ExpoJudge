import axiosClient from './axiosClient.js';

export const getScoresApi = (eventId) => axiosClient.get('/scores', { params: { eventId } });
export const saveScoreApi = (data) => axiosClient.post('/scores', data);
