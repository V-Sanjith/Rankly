import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Folder, Gavel, Eye, MousePointerClick, TrendingUp, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Stat } from '../../components/ui/Stat';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { analyticsService } from '../../services/analytics.service';
import { Spinner } from '../../components/ui/Spinner';

export function DashboardOverview() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalProjects: number;
    activeBids?: number;
    activeProjects?: number;
    totalBids?: number;
    totalViews: number;
    totalClicks: number;
  }>({
    totalProjects: 0,
    activeBids: 0,
    totalViews: 0,
    totalClicks: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [overviewRes, activityRes] = await Promise.allSettled([
          analyticsService.getDashboardOverview(),
          analyticsService.getUserActivity(),
        ]);

        if (isMounted) {
          if (overviewRes.status === 'fulfilled' && overviewRes.value.success) {
            setStats(overviewRes.value.data);
          }
          if (activityRes.status === 'fulfilled' && activityRes.value.success) {
            setActivities(activityRes.value.data || []);
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard overview data', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const userName = user?.name || 'Founder';

  const statCards = [
    { label: 'Total Projects', value: stats.totalProjects, icon: Folder, variant: 'primary' as const },
    { label: 'Active Bids', value: stats.activeBids || 0, icon: Gavel, variant: 'warning' as const },
    { label: 'Total Views', value: stats.totalViews, icon: Eye, variant: 'secondary' as const },
    { label: 'Total Clicks', value: stats.totalClicks, icon: MousePointerClick, variant: 'success' as const },
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
          <h1 className="text-2xl font-bold text-text">Welcome back, {userName}! 👋</h1>
          <p className="text-text-muted mt-1">Here is what is happening with your projects today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/dashboard/analytics')}>
            View Analytics
          </Button>
          <Button variant="primary" onClick={() => navigate('/dashboard/projects/submit')}>
            + Submit Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Stat {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text">Performance Overview</h3>
            <Link to="/dashboard/analytics" className="text-sm text-primary hover:text-primary-hover">
              View full report
            </Link>
          </div>
          <div className="h-64 flex items-center justify-center border border-border/50 rounded-lg bg-elevated/50 p-6 text-center">
            {stats.totalViews > 0 || stats.totalClicks > 0 ? (
              <div className="space-y-2">
                <TrendingUp size={36} className="mx-auto text-primary" />
                <p className="text-text font-medium">{stats.totalViews} total views across your projects</p>
                <p className="text-sm text-text-muted">{stats.totalClicks} outbound clicks received</p>
              </div>
            ) : (
              <div className="text-center text-text-muted max-w-sm">
                <TrendingUp size={32} className="mx-auto mb-2 opacity-50" />
                <p className="font-medium text-text">No traffic recorded yet</p>
                <p className="text-xs text-text-muted mt-1">
                  Your performance data will appear here once your project starts receiving visitors.
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text">Recent Activity</h3>
          </div>
          <div className="flex-1 space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 items-start border-b border-border/40 pb-3 last:border-0">
                  <div className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm text-text font-medium">
                      {activity.action.replace(/_/g, ' ')} ({activity.entityType})
                    </p>
                    <div className="flex items-center text-xs text-text-muted mt-1">
                      <Clock size={12} className="mr-1" />
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-text-muted text-sm">
                No recent activity yet.
              </div>
            )}
          </div>
          <Button variant="outline" className="w-full mt-6" onClick={() => navigate('/dashboard/bids')}>
            View All Bids
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default DashboardOverview;
