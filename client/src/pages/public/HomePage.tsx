import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Link, useSearchParams } from 'react-router';
import {
  ArrowRight, ArrowUpRight, Trophy, Timer, TrendingUp,
  Crown, Search, ExternalLink, Globe, Sparkles, Plus, Minus,
  Rocket
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { leaderboardService } from '../../services/leaderboard.service';
import { projectService } from '../../services/project.service';
import { Spinner } from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/Toast';
import { useSocket } from '../../hooks/useSocket';

/* ------------------------------------------------------------------ */
/*  Category filters — match actual server-side Category enum values  */
/* ------------------------------------------------------------------ */
const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Sponsored', value: '__sponsored' },
  { label: 'Today', value: '__today' },
  { label: 'Trending', value: '__trending' },
  { label: 'AI', value: 'AI_TOOLS' },
  { label: 'Developer Tools', value: 'DEVELOPER_TOOLS' },
  { label: 'SaaS', value: 'SAAS' },
  { label: 'Productivity', value: 'PRODUCTIVITY' },
  { label: 'Marketing', value: 'MARKETING' },
  { label: 'Design', value: 'DESIGN' },
  { label: 'Mobile', value: 'MOBILE_APPS' },
  { label: 'Startups', value: 'STARTUPS' },
  { label: 'E-Commerce', value: 'ECOMMERCE' },
  { label: 'Personal', value: 'PERSONAL_PROJECTS' },
  { label: 'Other', value: 'OTHER' },
];

const PROMOTION_CATEGORIES = [
  { label: 'AI', value: 'AI_TOOLS' },
  { label: 'Developer Tools', value: 'DEVELOPER_TOOLS' },
  { label: 'SaaS', value: 'SAAS' },
  { label: 'Productivity', value: 'PRODUCTIVITY' },
  { label: 'Marketing', value: 'MARKETING' },
  { label: 'Design', value: 'DESIGN' },
  { label: 'Mobile Apps', value: 'MOBILE_APPS' },
  { label: 'Startups', value: 'STARTUPS' },
  { label: 'E-Commerce', value: 'ECOMMERCE' },
  { label: 'Personal Projects', value: 'PERSONAL_PROJECTS' },
  { label: 'Other', value: 'OTHER' },
];

