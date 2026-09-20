import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Folder, MoreVertical,  Eye } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { Dropdown } from '../../components/ui/Dropdown';
import { Spinner } from '../../components/ui/Spinner';
import { projectService } from '../../services/project.service';

export function MyProjects() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const res = await projectService.getMyProjects();
        if (isMounted && res.success) {
          setProjects(res.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch user projects', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProjects = projects.filter((p) => {
    if (filter !== 'ALL' && p.status !== filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">My Projects</h1>
          <p className="text-text-muted mt-1">Manage and track your submitted projects.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/dashboard/projects/submit')}>
          <Plus size={18} className="mr-2" /> New Project
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {['ALL', 'APPROVED', 'PENDING_REVIEW', 'REJECTED'].map((status) => (
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
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-elevated/50 border-b border-border text-text-muted text-sm">
                  <th className="p-4 font-medium">Project Name</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Date Submitted</th>
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
                    <td className="p-4">{getStatusBadge(project.status)}</td>
                    <td className="p-4 text-text-muted">{project.category}</td>
                    <td className="p-4 text-text-muted">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Dropdown
                        align="right"
                        trigger={
                          <button className="p-2 text-text-muted hover:text-text hover:bg-elevated rounded-lg transition-colors">
                            <MoreVertical size={18} />
                          </button>
                        }
                        items={[
                          {
                            label: 'View',
                            icon: <Eye size={16} />,
                            onClick: () => navigate(`/project/${project.slug}`),
                          },
                        ]}
                      />
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
              description={
                projects.length === 0
                  ? "You haven't submitted any projects yet."
                  : 'No projects match your current filter criteria.'
              }
              action={
                <Button variant="primary" onClick={() => navigate('/dashboard/projects/submit')}>
                  Submit Your First Project
                </Button>
              }
            />
          </div>
        )}
      </Card>
    </div>
  );
}

export default MyProjects;
