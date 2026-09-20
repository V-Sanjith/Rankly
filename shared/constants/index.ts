import { Category } from '../types/index.js';

export const CATEGORIES = [
  { label: 'AI', value: Category.AI_TOOLS, icon: 'bot', description: 'Artificial intelligence, agents, LLMs, and ML platforms' },
  { label: 'Developer Tools', value: Category.DEVELOPER_TOOLS, icon: 'code', description: 'APIs, infrastructure, SDKs, and developer platforms' },
  { label: 'SaaS', value: Category.SAAS, icon: 'layers', description: 'Software as a service for modern businesses' },
  { label: 'Productivity', value: Category.PRODUCTIVITY, icon: 'check-square', description: 'Tools that help you get things done faster' },
  { label: 'Marketing', value: Category.MARKETING, icon: 'megaphone', description: 'Growth, attribution, ads, and lead generation' },
  { label: 'Design', value: Category.DESIGN, icon: 'palette', description: 'Design tools, UI kits, 3D, and creative software' },
  { label: 'Mobile Apps', value: Category.MOBILE_APPS, icon: 'smartphone', description: 'iOS and Android applications, cross-platform tools' },
  { label: 'Startups', value: Category.STARTUPS, icon: 'rocket', description: 'Early-stage ventures and high-growth companies' },
  { label: 'E-commerce', value: Category.ECOMMERCE, icon: 'shopping-cart', description: 'Online retail, checkout experiences, and commerce tools' },
  { label: 'Personal Projects', value: Category.PERSONAL_PROJECTS, icon: 'user', description: 'Indie creations, portfolio projects, and experiments' },
  { label: 'Other', value: Category.OTHER, icon: 'box', description: 'Miscellaneous apps, utilities, and communities' }
];

export const BID_DEFAULTS = {
  minBid: 199,
  minIncrement: 50,
  currency: 'INR'
};

export const PROJECT_LIMITS = {
  nameMax: 100,
  shortDescMax: 200,
  descMax: 5000,
  urlMax: 500
};
