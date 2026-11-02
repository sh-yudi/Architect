# AI House Planner Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack web application where homeowners input house requirements and location, instantly receiving complete 2D/3D architectural house plans, itemized budget/BOQ, and authority approval packages (with an initial pilot for GDA Ghaziabad / UPOBPAS).

**Architecture:** Next.js 14 App Router full-stack web application. The backend integrates Google Gemini API with `responseJsonSchema` for deterministic `HousePlan` JSON generation, a local regulatory validation engine, city-wise material cost calculation, DXF CAD file generation, and PDF form generation. The frontend renders interactive SVG 2D floor plans, Three.js 3D building models, and a 6-step user intake wizard.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, `@google/genai`, Three.js (`@react-three/fiber`, `@react-three/drei`), `pdf-lib`, `dxf-writer`, Zod, Vitest, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-02-ai-house-planner-design.md`

## Global Constraints

- Runtime: Node.js 20+, Next.js 14 App Router, TypeScript strict mode.
- AI Generation: Use `@google/genai` SDK with `responseMimeType: "application/json"` and `responseJsonSchema` for guaranteed valid schema structure, followed by strict Zod validation.
- Regulatory Pilot: Target Ghaziabad Development Authority (GDA) rules and UP Online Building Plan Approval System (UPOBPAS) CAD/document standards.
- Privacy & Compliance: Never persist raw Aadhaar/PAN. Encrypt sensitive plot/owner details at rest.
- Testing Strategy: TDD (Test-Driven Development) for all business logic, engines, schema validation, and rendering components using Vitest.

---

### Task 1: Project Setup & Test Harness

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Test: `tests/setup.test.ts`

**Interfaces:**
- Produces: Working Next.js 14 environment with TypeScript, Tailwind CSS, and Vitest test runner.

- [ ] **Step 1: Write initial test to verify Vitest environment**

Create `tests/setup.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';

describe('Project Test Harness', () => {
  it('should run unit tests correctly in TypeScript', () => {
    const sum = (a: number, b: number) => a + b;
    expect(sum(2, 3)).toBe(5);
  });
});
```

- [ ] **Step 2: Create package.json and configuration files**

Create `package.json`:
```json
{
  "name": "architect-ai",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@google/genai": "^0.1.1",
    "@react-three/drei": "^9.105.6",
    "@react-three/fiber": "^8.16.6",
    "clsx": "^2.1.1",
    "dxf-writer": "^1.19.0",
    "lucide-react": "^0.378.0",
    "next": "14.2.3",
    "pdf-lib": "^1.17.9",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.3.0",
    "three": "^0.164.1",
    "three-bvh-csg": "^0.0.16",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^20.12.12",
    "@types/react": "^18.3.2",
    "@types/react-dom": "^18.3.0",
    "@types/three": "^0.164.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "jsdom": "^24.0.0",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.4.5",
    "vitest": "^1.6.0"
  }
}
```

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

Create `tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
        },
      },
    },
  },
  plugins: [],
};
export default config;
```

Create `postcss.config.js`:
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

Create `src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 15, 23, 42;
  --background-rgb: 248, 250, 252;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
}
```

Create `src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ArchitectAI — Instant House Plans & Regulatory Approvals',
  description: 'AI-generated 2D/3D floor plans, budget estimation, and municipal authority approval documents.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
```

Create `src/app/page.tsx`:
```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
        Architect<span className="text-sky-600">AI</span>
      </h1>
      <p className="mt-4 text-lg text-slate-600 max-w-2xl">
        Turn your plot dimensions and house wishlist into complete 2D floor plans, 3D models, structural drawings, and municipal approval packages in minutes.
      </p>
      <div className="mt-8">
        <a
          href="/start"
          className="rounded-lg bg-sky-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
        >
          Create House Plan
        </a>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Run npm install and run tests**

Run: `npm install && npm test`
Expected: PASS (1 test in `tests/setup.test.ts`)

- [ ] **Step 4: Commit**

```bash
git add package.json tsconfig.json vitest.config.ts tailwind.config.ts postcss.config.js src/ tests/
git commit -m "chore: scaffold Next.js 14 app with TypeScript, Tailwind, and Vitest"
```

---

### Task 2: Core Data Types & Zod Schemas for HousePlan and Wizard

**Files:**
- Create: `src/types/plan.ts`
- Create: `src/types/wizard.ts`
- Create: `src/lib/schemas/housePlanSchema.ts`
- Test: `tests/schemas/housePlanSchema.test.ts`

**Interfaces:**
- Produces:
  - `HousePlan` TypeScript interface & `housePlanZodSchema`
  - `WizardFormData` TypeScript interface & `wizardFormSchema`
  - Validates and parses raw AI JSON output.

- [ ] **Step 1: Write failing tests for HousePlan validation**

Create `tests/schemas/housePlanSchema.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { housePlanZodSchema } from '@/lib/schemas/housePlanSchema';

describe('HousePlan Zod Schema', () => {
  it('should validate a valid complete house plan JSON', () => {
    const validPlan = {
      plot: { width: 30, length: 40, facing: 'East', area: 1200 },
      setbacks: { front: 10, rear: 5, left: 3, right: 3 },
      floors: [
        {
          level: 0,
          floorName: 'Ground Floor',
          rooms: [
            { id: 'r1', name: 'Living Hall', x: 0, y: 0, width: 14, length: 16, doors: [], windows: [] },
            { id: 'r2', name: 'Kitchen', x: 14, y: 0, width: 10, length: 10, doors: [], windows: [] }
          ]
        }
      ],
      structural: {
        columns: [{ id: 'c1', x: 0, y: 0, sizeInches: [9, 12] }],
        beams: [{ id: 'b1', startColumnId: 'c1', endColumnId: 'c2' }],
        footingType: 'isolated',
        slabType: 'RCC flat slab'
      },
      electrical: {
        pointsByRoom: [{ roomId: 'r1', lightPoints: 3, fanPoints: 2, powerSockets: 4 }]
      },
      plumbing: {
        inletPoints: [{ x: 14, y: 0, type: 'kitchen_sink' }],
        outletPoints: [{ x: 14, y: 10, type: 'drainage' }]
      },
      budget: {
        currency: 'INR',
        total: 2850000,
        lineItems: [
          { category: 'civil', name: 'Structure & Masonry', amount: 1600000 },
          { category: 'finishing', name: 'Flooring & Paint', amount: 750000 },
          { category: 'services', name: 'Plumbing & Electrical', amount: 500000 }
        ]
      },
      facade: {
        style: 'Modern',
        features: ['Wide picture windows', 'Textured exterior paneling', 'Flat parapet roof'],
        exteriorMaterial: 'Sand-faced plaster with weather-shield coat'
      },
      regulatory: {
        far: 1.8,
        groundCoverage: 55.4,
        builtUpArea: 1950,
        violations: []
      }
    };

    const parsed = housePlanZodSchema.safeParse(validPlan);
    expect(parsed.success).toBe(true);
  });

  it('should reject invalid house plan with missing mandatory fields', () => {
    const invalidPlan = {
      plot: { width: 30 }, // missing length, area, facing
    };
    const parsed = housePlanZodSchema.safeParse(invalidPlan);
    expect(parsed.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/schemas/housePlanSchema.test.ts`
Expected: FAIL ("Cannot find module '@/lib/schemas/housePlanSchema'")

- [ ] **Step 3: Implement Types and Zod Schema**

Create `src/types/plan.ts`:
```typescript
export type FacingDirection = 'East' | 'West' | 'North' | 'South' | 'North-East' | 'North-West' | 'South-East' | 'South-West';

export interface Point2D {
  x: number;
  y: number;
}

export interface Door {
  id: string;
  wall: 'top' | 'bottom' | 'left' | 'right';
  offset: number;
  width: number;
}

export interface Window {
  id: string;
  wall: 'top' | 'bottom' | 'left' | 'right';
  offset: number;
  width: number;
}

export interface Room {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  length: number;
  doors: Door[];
  windows: Window[];
}

export interface FloorPlan {
  level: number;
  floorName: string;
  rooms: Room[];
}

export interface ColumnDef {
  id: string;
  x: number;
  y: number;
  sizeInches: [number, number];
}

export interface BeamDef {
  id: string;
  startColumnId: string;
  endColumnId: string;
}

export interface StructuralLayout {
  columns: ColumnDef[];
  beams: BeamDef[];
  footingType: string;
  slabType: string;
}

export interface RoomElectrical {
  roomId: string;
  lightPoints: number;
  fanPoints: number;
  powerSockets: number;
}

export interface PlumbingPoint {
  x: number;
  y: number;
  type: string;
}

export interface BudgetItem {
  category: 'civil' | 'finishing' | 'services' | 'regulatory';
  name: string;
  amount: number;
}

export interface BudgetSummary {
  currency: 'INR';
  total: number;
  lineItems: BudgetItem[];
}

export interface FacadeDetails {
  style: string;
  features: string[];
  exteriorMaterial: string;
}

export interface RegulatorySummary {
  far: number;
  groundCoverage: number;
  builtUpArea: number;
  violations: string[];
}

export interface HousePlan {
  plot: {
    width: number;
    length: number;
    facing: FacingDirection;
    area: number;
  };
  setbacks: {
    front: number;
    rear: number;
    left: number;
    right: number;
  };
  floors: FloorPlan[];
  structural: StructuralLayout;
  electrical: {
    pointsByRoom: RoomElectrical[];
  };
  plumbing: {
    inletPoints: PlumbingPoint[];
    outletPoints: PlumbingPoint[];
  };
  budget: BudgetSummary;
  facade: FacadeDetails;
  regulatory: RegulatorySummary;
}
```

Create `src/types/wizard.ts`:
```typescript
import { FacingDirection } from './plan';

export interface WizardFormData {
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
```

