import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import {
  Bot,
  Code2,
  Layers,
  CheckSquare,
  Megaphone,
  Palette,
  Smartphone,
  Rocket,
  ShoppingCart,
  CreditCard,
  Cpu,
  Shield,
  BarChart3,
  Server,
  MessageSquare,
  GraduationCap,
  Activity,
  Gamepad2,
  GitBranch,
  Video,
  User,
  Box,
  Search,
  PlusCircle,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { leaderboardService } from '../../services/leaderboard.service';

export interface CategoryOverviewItem {
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
}

const DEFAULT_CATEGORIES: CategoryOverviewItem[] = [
  {
    category: 'AI_TOOLS',
    label: 'AI',
    description: 'Artificial intelligence, agents, LLMs, and ML platforms',
    icon: 'bot',
    totalProducts: 0,
    topRankings: [],
  },
  {
    category: 'DEVELOPER_TOOLS',
    label: 'Developer Tools',
    description: 'APIs, infrastructure, SDKs, and developer platforms',
    icon: 'code',
    totalProducts: 0,
    topRankings: [],
  },
  {
    category: 'SAAS',
    label: 'SaaS',
    description: 'Software as a service for modern businesses',
    icon: 'layers',
    totalProducts: 0,
    topRankings: [],
  },
  {
    category: 'PRODUCTIVITY',
    label: 'Productivity',
    description: 'Tools that help you get things done faster',
    icon: 'check-square',
    totalProducts: 0,
    topRankings: [],
  },
  {
    category: 'MARKETING',
    label: 'Marketing',
    description: 'Growth, attribution, ads, and lead generation',
    icon: 'megaphone',
    totalProducts: 0,
    topRankings: [],
  },
  {
    category: 'DESIGN',
    label: 'Design',
    description: 'Design tools, UI kits, 3D, and creative software',
    icon: 'palette',
    totalProducts: 0,
    topRankings: [],
  },
  {
    category: 'MOBILE_APPS',
    label: 'Mobile Apps',
    description: 'iOS and Android applications, cross-platform tools',
    icon: 'smartphone',
    totalProducts: 0,
    topRankings: [],
  },
  {
    category: 'STARTUPS',
    label: 'Startups',
    description: 'Early-stage ventures and high-growth companies',
    icon: 'rocket',
    totalProducts: 0,
    topRankings: [],
  },
  {
    category: 'ECOMMERCE',
    label: 'E-Commerce',
    description: 'Online retail, checkout experiences, and commerce tools',
    icon: 'shopping-cart',
    totalProducts: 0,
    topRankings: [],
  },
  {
    category: 'FINTECH',
    label: 'Fintech',
    description: 'Banking, crypto, payments, and financial management',
    icon: 'credit-card',
    totalProducts: 0,
    topRankings: [],
  },
  {
    category: 'WEB3',
    label: 'Web3 & Crypto',
    description: 'Blockchains, smart contracts, dApps, and DeFi protocols',
    icon: 'cpu',
    totalProducts: 0,
    topRankings: [],
  },
  {
    category: 'SECURITY',
    label: 'Security',
    description: 'Cybersecurity, auth, penetration testing, and compliance',
    icon: 'shield',
    totalProducts: 0,
    topRankings: [],
  },
  {
    category: 'ANALYTICS',
    label: 'Analytics',
    description: 'Product analytics, business intelligence, and event pipelines',
    icon: 'bar-chart',
    totalProducts: 0,
    topRankings: [],
  },
  {
    category: 'DEVOPS',
    label: 'Cloud & DevOps',
    description: 'Hosting, Kubernetes, CI/CD, and serverless infrastructure',
    icon: 'server',
    totalProducts: 0,
    topRankings: [],
  },
  {
    category: 'COMMUNICATION',
    label: 'Communication',
    description: 'Chat, video conferencing, email, and collaboration apps',
    icon: 'message-square',
    totalProducts: 0,
    topRankings: [],
  },
  {
    category: 'EDUCATION',
    label: 'Education',
    description: 'EdTech, learning platforms, courses, and interactive tutoring',
    icon: 'graduation-cap',
    totalProducts: 0,
    topRankings: [],
  },
  {
    category: 'HEALTH',
    label: 'Health & Wellness',
    description: 'Fitness trackers, mental health, telehealth, and wellness',
    icon: 'activity',
    totalProducts: 0,
    topRankings: [],
  },
  {
    category: 'GAMING',
    label: 'Gaming',
    description: 'Game development engines, streaming, indie games, and tools',
    icon: 'gamepad-2',
    totalProducts: 0,
    topRankings: [],
  },
  {
    category: 'OPEN_SOURCE',
    label: 'Open Source',
    description: 'Community projects, open repositories, and public tools',
    icon: 'git-branch',
    totalProducts: 0,
    topRankings: [],
  },
  {
    category: 'MEDIA',
    label: 'Media & Content',
    description: 'Audio production, video editing, podcasting, and publishing',
    icon: 'video',
    totalProducts: 0,
    topRankings: [],
  },
  {
    category: 'PERSONAL_PROJECTS',
    label: 'Personal Projects',
    description: 'Indie creations, portfolio projects, and experiments',
    icon: 'user',
    totalProducts: 0,
    topRankings: [],
  },
  {
    category: 'OTHER',
    label: 'Other',
    description: 'Miscellaneous apps, utilities, and communities',
    icon: 'box',
    totalProducts: 0,
    topRankings: [],
  },
];

const renderCategoryIcon = (iconName: string) => {
  const iconProps = { size: 18, className: 'text-[#ff5c35]' };
  switch (iconName) {
    case 'bot':
      return <Bot {...iconProps} />;
    case 'code':
      return <Code2 {...iconProps} />;
    case 'layers':
      return <Layers {...iconProps} />;
    case 'check-square':
      return <CheckSquare {...iconProps} />;
    case 'megaphone':
      return <Megaphone {...iconProps} />;
    case 'palette':
      return <Palette {...iconProps} />;
    case 'smartphone':
      return <Smartphone {...iconProps} />;
    case 'rocket':
      return <Rocket {...iconProps} />;
    case 'shopping-cart':
      return <ShoppingCart {...iconProps} />;
    case 'credit-card':
      return <CreditCard {...iconProps} />;
    case 'cpu':
      return <Cpu {...iconProps} />;
    case 'shield':
      return <Shield {...iconProps} />;
    case 'bar-chart':
      return <BarChart3 {...iconProps} />;
    case 'server':
      return <Server {...iconProps} />;
    case 'message-square':
      return <MessageSquare {...iconProps} />;
    case 'graduation-cap':
      return <GraduationCap {...iconProps} />;
    case 'activity':
      return <Activity {...iconProps} />;
    case 'gamepad-2':
      return <Gamepad2 {...iconProps} />;
    case 'git-branch':
      return <GitBranch {...iconProps} />;
    case 'video':
      return <Video {...iconProps} />;
    case 'user':
      return <User {...iconProps} />;
    case 'box':
    default:
      return <Box {...iconProps} />;
  }
};

const ExplorePage = () => {
  const [categories, setCategories] = useState<CategoryOverviewItem[]>(DEFAULT_CATEGORIES);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('default');

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const res = await leaderboardService.getCategoryOverview();
        if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
          // Merge API data with default list to preserve all 22 categories
          const apiMap = new Map(res.data.map((item: CategoryOverviewItem) => [item.category, item]));
          const merged = DEFAULT_CATEGORIES.map((def) => {
            const apiItem = apiMap.get(def.category);
            return apiItem ? { ...def, ...apiItem } : def;
          });
          setCategories(merged);
        }
      } catch (err) {
        // Fallback to DEFAULT_CATEGORIES gracefully with zero errors
        console.warn('Using cached category matrix:', err);
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCategories = categories.filter((cat) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase().trim();
    return (
      cat.label.toLowerCase().includes(query) ||
      cat.description.toLowerCase().includes(query)
    );
  });

  const totalListings = categories.reduce((sum, cat) => sum + (cat.totalProducts || 0), 0);

  return (
    <div className="py-8 md:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Bar: Search, Category Count & Default Order Dropdown (Pixel-perfect to reference screenshot) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search categories or products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#121319] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-[#ff5c35] focus:outline-none transition-colors"
          />
        </div>

        {/* Right Info & Order Filter */}
        <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
          <span className="text-gray-400 font-medium">
            Showing {filteredCategories.length} of {categories.length} Categories ({totalListings} Listings)
          </span>

          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="appearance-none bg-[#121319] border border-white/10 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#ff5c35] cursor-pointer"
            >
              <option value="default">Default Order</option>
              <option value="az">A to Z</option>
              <option value="popular">Most Products</option>
            </select>
            <ChevronDown size={14} className="text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3-Column Category Card Grid (Pixel-perfect matching screenshot) */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((item, index) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.4), duration: 0.25 }}
              className="bg-[#121319] border border-white/[0.08] hover:border-[#ff5c35]/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-xl group hover:shadow-[0_0_25px_rgba(255,92,53,0.08)]"
            >
              {/* Card Header: Icon, Title & Pill */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#231311] border border-[#ff5c35]/30 text-[#ff5c35] shrink-0">
                      {renderCategoryIcon(item.icon)}
                    </div>
                    <h2 className="font-bold text-white text-base tracking-tight">
                      {item.label}
                    </h2>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#231311] text-[#ff5c35] border border-[#ff5c35]/30 whitespace-nowrap">
                    {item.totalProducts || 0} {item.totalProducts === 1 ? 'product' : 'products'}
                  </span>
                </div>

                <p className="text-xs text-gray-400 mt-2.5 leading-relaxed min-h-[36px]">
                  {item.description}
                </p>
              </div>

              {/* 3 Rank Slots (Middle) */}
              <div className="space-y-2 my-4 flex-grow">
                {[1, 2, 3].map((slotNumber) => {
                  const rankedItem = item.topRankings?.find((r) => r.rank === slotNumber);

                  if (rankedItem) {
                    return (
                      <div
                        key={slotNumber}
                        className="flex items-center justify-between py-2.5 px-3.5 rounded-xl border border-white/10 bg-[#151722] hover:border-white/20 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xs font-mono font-bold text-white">#{slotNumber}</span>
                          <Link
                            to={`/project/${rankedItem.slug}`}
                            className="text-xs font-bold text-white hover:text-[#ff5c35] truncate transition-colors max-w-[130px]"
                          >
                            {rankedItem.name}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#ff5c35]">
                            ₹{Number(rankedItem.rankingValue).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // Empty Slot (Pixel-perfect to reference screenshot)
                  return (
                    <div
                      key={slotNumber}
                      className="flex items-center justify-between py-2 px-3 rounded-xl border border-white/[0.06] bg-[#0d0e13] hover:border-[#ff5c35]/30 hover:bg-[#151722] transition-colors group/slot"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-semibold text-gray-500">
                          #{slotNumber}
                        </span>
                        <span className="text-xs text-gray-400 italic font-mono">
                          Rank available
                        </span>
                      </div>

                      <Link
                        to={`/leaderboard?category=${item.category}#promote`}
                        className="flex items-center gap-1.5 text-xs font-medium text-[#ff5c35] hover:text-[#ff7550] transition-colors shrink-0"
                      >
                        <PlusCircle size={13} className="text-[#ff5c35] shrink-0" />
                        <span>Sponsor this category</span>
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* Card Footer: Full Category Board & + Add Product */}
              <div className="border-t border-white/[0.08] pt-3.5 flex items-center justify-between text-xs">
                <Link
                  to={`/leaderboard?category=${item.category}`}
                  className="text-gray-300 hover:text-white font-medium flex items-center gap-1 transition-colors"
                >
                  Full Category Board <ChevronRight size={13} className="text-gray-400" />
                </Link>

                <Link
                  to={`/leaderboard?category=${item.category}#promote`}
                  className="text-[#ff5c35] hover:text-[#ff7550] font-semibold flex items-center gap-1 transition-colors"
                >
                  + Add Product
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Empty Search State */
        <div className="py-20 text-center bg-[#121319] rounded-3xl border border-white/10 max-w-lg mx-auto p-8">
          <div className="w-12 h-12 rounded-full bg-[#231311] border border-[#ff5c35]/30 flex items-center justify-center mx-auto mb-4 text-[#ff5c35]">
            <Search size={20} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No categories match "{search}"</h3>
          <p className="text-xs text-text-muted mb-6">
            Try searching for another sector like AI, SaaS, Productivity, or Developer Tools.
          </p>
          <button
            onClick={() => setSearch('')}
            className="px-5 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 text-xs font-mono font-bold uppercase transition-colors"
          >
            Clear Search Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
