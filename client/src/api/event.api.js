import axiosClient from './axiosClient.js';

export const createEventApi = async (data) => {
  const response = await axiosClient.post('/events', data);
  return response.data;
};

export const joinEventApi = async (joinCode) => {
  const response = await axiosClient.post('/events/join', { joinCode });
  return response.data;
};

export const getMyEventsApi = async () => {
  const response = await axiosClient.get('/events/mine');
  return response.data;
};

export const getActiveEventApi = async () => {
  const response = await axiosClient.get('/events/active');
  return response.data;
};

export const setActiveEventApi = async (eventId) => {
  const response = await axiosClient.patch('/events/active', { eventId });
  return response.data;
};

export const updateEventApi = async (id, data) => {
  const response = await axiosClient.patch(`/events/${id}`, data);
  return response.data;
};
