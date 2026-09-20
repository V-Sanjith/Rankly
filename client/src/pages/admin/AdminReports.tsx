import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { FileText } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { adminService } from '../../services/admin.service';

export function AdminReports() {
  const [filter, setFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const res = await adminService.getAuditLogs();
        if (isMounted && res.success) {
          setLogs(res.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch audit logs', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchLogs();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'ALL') return true;
    return (log.action || '').includes(filter);
  });

  const getActionBadge = (action: string) => {
    if (action.includes('PROJECT')) return <Badge variant="primary">{action}</Badge>;
    if (action.includes('BID')) return <Badge variant="success">{action}</Badge>;
    if (action.includes('SUSPENDED') || action.includes('REJECTED')) return <Badge variant="error">{action}</Badge>;
    if (action.includes('LOGIN') || action.includes('SETTINGS')) return <Badge variant="secondary">{action}</Badge>;
    return <Badge variant="warning">{action}</Badge>;
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
        <h1 className="text-2xl font-bold text-text">Audit Logs & Reports</h1>
        <p className="text-text-muted mt-1">System-wide activity and security logs.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {['ALL', 'PROJECT', 'BID', 'USER'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === type
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-muted hover:bg-elevated hover:text-text'
                }`}
              >
                {type === 'ALL' ? 'All Activity' : `${type} Events`}
              </button>
            ))}
          </div>
        </div>

        {filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-elevated/50 border-b border-border text-text-muted text-sm">
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">Action</th>
                  <th className="p-4 font-medium">Entity</th>
                  <th className="p-4 font-medium">Date & Time</th>
                  <th className="p-4 font-medium">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, i) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border hover:bg-elevated/30 transition-colors"
                  >
                    <td className="p-4 font-medium text-text">
                      {log.user?.name || log.user?.email || 'System'}
                    </td>
                    <td className="p-4">{getActionBadge(log.action || 'ACTION')}</td>
                    <td className="p-4 text-text-muted">{log.entityType} ({log.entityId})</td>
                    <td className="p-4 text-text-muted font-mono text-sm">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-text-muted font-mono text-sm">{log.ipAddress || '127.0.0.1'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={FileText}
              title="No logs found"
              description="No audit activity matches your current filters."
            />
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminReports;
