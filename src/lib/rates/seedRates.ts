export interface CityMaterialRates {
  cementPerBag: number;
  steelFe500DPerKg: number;
  redBrickPerPiece: number;
  civilLabourPerSqFt: number;
  finishingLabourPerSqFt: number;
}

export const cityMaterialRates: Record<string, CityMaterialRates> = {
  'Delhi/NCR': {
    cementPerBag: 370,
    steelFe500DPerKg: 62,
    redBrickPerPiece: 7.5,
    civilLabourPerSqFt: 420,
    finishingLabourPerSqFt: 180,
  },
  'Ghaziabad': {
    cementPerBag: 370,
    steelFe500DPerKg: 62,
    redBrickPerPiece: 7.5,
    civilLabourPerSqFt: 420,
    finishingLabourPerSqFt: 180,
  },
  'Mumbai': {
    cementPerBag: 405,
    steelFe500DPerKg: 67,
    redBrickPerPiece: 9.0,
    civilLabourPerSqFt: 520,
    finishingLabourPerSqFt: 240,
  },
  'Bengaluru': {
    cementPerBag: 390,
    steelFe500DPerKg: 64,
    redBrickPerPiece: 8.0,
    civilLabourPerSqFt: 480,
    finishingLabourPerSqFt: 210,
  },
};
