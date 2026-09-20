import { fetchApi } from './api';

export const projectService = {
  list: (params?: { category?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchApi<{ success: boolean; data: any[]; meta: any }>(`/projects${qs}`);
  },

  getMyProjects: () =>
    fetchApi<{ success: boolean; data: any[] }>('/projects/my/projects'),

  getBySlug: (slug: string) =>
    fetchApi<{ success: boolean; data: any }>(`/projects/${slug}`),

  create: (data: any) =>
    fetchApi<{ success: boolean; data: any }>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    fetchApi<{ success: boolean; data: any }>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  initiatePromotion: (data: {
    url: string;
    category: string;
    amount: number;
    name?: string;
    contactEmail?: string;
  }) =>
    fetchApi<{
      success: boolean;
      data: {
        orderId: string;
        keyId: string;
        amount: number;
        currency: string;
        bidId: string;
        projectId: string;
        projectName: string;
        url: string;
      };
    }>('/projects/promote', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifyPromotion: (data: {
    bidId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) =>
    fetchApi<{ success: boolean; message: string; data: any }>('/projects/promote/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
