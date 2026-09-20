import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Trophy, TrendingUp, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';

interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl?: string;
  rank?: number;
  bidAmount?: number;
  featured?: boolean;
}

export function ProjectCard({ id, name, description, category, imageUrl, rank, bidAmount, featured }: ProjectCardProps) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="h-full flex flex-col overflow-hidden border-border/50 hover:border-primary/50 transition-colors">
        <div className="relative h-48 bg-elevated">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted">
              No Image Available
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="primary">{category}</Badge>
            {featured && <Badge variant="warning">Featured</Badge>}
          </div>
          {rank && (
            <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur text-text px-3 py-1 rounded-full text-sm font-bold flex items-center shadow-lg border border-border">
              <Trophy size={14} className="text-warning mr-1" />
              #{rank}
            </div>
          )}
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-xl font-bold text-text mb-2 line-clamp-1">{name}</h3>
          <p className="text-text-muted text-sm line-clamp-2 mb-4 flex-1">
            {description}
          </p>
          
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
            {bidAmount ? (
              <div className="flex items-center text-sm">
                <TrendingUp size={16} className="text-success mr-1" />
                <span className="text-text font-medium">₹{bidAmount} bid</span>
              </div>
            ) : (
              <div />
            )}
            
            <Link to={`/projects/${id}`}>
              <Button variant="outline" size="sm" className="gap-1">
                View
                <LinkIcon size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
