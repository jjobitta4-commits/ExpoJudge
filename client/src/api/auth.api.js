import axiosClient from './axiosClient.js';

export const loginApi = async (credentials) => {
  const response = await axiosClient.post('/auth/login', credentials);
  return response.data;
};

export const registerApi = async (userData) => {
  const response = await axiosClient.post('/auth/register', userData);
  return response.data;
};

export const getMeApi = async () => {
  const response = await axiosClient.get('/auth/me');
  return response.data;
};
