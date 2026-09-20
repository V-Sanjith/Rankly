import { fetchApi } from './api';

export const bidService = {
  create: (data: { projectId: string; amount: number }) =>
    fetchApi<{ success: boolean; data: { bid: any; payment: any; order: any } }>('/bids', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifyPayment: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; bidId: string }) =>
    fetchApi<{ success: boolean; data: any }>('/bids/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyBids: () =>
    fetchApi<{ success: boolean; data: any[] }>('/bids/my'),
};
