import axiosClient from './axiosClient.js';

export const getJudgesApi = async (eventId) => {
  const response = await axiosClient.get('/judges', {
    params: eventId ? { eventId } : {},
  });
  return response.data;
};

export const removeJudgeApi = async (userId, eventId) => {
  const response = await axiosClient.delete(`/judges/${userId}`, {
    params: eventId ? { eventId } : {},
  });
  return response.data;
};

export const removeJudgeFromEventApi = removeJudgeApi;
