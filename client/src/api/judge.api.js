import axiosClient from './axiosClient.js';

export const getJudgesApi = () => axiosClient.get('/judges');
export const createJudgeApi = (data) => axiosClient.post('/judges', data);
