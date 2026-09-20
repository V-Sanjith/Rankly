// Re-export shared types for convenient server-side imports
// This avoids deep relative paths and works with NodeNext module resolution

export { 
  UserRole, 
  ProjectStatus, 
  BidStatus, 
  PaymentStatus, 
  Category, 
  PaymentProvider 
} from '../../../shared/types/index.js';

export type { 
  User, 
  Project, 
  Bid, 
  Payment, 
  Ranking, 
  BidConfig, 
  AuthResponse, 
  PaginatedResponse 
} from '../../../shared/types/index.js';