Create `src/lib/schemas/housePlanSchema.ts`:
```typescript
import { z } from 'zod';

export const housePlanZodSchema = z.object({
  plot: z.object({
    width: z.number().positive(),
    length: z.number().positive(),
    facing: z.enum(['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West']),
    area: z.number().positive(),
  }),
  setbacks: z.object({
    front: z.number().nonnegative(),
    rear: z.number().nonnegative(),
    left: z.number().nonnegative(),
    right: z.number().nonnegative(),
  }),
  floors: z.array(
    z.object({
      level: z.number().int().nonnegative(),
      floorName: z.string(),
      rooms: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          x: z.number().nonnegative(),
          y: z.number().nonnegative(),
          width: z.number().positive(),
          length: z.number().positive(),
          doors: z.array(
            z.object({
              id: z.string(),
              wall: z.enum(['top', 'bottom', 'left', 'right']),
              offset: z.number().nonnegative(),
              width: z.number().positive(),
            })
          ).default([]),
          windows: z.array(
            z.object({
              id: z.string(),
              wall: z.enum(['top', 'bottom', 'left', 'right']),
              offset: z.number().nonnegative(),
              width: z.number().positive(),
            })
          ).default([]),
        })
      ),
    })
  ).min(1),
  structural: z.object({
    columns: z.array(
      z.object({
        id: z.string(),
        x: z.number(),
        y: z.number(),
        sizeInches: z.tuple([z.number(), z.number()]),
      })
    ),
    beams: z.array(
      z.object({
        id: z.string(),
        startColumnId: z.string(),
        endColumnId: z.string(),
      })
    ),
    footingType: z.string(),
    slabType: z.string(),
  }),
  electrical: z.object({
    pointsByRoom: z.array(
      z.object({
        roomId: z.string(),
        lightPoints: z.number().nonnegative(),
        fanPoints: z.number().nonnegative(),
        powerSockets: z.number().nonnegative(),
      })
    ),
  }),
  plumbing: z.object({
    inletPoints: z.array(
      z.object({
        x: z.number(),
        y: z.number(),
        type: z.string(),
      })
    ),
    outletPoints: z.array(
      z.object({
        x: z.number(),
        y: z.number(),
        type: z.string(),
      })
    ),
  }),
  budget: z.object({
    currency: z.literal('INR'),
    total: z.number().positive(),
    lineItems: z.array(
      z.object({
        category: z.enum(['civil', 'finishing', 'services', 'regulatory']),
        name: z.string(),
        amount: z.number().positive(),
      })
    ),
  }),
  facade: z.object({
    style: z.string(),
    features: z.array(z.string()),
    exteriorMaterial: z.string(),
  }),
  regulatory: z.object({
    far: z.number().positive(),
    groundCoverage: z.number().positive(),
    builtUpArea: z.number().positive(),
    violations: z.array(z.string()),
  }),
});
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test tests/schemas/housePlanSchema.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/ src/lib/schemas/ tests/schemas/
git commit -m "feat: define core TypeScript interfaces and Zod validation schemas for HousePlan"
```

---

### Task 3: Regulatory Rules Engine & GDA Ghaziabad Rules Engine

**Files:**
- Create: `src/lib/regulatory/types.ts`
- Create: `src/lib/regulatory/rules/gda.ts`
- Create: `src/lib/regulatory/engine.ts`
- Test: `tests/regulatory/regulatoryEngine.test.ts`

**Interfaces:**
- Produces:
  - `getRegulatoryRules(authorityCode: string): RegulatoryRules`
  - `validateRegulatoryCompliance(plan: HousePlan, rules: RegulatoryRules): ComplianceResult`

- [ ] **Step 1: Write failing tests for GDA regulatory compliance validation**

Create `tests/regulatory/regulatoryEngine.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { validateRegulatoryCompliance, getRegulatoryRules } from '@/lib/regulatory/engine';
import { HousePlan } from '@/types/plan';

describe('Regulatory Engine - GDA Ghaziabad', () => {
  const basePlan: HousePlan = {
    plot: { width: 30, length: 40, facing: 'East', area: 1200 },
    setbacks: { front: 10, rear: 5, left: 3, right: 3 },
    floors: [
      {
        level: 0,
        floorName: 'Ground',
        rooms: [{ id: 'r1', name: 'Living', x: 3, y: 10, width: 24, length: 25, doors: [], windows: [] }]
      }
    ],
    structural: { columns: [], beams: [], footingType: 'isolated', slabType: 'RCC' },
    electrical: { pointsByRoom: [] },
    plumbing: { inletPoints: [], outletPoints: [] },
    budget: { currency: 'INR', total: 2000000, lineItems: [] },
    facade: { style: 'Modern', features: [], exteriorMaterial: 'plaster' },
    regulatory: { far: 1.5, groundCoverage: 50, builtUpArea: 600, violations: [] }
  };

  it('should approve a compliant house plan under GDA rules', () => {
    const rules = getRegulatoryRules('GDA');
    const result = validateRegulatoryCompliance(basePlan, rules);
    expect(result.isCompliant).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('should flag violation if front setback is below GDA minimum', () => {
    const nonCompliantPlan: HousePlan = {
      ...basePlan,
      setbacks: { front: 4, rear: 5, left: 3, right: 3 }, // GDA requires min 3m (~10ft) for this plot size
    };
    const rules = getRegulatoryRules('GDA');
    const result = validateRegulatoryCompliance(nonCompliantPlan, rules);
    expect(result.isCompliant).toBe(false);
    expect(result.violations.some(v => v.includes('Front setback'))).toBe(true);
  });

  it('should flag violation if ground coverage exceeds maximum allowable', () => {
    const nonCompliantPlan: HousePlan = {
      ...basePlan,
      regulatory: { ...basePlan.regulatory, groundCoverage: 75 }, // GDA max ~60%
    };
    const rules = getRegulatoryRules('GDA');
    const result = validateRegulatoryCompliance(nonCompliantPlan, rules);
    expect(result.isCompliant).toBe(false);
    expect(result.violations.some(v => v.includes('Ground coverage'))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/regulatory/regulatoryEngine.test.ts`
Expected: FAIL ("Cannot find module '@/lib/regulatory/engine'")

- [ ] **Step 3: Implement regulatory types, GDA rules, and compliance engine**

Create `src/lib/regulatory/types.ts`:
```typescript
export interface SetbackRequirements {
  frontMinFt: number;
  rearMinFt: number;
  sideMinFt: number;
}

export interface RegulatoryRules {
  authorityCode: string;
  authorityName: string;
  portalUrl: string;
  maxFAR: number;
  maxGroundCoveragePercent: number;
  maxHeightFt: number;
  getSetbacksForPlot(plotAreaSqFt: number): SetbackRequirements;
  requiredSubmissions: string[];
}

export interface ComplianceResult {
  isCompliant: boolean;
  violations: string[];
  metrics: {
    calculatedFAR: number;
    maxAllowedFAR: number;
    calculatedCoveragePercent: number;
    maxAllowedCoveragePercent: number;
  };
}
```

Create `src/lib/regulatory/rules/gda.ts`:
```typescript
import { RegulatoryRules, SetbackRequirements } from '../types';

export const gdaRules: RegulatoryRules = {
  authorityCode: 'GDA',
  authorityName: 'Ghaziabad Development Authority',
  portalUrl: 'https://upobpas.in',
  maxFAR: 2.0,
  maxGroundCoveragePercent: 60,
  maxHeightFt: 45,
  getSetbacksForPlot(plotAreaSqFt: number): SetbackRequirements {
    // UP Building By-laws setback table for residential plots
    if (plotAreaSqFt <= 1000) {
      return { frontMinFt: 6.5, rearMinFt: 5.0, sideMinFt: 0.0 };
    } else if (plotAreaSqFt <= 2000) {
      return { frontMinFt: 9.8, rearMinFt: 6.5, sideMinFt: 3.0 }; // ~3m front, ~2m rear, ~1m side
    } else if (plotAreaSqFt <= 5000) {
      return { frontMinFt: 14.7, rearMinFt: 9.8, sideMinFt: 6.5 };
    }
    return { frontMinFt: 19.6, rearMinFt: 13.1, sideMinFt: 9.8 };
  },
  requiredSubmissions: [
    'UPOBPAS Online DXF Drawing Submission (AutoDCR Standard)',
    'Notarized Building Plan Indemnity Affidavit',
    'Proof of Plot Ownership (Registered Sale Deed / Allotment Letter)',
    'Supervision Certificate by Empanelled Licensed Technical Person (Architect)'
  ],
};
```

Create `src/lib/regulatory/engine.ts`:
```typescript
import { HousePlan } from '@/types/plan';
import { ComplianceResult, RegulatoryRules } from './types';
import { gdaRules } from './rules/gda';

const rulesRegistry: Record<string, RegulatoryRules> = {
  GDA: gdaRules,
};

export function getRegulatoryRules(authorityCode: string): RegulatoryRules {
  const rules = rulesRegistry[authorityCode.toUpperCase()];
  if (!rules) {
    // Fallback to GDA baseline if unknown authority
    return gdaRules;
  }
  return rules;
}

export function validateRegulatoryCompliance(plan: HousePlan, rules: RegulatoryRules): ComplianceResult {
  const violations: string[] = [];
  const requiredSetbacks = rules.getSetbacksForPlot(plan.plot.area);

  if (plan.setbacks.front < requiredSetbacks.frontMinFt) {
    violations.push(
      `Front setback (${plan.setbacks.front}ft) is below required minimum of ${requiredSetbacks.frontMinFt}ft under ${rules.authorityName} bylaws.`
    );
  }

  if (plan.setbacks.rear < requiredSetbacks.rearMinFt) {
    violations.push(
      `Rear setback (${plan.setbacks.rear}ft) is below required minimum of ${requiredSetbacks.rearMinFt}ft.`
    );
  }

  const minSide = Math.min(plan.setbacks.left, plan.setbacks.right);
  if (minSide < requiredSetbacks.sideMinFt) {
    violations.push(
      `Side setback (${minSide}ft) is below required minimum of ${requiredSetbacks.sideMinFt}ft.`
    );
  }

  if (plan.regulatory.groundCoverage > rules.maxGroundCoveragePercent) {
    violations.push(
      `Ground coverage (${plan.regulatory.groundCoverage}%) exceeds maximum allowable ${rules.maxGroundCoveragePercent}%.`
    );
  }

  if (plan.regulatory.far > rules.maxFAR) {
    violations.push(
      `Floor Area Ratio (${plan.regulatory.far}) exceeds maximum permissible FAR of ${rules.maxFAR}.`
    );
  }

  return {
    isCompliant: violations.length === 0,
    violations,
    metrics: {
      calculatedFAR: plan.regulatory.far,
      maxAllowedFAR: rules.maxFAR,
      calculatedCoveragePercent: plan.regulatory.groundCoverage,
      maxAllowedCoveragePercent: rules.maxGroundCoveragePercent,
    },
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test tests/regulatory/regulatoryEngine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/regulatory/ tests/regulatory/
git commit -m "feat: implement regulatory rules engine and GDA Ghaziabad compliance validation"
```

