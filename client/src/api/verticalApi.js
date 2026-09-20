import api from './axios';

export const verticalApi = {
  list: () => api.get('/verticals'),
  getById: (id) => api.get(`/verticals/${id}`),
  create: (data) => api.post('/verticals', data),
  update: (id, data) => api.put(`/verticals/${id}`, data),
  delete: (id) => api.delete(`/verticals/${id}`)
};
