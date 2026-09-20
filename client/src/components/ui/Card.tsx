import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  className = '', 
  padding = 'md', 
  hover = false,
  children,
  ...props 
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div 
      className={`bg-surface border border-border rounded-xl overflow-hidden ${hover ? 'transition-colors hover:border-primary/50' : ''} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
