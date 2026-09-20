import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Gavel } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { adminService } from '../../services/admin.service';

export function AdminBids() {
  const [isLoading, setIsLoading] = useState(true);
  const [bids, setBids] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchBids = async () => {
      try {
        setIsLoading(true);
        const res = await adminService.getBids();
        if (isMounted && res.success) {
          setBids(res.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch admin bids', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchBids();
    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'ACTIVE':
        return <Badge variant="success">Confirmed</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      case 'CANCELLED':
      case 'FAILED':
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Bid Monitoring</h1>
        <p className="text-text-muted mt-1">Monitor all active and historical bids across the platform.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        {bids.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-elevated/50 border-b border-border text-text-muted text-sm">
                  <th className="p-4 font-medium">Bidder</th>
                  <th className="p-4 font-medium">Project</th>
                  <th className="p-4 font-medium">Amount (₹)</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((bid, i) => (
                  <motion.tr
                    key={bid.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border hover:bg-elevated/30 transition-colors"
                  >
                    <td className="p-4 font-medium text-text">
                      {bid.bidder?.name || bid.bidder?.email || 'User'}
                    </td>
                    <td className="p-4 text-text-muted">{bid.project?.name || 'Project'}</td>
                    <td className="p-4 font-semibold text-text">₹{Number(bid.amount)}</td>
                    <td className="p-4">{getStatusBadge(bid.status)}</td>
                    <td className="p-4 text-text-muted">
                      {new Date(bid.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={Gavel}
              title="No bids found"
              description="There are currently no bids in the system."
            />
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminBids;
