import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge Component', () => {
  it('renders children correctly', () => {
    render(<Badge variant="success">Active Order</Badge>);
    expect(screen.getByText('Active Order')).toBeInTheDocument();
  });

  it('applies proper styling variant', () => {
    const { container } = render(<Badge variant="lime">Organic</Badge>);
    expect(container.firstChild).toHaveClass('bg-lime');
  });
});
