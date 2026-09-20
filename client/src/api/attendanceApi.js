import api from './axios';

export const attendanceApi = {
  getRoster: (eventId, params) => api.get(`/events/${eventId}/roster`, { params }),
  saveRoster: (eventId, data) => api.put(`/events/${eventId}/attendance`, data),
  listRecords: (params) => api.get('/attendance', { params }),
  adminEdit: (attendanceId, data) => api.patch(`/attendance/${attendanceId}`, data)
};