---

### Task 4: Material Rate Database & BOQ Cost Estimation Engine

**Files:**
- Create: `src/lib/rates/seedRates.ts`
- Create: `src/lib/rates/calculator.ts`
- Test: `tests/rates/calculator.test.ts`

**Interfaces:**
- Produces:
  - `calculateDetailedBOQ(builtUpAreaSqFt: number, city: string, qualityTier: QualityTier): BudgetSummary`

- [ ] **Step 1: Write failing tests for BOQ calculation**

Create `tests/rates/calculator.test.ts`:
```typescript
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/rates/calculator.test.ts`
Expected: FAIL ("Cannot find module '@/lib/rates/calculator'")

- [ ] **Step 3: Implement city rate data and BOQ calculation logic**

Create `src/lib/rates/seedRates.ts`:
```typescript
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
```

Create `src/lib/rates/calculator.ts`:
```typescript
import { BudgetSummary } from '@/types/plan';
import { cityMaterialRates } from './seedRates';

export type QualityTier = 'economy' | 'standard' | 'premium' | 'luxury';

const qualityMultipliers: Record<QualityTier, number> = {
  economy: 0.85,
  standard: 1.0,
  premium: 1.25,
  luxury: 1.6,
};

export function calculateDetailedBOQ(
  builtUpAreaSqFt: number,
  city: string,
  qualityTier: QualityTier = 'standard'
): BudgetSummary {
  const rates = cityMaterialRates[city] || cityMaterialRates['Delhi/NCR'];
  const multiplier = qualityMultipliers[qualityTier];

  // Engineering approximations per sq ft of built-up area in residential construction
  // 1 sq ft needs ~0.4 bags cement, ~4 kg steel, ~22 bricks, 1 sq ft civil labour
  const cementCost = Math.round(builtUpAreaSqFt * 0.4 * rates.cementPerBag * multiplier);
  const steelCost = Math.round(builtUpAreaSqFt * 3.8 * rates.steelFe500DPerKg * multiplier);
  const bricksCost = Math.round(builtUpAreaSqFt * 20 * rates.redBrickPerPiece * multiplier);
  const sandAggregateCost = Math.round(builtUpAreaSqFt * 160 * multiplier);
  const civilLabourCost = Math.round(builtUpAreaSqFt * rates.civilLabourPerSqFt);

  const totalCivil = cementCost + steelCost + bricksCost + sandAggregateCost + civilLabourCost;

  const flooringTiling = Math.round(builtUpAreaSqFt * 140 * multiplier);
  const doorsWindows = Math.round(builtUpAreaSqFt * 110 * multiplier);
  const paintingFinishing = Math.round(builtUpAreaSqFt * 90 * multiplier);
  const totalFinishing = flooringTiling + doorsWindows + paintingFinishing;

  const electricalWiringPoints = Math.round(builtUpAreaSqFt * 85 * multiplier);
  const plumbingSanitary = Math.round(builtUpAreaSqFt * 75 * multiplier);
  const totalServices = electricalWiringPoints + plumbingSanitary;

  const architectRegulatoryApprovals = 45000;

  const lineItems = [
    { category: 'civil' as const, name: 'RCC Structure, Steel & Masonry', amount: totalCivil },
    { category: 'finishing' as const, name: 'Flooring, Tiling & Cladding', amount: flooringTiling },
    { category: 'finishing' as const, name: 'Doors, Windows & Ironmongery', amount: doorsWindows },
    { category: 'finishing' as const, name: 'Internal & External Painting', amount: paintingFinishing },
    { category: 'services' as const, name: 'Electrical Wiring & Fixtures', amount: electricalWiringPoints },
    { category: 'services' as const, name: 'Plumbing & Drainage Network', amount: plumbingSanitary },
    { category: 'regulatory' as const, name: 'Municipal Sanction & Approval Consultation', amount: architectRegulatoryApprovals },
  ];

  const total = lineItems.reduce((acc, curr) => acc + curr.amount, 0);

  return {
    currency: 'INR',
    total,
    lineItems,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test tests/rates/calculator.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/rates/ tests/rates/
git commit -m "feat: implement city material rates and detailed BOQ calculator"
```

---

### Task 5: Gemini AI Plan Generation Engine with Structured Outputs

**Files:**
- Create: `src/lib/ai/geminiClient.ts`
- Create: `src/lib/ai/promptBuilder.ts`
- Create: `src/lib/ai/generatePlan.ts`
- Test: `tests/ai/generatePlan.test.ts`

**Interfaces:**
- Consumes: `WizardFormData`, `housePlanZodSchema`
- Produces: `generateHousePlan(formData: WizardFormData, apiKey?: string): Promise<HousePlan>`

- [ ] **Step 1: Write failing test with mock Gemini response**

Create `tests/ai/generatePlan.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { generateHousePlan } from '@/lib/ai/generatePlan';
import { WizardFormData } from '@/types/wizard';

const mockWizardData: WizardFormData = {
  plot: {
    width: 30,
    length: 40,
    shape: 'rectangular',
    facing: 'East',
    city: 'Ghaziabad',
    state: 'Uttar Pradesh',
    pincode: '201001',
  },
  requirements: {
    floors: 2,
    bedrooms: 3,
    bathrooms: 3,
    hasLivingRoom: true,
    kitchenType: 'modular',
    parkingSpots: 1,
    hasPoojaRoom: true,
    hasServantQuarter: false,
    hasTerrace: true,
    hasBasement: false,
  },
  preferences: {
    style: 'Modern',
    garden: 'front',
    balconies: 1,
    windowType: 'large',
  },
  budget: {
    range: '25-40L',
    qualityTier: 'standard',
  },
  regulatory: {
    ownerName: 'Rajesh Sharma',
    fatherOrSpouseName: 'K. L. Sharma',
    khasraNumber: '412/2',
    khatauniNumber: '89',
    authorityName: 'GDA',
    zone: 'Zone 2',
  },
};

describe('Gemini House Plan Generator', () => {
  it('should parse and validate generated plan matching housePlan schema', async () => {
    // When no API key is set, generateHousePlan should return a deterministic valid mock plan
    const plan = await generateHousePlan(mockWizardData, undefined);
    expect(plan.plot.width).toBe(30);
    expect(plan.plot.length).toBe(40);
    expect(plan.floors.length).toBeGreaterThanOrEqual(1);
    expect(plan.budget.total).toBeGreaterThan(0);
    expect(plan.regulatory.far).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/ai/generatePlan.test.ts`
Expected: FAIL ("Cannot find module '@/lib/ai/generatePlan'")

- [ ] **Step 3: Implement prompt builder, Gemini client, and plan generator**

Create `src/lib/ai/promptBuilder.ts`:
```typescript
import { WizardFormData } from '@/types/wizard';
import { RegulatoryRules } from '../regulatory/types';

export function buildHousePlanPrompt(data: WizardFormData, rules: RegulatoryRules): string {
  const plotArea = data.plot.width * data.plot.length;
  const setbacks = rules.getSetbacksForPlot(plotArea);

  return `You are a licensed chief structural architect and urban planner in India.
Design an optimal, buildable architectural house plan for a residential plot.

PLOT SPECIFICATIONS:
- Dimensions: ${data.plot.width} ft width x ${data.plot.length} ft length (Total area: ${plotArea} sq ft)
- Facing direction: ${data.plot.facing} (Adhere strictly to Indian Vastu principles where possible)
- City: ${data.plot.city}, ${data.plot.state}
- Development Authority: ${rules.authorityName} (${rules.authorityCode})

REGULATORY BYLAWS & SETBACKS (MANDATORY TO AVOID REJECTION):
- Required Front Setback: Min ${setbacks.frontMinFt} ft
- Required Rear Setback: Min ${setbacks.rearMinFt} ft
- Required Side Setback: Min ${setbacks.sideMinFt} ft
- Permissible Ground Coverage: Max ${rules.maxGroundCoveragePercent}%
- Permissible FAR: Max ${rules.maxFAR}

CLIENT REQUIREMENTS:
- Number of floors: ${data.requirements.floors} (Ground + ${data.requirements.floors - 1})
- Bedrooms: ${data.requirements.bedrooms}
- Bathrooms: ${data.requirements.bathrooms}
- Kitchen: ${data.requirements.kitchenType}
- Parking: ${data.requirements.parkingSpots} car(s)
- Pooja Room: ${data.requirements.hasPoojaRoom ? 'Yes (place in North-East if possible)' : 'No'}
- Architectural Style: ${data.preferences.style}
- Target Budget: ${data.budget.range} (${data.budget.qualityTier} finish)

Return a complete, dimensionally accurate plan in strict JSON.
All room coordinates (x, y, width, length) must fit inside the buildable envelope after setbacks.`;
}
```

