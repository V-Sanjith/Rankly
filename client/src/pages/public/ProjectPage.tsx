import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { 
  ExternalLink, Trophy,   
  ShieldCheck, Share2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { projectService } from '../../services/project.service';
import { analyticsService } from '../../services/analytics.service';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    if (!slug) return;

    const fetchProject = async () => {
      try {
        setIsLoading(true);
        setErrorMsg('');
        const res = await projectService.getBySlug(slug);
        if (isMounted && res.success && res.data) {
          setProject(res.data);
          // Record view event
          analyticsService.recordView(res.data.id).catch(() => {});
        } else {
          setErrorMsg('Project not found');
        }
      } catch (err: any) {
        if (isMounted) setErrorMsg(err.message || 'Project not found');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProject();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleVisitWebsite = () => {
    if (project?.id) {
      analyticsService.recordClick(project.id).catch(() => {});
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center pt-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (errorMsg || !project) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center pt-20 px-4">
        <EmptyState
          title="Project Not Found"
          description="The project you are looking for does not exist or has not been approved yet."
          action={
            <Button as={Link} to="/explore" variant="primary">
              Explore Approved Projects
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text pt-20">
      {/* 1. PROJECT HEADER */}
      <section className="py-12 md:py-20 relative border-b border-border">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-surface to-elevated border border-border flex items-center justify-center flex-shrink-0 shadow-xl text-4xl font-bold text-text-muted overflow-hidden"
            >
              {project.imageUrl ? (
                <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
              ) : (
                project.name.substring(0, 2).toUpperCase()
              )}
            </motion.div>
            
            <div className="flex-grow">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-3xl md:text-5xl font-extrabold">{project.name}</h1>
                  <span className="px-3 py-1 rounded-full bg-surface text-sm font-medium border border-border/50">
                    {project.category}
                  </span>
                </div>
                
                <p className="text-xl text-text-muted mb-6">{project.shortDescription}</p>
                
                <div className="flex flex-wrap gap-4">
                  <Button
                    as="a"
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleVisitWebsite}
                    variant="primary"
                    className="rounded-full gap-2 font-semibold"
                  >
                    Visit Website <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full gap-2 border-border hover:bg-surface"
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                  >
                    <Share2 className="w-4 h-4" /> Share Link
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Rank Card */}
            {project.ranking && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="w-full md:w-64 bg-elevated border border-primary/30 rounded-2xl p-5 shadow-[0_0_20px_rgba(139,92,246,0.1)] flex-shrink-0"
              >
                <div className="text-center mb-4">
                  <p className="text-sm text-text-muted font-medium mb-1 uppercase tracking-wider">Leaderboard Rank</p>
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    <span className="text-4xl font-extrabold">#{project.ranking.rank}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-3 border-t border-b border-border/50 mb-4">
                  <span className="text-sm text-text-muted">Total Bid</span>
                  <span className="font-bold text-secondary">₹{Number(project.ranking.rankingValue)}</span>
                </div>
                <Button as={Link} to="/dashboard/projects" variant="primary" className="w-full py-2 text-sm rounded-xl">
                  Manage Project
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT */}
      <section className="py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Column: Description & Details */}
            <div className="lg:col-span-2 space-y-12">
              <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-2xl font-bold mb-4">About {project.name}</h2>
                <div className="prose prose-invert max-w-none text-text-muted leading-relaxed whitespace-pre-line">
                  <p>{project.description}</p>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-surface/30 rounded-2xl p-6 border border-border">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-success" /> Verified Listing
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-text-muted mb-1">Founder / Maker</p>
                    <p className="font-medium">{project.founderName || project.owner?.name || 'Anonymous Maker'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted mb-1">Listed On</p>
                    <p className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Stats & Meta */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h3 className="text-lg font-bold mb-4">Project Category</h3>
                <div className="bg-surface border border-border rounded-xl p-4">
                  <span className="text-sm text-text-muted">Category:</span>
                  <p className="text-lg font-semibold text-text mt-1">{project.category}</p>
                </div>
              </motion.div>
            </div>
            
          </div>
        </div>
      </section>
    </div>
  );
}
