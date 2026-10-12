import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default' | 'lime' | 'forest';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-sage-muted text-text-primary border-border',
    success: 'bg-emerald-50 text-state-success border-emerald-200',
    warning: 'bg-amber-50 text-state-warning border-amber-200',
    error: 'bg-rose-50 text-state-error border-rose-200',
    info: 'bg-blue-50 text-state-info border-blue-200',
    lime: 'bg-lime text-forest-deep font-semibold border-lime-dark',
    forest: 'bg-forest text-white border-forest-deep',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 rounded-full',
    md: 'text-xs font-medium px-2.5 py-1 rounded-full',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
