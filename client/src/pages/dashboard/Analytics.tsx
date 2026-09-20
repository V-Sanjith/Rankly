import { useEffect, useState } from 'react';
import { Eye, MousePointerClick, TrendingUp, Trophy } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Stat } from '../../components/ui/Stat';
import { Spinner } from '../../components/ui/Spinner';
import { analyticsService } from '../../services/analytics.service';

export function Analytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalBids: 0,
    totalViews: 0,
    totalClicks: 0,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const res = await analyticsService.getDashboardOverview();
        if (isMounted && res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  const ctr = stats.totalViews > 0
    ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(1) + '%'
    : '0%';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const hasData = stats.totalViews > 0 || stats.totalClicks > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Analytics</h1>
          <p className="text-text-muted mt-1">Real-time performance metrics for your projects.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat label="Total Views" value={stats.totalViews} icon={Eye} variant="secondary" />
        <Stat label="Total Clicks" value={stats.totalClicks} icon={MousePointerClick} variant="success" />
        <Stat label="Avg CTR" value={ctr} icon={TrendingUp} variant="primary" />
        <Stat label="Active Projects" value={stats.activeProjects} icon={Trophy} variant="warning" />
      </div>

      {hasData ? (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Traffic Summary</h3>
          <div className="p-6 bg-elevated rounded-lg border border-border space-y-4">
            <div className="flex justify-between items-center border-b border-border/50 pb-3">
              <span className="text-text-muted">Total Recorded Views</span>
              <span className="font-bold text-text text-lg">{stats.totalViews}</span>
            </div>
            <div className="flex justify-between items-center border-b border-border/50 pb-3">
              <span className="text-text-muted">Total Outbound Clicks</span>
              <span className="font-bold text-text text-lg">{stats.totalClicks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Click-Through Rate (CTR)</span>
              <span className="font-bold text-primary text-lg">{ctr}</span>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center space-y-4">
          <TrendingUp size={48} className="mx-auto text-text-muted opacity-40" />
          <h3 className="text-lg font-semibold text-text">No Analytics Data Yet</h3>
          <p className="text-text-muted max-w-md mx-auto text-sm">
            Your performance data will appear here once your project starts receiving visitors.
          </p>
        </Card>
      )}
    </div>
  );
}

export default Analytics;