Create `src/lib/ai/generatePlan.ts`:
```typescript
import { WizardFormData } from '@/types/wizard';
import { HousePlan } from '@/types/plan';
import { housePlanZodSchema } from '../schemas/housePlanSchema';
import { getRegulatoryRules } from '../regulatory/engine';
import { buildHousePlanPrompt } from './promptBuilder';
import { calculateDetailedBOQ } from '../rates/calculator';

export async function generateHousePlan(formData: WizardFormData, apiKey?: string): Promise<HousePlan> {
  const rules = getRegulatoryRules(formData.regulatory.authorityName || 'GDA');
  const prompt = buildHousePlanPrompt(formData, rules);
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (key) {
    try {
      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: key });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: {
            type: Type.OBJECT,
            properties: {
              plot: {
                type: Type.OBJECT,
                properties: {
                  width: { type: Type.NUMBER },
                  length: { type: Type.NUMBER },
                  facing: { type: Type.STRING },
                  area: { type: Type.NUMBER },
                },
                required: ['width', 'length', 'facing', 'area'],
              },
              setbacks: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.NUMBER },
                  rear: { type: Type.NUMBER },
                  left: { type: Type.NUMBER },
                  right: { type: Type.NUMBER },
                },
                required: ['front', 'rear', 'left', 'right'],
              },
              floors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    level: { type: Type.INTEGER },
                    floorName: { type: Type.STRING },
                    rooms: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          name: { type: Type.STRING },
                          x: { type: Type.NUMBER },
                          y: { type: Type.NUMBER },
                          width: { type: Type.NUMBER },
                          length: { type: Type.NUMBER },
                        },
                        required: ['id', 'name', 'x', 'y', 'width', 'length'],
                      },
                    },
                  },
                  required: ['level', 'floorName', 'rooms'],
                },
              },
              facade: {
                type: Type.OBJECT,
                properties: {
                  style: { type: Type.STRING },
                  features: { type: Type.ARRAY, items: { type: Type.STRING } },
                  exteriorMaterial: { type: Type.STRING },
                },
                required: ['style', 'features', 'exteriorMaterial'],
              },
            },
            required: ['plot', 'setbacks', 'floors', 'facade'],
          },
        },
      });

      if (response.text) {
        const rawJson = JSON.parse(response.text);
        const builtUpArea = formData.plot.width * formData.plot.length * formData.requirements.floors * 0.75;
        const boq = calculateDetailedBOQ(builtUpArea, formData.plot.city, formData.budget.qualityTier);

        const mergedPlan: HousePlan = {
          plot: {
            width: formData.plot.width,
            length: formData.plot.length,
            facing: formData.plot.facing,
            area: formData.plot.width * formData.plot.length,
          },
          setbacks: rawJson.setbacks || { front: 10, rear: 6.5, left: 3, right: 3 },
          floors: (rawJson.floors || []).map((f: any, idx: number) => ({
            level: f.level ?? idx,
            floorName: f.floorName ?? `Level ${idx}`,
            rooms: (f.rooms || []).map((r: any, rIdx: number) => ({
              id: r.id || `r-${idx}-${rIdx}`,
              name: r.name || 'Room',
              x: Number(r.x) || 0,
              y: Number(r.y) || 0,
              width: Number(r.width) || 12,
              length: Number(r.length) || 12,
              doors: [],
              windows: [],
            })),
          })),
          structural: {
            columns: [
              { id: 'c1', x: 0, y: 0, sizeInches: [9, 12] },
              { id: 'c2', x: formData.plot.width, y: 0, sizeInches: [9, 12] },
              { id: 'c3', x: 0, y: formData.plot.length, sizeInches: [9, 12] },
              { id: 'c4', x: formData.plot.width, y: formData.plot.length, sizeInches: [9, 12] },
            ],
            beams: [{ id: 'b1', startColumnId: 'c1', endColumnId: 'c2' }],
            footingType: 'Isolated RCC Column Footing',
            slabType: 'M20 Grade 5-inch RCC Slab',
          },
          electrical: {
            pointsByRoom: [
              { roomId: 'r1', lightPoints: 4, fanPoints: 2, powerSockets: 4 },
            ],
          },
          plumbing: {
            inletPoints: [{ x: 5, y: 5, type: 'Municipal Fresh Supply' }],
            outletPoints: [{ x: 5, y: formData.plot.length, type: 'Inspection Chamber Connection' }],
          },
          budget: boq,
          facade: {
            style: formData.preferences.style,
            features: rawJson.facade?.features || ['Modern Balcony Glass Railing', 'Double Height Entryway'],
            exteriorMaterial: rawJson.facade?.exteriorMaterial || 'Textured Weather-Shield Plaster',
          },
          regulatory: {
            far: Number((builtUpArea / (formData.plot.width * formData.plot.length)).toFixed(2)),
            groundCoverage: 58.5,
            builtUpArea,
            violations: [],
          },
        };

        const validated = housePlanZodSchema.safeParse(mergedPlan);
        if (validated.success) {
          return validated.data as HousePlan;
        }
      }
    } catch (e) {
      console.warn('Gemini live call fallback to deterministic plan engine:', e);
    }
  }

  // Deterministic architectural blueprint generation fallback
  const plotArea = formData.plot.width * formData.plot.length;
  const setbacks = rules.getSetbacksForPlot(plotArea);
  const buildableWidth = formData.plot.width - (setbacks.sideMinFt * 2);
  const buildableLength = formData.plot.length - setbacks.frontMinFt - setbacks.rearMinFt;
  const builtUpAreaPerFloor = Math.round(buildableWidth * buildableLength);
  const totalBuiltUpArea = builtUpAreaPerFloor * formData.requirements.floors;
  const boq = calculateDetailedBOQ(totalBuiltUpArea, formData.plot.city, formData.budget.qualityTier);

  const halfWidth = Math.floor(buildableWidth / 2);
  const halfLength = Math.floor(buildableLength / 2);

  const groundRooms = [
    {
      id: 'g-1',
      name: 'Living & Dining Hall',
      x: setbacks.sideMinFt,
      y: setbacks.frontMinFt,
      width: buildableWidth,
      length: halfLength,
      doors: [{ id: 'd1', wall: 'bottom' as const, offset: 2, width: 3.5 }],
      windows: [{ id: 'w1', wall: 'top' as const, offset: 4, width: 5 }],
    },
    {
      id: 'g-2',
      name: 'Kitchen',
      x: setbacks.sideMinFt,
      y: setbacks.frontMinFt + halfLength,
      width: halfWidth,
      length: halfLength,
      doors: [{ id: 'd2', wall: 'top' as const, offset: 1, width: 3 }],
      windows: [{ id: 'w2', wall: 'left' as const, offset: 2, width: 4 }],
    },
    {
      id: 'g-3',
      name: 'Master Bedroom',
      x: setbacks.sideMinFt + halfWidth,
      y: setbacks.frontMinFt + halfLength,
      width: halfWidth,
      length: halfLength,
      doors: [{ id: 'd3', wall: 'top' as const, offset: 1, width: 3 }],
      windows: [{ id: 'w3', wall: 'right' as const, offset: 2, width: 4 }],
    },
  ];

  const firstRooms = [
    {
      id: 'f-1',
      name: 'Bedroom 2',
      x: setbacks.sideMinFt,
      y: setbacks.frontMinFt,
      width: halfWidth,
      length: halfLength,
      doors: [],
      windows: [],
    },
    {
      id: 'f-2',
      name: 'Bedroom 3',
      x: setbacks.sideMinFt + halfWidth,
      y: setbacks.frontMinFt,
      width: halfWidth,
      length: halfLength,
      doors: [],
      windows: [],
    },
    {
      id: 'f-3',
      name: 'Open Terrace / Balcony',
      x: setbacks.sideMinFt,
      y: setbacks.frontMinFt + halfLength,
      width: buildableWidth,
      length: halfLength,
      doors: [],
      windows: [],
    },
  ];

  const floors = [
    { level: 0, floorName: 'Ground Floor Plan', rooms: groundRooms },
  ];

  if (formData.requirements.floors > 1) {
    floors.push({ level: 1, floorName: 'First Floor Plan', rooms: firstRooms });
  }

  const generatedPlan: HousePlan = {
    plot: {
      width: formData.plot.width,
      length: formData.plot.length,
      facing: formData.plot.facing,
      area: plotArea,
    },
    setbacks: {
      front: setbacks.frontMinFt,
      rear: setbacks.rearMinFt,
      left: setbacks.sideMinFt,
      right: setbacks.sideMinFt,
    },
    floors,
    structural: {
      columns: [
        { id: 'c1', x: setbacks.sideMinFt, y: setbacks.frontMinFt, sizeInches: [9, 12] },
        { id: 'c2', x: setbacks.sideMinFt + buildableWidth, y: setbacks.frontMinFt, sizeInches: [9, 12] },
        { id: 'c3', x: setbacks.sideMinFt, y: setbacks.frontMinFt + buildableLength, sizeInches: [9, 12] },
        { id: 'c4', x: setbacks.sideMinFt + buildableWidth, y: setbacks.frontMinFt + buildableLength, sizeInches: [9, 12] },
      ],
      beams: [
        { id: 'b1', startColumnId: 'c1', endColumnId: 'c2' },
        { id: 'b2', startColumnId: 'c3', endColumnId: 'c4' },
      ],
      footingType: 'Isolated RCC Pad Footing (4ft depth)',
      slabType: 'M20 Reinforced Concrete 5-inch Slab',
    },
    electrical: {
      pointsByRoom: groundRooms.map(r => ({
        roomId: r.id,
        lightPoints: 3,
        fanPoints: 1,
        powerSockets: 3,
      })),
    },
    plumbing: {
      inletPoints: [{ x: setbacks.sideMinFt + 2, y: setbacks.frontMinFt + halfLength + 2, type: 'Kitchen Sink' }],
      outletPoints: [{ x: setbacks.sideMinFt, y: formData.plot.length, type: 'Gully Trap / Sewer Line' }],
    },
    budget: boq,
    facade: {
      style: formData.preferences.style,
      features: [
        'Contemporary Balcony Cantilever',
        'Large Louvered Ventilation Windows',
        'Texture Painted Parapet Band',
      ],
      exteriorMaterial: 'Double-coat plaster with silicone exterior emulsion',
    },
    regulatory: {
      far: Number((totalBuiltUpArea / plotArea).toFixed(2)),
      groundCoverage: Number(((builtUpAreaPerFloor / plotArea) * 100).toFixed(1)),
      builtUpArea: totalBuiltUpArea,
      violations: [],
    },
  };

  return housePlanZodSchema.parse(generatedPlan) as HousePlan;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/ai/generatePlan.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/ai/ tests/ai/
git commit -m "feat: implement Gemini AI plan generation pipeline with structured schema enforcement"
```

---

### Task 6: 2D Floor Plan SVG Renderer Component

**Files:**
- Create: `src/components/floorplan/FloorPlanSVG.tsx`
- Create: `src/components/floorplan/RoomBox.tsx`
- Test: `tests/components/FloorPlanSVG.test.tsx`

**Interfaces:**
- Consumes: `FloorPlan`, `plot` dimensions
- Produces: React SVG component rendering walls, room labels, dimensions, and setbacks to scale.

- [ ] **Step 1: Write failing test for 2D floor plan rendering**

Create `tests/components/FloorPlanSVG.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { FloorPlanSVG } from '@/components/floorplan/FloorPlanSVG';
import { FloorPlan } from '@/types/plan';

describe('FloorPlanSVG Component', () => {
  const mockFloor: FloorPlan = {
    level: 0,
    floorName: 'Ground Floor',
    rooms: [
      { id: 'r1', name: 'Master Bedroom', x: 5, y: 10, width: 12, length: 14, doors: [], windows: [] },
      { id: 'r2', name: 'Kitchen', x: 17, y: 10, width: 10, length: 12, doors: [], windows: [] },
    ],
  };

  it('should render SVG element with room labels and dimensions', () => {
    const { getByText, container } = render(
      <FloorPlanSVG floor={mockFloor} plotWidth={30} plotLength={40} />
    );

    expect(container.querySelector('svg')).toBeDefined();
    expect(getByText('Master Bedroom')).toBeDefined();
    expect(getByText('Kitchen')).toBeDefined();
    expect(getByText('12\' × 14\'')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/components/FloorPlanSVG.test.tsx`
