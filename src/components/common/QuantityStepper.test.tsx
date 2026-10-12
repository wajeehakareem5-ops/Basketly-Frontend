import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuantityStepper } from './QuantityStepper';

describe('QuantityStepper Component', () => {
  it('displays initial value correctly', () => {
    render(<QuantityStepper value={3} onChange={vi.fn()} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onChange with incremented value when plus clicked', () => {
    const handleChange = vi.fn();
    render(<QuantityStepper value={2} onChange={handleChange} />);
    const plusBtn = screen.getByRole('button', { name: /increase quantity/i });
    fireEvent.click(plusBtn);
    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it('calls onChange with decremented value when minus clicked', () => {
    const handleChange = vi.fn();
    render(<QuantityStepper value={3} min={1} onChange={handleChange} />);
    const minusBtn = screen.getByRole('button', { name: /decrease quantity/i });
    fireEvent.click(minusBtn);
    expect(handleChange).toHaveBeenCalledWith(2);
  });

  it('calls onChange with 0 when at min=1 and allowDeleteAtZero is true', () => {
    const handleChange = vi.fn();
    render(<QuantityStepper value={1} min={1} allowDeleteAtZero={true} onChange={handleChange} />);
    const removeBtn = screen.getByRole('button', { name: /remove item/i });
    fireEvent.click(removeBtn);
    expect(handleChange).toHaveBeenCalledWith(0);
  });
});
