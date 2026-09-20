import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Gavel, ArrowDownUp } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { bidService } from '../../services/bid.service';

export function BidHistory() {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [bids, setBids] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchBids = async () => {
      try {
        setIsLoading(true);
        const res = await bidService.getMyBids();
        if (isMounted && res.success) {
          setBids(res.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch user bids', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchBids();
    return () => {
      isMounted = false;
    };
  }, []);

  const sortedBids = [...bids].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'PAID':
        return <Badge variant="success">Confirmed</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      case 'CANCELLED':
      case 'FAILED':
        return <Badge variant="error">Failed</Badge>;
      case 'REFUNDED':
        return <Badge variant="secondary">Refunded</Badge>;
      default:
        return <Badge variant="primary">{status}</Badge>;
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
        <h1 className="text-2xl font-bold text-text">Bid History</h1>
        <p className="text-text-muted mt-1">Track your ranking bids and payments.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        {sortedBids.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-elevated/50 border-b border-border text-text-muted text-sm">
                  <th className="p-4 font-medium">Project Name</th>
                  <th className="p-4 font-medium">Amount (₹)</th>
                  <th className="p-4 font-medium">Status</th>
                  <th
                    className="p-4 font-medium cursor-pointer hover:text-text transition-colors flex items-center gap-1"
                    onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                  >
                    Date <ArrowDownUp size={14} />
                  </th>
                  <th className="p-4 font-medium">Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {sortedBids.map((bid, i) => (
                  <motion.tr
                    key={bid.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border hover:bg-elevated/30 transition-colors"
                  >
                    <td className="p-4 font-medium text-text">
                      {bid.project?.name || 'Project'}
                    </td>
                    <td className="p-4 font-semibold text-text">₹{Number(bid.amount)}</td>
                    <td className="p-4">{getStatusBadge(bid.status)}</td>
                    <td className="p-4 text-text-muted">
                      {new Date(bid.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-text-muted font-mono text-xs">
                      {bid.payment?.providerPaymentId || bid.id}
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
              description="You haven't placed any bids to boost your projects yet."
            />
          </div>
        )}
      </Card>
    </div>
  );
}

export default BidHistory;
