import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { leaderboardService } from '../../services/leaderboard.service';

const LeaderboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [rankings, setRankings] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const res = await leaderboardService.getLeaderboard({ limit: 100 });
        if (isMounted && res.success) {
          setRankings(res.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchLeaderboard();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Global Leaderboard</h1>
        <p className="text-xl text-text-muted max-w-2xl mx-auto">
          The most popular projects on Rankly, determined by real-time bidding.
        </p>
      </div>

      <Card padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Spinner size="lg" />
          </div>
        ) : rankings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-elevated border-b border-border text-text-muted text-sm">
                  <th className="py-4 px-6 font-semibold w-24">Rank</th>
                  <th className="py-4 px-6 font-semibold">Project</th>
                  <th className="py-4 px-6 font-semibold">Category</th>
                  <th className="py-4 px-6 font-semibold text-right">Confirmed Bid Total</th>
                  <th className="py-4 px-6 font-semibold text-right w-32">Action</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((item, i) => (
                  <motion.tr
                    key={item.projectId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border hover:bg-elevated/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                        item.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                        item.rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                        item.rank === 3 ? 'bg-orange-600/20 text-orange-500' :
                        'bg-surface text-text-muted'
                      }`}>
                        #{item.rank}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-text">
                      {item.project?.name || 'Project'}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="outline">{item.project?.category || 'SaaS'}</Badge>
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-primary font-bold text-lg">
                      ₹{Number(item.rankingValue)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {item.project?.slug && (
                        <Link to={`/project/${item.project.slug}`}>
                          <Button size="sm" variant="secondary">View</Button>
                        </Link>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={Trophy}
              title="No ranked projects available yet"
              description="Be the first to submit and rank a project on the platform!"
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default LeaderboardPage;
