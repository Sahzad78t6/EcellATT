import api from './axios';

export const reportApi = {
  getMemberWise: (params) => api.get('/reports/members', { params }),
  getEventWise: (params) => api.get('/reports/events', { params }),
  getVerticalWise: (params) => api.get('/reports/verticals', { params }),

  downloadExport: async (endpoint, params, format, defaultFilename) => {
    const response = await api.get(endpoint, {
      params: { ...params, export: format },
      responseType: 'blob'
    });

    const blob = new Blob([response.data], {
      type: format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv;charset=utf-8;'
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${defaultFilename}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
