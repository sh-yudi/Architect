import { describe, it, expect } from 'vitest';
import { calculateDetailedBOQ } from '@/lib/rates/calculator';

describe('BOQ Calculator Engine', () => {
  it('should compute itemized BOQ for Delhi/NCR with standard quality', () => {
    const boq = calculateDetailedBOQ(2000, 'Delhi/NCR', 'standard');
    expect(boq.currency).toBe('INR');
    expect(boq.total).toBeGreaterThan(3000000); // Standard 2000 sq ft house is > 30L
    expect(boq.lineItems.length).toBeGreaterThan(4);
    
    const civilItem = boq.lineItems.find(item => item.category === 'civil');
    expect(civilItem).toBeDefined();
    expect(civilItem!.amount).toBeGreaterThan(1000000);
  });

  it('should scale budget up for luxury quality tier', () => {
    const standardBoq = calculateDetailedBOQ(1500, 'Delhi/NCR', 'standard');
    const luxuryBoq = calculateDetailedBOQ(1500, 'Delhi/NCR', 'luxury');
    expect(luxuryBoq.total).toBeGreaterThan(standardBoq.total * 1.3);
  });

  it('should scale budget down for economy quality tier', () => {
    const standardBoq = calculateDetailedBOQ(1500, 'Delhi/NCR', 'standard');
    const economyBoq = calculateDetailedBOQ(1500, 'Delhi/NCR', 'economy');
    expect(economyBoq.total).toBeLessThan(standardBoq.total);
  });

  it('should handle different cities like Mumbai and Bengaluru with varying rates', () => {
    const delhiBoq = calculateDetailedBOQ(1500, 'Delhi/NCR', 'standard');
    const mumbaiBoq = calculateDetailedBOQ(1500, 'Mumbai', 'standard');
    const blrBoq = calculateDetailedBOQ(1500, 'Bengaluru', 'standard');
    expect(mumbaiBoq.total).toBeGreaterThan(delhiBoq.total);
    expect(blrBoq.total).toBeGreaterThan(delhiBoq.total);
  });

  it('should fall back to Delhi/NCR rates if city is unrecognized', () => {
    const fallbackBoq = calculateDetailedBOQ(1500, 'UnknownCity', 'standard');
    const delhiBoq = calculateDetailedBOQ(1500, 'Delhi/NCR', 'standard');
    expect(fallbackBoq.total).toEqual(delhiBoq.total);
  });

  it('should ensure line item amounts sum exactly to total', () => {
    const boq = calculateDetailedBOQ(1200, 'Delhi/NCR', 'premium');
    const sum = boq.lineItems.reduce((acc, item) => acc + item.amount, 0);
    expect(boq.total).toBe(sum);
  });

  it('should contain all required cost categories', () => {
    const boq = calculateDetailedBOQ(1000, 'Delhi/NCR', 'standard');
    const categories = new Set(boq.lineItems.map(item => item.category));
    expect(categories.has('civil')).toBe(true);
    expect(categories.has('finishing')).toBe(true);
    expect(categories.has('services')).toBe(true);
    expect(categories.has('regulatory')).toBe(true);
  });
});
