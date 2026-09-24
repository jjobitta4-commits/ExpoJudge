import axiosClient from './axiosClient.js';

export const getEventsApi = () => axiosClient.get('/events');
export const getEventByIdApi = (id) => axiosClient.get(`/events/${id}`);
export const createEventApi = (data) => axiosClient.post('/events', data);
export const updateEventApi = (id, data) => axiosClient.put(`/events/${id}`, data);