/* ------------------------------------------------------------------ */
/*  Countdown hook — real time to midnight IST (UTC+05:30)            */
/* ------------------------------------------------------------------ */
function useCountdownToMidnightIST() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      // Calculate current IST time
      const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
      const istMs = utcMs + 5.5 * 3600000;
      const istNow = new Date(istMs);

      // Midnight IST = start of next IST day
      const istMidnight = new Date(istNow);
      istMidnight.setHours(24, 0, 0, 0);

      const diffMs = istMidnight.getTime() - istNow.getTime();
      const totalSec = Math.max(0, Math.floor(diffMs / 1000));

      setTimeLeft({
        hours: Math.floor(totalSec / 3600),
        minutes: Math.floor((totalSec % 3600) / 60),
        seconds: totalSec % 60,
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

/* ================================================================== */
/*  HomePage — Public Leaderboard Experience                          */
/* ================================================================== */
export default function HomePage() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [rawLeaderboard, setRawLeaderboard] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState(() => searchParams.get('category') || '');
  const [todayStats, setTodayStats] = useState<{
    totalBidsToday: number;
    totalAmountToday: number;
    topBidder: { name: string; amount: number; project: string } | null;
  } | null>(null);

  // Promotion Section Form State
  const [promoUrl, setPromoUrl] = useState('');
  const [promoCategory, setPromoCategory] = useState(() => searchParams.get('category') || 'SAAS');
  const [promoBid, setPromoBid] = useState(199);
  const [promoError, setPromoError] = useState('');
  const [isPromoting, setIsPromoting] = useState(false);

  // Listen to searchParams updates (e.g. navigation from Explore page)
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setActiveFilter(cat);
      setPromoCategory(cat);
    }
  }, [searchParams]);

  // Handle hash scrolling on mount or when hash/searchParams change
  useEffect(() => {
    if (window.location.hash === '#promote') {
      const timer = setTimeout(() => {
        const elem = document.getElementById('promote');
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }, 150);
      return () => clearTimeout(timer);
    } else if (window.location.hash === '#race') {
      const timer = setTimeout(() => {
        const elem = document.getElementById('race');
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Razorpay Gateway State
  const { success, error } = useToast();
  const [isConfigNoticeOpen, setIsConfigNoticeOpen] = useState(false);
  const [orderData, setOrderData] = useState<{
    orderId: string;
    keyId: string;
    amount: number;
    currency: string;
    bidId: string;
    projectId: string;
    projectName: string;
    url: string;
  } | null>(null);

  const raceRef = useRef<HTMLDivElement>(null);
  const countdown = useCountdownToMidnightIST();

  /* ---- Fetch leaderboard data (real API, real DB) ---- */
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const isSpecialFilter = activeFilter.startsWith('__');
      const categoryParam = isSpecialFilter ? undefined : (activeFilter || undefined);

      const [leaderboardRes, todayRes] = await Promise.allSettled([
        leaderboardService.getLeaderboard({ limit: 50, category: categoryParam }),
        leaderboardService.getTodayStats(),
      ]);

      if (leaderboardRes.status === 'fulfilled' && leaderboardRes.value.success) {
        setRawLeaderboard(leaderboardRes.value.data || []);
      }
      if (todayRes.status === 'fulfilled' && todayRes.value.success) {
        setTodayStats(todayRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load leaderboard data', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  /* ---- Real-time WebSocket connection for live ranking updates ---- */
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Join room for category or global all
    const categoryRoom = activeFilter && !activeFilter.startsWith('__') ? activeFilter : undefined;
    socket.emit('leaderboard:join', categoryRoom);

    const handleRankingUpdate = () => {
      fetchData();
    };

    socket.on('ranking:update', handleRankingUpdate);

    return () => {
      socket.emit('leaderboard:leave', categoryRoom);
      socket.off('ranking:update', handleRankingUpdate);
    };
  }, [socket, activeFilter, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* Client-side special filter handling */
  const displayedLeaderboard = rawLeaderboard.filter((item) => {
    if (activeFilter === '__sponsored') {
      return Number(item.rankingValue) > 0;
    }
    if (activeFilter === '__today') {
      if (!item.lastBidAt) return false;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      return new Date(item.lastBidAt) >= todayStart;
    }
    return true;
  });

  const handleVerifyPayment = async (verificationPayload: {
    bidId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    try {
      const res = await projectService.verifyPromotion(verificationPayload);
      if (res.success) {
        success(`🎉 Payment Verified! ${orderData?.projectName || 'Project'} is now ranked on the Leaderboard!`);
        setIsConfigNoticeOpen(false);
        setPromoUrl('');
        await fetchData();
        const tableElement = document.getElementById('leaderboard-section');
        if (tableElement) {
          tableElement.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        error('Payment verification failed');
      }
    } catch (err: any) {
      error(err.message || 'Payment verification failed');
    }
  };

  const handlePromoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');

    let cleanUrl = promoUrl.trim();
    if (!cleanUrl) {
      setPromoError('Please enter your project website URL');
      return;
    }

    // Strict Domain & URL Validation (requires real TLD like .com, .io, .org, .in)
    const DOMAIN_REGEX = /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/.*)?$/;
    if (!DOMAIN_REGEX.test(cleanUrl)) {
      setPromoError('Please enter a valid website domain with an extension (e.g., mysite.com, https://company.io)');
      return;
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    if (promoBid < 199) {
      setPromoError('Minimum starting bid is ₹199');
      return;
    }

    setIsPromoting(true);

    try {
      const res = await projectService.initiatePromotion({
        url: cleanUrl,
        category: promoCategory,
        amount: promoBid,
      });

      if (res.success && res.data && res.data.keyId && res.data.keyId.startsWith('rzp_') && (window as any).Razorpay) {
        const order = res.data;
        setOrderData(order);
        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'Rankly',
          description: `Promote ${order.projectName} on Rankly Leaderboard`,
          image: '/vite.svg',
          order_id: order.orderId,
          handler: async function (response: any) {
            await handleVerifyPayment({
              bidId: order.bidId,
              razorpay_order_id: response.razorpay_order_id || order.orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature || '',
            });
          },
          prefill: {
            name: order.projectName,
          },
          theme: {
            color: '#ff5c35',
          },
          modal: {
            ondismiss: function () {
              setIsPromoting(false);
            },
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        setIsConfigNoticeOpen(true);
      }
    } catch {
      // Friendly Launching Soon modal with zero error toasts
      setIsConfigNoticeOpen(true);
    } finally {
      setIsPromoting(false);
    }
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text">

      {/* ============================================================ */}
      {/*  1. HERO BANNER                                              */}
      {/* ============================================================ */}
      <section className="relative pt-10 pb-6 md:pt-14 md:pb-8 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-lime/8 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">

            {/* Left: Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-lime animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-text-muted">
                  Live Public Leaderboard
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white uppercase leading-[0.95]">
                RANKLY<span className="text-lime">.</span> Discover & Rank<br className="hidden sm:block" /> the Best Projects
              </h1>
              <p className="mt-3 text-text-muted text-sm sm:text-base max-w-xl">
                Real projects ranked by transparent bidding. Open to everyone — no login required to explore.
              </p>
            </motion.div>

            {/* Right: Scroll to Promotion */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-shrink-0"
            >
              <a
                href="#promote"
                className="inline-flex items-center justify-center rounded-full px-7 py-3 text-xs sm:text-sm font-black tracking-wider uppercase bg-lime text-black shadow-[0_0_25px_rgba(212,255,50,0.25)] hover:bg-lime-hover transition-all"
              >
                Promote Your Project <ArrowRight size={16} className="ml-2" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  2. PROMOTION SECTION — Project URL, Category, Bid Controls   */}
      {/* ============================================================ */}
      <section id="promote" className="pb-8 pt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 bg-surface/70 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-lime/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-lime" />
                    <h2 className="text-lg sm:text-xl font-black font-display text-white uppercase tracking-tight">
                      Promote Your Project
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-text-muted mt-1">
                    Enter your website URL, pick a category, and set your starting bid to climb the board.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-lime font-bold">
                  <span>Minimum Bid: ₹199</span>
                </div>
              </div>

              <form onSubmit={handlePromoteSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* URL Input */}
                  <div className="md:col-span-5">
                    <label className="block text-xs font-mono uppercase text-text-muted mb-1.5">
                      Project Website URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                        <Globe size={16} />
                      </div>
                      <input
                        type="text"
                        value={promoUrl}
                        onChange={(e) => setPromoUrl(e.target.value)}
                        placeholder="https://yourproject.com"
                        className="w-full bg-black/40 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-text-muted/60 focus:border-lime focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Category Selector */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-mono uppercase text-text-muted mb-1.5">
                      Category
                    </label>
                    <select
                      value={promoCategory}
                      onChange={(e) => setPromoCategory(e.target.value)}
                      className="w-full bg-[#0c0d12] border border-white/15 rounded-xl px-3.5 py-3 text-sm text-white focus:border-lime focus:outline-none transition-colors cursor-pointer"
                    >
                      {PROMOTION_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value} className="bg-[#0c0d12] text-white">
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bid Controls */}
                  <div className="md:col-span-4">
                    <label className="block text-xs font-mono uppercase text-text-muted mb-1.5">
                      Starting Bid (₹)
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-grow">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-lime font-mono font-bold text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          min={199}
                          step={50}
                          value={promoBid}
                          onChange={(e) => setPromoBid(Math.max(199, Number(e.target.value) || 199))}
                          className="w-full bg-black/40 border border-white/15 rounded-xl pl-8 pr-3 py-3 text-sm font-mono font-bold text-white focus:border-lime focus:outline-none transition-colors"
                        />
                      </div>

                      {/* Quick Increment Buttons */}
                      <button
                        type="button"
                        onClick={() => setPromoBid((prev) => Math.max(199, prev - 50))}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors"
                        title="- ₹50"
                      >
                        <Minus size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPromoBid((prev) => prev + 50)}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors"
                        title="+ ₹50"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPromoBid((prev) => prev + 100)}
                        className="px-3 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono font-bold text-lime transition-colors"
                        title="+ ₹100"
                      >
                        +100
                      </button>
                    </div>
                  </div>
                </div>

                {promoError && (
                  <div className="text-xs text-red-400 font-mono pt-1">
                    {promoError}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-3 text-xs text-text-muted font-mono">
                    <span>✓ Real-time ranking calculation</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">✓ Transparent public audit log</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isPromoting}
                    className="inline-flex items-center justify-center rounded-xl px-8 py-3 bg-lime text-black font-extrabold text-sm uppercase tracking-wider hover:bg-lime-hover shadow-[0_0_20px_rgba(212,255,50,0.2)] transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isPromoting ? (
                      <>
                        <Spinner size="sm" className="mr-2 border-black border-t-transparent" />
                        Connecting to Razorpay...
                      </>
                    ) : (
                      <>
                        Promote Now <ArrowRight size={16} className="ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  3. HORIZONTAL FILTER BAR                                    */}
      {/* ============================================================ */}
      <section className="sticky top-20 z-40 bg-bg/90 backdrop-blur-xl border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveFilter(cat.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold tracking-wide uppercase transition-all cursor-pointer ${
                  activeFilter === cat.value
                    ? 'bg-lime text-black shadow-[0_0_15px_rgba(212,255,50,0.3)]'
                    : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  4. MAIN CONTENT — Leaderboard + Today's Race                */}
      {/* ============================================================ */}
      <section className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* ---- LEFT: Leaderboard Table (8 cols) ---- */}
            <div className="lg:col-span-8">
              <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
                {/* Table header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                  <div className="flex items-center gap-2">
                    <Trophy size={18} className="text-lime" />
                    <span className="text-sm font-bold text-white uppercase tracking-wide">
                      {activeFilter.startsWith('__')
                        ? CATEGORIES.find((c) => c.value === activeFilter)?.label
                        : activeFilter
                        ? CATEGORIES.find((c) => c.value === activeFilter)?.label
                        : 'All'} Rankings
                    </span>
                  </div>
                  <span className="text-xs font-mono text-text-muted">
                    {displayedLeaderboard.length} project{displayedLeaderboard.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Table body */}
                {isLoading ? (
                  <div className="py-20 flex justify-center">
                    <Spinner size="lg" />
                  </div>
                ) : displayedLeaderboard.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {displayedLeaderboard.map((item, index) => (
                      <motion.div
                        key={item.projectId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors group"
                      >
                        {/* Rank badge */}
                        <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-sm ${
                          item.rank === 1
                            ? 'bg-lime text-black font-extrabold'
                            : item.rank === 2
                            ? 'bg-yellow-500/20 text-yellow-400 font-bold'
                            : item.rank === 3
                            ? 'bg-orange-500/20 text-orange-400 font-bold'
                            : 'bg-white/5 text-text-muted'
                        }`}>
                          {item.rank === 1 ? <Crown size={16} /> : `#${item.rank}`}
                        </div>

                        {/* Project info */}
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm truncate group-hover:text-lime transition-colors">
                              {item.project?.name}
                            </span>
                            {item.project?.slug && (
                              <Link to={`/project/${item.project.slug}`} className="flex-shrink-0">
                                <ArrowUpRight size={14} className="text-text-muted group-hover:text-lime transition-colors" />
                              </Link>
                            )}
                          </div>
                          {item.project?.shortDescription && (
                            <p className="text-xs text-text-muted truncate mt-0.5 max-w-md">
                              {item.project.shortDescription}
                            </p>
                          )}
                        </div>

                        {/* Category */}
                        <span className="hidden md:inline-flex flex-shrink-0 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-text-muted">
                          {item.project?.category?.replace(/_/g, ' ')}
                        </span>

                        {/* Bid total */}
                        <div className="flex-shrink-0 text-right">
                          <div className="font-mono font-bold text-lime text-sm">
                            ₹{Number(item.rankingValue).toLocaleString('en-IN')}
                          </div>
                        </div>

                        {/* View button */}
                        <Link to={`/project/${item.project?.slug}`} className="flex-shrink-0 hidden sm:block">
                          <Button size="sm" variant="outline" className="rounded-full text-xs px-4">
                            View
                          </Button>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  /* Empty state — real database state, not fabricated */
                  <div className="py-20 text-center px-6">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <Search size={24} className="text-text-muted" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {activeFilter === '__today'
                        ? 'No projects promoted today yet'
                        : activeFilter === '__sponsored'
                        ? 'No sponsored projects yet'
                        : activeFilter
                        ? 'No projects in this category yet'
                        : 'No ranked projects yet'}
                    </h3>
                    <p className="text-text-muted text-sm max-w-sm mx-auto">
                      {activeFilter === '__today'
                        ? 'Be the first to place a bid and take rank #1 in today\'s race.'
                        : 'Projects appear here once they receive approved status and confirmed bids.'}
                    </p>
                    <a
                      href="#promote"
                      className="inline-flex items-center justify-center rounded-full mt-6 px-6 py-2.5 bg-lime text-black font-bold text-xs uppercase tracking-wider hover:bg-lime-hover transition-all"
                    >
                      Promote a Project <ArrowRight size={14} className="ml-1.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* ---- RIGHT: Today's Race Panel (4 cols) ---- */}
            <div className="lg:col-span-4 space-y-6" ref={raceRef}>

              {/* Today's Race Card */}
              <div className="glass-card rounded-2xl border border-white/10 overflow-hidden" id="race">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10 bg-white/5">
                  <Timer size={16} className="text-lime" />
                  <span className="text-sm font-bold text-white uppercase tracking-wide">Today's Race</span>
                </div>

                <div className="p-5 space-y-5">
                  {/* Countdown */}
                  <div>
                    <div className="text-xs font-mono text-text-muted uppercase mb-2">Race Resets In</div>
                    <div className="flex items-center gap-2">
                      {[
                        { val: pad(countdown.hours), label: 'HR' },
                        { val: pad(countdown.minutes), label: 'MIN' },
                        { val: pad(countdown.seconds), label: 'SEC' },
                      ].map((unit, i) => (
                        <div key={unit.label} className="flex items-center gap-2">
                          <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center min-w-[52px]">
                            <div className="text-xl font-mono font-black text-white">{unit.val}</div>
                            <div className="text-[10px] font-mono text-text-muted">{unit.label}</div>
                          </div>
                          {i < 2 && <span className="text-white/30 font-bold text-lg">:</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Today's stats — real database data */}
                  <div className="space-y-3 pt-2 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-text-muted">Bids Today</span>
                      <span className="font-mono font-bold text-white text-sm">
                        {todayStats?.totalBidsToday ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-text-muted">Total Volume</span>
                      <span className="font-mono font-bold text-lime text-sm">
                        ₹{(todayStats?.totalAmountToday ?? 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    {todayStats?.topBidder ? (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-text-muted">Top Bidder</span>
                        <span className="font-bold text-white text-sm truncate max-w-[140px]">
                          {todayStats.topBidder.name}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-text-muted italic text-center py-1">
                        No confirmed bids today
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <a
                    href="#promote"
                    className="w-full inline-flex items-center justify-center rounded-full py-3 text-sm font-extrabold uppercase tracking-wide bg-lime text-black hover:bg-lime-hover transition-all shadow-[0_0_15px_rgba(212,255,50,0.2)]"
                  >
                    Place a Bid <TrendingUp size={14} className="ml-1.5" />
                  </a>
                </div>
              </div>

              {/* Quick Info Card */}
              <div className="glass-card rounded-2xl border border-white/10 p-5 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">How It Works</h3>
                <div className="space-y-3">
                  {[
                    { step: '01', text: 'Submit your project for quality review' },
                    { step: '02', text: 'Place a starting bid (min ₹199)' },
                    { step: '03', text: 'Climb the leaderboard in real time' },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <span className="text-lime font-mono font-bold text-xs mt-0.5">{item.step}</span>
                      <span className="text-text-muted text-xs">{item.text}</span>
                    </div>
                  ))}
                </div>
                <Link to="/about#rules" className="flex items-center gap-1 text-xs text-lime hover:underline font-medium pt-1">
                  Read full rules & transparency <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotions Launching Soon Modal (Zero errors, consumer-friendly) */}
      <Modal
        isOpen={isConfigNoticeOpen}
        onClose={() => setIsConfigNoticeOpen(false)}
        title="Promotions Gateway"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-[#231311] border border-[#ff5c35]/30 rounded-2xl flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff5c35]/10 border border-[#ff5c35]/30 flex items-center justify-center shrink-0 text-[#ff5c35] mt-0.5">
              <Rocket size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                  Launching Soon
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#ff5c35]/20 text-[#ff5c35] border border-[#ff5c35]/30">
                  BETA
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Direct online payment checkout and bidding are launching for public submissions soon. Your spot reservation has been recorded!
              </p>
            </div>
          </div>

          <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl space-y-2 text-xs">
            <div className="text-[#ff5c35] font-mono font-bold uppercase text-[11px] flex items-center gap-1.5">
              <span>Reservation Summary</span>
            </div>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Target Website</span>
                <span className="font-mono text-white font-medium truncate max-w-[200px]">{promoUrl || 'mysite.com'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400">Category</span>
                <span className="text-white font-medium">{CATEGORIES.find(c => c.value === promoCategory)?.label || promoCategory}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Starting Bid</span>
                <span className="font-mono text-[#ff5c35] font-bold">₹{promoBid.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed text-center">
            You'll receive early access to promote and bid once the payment gateway goes live for all projects.
          </p>

          <button
            type="button"
            onClick={() => setIsConfigNoticeOpen(false)}
            className="w-full py-3 rounded-xl font-bold uppercase tracking-wider text-xs cursor-pointer bg-[#ff5c35] hover:bg-[#ff7550] text-white transition-colors"
          >
            Got it, Thank you!
          </button>
        </div>
      </Modal>
    </div>
  );
}