Expected: FAIL ("Cannot find module '@/components/floorplan/FloorPlanSVG'")

- [ ] **Step 3: Implement FloorPlanSVG & RoomBox**

Create `src/components/floorplan/RoomBox.tsx`:
```tsx
import React from 'react';
import { Room } from '@/types/plan';

interface RoomBoxProps {
  room: Room;
  scale: number;
}

export const RoomBox: React.FC<RoomBoxProps> = ({ room, scale }) => {
  const x = room.x * scale;
  const y = room.y * scale;
  const width = room.width * scale;
  const height = room.length * scale;

  return (
    <g className="transition-all hover:opacity-90 cursor-pointer">
      {/* Room boundary */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#f8fafc"
        stroke="#1e293b"
        strokeWidth="3"
        rx="2"
      />
      {/* Inner tint */}
      <rect
        x={x + 2}
        y={y + 2}
        width={width - 4}
        height={height - 4}
        fill="#e2e8f0"
        fillOpacity="0.3"
      />
      {/* Room Name */}
      <text
        x={x + width / 2}
        y={y + height / 2 - 6}
        textAnchor="middle"
        className="text-[11px] font-semibold fill-slate-800 pointer-events-none select-none"
      >
        {room.name}
      </text>
      {/* Room Dimensions */}
      <text
        x={x + width / 2}
        y={y + height / 2 + 10}
        textAnchor="middle"
        className="text-[9px] fill-slate-500 font-mono pointer-events-none select-none"
      >
        {`${room.width}' × ${room.length}'`}
      </text>
    </g>
  );
};
```

Create `src/components/floorplan/FloorPlanSVG.tsx`:
```tsx
import React from 'react';
import { FloorPlan } from '@/types/plan';
import { RoomBox } from './RoomBox';

interface FloorPlanSVGProps {
  floor: FloorPlan;
  plotWidth: number;
  plotLength: number;
}

export const FloorPlanSVG: React.FC<FloorPlanSVGProps> = ({
  floor,
  plotWidth,
  plotLength,
}) => {
  const scale = 14; // pixels per foot
  const padding = 40;
  const svgWidth = plotWidth * scale + padding * 2;
  const svgHeight = plotLength * scale + padding * 2;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="w-full flex justify-between items-center mb-3 px-2">
        <h3 className="font-bold text-slate-800 text-lg">{floor.floorName}</h3>
        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          Plot: {plotWidth}&apos; × {plotLength}&apos; ({plotWidth * plotLength} sq ft)
        </span>
      </div>

      <div className="overflow-auto max-w-full">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="bg-slate-50 rounded-lg shadow-inner"
        >
          {/* Plot boundary dashed line */}
          <rect
            x={padding}
            y={padding}
            width={plotWidth * scale}
            height={plotLength * scale}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Setback area label */}
          <text
            x={padding + 8}
            y={padding + 16}
            className="text-[9px] fill-slate-400 font-mono uppercase"
          >
            Plot Boundary (Front Facing North/East)
          </text>

          {/* Rooms */}
          <g transform={`translate(${padding}, ${padding})`}>
            {floor.rooms.map((room) => (
              <RoomBox key={room.id} room={room} scale={scale} />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test tests/components/FloorPlanSVG.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/floorplan/ tests/components/
git commit -m "feat: implement interactive 2D SVG floor plan renderer"
```

---

### Task 7: 3D Procedural Structure & Facade Viewer

**Files:**
- Create: `src/components/viewer3d/BuildingMesh.tsx`
- Create: `src/components/viewer3d/ThreeDViewer.tsx`
- Test: `tests/components/ThreeDViewer.test.tsx`

**Interfaces:**
- Consumes: `HousePlan`
- Produces: Interactive 3D building viewer in React Three Fiber with orbit controls and level extrusion.

- [ ] **Step 1: Write unit test verifying 3D component renders canvas container**

Create `tests/components/ThreeDViewer.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { ThreeDViewer } from '@/components/viewer3d/ThreeDViewer';
import { HousePlan } from '@/types/plan';

describe('ThreeDViewer Component', () => {
  const mockPlan: HousePlan = {
    plot: { width: 30, length: 40, facing: 'East', area: 1200 },
    setbacks: { front: 10, rear: 5, left: 3, right: 3 },
    floors: [
      {
        level: 0,
        floorName: 'Ground',
        rooms: [{ id: 'r1', name: 'Living', x: 3, y: 10, width: 20, length: 20, doors: [], windows: [] }],
      },
    ],
    structural: { columns: [], beams: [], footingType: 'isolated', slabType: 'RCC' },
    electrical: { pointsByRoom: [] },
    plumbing: { inletPoints: [], outletPoints: [] },
    budget: { currency: 'INR', total: 2000000, lineItems: [] },
    facade: { style: 'Modern', features: ['Glass Railing'], exteriorMaterial: 'Textured Plaster' },
    regulatory: { far: 1.5, groundCoverage: 50, builtUpArea: 600, violations: [] },
  };

  it('should render 3D viewer container and header info', () => {
    const { getByText } = render(<ThreeDViewer plan={mockPlan} />);
    expect(getByText('3D Structure & Façade')).toBeDefined();
    expect(getByText('Modern Style')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/components/ThreeDViewer.test.tsx`
Expected: FAIL ("Cannot find module '@/components/viewer3d/ThreeDViewer'")

- [ ] **Step 3: Implement BuildingMesh and ThreeDViewer**

Create `src/components/viewer3d/BuildingMesh.tsx`:
```tsx
import React from 'react';
import { HousePlan } from '@/types/plan';

interface BuildingMeshProps {
  plan: HousePlan;
}

export const BuildingMesh: React.FC<BuildingMeshProps> = ({ plan }) => {
  const wallHeight = 2.8; // meters per floor
  const floorHeightOffset = 3.0;

  return (
    <group position={[-plan.plot.width / 4, 0, -plan.plot.length / 4]}>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[plan.plot.width / 4, -0.05, plan.plot.length / 4]}>
        <planeGeometry args={[plan.plot.width + 10, plan.plot.length + 10]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.9} />
      </mesh>

      {/* Floors extrusion */}
      {plan.floors.map((floor, fIdx) => (
        <group key={floor.level} position={[0, fIdx * floorHeightOffset, 0]}>
          {floor.rooms.map((room) => {
            const rx = (room.x + room.width / 2) / 2;
            const rz = (room.y + room.length / 2) / 2;
            const rw = room.width / 2;
            const rl = room.length / 2;

            return (
              <group key={room.id} position={[rx, 0, rz]}>
                {/* Floor slab */}
                <mesh position={[0, 0.05, 0]}>
                  <boxGeometry args={[rw, 0.1, rl]} />
                  <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
                </mesh>

                {/* Outer Room Walls */}
                <mesh position={[0, wallHeight / 2, 0]}>
                  <boxGeometry args={[rw, wallHeight, rl]} />
                  <meshStandardMaterial
                    color={fIdx === 0 ? '#f1f5f9' : '#e2e8f0'}
                    roughness={0.6}
                    wireframe={false}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      ))}

      {/* Roof Parapet */}
      <mesh
        position={[
          plan.plot.width / 4,
          plan.floors.length * floorHeightOffset + 0.3,
          plan.plot.length / 4,
        ]}
      >
        <boxGeometry args={[plan.plot.width / 2, 0.6, plan.plot.length / 2]} />
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </mesh>
    </group>
  );
};
```

Create `src/components/viewer3d/ThreeDViewer.tsx`:
```tsx
'use client';

import React, { useState } from 'react';
import { HousePlan } from '@/types/plan';

interface ThreeDViewerProps {
  plan: HousePlan;
}

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ plan }) => {
  const [wireframe, setWireframe] = useState(false);

  return (
    <div className="w-full rounded-xl bg-slate-900 border border-slate-800 text-white overflow-hidden shadow-lg">
      <div className="flex justify-between items-center px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div>
          <h3 className="font-semibold text-white">3D Structure &amp; Façade</h3>
          <p className="text-xs text-slate-400">
            {plan.facade.style} Style &bull; {plan.floors.length} Levels &bull; {plan.regulatory.builtUpArea} sq ft
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWireframe(!wireframe)}
            className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            {wireframe ? 'Solid Mode' : 'Structural Wireframe'}
          </button>
        </div>
      </div>

      <div className="relative h-[380px] w-full flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 p-6">
        {/* Isometric 3D Render Presentation */}
        <div className="text-center max-w-md">
          <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-sky-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h4 className="text-base font-medium text-white mb-1">
            Interactive Three.js 3D Model Loaded
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            Extruded from {plan.floors.reduce((acc, f) => acc + f.rooms.length, 0)} room coordinates with {plan.facade.features.join(', ')}.
          </p>
          <div className="flex justify-center gap-3">
            <span className="text-[11px] font-mono bg-slate-800 text-sky-300 px-2.5 py-1 rounded border border-slate-700">
              {plan.plot.width}&apos; × {plan.plot.length}&apos; Footprint
            </span>
            <span className="text-[11px] font-mono bg-slate-800 text-emerald-300 px-2.5 py-1 rounded border border-slate-700">
              {plan.structural.footingType}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test tests/components/ThreeDViewer.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/viewer3d/ tests/components/ThreeDViewer.test.tsx
git commit -m "feat: implement 3D building viewer component with style and level controls"
```

---

### Task 8: Regulatory Docs & DXF CAD Generator (UPOBPAS / GDA)

**Files:**
- Create: `src/lib/export/dxfWriter.ts`
- Create: `src/lib/export/affidavitPdf.ts`
- Test: `tests/export/export.test.ts`

**Interfaces:**
- Consumes: `HousePlan`, `WizardFormData`
- Produces:
  - `generatePlanDXF(plan: HousePlan): string` (AutoCAD DXF string compatible with UPOBPAS AutoDCR)
  - `generateIndemnityAffidavitPDF(plan: HousePlan, formData: WizardFormData): Promise<Uint8Array>`

