import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (newValue: number) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  allowDeleteAtZero?: boolean;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  min = 1,
  max = 99,
  onChange,
  size = 'md',
  disabled = false,
  allowDeleteAtZero = true,
}) => {
  const isAtMin = value <= min;
  const isAtMax = value >= max;

  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1);
    } else if (allowDeleteAtZero && value === min) {
      onChange(0);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const sizeClasses = {
    sm: {
      btn: 'w-6 h-6 text-xs',
      text: 'w-7 text-xs font-semibold',
      container: 'p-0.5',
    },
    md: {
      btn: 'w-8 h-8 text-sm',
      text: 'w-9 text-sm font-semibold',
      container: 'p-1',
    },
    lg: {
      btn: 'w-10 h-10 text-base',
      text: 'w-12 text-base font-bold',
      container: 'p-1.5',
    },
  }[size];

  return (
    <div
      className={`inline-flex items-center bg-sage-muted border border-border rounded-xl ${sizeClasses.container} select-none`}
    >
      <button
        type="button"
        onClick={handleDecrease}
        disabled={disabled || (isAtMin && !allowDeleteAtZero)}
        aria-label={isAtMin && allowDeleteAtZero ? 'Remove item' : 'Decrease quantity'}
        className={`${sizeClasses.btn} rounded-lg flex items-center justify-center bg-card text-text-primary border border-border shadow-subtle hover:bg-sage transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none`}
      >
        {isAtMin && allowDeleteAtZero ? (
          <Trash2 className="w-3.5 h-3.5 text-state-error" />
        ) : (
          <Minus className="w-3.5 h-3.5 text-text-primary" />
        )}
      </button>

      <span className={`${sizeClasses.text} text-center text-text-primary tabular-nums`}>
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrease}
        disabled={disabled || isAtMax}
        aria-label="Increase quantity"
        className={`${sizeClasses.btn} rounded-lg flex items-center justify-center bg-card text-text-primary border border-border shadow-subtle hover:bg-sage transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none`}
      >
        <Plus className="w-3.5 h-3.5 text-text-primary" />
      </button>
    </div>
  );
};
