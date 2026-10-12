import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
  type?: 'card' | 'line' | 'table';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 3,
  className = '',
  type = 'card',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="animate-pulse">
          {type === 'card' && (
            <div className="bg-white border border-border rounded-2xl p-6 shadow-card space-y-3">
              <div className="h-4 bg-sage-muted rounded-md w-1/3"></div>
              <div className="h-8 bg-sage-muted rounded-md w-1/2"></div>
              <div className="h-3 bg-sage-muted rounded-md w-2/3"></div>
            </div>
          )}
          {type === 'line' && (
            <div className="h-4 bg-sage-muted rounded-md w-full"></div>
          )}
          {type === 'table' && (
            <div className="flex items-center gap-4 p-4 bg-white border border-border rounded-xl">
              <div className="w-12 h-12 bg-sage-muted rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-sage-muted rounded w-1/4"></div>
                <div className="h-3 bg-sage-muted rounded w-1/2"></div>
              </div>
              <div className="w-20 h-8 bg-sage-muted rounded-lg"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