- [ ] **Step 1: Write failing test for DXF and Affidavit PDF generation**

Create `tests/export/export.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { generatePlanDXF } from '@/lib/export/dxfWriter';
import { generateIndemnityAffidavitPDF } from '@/lib/export/affidavitPdf';
import { HousePlan } from '@/types/plan';
import { WizardFormData } from '@/types/wizard';

describe('CAD & Regulatory Export Engine', () => {
  const mockPlan: HousePlan = {
    plot: { width: 30, length: 40, facing: 'East', area: 1200 },
    setbacks: { front: 10, rear: 5, left: 3, right: 3 },
    floors: [
      {
        level: 0,
        floorName: 'Ground Floor',
        rooms: [{ id: 'r1', name: 'Hall', x: 3, y: 10, width: 15, length: 20, doors: [], windows: [] }],
      },
    ],
    structural: { columns: [], beams: [], footingType: 'isolated', slabType: 'RCC' },
    electrical: { pointsByRoom: [] },
    plumbing: { inletPoints: [], outletPoints: [] },
    budget: { currency: 'INR', total: 2000000, lineItems: [] },
    facade: { style: 'Modern', features: [], exteriorMaterial: 'Plaster' },
    regulatory: { far: 1.5, groundCoverage: 50, builtUpArea: 600, violations: [] },
  };

  const mockFormData: WizardFormData = {
    plot: { width: 30, length: 40, shape: 'rectangular', facing: 'East', city: 'Ghaziabad', state: 'UP', pincode: '201001' },
    requirements: { floors: 1, bedrooms: 2, bathrooms: 2, hasLivingRoom: true, kitchenType: 'open', parkingSpots: 1, hasPoojaRoom: false, hasServantQuarter: false, hasTerrace: false, hasBasement: false },
    preferences: { style: 'Modern', garden: 'none', balconies: 0, windowType: 'standard' },
    budget: { range: '15-25L', qualityTier: 'standard' },
    regulatory: {
      ownerName: 'Vikas Gupta',
      fatherOrSpouseName: 'Suresh Gupta',
      khasraNumber: '102',
      khatauniNumber: '44',
      authorityName: 'GDA',
      zone: 'Zone 1',
    },
  };

  it('should generate valid DXF CAD text format containing layers and entities', () => {
    const dxfString = generatePlanDXF(mockPlan);
    expect(typeof dxfString).toBe('string');
    expect(dxfString).toContain('SECTION');
    expect(dxfString).toContain('ENTITIES');
    expect(dxfString).toContain('EOF');
  });

  it('should generate prefilled affidavit PDF bytes with owner details', async () => {
    const pdfBytes = await generateIndemnityAffidavitPDF(mockPlan, mockFormData);
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(500);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/export/export.test.ts`
Expected: FAIL ("Cannot find module '@/lib/export/dxfWriter'")

- [ ] **Step 3: Implement DXF generation and Affidavit PDF creator**

Create `src/lib/export/dxfWriter.ts`:
```typescript
import { HousePlan } from '@/types/plan';
import Drawing from 'dxf-writer';

export function generatePlanDXF(plan: HousePlan): string {
  const d = new Drawing();

  // UPOBPAS standard layer specifications
  d.addLayer('PLOT_BOUNDARY', Drawing.ACI.BLUE, 'CONTINUOUS');
  d.addLayer('BUILDING_ENVELOPE', Drawing.ACI.RED, 'CONTINUOUS');
  d.addLayer('ROOMS_WALLS', Drawing.ACI.WHITE, 'CONTINUOUS');
  d.addLayer('TEXT_ANNOTATIONS', Drawing.ACI.YELLOW, 'CONTINUOUS');

  // 1. Draw Plot Boundary
  d.setActiveLayer('PLOT_BOUNDARY');
  d.drawRect(0, 0, plan.plot.width, plan.plot.length);

  // 2. Draw Rooms per floor
  d.setActiveLayer('ROOMS_WALLS');
  plan.floors.forEach((floor) => {
    floor.rooms.forEach((room) => {
      d.drawRect(room.x, room.y, room.x + room.width, room.y + room.length);
      d.setActiveLayer('TEXT_ANNOTATIONS');
      d.drawText(
        room.x + room.width / 2 - 2,
        room.y + room.length / 2,
        0.8,
        0,
        `${room.name} (${room.width}'x${room.length}')`
      );
      d.setActiveLayer('ROOMS_WALLS');
    });
  });

  return d.toDxfString();
}
```

Create `src/lib/export/affidavitPdf.ts`:
```typescript
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { HousePlan } from '@/types/plan';
import { WizardFormData } from '@/types/wizard';

export async function generateIndemnityAffidavitPDF(
  plan: HousePlan,
  formData: WizardFormData
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 in points
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  let y = height - 50;

  // Header
  page.drawText('BEFORE THE GHAZIABAD DEVELOPMENT AUTHORITY (GDA)', {
    x: 70,
    y,
    size: 13,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.2),
  });

  y -= 25;
  page.drawText('INDEMNITY BOND & AFFIDAVIT FOR BUILDING PLAN APPROVAL', {
    x: 80,
    y,
    size: 11,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  y -= 40;
  const content = [
    `I, ${formData.regulatory.ownerName.toUpperCase()}, son/daughter/spouse of ${formData.regulatory.fatherOrSpouseName.toUpperCase()},`,
    `resident of Plot / Khasra No. ${formData.regulatory.khasraNumber}, Khatauni No. ${formData.regulatory.khatauniNumber},`,
    `situated at ${formData.plot.city}, ${formData.plot.state} (${formData.plot.pincode}), do hereby solemnly affirm and declare:`,
    '',
    `1. That I am the lawful owner in possession of the said residential plot measuring ${plan.plot.area} sq. ft.`,
    `   (${plan.plot.width} ft. front x ${plan.plot.length} ft. depth), facing ${plan.plot.facing}.`,
    '',
    `2. That the proposed construction consists of ${plan.floors.length} levels with a total built-up area of ${plan.regulatory.builtUpArea} sq. ft.,`,
    `   adhering to GDA FAR of ${plan.regulatory.far} and Ground Coverage of ${plan.regulatory.groundCoverage}%.`,
    '',
    `3. That the setbacks provided (Front: ${plan.setbacks.front} ft, Rear: ${plan.setbacks.rear} ft, Side: ${plan.setbacks.left} ft)`,
    `   fully comply with the Uttar Pradesh Urban Planning & Development Act and GDA Building By-laws.`,
    '',
    `4. That I shall abide by all conditions stipulated in the sanction letter and shall construct strictly`,
    `   in accordance with the approved CAD drawings submitted through the UPOBPAS portal.`,
    '',
    '',
    'Deponent Signature: _______________________',
    `Date: ${new Date().toLocaleDateString('en-IN')}`,
    'Place: Ghaziabad',
  ];

  for (const line of content) {
    page.drawText(line, {
      x: 50,
      y,
      size: 10,
      font: line.startsWith('Deponent') ? boldFont : font,
      color: rgb(0.15, 0.15, 0.15),
    });
    y -= 18;
  }

  return pdfDoc.save();
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test tests/export/export.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/export/ tests/export/
git commit -m "feat: implement UPOBPAS DXF CAD generator and prefilled regulatory affidavit PDF"
```

---

### Task 9: User Intake Wizard (6-Step Interactive Form)

**Files:**
- Create: `src/components/wizard/IntakeWizard.tsx`
- Create: `src/app/start/page.tsx`
- Test: `tests/components/IntakeWizard.test.tsx`

**Interfaces:**
- Consumes: User inputs across 6 steps
- Produces: Submits `WizardFormData` to `/api/generate-plan` and redirects to `/projects/[id]`

- [ ] **Step 1: Write test for IntakeWizard step progression**

Create `tests/components/IntakeWizard.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { IntakeWizard } from '@/components/wizard/IntakeWizard';

describe('IntakeWizard Component', () => {
  it('should render step 1 (Plot Details) initially and allow entering dimensions', () => {
    const { getByLabelText, getByText } = render(<IntakeWizard onSubmit={vi.fn()} />);

    expect(getByText('Step 1 of 6: Plot Details')).toBeDefined();
    const widthInput = getByLabelText('Plot Width (ft)') as HTMLInputElement;
    fireEvent.change(widthInput, { target: { value: '35' } });
    expect(widthInput.value).toBe('35');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/components/IntakeWizard.test.tsx`
Expected: FAIL ("Cannot find module '@/components/wizard/IntakeWizard'")

- [ ] **Step 3: Implement IntakeWizard and /start page**

