import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { adminService } from '../../services/admin.service';

export function AdminUsers() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const res = await adminService.getUsers();
        if (isMounted && res.success) {
          setUsers(res.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusBadge = (status: string) => {
    return status === 'ACTIVE' ? (
      <Badge variant="success">Active</Badge>
    ) : (
      <Badge variant="error">Suspended</Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    return role === 'ADMIN' ? (
      <Badge variant="primary">Admin</Badge>
    ) : (
      <Badge variant="secondary">User</Badge>
    );
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
        <h1 className="text-2xl font-bold text-text">User Management</h1>
        <p className="text-text-muted mt-1">Manage user accounts and permissions.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-elevated/50 border-b border-border text-text-muted text-sm">
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border hover:bg-elevated/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} size="sm" />
                        <div>
                          <p className="font-medium text-text">{user.name}</p>
                          <p className="text-xs text-text-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{getRoleBadge(user.role)}</td>
                    <td className="p-4">{getStatusBadge(user.status || 'ACTIVE')}</td>
                    <td className="p-4 text-text-muted">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState icon={Users} title="No users found" description="No users are currently registered." />
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminUsers;
