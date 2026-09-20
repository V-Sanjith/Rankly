import { fetchApi } from './api';

export const adminService = {
  getDashboardStats: () =>
    fetchApi<{ success: boolean; data: { totalUsers: number; totalProjects: number; pendingReviews: number; activeBids: number; totalRevenue: number } }>('/admin/dashboard'),

  getUsers: () =>
    fetchApi<{ success: boolean; data: any[] }>('/admin/users'),

  getProjects: () =>
    fetchApi<{ success: boolean; data: any[] }>('/admin/projects'),

  updateProjectStatus: (id: string, status: string) =>
    fetchApi<{ success: boolean; data: any }>(`/admin/projects/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getBids: () =>
    fetchApi<{ success: boolean; data: any[] }>('/admin/bids'),

  getPayments: () =>
    fetchApi<{ success: boolean; data: any[] }>('/admin/payments'),

  getAuditLogs: () =>
    fetchApi<{ success: boolean; data: any[]; meta: any }>('/admin/audit-logs'),

  getConfig: () =>
    fetchApi<{ success: boolean; data: any }>('/admin/config'),

  updateConfig: (data: any) =>
    fetchApi<{ success: boolean; data: any }>('/admin/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
