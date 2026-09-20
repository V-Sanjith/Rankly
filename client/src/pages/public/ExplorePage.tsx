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
  User,
  Box,
  Search,
  PlusCircle,
  ChevronRight,
} from 'lucide-react';
import { leaderboardService } from '../../services/leaderboard.service';
import { Spinner } from '../../components/ui/Spinner';

interface CategoryOverviewItem {
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
    case 'user':
      return <User {...iconProps} />;
    case 'box':
    default:
      return <Box {...iconProps} />;
  }
};

const ExplorePage = () => {
  const [categories, setCategories] = useState<CategoryOverviewItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const res = await leaderboardService.getCategoryOverview();
        if (isMounted && res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch category overview', err);
      } finally {
        if (isMounted) setIsLoading(false);
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

  return (
    <div className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-xs font-mono font-bold text-[#ff5c35] uppercase tracking-widest block mb-2">
            // CATEGORY DISCOVERY
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase text-white tracking-tight">
            Explore Categories<span className="text-[#ff5c35]">.</span>
          </h1>
          <p className="text-text-muted mt-2 text-sm sm:text-base max-w-2xl">
            Discover curated tech sectors, check current rankings, or sponsor available positions to elevate your product.
          </p>
        </div>

        {/* Search Input */}
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#ff5c35] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0f1015] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-text-muted/60 focus:border-[#ff5c35] focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-72 gap-3">
          <Spinner size="lg" />
          <p className="text-xs font-mono text-text-muted uppercase">Loading Category Matrix...</p>
        </div>
      ) : filteredCategories.length > 0 ? (
        /* 3-Column Category Card Grid matching screenshot */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((item, index) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
              className="bg-[#0f1015] border border-white/[0.08] hover:border-[#ff5c35]/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-xl group hover:shadow-[0_0_25px_rgba(255,92,53,0.08)]"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#231311] border border-[#ff5c35]/30 text-[#ff5c35] shrink-0">
                      {renderCategoryIcon(item.icon)}
                    </div>
                    <h2 className="font-bold text-white text-base sm:text-lg tracking-tight">
                      {item.label}
                    </h2>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#231311] text-[#ff5c35] border border-[#ff5c35]/30 whitespace-nowrap">
                    {item.totalProducts} {item.totalProducts === 1 ? 'product' : 'products'}
                  </span>
                </div>

                <p className="text-xs sm:text-[13px] text-gray-400 mt-2.5 leading-relaxed min-h-[38px]">
                  {item.description}
                </p>
              </div>

              {/* 3 Rank Slots (Middle) */}
              <div className="space-y-2.5 my-4 flex-grow">
                {[1, 2, 3].map((slotNumber) => {
                  const rankedItem = item.topRankings?.find((r) => r.rank === slotNumber);

                  if (rankedItem) {
                    return (
                      <div
                        key={slotNumber}
                        className="flex items-center justify-between py-2.5 px-3.5 rounded-xl border border-white/10 bg-[#141620] hover:border-white/20 transition-all"
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
                      className="flex items-center justify-between py-2.5 px-3.5 rounded-xl border border-white/[0.06] bg-[#121319] hover:border-[#ff5c35]/30 hover:bg-[#151722] transition-colors group/slot"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-semibold text-gray-400">
                          #{slotNumber}
                        </span>
                        <span className="text-xs sm:text-[13px] text-gray-400 italic">
                          Rank available
                        </span>
                      </div>

                      <Link
                        to={`/leaderboard?category=${item.category}#promote`}
                        className="flex items-center gap-1.5 text-xs sm:text-[13px] font-medium text-[#ff5c35] hover:text-[#ff7550] transition-colors shrink-0"
                      >
                        <PlusCircle size={14} className="text-[#ff5c35] shrink-0" />
                        <span>Sponsor this category</span>
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* Card Footer */}
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
        <div className="py-20 text-center bg-[#0f1015] rounded-3xl border border-white/10 max-w-lg mx-auto p-8">
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
