import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Check, X, Eye, Folder } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { adminService } from '../../services/admin.service';

export function AdminProjects() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const { success, error } = useToast();

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getProjects();
      if (res.success) {
        setProjects(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = projects.filter(
    (p) => filter === 'ALL' || p.status === filter
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="success">Approved</Badge>;
      case 'PENDING_REVIEW':
      case 'PENDING':
        return <Badge variant="warning">Pending Review</Badge>;
      case 'REJECTED':
        return <Badge variant="error">Rejected</Badge>;
      case 'SUSPENDED':
        return <Badge variant="error">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleAction = async (id: string, status: string) => {
    try {
      const res = await adminService.updateProjectStatus(id, status);
      if (res.success) {
        success(`Project status updated to ${status}`);
        loadProjects();
      }
    } catch (err: any) {
      error(err.message || 'Failed to update status');
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
        <h1 className="text-2xl font-bold text-text">Project Management</h1>
        <p className="text-text-muted mt-1">Review and manage platform projects.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {['ALL', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === status
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-muted hover:bg-elevated hover:text-text'
                }`}
              >
                {status === 'ALL'
                  ? 'All Projects'
                  : status === 'PENDING_REVIEW'
                  ? 'Pending'
                  : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-elevated/50 border-b border-border text-text-muted text-sm">
                  <th className="p-4 font-medium">Project Name</th>
                  <th className="p-4 font-medium">Owner</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Submitted Date</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project, i) => (
                  <motion.tr
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border hover:bg-elevated/30 transition-colors"
                  >
                    <td className="p-4 font-medium text-text">{project.name}</td>
                    <td className="p-4 text-text-muted">{project.owner?.email || 'User'}</td>
                    <td className="p-4 text-text-muted">{project.category}</td>
                    <td className="p-4">{getStatusBadge(project.status)}</td>
                    <td className="p-4 text-text-muted">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          onClick={() => navigate(`/project/${project.slug}`)}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </Button>
                        {project.status === 'PENDING_REVIEW' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="p-2 text-success hover:bg-success/10 hover:border-success/50"
                              onClick={() => handleAction(project.id, 'APPROVED')}
                              title="Approve"
                            >
                              <Check size={16} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="p-2 text-error hover:bg-error/10 hover:border-error/50"
                              onClick={() => handleAction(project.id, 'REJECTED')}
                              title="Reject"
                            >
                              <X size={16} />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={Folder}
              title="No projects found"
              description="There are currently no projects matching this filter."
            />
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminProjects;