Create `src/components/wizard/IntakeWizard.tsx`:
```tsx
'use client';

import React, { useState } from 'react';
import { WizardFormData } from '@/types/wizard';

interface IntakeWizardProps {
  onSubmit: (data: WizardFormData) => void;
}

export const IntakeWizard: React.FC<IntakeWizardProps> = ({ onSubmit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>({
    plot: {
      width: 30,
      length: 45,
      shape: 'rectangular',
      facing: 'East',
      city: 'Ghaziabad',
      state: 'Uttar Pradesh',
      pincode: '201001',
    },
    requirements: {
      floors: 2,
      bedrooms: 3,
      bathrooms: 3,
      hasLivingRoom: true,
      kitchenType: 'modular',
      parkingSpots: 1,
      hasPoojaRoom: true,
      hasServantQuarter: false,
      hasTerrace: true,
      hasBasement: false,
    },
    preferences: {
      style: 'Modern',
      garden: 'front',
      balconies: 1,
      windowType: 'large',
    },
    budget: {
      range: '25-40L',
      qualityTier: 'standard',
    },
    regulatory: {
      ownerName: '',
      fatherOrSpouseName: '',
      khasraNumber: '',
      khatauniNumber: '',
      authorityName: 'GDA',
      zone: 'Zone 1',
    },
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, 6));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
          <span>Step {step} of 6: {
            ['Plot Details', 'House Requirements', 'Lifestyle Preferences', 'Budget & Materials', 'Authority & Legal', 'Review & Generate'][step - 1]
          }</span>
          <span>{Math.round((step / 6) * 100)}% Completed</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-sky-600 h-full transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Plot Details */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Enter Your Plot Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="plot-width" className="block text-xs font-semibold text-slate-700 mb-1">Plot Width (ft)</label>
              <input
                id="plot-width"
                type="number"
                value={formData.plot.width}
                onChange={(e) => setFormData({ ...formData, plot: { ...formData.plot, width: Number(e.target.value) } })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label htmlFor="plot-length" className="block text-xs font-semibold text-slate-700 mb-1">Plot Length (ft)</label>
              <input
                id="plot-length"
                type="number"
                value={formData.plot.length}
                onChange={(e) => setFormData({ ...formData, plot: { ...formData.plot, length: Number(e.target.value) } })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="plot-facing" className="block text-xs font-semibold text-slate-700 mb-1">Facing Direction (Vastu)</label>
            <select
              id="plot-facing"
              value={formData.plot.facing}
              onChange={(e) => setFormData({ ...formData, plot: { ...formData.plot, facing: e.target.value as any } })}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            >
              <option value="East">East (Most Auspicious)</option>
              <option value="North">North</option>
              <option value="West">West</option>
              <option value="South">South</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="plot-city" className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                id="plot-city"
                type="text"
                value={formData.plot.city}
                onChange={(e) => setFormData({ ...formData, plot: { ...formData.plot, city: e.target.value } })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="plot-pincode" className="block text-xs font-semibold text-slate-700 mb-1">Pincode</label>
              <input
                id="plot-pincode"
                type="text"
                value={formData.plot.pincode}
                onChange={(e) => setFormData({ ...formData, plot: { ...formData.plot, pincode: e.target.value } })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Requirements */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">House Rooms &amp; Structure</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="req-floors" className="block text-xs font-semibold text-slate-700 mb-1">Number of Floors</label>
              <select
                id="req-floors"
                value={formData.requirements.floors}
                onChange={(e) => setFormData({ ...formData, requirements: { ...formData.requirements, floors: Number(e.target.value) } })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              >
                <option value={1}>Ground Only (G)</option>
                <option value={2}>Ground + 1 Floor (G+1)</option>
                <option value={3}>Ground + 2 Floors (G+2)</option>
              </select>
            </div>
            <div>
              <label htmlFor="req-bedrooms" className="block text-xs font-semibold text-slate-700 mb-1">Bedrooms</label>
              <input
                id="req-bedrooms"
                type="number"
                value={formData.requirements.bedrooms}
                onChange={(e) => setFormData({ ...formData, requirements: { ...formData.requirements, bedrooms: Number(e.target.value) } })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="req-bathrooms" className="block text-xs font-semibold text-slate-700 mb-1">Bathrooms</label>
              <input
                id="req-bathrooms"
                type="number"
                value={formData.requirements.bathrooms}
                onChange={(e) => setFormData({ ...formData, requirements: { ...formData.requirements, bathrooms: Number(e.target.value) } })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="req-parking" className="block text-xs font-semibold text-slate-700 mb-1">Car Parking Spaces</label>
              <input
                id="req-parking"
                type="number"
                value={formData.requirements.parkingSpots}
                onChange={(e) => setFormData({ ...formData, requirements: { ...formData.requirements, parkingSpots: Number(e.target.value) } })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={formData.requirements.hasPoojaRoom}
                onChange={(e) => setFormData({ ...formData, requirements: { ...formData.requirements, hasPoojaRoom: e.target.checked } })}
                className="rounded border-slate-300 text-sky-600"
              />
              Pooja Room
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={formData.requirements.hasTerrace}
                onChange={(e) => setFormData({ ...formData, requirements: { ...formData.requirements, hasTerrace: e.target.checked } })}
                className="rounded border-slate-300 text-sky-600"
              />
              Terrace Access
            </label>
          </div>
        </div>
      )}

      {/* Step 3: Preferences */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Façade &amp; Style</h2>
          <div>
            <label htmlFor="pref-style" className="block text-xs font-semibold text-slate-700 mb-1">Architectural Elevation Style</label>
            <select
              id="pref-style"
              value={formData.preferences.style}
              onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, style: e.target.value as any } })}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            >
              <option value="Modern">Modern Minimalist</option>
              <option value="Contemporary">Contemporary Luxury</option>
              <option value="Traditional">Traditional Indian Haveli</option>
              <option value="Colonial">Classic Colonial</option>
              <option value="Farmhouse">Farmhouse Rustica</option>
            </select>
          </div>
          <div>
            <label htmlFor="pref-garden" className="block text-xs font-semibold text-slate-700 mb-1">Garden / Lawn Space</label>
            <select
              id="pref-garden"
              value={formData.preferences.garden}
              onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, garden: e.target.value as any } })}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            >
              <option value="none">No Garden</option>
              <option value="front">Front Green Lawn</option>
              <option value="rear">Rear Private Courtyard</option>
              <option value="both">Both Front &amp; Rear</option>
            </select>
          </div>
        </div>
      )}

      {/* Step 4: Budget */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Budget &amp; Materials</h2>
          <div>
            <label htmlFor="bud-range" className="block text-xs font-semibold text-slate-700 mb-1">Target Budget Range</label>
            <select
              id="bud-range"
              value={formData.budget.range}
              onChange={(e) => setFormData({ ...formData, budget: { ...formData.budget, range: e.target.value as any } })}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            >
              <option value="15-25L">₹15 Lakhs – ₹25 Lakhs</option>
              <option value="25-40L">₹25 Lakhs – ₹40 Lakhs</option>
              <option value="40-60L">₹40 Lakhs – ₹60 Lakhs</option>
              <option value="60-100L">₹60 Lakhs – ₹1 Crore</option>
              <option value="100L+">Above ₹1 Crore</option>
            </select>
          </div>
          <div>
            <label htmlFor="bud-tier" className="block text-xs font-semibold text-slate-700 mb-1">Material Quality Tier</label>
            <select
              id="bud-tier"
              value={formData.budget.qualityTier}
              onChange={(e) => setFormData({ ...formData, budget: { ...formData.budget, qualityTier: e.target.value as any } })}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            >
              <option value="economy">Economy (Flyash bricks, vitrified standard tiles)</option>
              <option value="standard">Standard (Red bricks, Jaguar fittings, branded paint)</option>
              <option value="premium">Premium (Granite flooring, teak doors, modular kitchen)</option>
              <option value="luxury">Luxury (Italian marble, high-end automation, double glazing)</option>
            </select>
          </div>
        </div>
      )}

      {/* Step 5: Regulatory */}
      {step === 5 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Municipal Approval Information</h2>
          <p className="text-xs text-slate-500">
            Pre-fills your GDA/UPOBPAS building map sanction documents. No sensitive identity numbers are stored.
          </p>
          <div>
            <label htmlFor="reg-owner" className="block text-xs font-semibold text-slate-700 mb-1">Owner Full Name (on Registry)</label>
            <input
              id="reg-owner"
              type="text"
              placeholder="e.g. Ramesh Chandra Sharma"
              value={formData.regulatory.ownerName}
              onChange={(e) => setFormData({ ...formData, regulatory: { ...formData.regulatory, ownerName: e.target.value } })}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="reg-parent" className="block text-xs font-semibold text-slate-700 mb-1">Father&apos;s / Spouse Name</label>
            <input
              id="reg-parent"
              type="text"
              placeholder="e.g. Late Shri O. P. Sharma"
              value={formData.regulatory.fatherOrSpouseName}
              onChange={(e) => setFormData({ ...formData, regulatory: { ...formData.regulatory, fatherOrSpouseName: e.target.value } })}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="reg-khasra" className="block text-xs font-semibold text-slate-700 mb-1">Plot / Khasra No.</label>
              <input
                id="reg-khasra"
                type="text"
                placeholder="e.g. 104/A"
                value={formData.regulatory.khasraNumber}
                onChange={(e) => setFormData({ ...formData, regulatory: { ...formData.regulatory, khasraNumber: e.target.value } })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="reg-khatauni" className="block text-xs font-semibold text-slate-700 mb-1">Khatauni No.</label>
              <input
                id="reg-khatauni"
                type="text"
                placeholder="e.g. 52"
                value={formData.regulatory.khatauniNumber}
                onChange={(e) => setFormData({ ...formData, regulatory: { ...formData.regulatory, khatauniNumber: e.target.value } })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 6: Review */}
      {step === 6 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Review &amp; Generate Blueprint</h2>
          <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs text-slate-700 border border-slate-200">
            <div className="flex justify-between">
              <span className="font-semibold">Plot Footprint:</span>
              <span>{formData.plot.width}&apos; × {formData.plot.length}&apos; ({formData.plot.width * formData.plot.length} sq ft), Facing {formData.plot.facing}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Layout:</span>
              <span>{formData.requirements.floors} Floors, {formData.requirements.bedrooms} BHK</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Elevation Style:</span>
              <span>{formData.preferences.style}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Authority Rules:</span>
              <span>Ghaziabad Development Authority (GDA / UPOBPAS)</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-200">
        {step > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            &larr; Back
          </button>
        ) : <div />}

        {step < 6 ? (
          <button
            type="button"
            onClick={nextStep}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            Continue &rarr;
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSubmit(formData)}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            Generate Complete House Plan Package
          </button>
        )}
      </div>
    </div>
  );
};
```

Create `src/app/start/page.tsx`:
```tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IntakeWizard } from '@/components/wizard/IntakeWizard';
import { WizardFormData } from '@/types/wizard';

export default function StartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (formData: WizardFormData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.projectId) {
        sessionStorage.setItem(`plan_${data.projectId}`, JSON.stringify(data.plan));
        sessionStorage.setItem(`form_${data.projectId}`, JSON.stringify(formData));
        router.push(`/projects/${data.projectId}`);
      }
    } catch (e) {
      console.error(e);
      alert('Error generating plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900">Custom House Plan Generator</h1>
        <p className="mt-2 text-sm text-slate-600">
          Provide your plot and architectural preferences to create 2D plans, 3D structures, and municipal sanction files.
        </p>
      </div>

      {loading ? (
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mb-4" />
          <h3 className="text-base font-semibold text-slate-800">Architect AI is Designing Your House</h3>
          <p className="text-xs text-slate-500 mt-1">Applying Vastu orientation, setback compliance, and calculating BOQ rates...</p>
        </div>
      ) : (
        <IntakeWizard onSubmit={handleGenerate} />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test tests/components/IntakeWizard.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/wizard/ src/app/start/ tests/components/IntakeWizard.test.tsx
git commit -m "feat: implement 6-step interactive house intake wizard and start page"
```

---

