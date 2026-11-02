import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { BudgetTable } from '@/components/dashboard/BudgetTable';
import { BudgetSummary } from '@/types/plan';

describe('BudgetTable Component', () => {
  const mockBudget: BudgetSummary = {
    currency: 'INR',
    total: 2500000,
    lineItems: [
      { category: 'civil', name: 'Structure', amount: 1500000 },
      { category: 'finishing', name: 'Finishes', amount: 1000000 },
    ],
  };

  it('should render total cost formatted in Indian currency notation', () => {
    const { getByText } = render(<BudgetTable budget={mockBudget} />);
    expect(getByText('Structure')).toBeDefined();
    expect(getByText(/25,00,000/)).toBeDefined();
  });

  it('should render all line items with category, description, and cost', () => {
    const { getByText } = render(<BudgetTable budget={mockBudget} />);
    expect(getByText('civil')).toBeDefined();
    expect(getByText('Structure')).toBeDefined();
    expect(getByText(/15,00,000/)).toBeDefined();

    expect(getByText('finishing')).toBeDefined();
    expect(getByText('Finishes')).toBeDefined();
    expect(getByText(/10,00,000/)).toBeDefined();
  });

  it('should render headers and estimated total label', () => {
    const { getByText } = render(<BudgetTable budget={mockBudget} />);
    expect(getByText('Itemized Bill of Quantities (BOQ)')).toBeDefined();
    expect(getByText('Estimated Total')).toBeDefined();
  });
});
