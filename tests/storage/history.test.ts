import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  savePlanToHistory,
  getPlanHistory,
  getPlanHistoryItem,
  deletePlanFromHistory,
  clearPlanHistory,
  PlanHistoryItem,
} from '@/lib/storage/history';
import { HousePlan } from '@/types/plan';
import { WizardFormData } from '@/types/wizard';

const mockPlan: HousePlan = {
  plot: { width: 30, length: 50, facing: 'North', area: 1500 },
  setbacks: { front: 10, rear: 7, left: 5, right: 5 },
  floors: [
    {
      level: 0,
      floorName: 'Ground Floor Plan',
      rooms: [
        {
          id: 'g-1',
          name: 'Living Room',
          x: 3,
          y: 9.8,
          width: 14,
          length: 16,
          doors: [],
          windows: [],
        },
      ],
    },
  ],
  structural: {
    columns: [],
    beams: [],
    footingType: 'Isolated RCC',
    slabType: 'RCC',
  },
  electrical: { pointsByRoom: [] },
  plumbing: { inletPoints: [], outletPoints: [] },
  budget: {
    total: 4500000,
    currency: 'INR',
    lineItems: [],
  },
  facade: {
    style: 'Modern',
    features: ['Balcony Toughened Glass Railing'],
    exteriorMaterial: 'Textured Weather-Shield Plaster',
  },
  regulatory: {
    far: 1.2,
    groundCoverage: 60,
    builtUpArea: 1800,
    violations: [],
  },
  customWishlist: 'Modern house with stilt parking and terrace bar',
};

const mockFormData: WizardFormData = {
  plot: {
    width: 30,
    length: 50,
    shape: 'rectangular',
    facing: 'North',
    city: 'Ghaziabad',
    state: 'UP',
    pincode: '201001',
  },
  requirements: {
    floors: 2,
    bedrooms: 3,
    bathrooms: 3,
    hasLivingRoom: true,
    kitchenType: 'open',
    parkingSpots: 2,
    hasPoojaRoom: true,
    hasServantQuarter: false,
    hasTerrace: true,
    hasBasement: false,
  },
  preferences: {
    style: 'Modern',
    garden: 'front',
    balconies: 2,
    windowType: 'large',
  },
  budget: {
    range: '40-60L',
    qualityTier: 'premium',
  },
  regulatory: {
    ownerName: 'Rahul Verma',
    fatherOrSpouseName: 'K. K. Verma',
    khasraNumber: '108',
    khatauniNumber: '24',
    authorityName: 'GDA',
    zone: 'Zone 2',
  },
  customWishlist: 'Modern house with stilt parking and terrace bar',
};

class MockStorage implements Storage {
  private store: Record<string, string> = {};
  get length() {
    return Object.keys(this.store).length;
  }
  clear() {
    this.store = {};
  }
  getItem(key: string) {
    return this.store[key] !== undefined ? this.store[key] : null;
  }
  key(index: number) {
    return Object.keys(this.store)[index] || null;
  }
  removeItem(key: string) {
    delete this.store[key];
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }
}

describe('History Storage Service', () => {
  beforeEach(() => {
    const mockLocal = new MockStorage();
    const mockSession = new MockStorage();
    Object.defineProperty(window, 'localStorage', { value: mockLocal, writable: true, configurable: true });
    Object.defineProperty(window, 'sessionStorage', { value: mockSession, writable: true, configurable: true });
    vi.restoreAllMocks();
  });

  it('should save a plan to localStorage history and retrieve it', () => {
    savePlanToHistory('proj_001', mockPlan, mockFormData);

    const history = getPlanHistory();
    expect(history).toHaveLength(1);
    expect(history[0].id).toBe('proj_001');
    expect(history[0].plot.width).toBe(30);
    expect(history[0].plot.length).toBe(50);
    expect(history[0].plot.area).toBe(1500);
    expect(history[0].floorsCount).toBe(1);
    expect(history[0].estimatedCost).toBe(4500000);
    expect(history[0].customWishlist).toBe('Modern house with stilt parking and terrace bar');
  });

  it('should also populate sessionStorage for direct route navigation', () => {
    savePlanToHistory('proj_001', mockPlan, mockFormData);

    expect(sessionStorage.getItem('plan_proj_001')).toBeTruthy();
    expect(sessionStorage.getItem('form_proj_001')).toBeTruthy();
    const parsedPlan = JSON.parse(sessionStorage.getItem('plan_proj_001')!);
    expect(parsedPlan.plot.area).toBe(1500);
  });

  it('should update existing entry if saved again with same projectId', () => {
    savePlanToHistory('proj_001', mockPlan, mockFormData);

    const updatedPlan: HousePlan = {
      ...mockPlan,
      customWishlist: 'Updated Wishlist',
    };

    savePlanToHistory('proj_001', updatedPlan, mockFormData);

    const history = getPlanHistory();
    expect(history).toHaveLength(1);
    expect(history[0].customWishlist).toBe('Updated Wishlist');
  });

  it('should get a specific plan item by id', () => {
    savePlanToHistory('proj_001', mockPlan, mockFormData);
    savePlanToHistory('proj_002', { ...mockPlan, plot: { ...mockPlan.plot, width: 25 } }, mockFormData);

    const item = getPlanHistoryItem('proj_002');
    expect(item).not.toBeNull();
    expect(item?.plot.width).toBe(25);

    const nonExistent = getPlanHistoryItem('proj_999');
    expect(nonExistent).toBeNull();
  });

  it('should delete a plan by id from history', () => {
    savePlanToHistory('proj_001', mockPlan, mockFormData);
    savePlanToHistory('proj_002', mockPlan, mockFormData);

    expect(getPlanHistory()).toHaveLength(2);

    deletePlanFromHistory('proj_001');

    const history = getPlanHistory();
    expect(history).toHaveLength(1);
    expect(history[0].id).toBe('proj_002');
  });

  it('should clear all history', () => {
    savePlanToHistory('proj_001', mockPlan, mockFormData);
    savePlanToHistory('proj_002', mockPlan, mockFormData);

    clearPlanHistory();

    expect(getPlanHistory()).toEqual([]);
  });

  it('should handle corrupted localStorage gracefully without throwing', () => {
    localStorage.setItem('architect_plan_history', 'INVALID_JSON{');

    expect(() => getPlanHistory()).not.toThrow();
    expect(getPlanHistory()).toEqual([]);
  });
});