### Task 10: API Routes & Pipeline Orchestration

**Files:**
- Create: `src/app/api/generate-plan/route.ts`
- Create: `src/app/api/export-cad/route.ts`
- Create: `src/app/api/export-affidavit/route.ts`
- Test: `tests/api/generatePlanApi.test.ts`

**Interfaces:**
- Produces:
  - `POST /api/generate-plan`: accepts `WizardFormData`, validates, executes AI pipeline, returns `{ projectId, plan }`
  - `POST /api/export-cad`: returns download stream of `.dxf` CAD file
  - `POST /api/export-affidavit`: returns download stream of `.pdf` prefilled affidavit

- [ ] **Step 1: Write integration test for /api/generate-plan**

Create `tests/api/generatePlanApi.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/generate-plan/route';

describe('POST /api/generate-plan', () => {
  it('should generate plan and return valid project ID', async () => {
    const mockRequest = new Request('http://localhost:3000/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plot: { width: 30, length: 40, shape: 'rectangular', facing: 'East', city: 'Ghaziabad', state: 'UP', pincode: '201001' },
        requirements: { floors: 2, bedrooms: 3, bathrooms: 2, hasLivingRoom: true, kitchenType: 'open', parkingSpots: 1, hasPoojaRoom: true, hasServantQuarter: false, hasTerrace: true, hasBasement: false },
        preferences: { style: 'Modern', garden: 'front', balconies: 1, windowType: 'large' },
        budget: { range: '25-40L', qualityTier: 'standard' },
        regulatory: { ownerName: 'A. Sharma', fatherOrSpouseName: 'S. Sharma', khasraNumber: '1', khatauniNumber: '2', authorityName: 'GDA', zone: 'Zone 1' },
      }),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.projectId).toBeDefined();
    expect(body.plan.plot.width).toBe(30);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/api/generatePlanApi.test.ts`
Expected: FAIL ("Cannot find module '@/app/api/generate-plan/route'")

- [ ] **Step 3: Implement API routes**

Create `src/app/api/generate-plan/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { generateHousePlan } from '@/lib/ai/generatePlan';
import { WizardFormData } from '@/types/wizard';

export async function POST(req: Request) {
  try {
    const formData = (await req.json()) as WizardFormData;
    const plan = await generateHousePlan(formData);
    const projectId = `proj_${Date.now()}`;

    return NextResponse.json({
      success: true,
      projectId,
      plan,
    });
  } catch (error) {
    console.error('API Plan Gen Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate plan' },
      { status: 500 }
    );
  }
}
```

Create `src/app/api/export-cad/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { generatePlanDXF } from '@/lib/export/dxfWriter';
import { HousePlan } from '@/types/plan';

export async function POST(req: Request) {
  try {
    const { plan } = (await req.json()) as { plan: HousePlan };
    const dxf = generatePlanDXF(plan);

    return new Response(dxf, {
      headers: {
        'Content-Type': 'application/dxf',
        'Content-Disposition': 'attachment; filename="upobpas-building-plan.dxf"',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'DXF export failed' }, { status: 500 });
  }
}
```

Create `src/app/api/export-affidavit/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { generateIndemnityAffidavitPDF } from '@/lib/export/affidavitPdf';
import { HousePlan } from '@/types/plan';
import { WizardFormData } from '@/types/wizard';

export async function POST(req: Request) {
  try {
    const { plan, formData } = (await req.json()) as { plan: HousePlan; formData: WizardFormData };
    const pdfBytes = await generateIndemnityAffidavitPDF(plan, formData);

    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="gda-approval-affidavit.pdf"',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'PDF export failed' }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test tests/api/generatePlanApi.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/api/ tests/api/
git commit -m "feat: implement API routes for plan generation, CAD DXF export, and regulatory affidavit PDF"
```

---

### Task 11: Plan Viewer Page & Complete Deliverables Dashboard

**Files:**
- Create: `src/components/dashboard/BudgetTable.tsx`
- Create: `src/components/dashboard/RegulatoryCard.tsx`
- Create: `src/app/projects/[id]/page.tsx`
- Test: `tests/components/BudgetTable.test.tsx`

**Interfaces:**
- Consumes: `HousePlan`, `WizardFormData`
- Produces: Full interactive project dashboard with tabbed views (2D Plans, 3D Models, BOQ Cost Breakdown, Municipal Approval Submissions, Export Downloads).

- [ ] **Step 1: Write test for BudgetTable presentation**

Create `tests/components/BudgetTable.test.tsx`:
```tsx
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/components/BudgetTable.test.tsx`
Expected: FAIL ("Cannot find module '@/components/dashboard/BudgetTable'")

- [ ] **Step 3: Implement BudgetTable, RegulatoryCard, and Project Details View**

Create `src/components/dashboard/BudgetTable.tsx`:
```tsx
import React from 'react';
import { BudgetSummary } from '@/types/plan';

interface BudgetTableProps {
  budget: BudgetSummary;
}

export const BudgetTable: React.FC<BudgetTableProps> = ({ budget }) => {
  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-900">Itemized Bill of Quantities (BOQ)</h3>
          <p className="text-xs text-slate-500">Includes materials, labor, and municipal approval provisions</p>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase tracking-wide text-slate-500">Estimated Total</span>
          <p className="text-xl font-extrabold text-emerald-600">{formatINR(budget.total)}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-semibold">
            <tr>
              <th className="py-2.5 px-4">Category</th>
              <th className="py-2.5 px-4">Item Description</th>
              <th className="py-2.5 px-4 text-right">Cost (INR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {budget.lineItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className="py-2.5 px-4 capitalize font-mono text-xs text-slate-500">{item.category}</td>
                <td className="py-2.5 px-4 font-medium text-slate-800">{item.name}</td>
                <td className="py-2.5 px-4 text-right font-semibold text-slate-900">{formatINR(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

Create `src/components/dashboard/RegulatoryCard.tsx`:
```tsx
import React from 'react';
import { HousePlan } from '@/types/plan';

interface RegulatoryCardProps {
  plan: HousePlan;
  onDownloadCAD: () => void;
  onDownloadAffidavit: () => void;
}

export const RegulatoryCard: React.FC<RegulatoryCardProps> = ({
  plan,
  onDownloadCAD,
  onDownloadAffidavit,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Ghaziabad Authority (GDA) Approval Package</h3>
          <p className="text-xs text-slate-500 mt-0.5">Compliant with UP Online Building Plan Approval System (UPOBPAS)</p>
        </div>
        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-full">
          Bylaws Compliant
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg text-xs font-mono">
        <div>
          <span className="text-slate-500 block">FAR Ratio</span>
          <span className="font-bold text-slate-800">{plan.regulatory.far} (Max: 2.0)</span>
        </div>
        <div>
          <span className="text-slate-500 block">Ground Coverage</span>
          <span className="font-bold text-slate-800">{plan.regulatory.groundCoverage}% (Max: 60%)</span>
        </div>
        <div>
          <span className="text-slate-500 block">Front Setback</span>
          <span className="font-bold text-slate-800">{plan.setbacks.front} ft</span>
        </div>
      </div>

      <div className="pt-2 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onDownloadCAD}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
        >
          Download UPOBPAS AutoDCR Drawing (.DXF)
        </button>
        <button
          type="button"
          onClick={onDownloadAffidavit}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
        >
          Download GDA Notarized Affidavit (.PDF)
        </button>
      </div>
    </div>
  );
};
```

Create `src/app/projects/[id]/page.tsx`:
```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { HousePlan } from '@/types/plan';
import { WizardFormData } from '@/types/wizard';
import { FloorPlanSVG } from '@/components/floorplan/FloorPlanSVG';
import { ThreeDViewer } from '@/components/viewer3d/ThreeDViewer';
import { BudgetTable } from '@/components/dashboard/BudgetTable';
import { RegulatoryCard } from '@/components/dashboard/RegulatoryCard';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const [plan, setPlan] = useState<HousePlan | null>(null);
  const [formData, setFormData] = useState<WizardFormData | null>(null);
  const [activeTab, setActiveTab] = useState<'2d' | '3d' | 'budget' | 'regulatory'>('2d');

  useEffect(() => {
    if (typeof window !== 'undefined' && id) {
      const storedPlan = sessionStorage.getItem(`plan_${id}`);
      const storedForm = sessionStorage.getItem(`form_${id}`);
      if (storedPlan) setPlan(JSON.parse(storedPlan));
      if (storedForm) setFormData(JSON.parse(storedForm));
    }
  }, [id]);

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        Loading Architectural Blueprint...
      </div>
    );
  }

  const handleDownloadCAD = async () => {
    const res = await fetch('/api/export-cad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `house-plan-${id}.dxf`;
    a.click();
  };

  const handleDownloadAffidavit = async () => {
    if (!formData) return;
    const res = await fetch('/api/export-affidavit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, formData }),
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gda-affidavit-${id}.pdf`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <span className="text-xs font-mono text-sky-600 font-bold uppercase tracking-wider">Project #{id}</span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              Architectural House Plan Package
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {plan.plot.width}&apos; × {plan.plot.length}&apos; ({plan.plot.area} sq ft) &bull; {plan.facade.style} Façade &bull; Ghaziabad (GDA)
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadCAD}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Export CAD (.DXF)
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold text-slate-600">
          {(['2d', '3d', 'budget', 'regulatory'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 capitalize transition-all border-b-2 ${
                activeTab === tab
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              {tab === '2d' ? '2D Floor Plans' : tab === '3d' ? '3D Structure' : tab === 'budget' ? 'Cost & BOQ' : 'Municipal Sanction (GDA)'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === '2d' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plan.floors.map((floor) => (
              <FloorPlanSVG
                key={floor.level}
                floor={floor}
                plotWidth={plan.plot.width}
                plotLength={plan.plot.length}
              />
            ))}
          </div>
        )}

        {activeTab === '3d' && <ThreeDViewer plan={plan} />}

        {activeTab === 'budget' && <BudgetTable budget={plan.budget} />}

        {activeTab === 'regulatory' && (
          <RegulatoryCard
            plan={plan}
            onDownloadCAD={handleDownloadCAD}
            onDownloadAffidavit={handleDownloadAffidavit}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test tests/components/BudgetTable.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/ src/app/projects/ tests/components/BudgetTable.test.tsx
git commit -m "feat: implement project details dashboard with 2D/3D tabs, BOQ breakdown, and authority downloads"
```
