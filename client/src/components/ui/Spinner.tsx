import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      className={`text-primary inline-flex ${className}`}
    >
      <Loader2 size={sizeMap[size]} />
    </motion.div>
  );
}
