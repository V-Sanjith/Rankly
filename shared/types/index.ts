export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED'
}

export enum BidStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentStatus {
  CREATED = 'CREATED',
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED'
}

export enum Category {
  AI_TOOLS = 'AI_TOOLS',
  DEVELOPER_TOOLS = 'DEVELOPER_TOOLS',
  SAAS = 'SAAS',
  PRODUCTIVITY = 'PRODUCTIVITY',
  MARKETING = 'MARKETING',
  DESIGN = 'DESIGN',
  MOBILE_APPS = 'MOBILE_APPS',
  STARTUPS = 'STARTUPS',
  ECOMMERCE = 'ECOMMERCE',
  PERSONAL_PROJECTS = 'PERSONAL_PROJECTS',
  OTHER = 'OTHER'
}

export enum PaymentProvider {
  RAZORPAY = 'RAZORPAY'
}

// Entity Interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  url: string;
  shortDescription: string;
  description: string;
  category: Category;
  imageUrl?: string | null;
  founderName?: string | null;
  contactEmail?: string | null;
  socialLinks?: any;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bid {
  id: string;
  projectId: string;
  bidderId: string;
  amount: number | string;
  currency: string;
  status: BidStatus;
  createdAt: Date;
}

export interface Payment {
  id: string;
  userId: string;
  bidId: string;
  provider: PaymentProvider;
  providerOrderId?: string | null;
  providerPaymentId?: string | null;
  providerSignature?: string | null;
  amount: number | string;
  currency: string;
  status: PaymentStatus;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ranking {
  projectId: string;
  rank: number;
  rankingValue: number | string;
  lastBidAt?: Date | null;
  updatedAt: Date;
}

export interface BidConfig {
  id: string;
  minBid: number | string;
  minIncrement: number | string;
  currency: string;
  allowSelfBid: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response Types
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
