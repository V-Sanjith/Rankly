import { Outlet, Link, useLocation } from 'react-router';
import { LayoutDashboard, Folder, History, BarChart3, Settings } from 'lucide-react';
import Navbar from './Navbar';

const DashboardLayout = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Projects', path: '/dashboard/projects', icon: Folder },
    { name: 'Bid History', path: '/dashboard/bids', icon: History },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />
      <div className="flex-grow flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
        <aside className="w-64 shrink-0 hidden md:block">
          <nav className="space-y-1 sticky top-24">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text hover:bg-elevated'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>
        
        <main className="flex-grow min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
