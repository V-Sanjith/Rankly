export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN'
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ProjectStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  REJECTED: 'REJECTED'
} as const;
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const BidStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  FAILED: 'FAILED'
} as const;
export type BidStatus = (typeof BidStatus)[keyof typeof BidStatus];

export const PaymentStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  label: string;
  value: string;
  icon?: string;
  description?: string;
  projectCount?: number;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  description: string;
  url: string;
  categoryId: string;
  category?: Category;
  ownerId: string;
  owner?: User;
  status: ProjectStatus;
  logoUrl?: string;
  currentRank?: number;
  currentBidAmount?: number;
  totalViews?: number;
  totalClicks?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: string;
  projectId: string;
  project?: Project;
  userId: string;
  user?: User;
  amount: number;
  status: BidStatus;
  paymentId?: string;
  expiresAt: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  bidId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

export interface Ranking {
  projectId: string;
  rank: number;
  score: number;
  bidAmount: number;
  trend: 'up' | 'down' | 'flat';
}

export interface AnalyticsData {
  views: { date: string; count: number }[];
  clicks: { date: string; count: number }[];
  totalViews: number;
  totalClicks: number;
  ctr: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
