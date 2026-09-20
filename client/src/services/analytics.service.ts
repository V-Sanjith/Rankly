import { fetchApi } from './api';

export const analyticsService = {
  getDashboardOverview: () =>
    fetchApi<{ success: boolean; data: { totalProjects: number; activeProjects: number; totalBids: number; totalViews: number; totalClicks: number } }>('/analytics/dashboard'),

  getProjectAnalytics: (projectId: string) =>
    fetchApi<{ success: boolean; data: { views: number; clicks: number; ctr: number | string } }>(`/analytics/project/${projectId}`),

  getUserActivity: () =>
    fetchApi<{ success: boolean; data: any[] }>('/analytics/activity'),

  recordView: (projectId: string, sessionId?: string, referrer?: string) =>
    fetchApi<{ success: boolean }>('/analytics/view', {
      method: 'POST',
      body: JSON.stringify({ projectId, sessionId, referrer }),
    }),

  recordClick: (projectId: string, sessionId?: string) =>
    fetchApi<{ success: boolean }>('/analytics/click', {
      method: 'POST',
      body: JSON.stringify({ projectId, sessionId }),
    }),
};
