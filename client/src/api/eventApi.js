import api from './axios';

export const eventApi = {
  list: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  open: (id) => api.post(`/events/${id}/open`),
  close: (id) => api.post(`/events/${id}/close`),
  reopen: (id) => api.post(`/events/${id}/reopen`),
  cancel: (id) => api.post(`/events/${id}/cancel`)
};
