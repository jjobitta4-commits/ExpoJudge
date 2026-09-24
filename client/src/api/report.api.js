import axiosClient from './axiosClient.js';

export const getGridReportApi = async (eventId) => {
  const response = await axiosClient.get('/reports/grid', {
    params: eventId ? { eventId } : {},
  });
  return response.data;
};

export const downloadScoresCSV = async (eventId, scope = 'all') => {
  const response = await axiosClient.get('/reports/export', {
    params: { eventId, scope },
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `ExpoJudge-Scores-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
