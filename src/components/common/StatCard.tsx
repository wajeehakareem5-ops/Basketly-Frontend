import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  highlight,
}) => {
  return (
    <div
      className={`p-5 rounded-2xl bg-card border ${
        highlight ? 'border-lime ring-1 ring-lime/50 bg-gradient-to-br from-card to-sage-light' : 'border-border'
      } shadow-card flex flex-col justify-between transition-all duration-200 hover:shadow-elevated`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{title}</span>
        <div className="w-10 h-10 rounded-xl bg-sage-muted flex items-center justify-center text-forest">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl font-bold text-text-primary tracking-tight">{value}</div>
        {(subtitle || trend) && (
          <div className="mt-1 flex items-center gap-2 text-xs text-text-secondary">
            {trend && (
              <span
                className={`font-medium ${
                  trend.isPositive ? 'text-state-success' : 'text-state-warning'
                }`}
              >
                {trend.value}
              </span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
