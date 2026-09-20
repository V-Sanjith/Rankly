import React from 'react';
import { motion } from 'motion/react';

interface EmptyStateProps {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 text-center bg-surface border border-border rounded-xl"
    >
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-elevated flex items-center justify-center mb-4 text-text-muted">
          <Icon size={24} />
        </div>
      )}
      <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
      <p className="text-text-muted max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </motion.div>
  );
}
