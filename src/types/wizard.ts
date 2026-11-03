import { FacingDirection } from './plan';

export interface WizardFormData {
  apiKey?: string;
  customWishlist?: string;
  plot: {
    width: number;
    length: number;
    shape: 'rectangular' | 'l-shaped' | 'irregular';
    facing: FacingDirection;
    city: string;
    state: string;
    pincode: string;
  };
  requirements: {
    floors: number;
    bedrooms: number;
    bathrooms: number;
    hasLivingRoom: boolean;
    kitchenType: 'open' | 'closed' | 'modular';
    parkingSpots: number;
    hasPoojaRoom: boolean;
    hasServantQuarter: boolean;
    hasTerrace: boolean;
    hasBasement: boolean;
  };
  preferences: {
    style: 'Modern' | 'Traditional' | 'Contemporary' | 'Colonial' | 'Farmhouse';
    garden: 'none' | 'front' | 'rear' | 'both';
    balconies: number;
    windowType: 'standard' | 'large' | 'floor-to-ceiling';
  };
  budget: {
    range: '15-25L' | '25-40L' | '40-60L' | '60-100L' | '100L+';
    qualityTier: 'economy' | 'standard' | 'premium' | 'luxury';
  };
  regulatory: {
    ownerName: string;
    fatherOrSpouseName: string;
    khasraNumber: string;
    khatauniNumber: string;
    authorityName: string;
    zone: string;
  };
}
