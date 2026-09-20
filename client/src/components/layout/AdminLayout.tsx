import { Outlet, Link, useLocation } from 'react-router';
import { Shield, Users, Folder, CreditCard, AlertTriangle, LayoutDashboard } from 'lucide-react';
import Navbar from './Navbar';

const AdminLayout = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Projects', path: '/admin/projects', icon: Folder },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Bids', path: '/admin/bids', icon: AlertTriangle },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />
      <div className="flex-grow flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="mb-6 px-4 py-3 bg-error/10 border border-error/20 rounded-lg flex items-center gap-2 text-error">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">Admin Panel</span>
          </div>
          <nav className="space-y-1 sticky top-24">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive ? 'bg-error/10 text-error' : 'text-text-muted hover:text-text hover:bg-elevated'
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

export default AdminLayout;
