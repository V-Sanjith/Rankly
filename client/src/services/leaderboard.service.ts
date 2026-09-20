import { fetchApi } from './api';

export const leaderboardService = {
  getLeaderboard: (params?: { category?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchApi<{ success: boolean; data: any[]; meta: any }>(`/leaderboard${qs}`);
  },

  getTodayStats: () =>
    fetchApi<{ success: boolean; data: { totalBidsToday: number; totalAmountToday: number; topBidder: { name: string; amount: number; project: string } | null } }>('/leaderboard/today-stats'),

  getCategoryOverview: () =>
    fetchApi<{
      success: boolean;
      data: Array<{
        category: string;
        label: string;
        description: string;
        icon: string;
        totalProducts: number;
        topRankings: Array<{
          rank: number;
          rankingValue: number;
          projectId: string;
          name: string;
          slug: string;
          url: string;
          imageUrl?: string | null;
          shortDescription?: string;
        }>;
      }>;
    }>('/leaderboard/categories/overview'),
};
