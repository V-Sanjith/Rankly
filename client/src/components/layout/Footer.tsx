import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className="bg-[#050508] border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">

          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-1.5 mb-4">
              <span className="font-display text-xl font-black tracking-tight text-white">RANKLY</span>
              <span className="w-2 h-2 rounded-full bg-lime shadow-[0_0_8px_#d4ff32]" />
            </Link>
            <p className="text-text-muted text-sm max-w-sm leading-relaxed">
              Discover, rank, and promote the best projects through transparent bidding. No hidden algorithms, no subscriptions.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4">Product</h4>
            <ul className="space-y-2.5">
              <li><Link to="/" className="text-sm text-text-muted hover:text-white transition-colors">Leaderboard</Link></li>
              <li><Link to="/explore" className="text-sm text-text-muted hover:text-white transition-colors">Explore</Link></li>
              <li><Link to="/categories" className="text-sm text-text-muted hover:text-white transition-colors">Categories</Link></li>
              <li><Link to="/pricing" className="text-sm text-text-muted hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li><Link to="/about" className="text-sm text-text-muted hover:text-white transition-colors">About</Link></li>
              <li><Link to="/about" className="text-sm text-text-muted hover:text-white transition-colors">Transparency</Link></li>
              <li><a href="#" className="text-sm text-text-muted hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-text-muted hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Rankly Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-text-muted">
            <Link to="/" className="hover:text-white transition-colors">Leaderboard</Link>
            <Link to="/explore" className="hover:text-white transition-colors">Explore</Link>
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
