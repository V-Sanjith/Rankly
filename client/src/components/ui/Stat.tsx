import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from './Card';

interface StatProps {
  label: string;
  value: string | number;
  change?: number; // percentage
  icon: React.ComponentType<{ size?: number; className?: string }>;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export function Stat({ label, value, change, icon: Icon, variant = 'primary' }: StatProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  const iconColors = {
    primary: 'text-primary bg-primary/10',
    secondary: 'text-secondary bg-secondary/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    error: 'text-error bg-error/10',
  };

  return (
    <Card className="p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-text-muted">{label}</span>
        <div className={`p-2 rounded-lg ${iconColors[variant]}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-end justify-between mt-auto">
        <h4 className="text-2xl font-bold text-text">{value}</h4>
        {change !== undefined && (
          <div
            className={`flex items-center text-sm font-medium ${
              isPositive ? 'text-success' : isNegative ? 'text-error' : 'text-text-muted'
            }`}
          >
            {isPositive && <ArrowUpRight size={16} className="mr-1" />}
            {isNegative && <ArrowDownRight size={16} className="mr-1" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </Card>
  );
}
