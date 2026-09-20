import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { IndianRupee } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { adminService } from '../../services/admin.service';

export function AdminPayments() {
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        const res = await adminService.getPayments();
        if (isMounted && res.success) {
          setPayments(res.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch admin payments', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchPayments();
    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <Badge variant="success">Paid</Badge>;
      case 'CREATED':
      case 'PENDING': return <Badge variant="warning">Pending</Badge>;
      case 'FAILED': return <Badge variant="error">Failed</Badge>;
      case 'REFUNDED': return <Badge variant="primary">Refunded</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
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
        <h1 className="text-2xl font-bold text-text">Payment Records</h1>
        <p className="text-text-muted mt-1">View and manage all platform transactions.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-elevated/50 border-b border-border text-text-muted text-sm">
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">Amount (₹)</th>
                  <th className="p-4 font-medium">Provider</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Payment ID</th>
                  <th className="p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, i) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border hover:bg-elevated/30 transition-colors"
                  >
                    <td className="p-4 font-medium text-text">
                      {payment.user?.name || payment.user?.email || 'User'}
                    </td>
                    <td className="p-4 font-semibold text-text">₹{Number(payment.amount)}</td>
                    <td className="p-4 text-text-muted">{payment.provider || 'RAZORPAY'}</td>
                    <td className="p-4">{getStatusBadge(payment.status)}</td>
                    <td className="p-4 text-text-muted font-mono text-xs">
                      {payment.providerPaymentId || payment.providerOrderId || payment.id}
                    </td>
                    <td className="p-4 text-text-muted">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={IndianRupee}
              title="No payments found"
              description="There are currently no payment records in the system."
            />
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminPayments;
