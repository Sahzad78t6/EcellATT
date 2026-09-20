import api from './axios';

export const analyticsApi = {
  // Admin Analytics
  getAdminOverview: (params) => api.get('/analytics/admin/overview', { params }),
  getTrends: (params) => api.get('/analytics/admin/trends', { params }),
  getVerticalComparison: (params) => api.get('/analytics/admin/vertical-comparison', { params }),
  getVerticalLeaderboard: (params) => api.get('/analytics/admin/vertical-leaderboard', { params }),
  getMemberLeaderboard: (params) => api.get('/analytics/admin/member-leaderboard', { params }),
  getHeatmap: (params) => api.get('/analytics/admin/heatmap', { params }),
  getAtRiskMembers: (params) => api.get('/analytics/admin/at-risk', { params }),

  // Head Analytics
  getVerticalSummary: (params) => api.get('/analytics/vertical/summary', { params }),

  // Member Analytics
  getMemberSummary: (params) => api.get('/analytics/member/me', { params })
};
