import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';
import { ShoppingBag } from 'lucide-react';

describe('StatCard Component', () => {
  it('renders title, value, and subtitle properly', () => {
    render(
      <StatCard
        title="Weekly Estimated Total"
        value="₹1,450.00"
        subtitle="72% of weekly limit"
        icon={ShoppingBag}
      />
    );

    expect(screen.getByText('Weekly Estimated Total')).toBeInTheDocument();
    expect(screen.getByText('₹1,450.00')).toBeInTheDocument();
    expect(screen.getByText('72% of weekly limit')).toBeInTheDocument();
  });
});
