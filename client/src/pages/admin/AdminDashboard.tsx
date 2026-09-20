import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, Folder, AlertCircle, Gavel, IndianRupee } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Stat } from '../../components/ui/Stat';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { adminService } from '../../services/admin.service';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    pendingReviews: 0,
    activeBids: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const res = await adminService.getDashboardStats();
        if (isMounted && res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, variant: 'primary' as const },
    { label: 'Total Projects', value: stats.totalProjects, icon: Folder, variant: 'secondary' as const },
    { label: 'Pending Reviews', value: stats.pendingReviews, icon: AlertCircle, variant: 'warning' as const },
    { label: 'Active Bids', value: stats.activeBids, icon: Gavel, variant: 'primary' as const },
    { label: 'Revenue (₹)', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, variant: 'success' as const },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Admin Dashboard</h1>
          <p className="text-text-muted mt-1">Platform overview and management.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/admin/reports')}>
            View Audit Logs
          </Button>
          <Button variant="primary" onClick={() => navigate('/admin/projects')}>
            Review Projects
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Stat {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text">Quick Links</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <Link to="/admin/projects" className="p-4 bg-elevated rounded-lg border border-border hover:border-primary transition-colors flex flex-col items-center justify-center text-center gap-2 group">
              <Folder className="text-text-muted group-hover:text-primary transition-colors" size={24} />
              <span className="font-medium text-text">Manage Projects</span>
            </Link>
            <Link to="/admin/users" className="p-4 bg-elevated rounded-lg border border-border hover:border-primary transition-colors flex flex-col items-center justify-center text-center gap-2 group">
              <Users className="text-text-muted group-hover:text-primary transition-colors" size={24} />
              <span className="font-medium text-text">Manage Users</span>
            </Link>
            <Link to="/admin/bids" className="p-4 bg-elevated rounded-lg border border-border hover:border-primary transition-colors flex flex-col items-center justify-center text-center gap-2 group">
              <Gavel className="text-text-muted group-hover:text-primary transition-colors" size={24} />
              <span className="font-medium text-text">Monitor Bids</span>
            </Link>
            <Link to="/admin/payments" className="p-4 bg-elevated rounded-lg border border-border hover:border-primary transition-colors flex flex-col items-center justify-center text-center gap-2 group">
              <IndianRupee className="text-text-muted group-hover:text-primary transition-colors" size={24} />
              <span className="font-medium text-text">Payments</span>
            </Link>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text">System Status</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="font-medium text-text">Main API</span>
              </div>
              <span className="text-success text-sm font-medium">Operational</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="font-medium text-text">Database</span>
              </div>
              <span className="text-success text-sm font-medium">Operational</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="font-medium text-text">Payment Gateway</span>
              </div>
              <span className="text-success text-sm font-medium">Operational</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;
