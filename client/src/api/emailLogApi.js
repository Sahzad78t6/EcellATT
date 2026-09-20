import api from './axios';

export const emailLogApi = {
  list: (params) => api.get('/email-logs', { params }),
  sendAlertsNow: (data) => api.post('/email-logs/send-now', data),
  retry: (id) => api.post(`/email-logs/${id}/retry`)
};
