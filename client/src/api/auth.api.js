import axiosClient from './axiosClient.js';

export const loginApi = (credentials) => axiosClient.post('/auth/login', credentials);
export const registerApi = (userData) => axiosClient.post('/auth/register', userData);
export const getMeApi = () => axiosClient.get('/auth/me');
