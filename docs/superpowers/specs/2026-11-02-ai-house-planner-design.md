# AI House Planner Platform — Design Specification
**Date:** 2026-11-02  
**Status:** Approved for Implementation Planning  
**Stack:** Next.js + Firebase + Gemini API + Three.js  
**Model:** Freemium (AI-first, human architect upgrade option)  
**Scope:** India-first, Ghaziabad/UP as first regulatory pilot  

---

## 1. Problem Statement

Building a house in India requires an architect's drawings, regulatory authority approval (e.g., GDA in Ghaziabad), structural plans, BOQ, and facade designs — a process that is expensive, slow, and inaccessible to most homeowners. This platform allows any homeowner to enter their requirements and receive a complete, professional-grade house plan package instantly via AI, with city-specific regulatory documents pre-filled for authority submission.

---

## 2. Core Value Proposition

1. **Instant AI-generated house plans** — 2D floor plans, 3D interactive view, elevations, structural layout, plumbing, electrical
2. **City-specific regulatory docs** — auto-filled building plan approval forms for GDA, MCD, NMMC, and other authorities
3. **Detailed budget estimate** — item-wise BOQ with material costs for the user's city
4. **Human architect upgrade** — paid option to have a licensed architect review and sign off the AI-generated plan

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Next.js 14 Web App                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  User Intake │  │ Plan Viewer  │  │  Dashboard /   │  │
│  │  Wizard      │  │ (2D + 3D +  │  │  My Projects   │  │
│  │  (6 Steps)   │  │  PDF export) │  │                │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬────────┘  │
└─────────│────────────────│────────────────────│──────────┘
          │ POST /api/generate-plan             │
          ▼                                     ▼
┌─────────────────────────────────────────────────────────┐
│                Next.js API Routes (BFF Layer)            │
│  POST /api/generate-plan   → triggers Gemini + saves    │
│  GET  /api/plans/[id]      → returns plan JSON          │
│  POST /api/export-pdf      → Puppeteer PDF generation   │
│  GET  /api/regulatory/[city] → city rules + form data   │
└──────────┬────────────────────────────────────────────┘
           │
    ┌──────┴────────────────────────┐
    │                               │
    ▼                               ▼
┌──────────────────┐      ┌──────────────────────────────┐
│   Gemini API     │      │        Firebase               │
│  gemini-1.5-pro  │      │  ├── Auth (Google, Email,    │
│                  │      │  │         Phone OTP)         │
│  Used for:       │      │  ├── Firestore (data)        │
│  • Plan JSON gen │      │  ├── Storage (PDFs, GLBs)    │
│  • Budget calc   │      │  └── Functions (optional)    │
│  • Regulatory    │      └──────────────────────────────┘
│    doc generation│
└──────────────────┘
```

### Key design decisions:
- **Next.js API Routes as BFF** — keeps Gemini API key server-side, handles PDF generation server-side
- **Firebase** — fast to build, handles auth + real-time plan status updates via Firestore listeners
- **Three.js in browser** — 3D rendering fully client-side, no server GPU required
- **SVG for 2D** — vector floor plans, scalable, exportable, printable

---

## 4. User Intake Wizard (6 Steps)

### Step 1: Plot Details
| Field | Type | Notes |
|---|---|---|
| Plot width (ft) | Number | |
| Plot length (ft) | Number | |
| Plot shape | Select | Rectangular / L-shaped / Irregular |
| Facing direction | Select | East / West / North / South |
| City | Text + Autocomplete | Drives regulatory rules lookup |
| State | Select | |
| Pincode | Number | |

### Step 2: House Requirements
| Field | Type |
|---|---|
| Number of floors | Select (G / G+1 / G+2 / G+3) |
| Bedrooms | Number |
| Bathrooms | Number |
| Living room / Hall | Checkbox |
| Kitchen type | Select (Open / Closed / Modular) |
| Parking | Select (None / 1 car / 2 cars / Covered) |
| Servant quarter | Checkbox |
| Terrace | Checkbox |
| Basement | Checkbox |
| Staircase type | Select (Straight / L-shaped / Spiral) |

### Step 3: Lifestyle Preferences
| Field | Type |
|---|---|
| Architectural style | Select (Modern / Traditional / Contemporary / Colonial / Farmhouse) |
| Pooja room | Checkbox |
| Home office | Checkbox |
| Garden / Lawn | Select (None / Front / Rear / Both) |
| Balcony | Select (None / One / Multiple) |
| Windows preference | Select (Standard / Large / Floor-to-ceiling) |

### Step 4: Budget
| Field | Type |
|---|---|
| Total budget range | Select (₹15-25L / ₹25-40L / ₹40-60L / ₹60-100L / ₹1Cr+) |
| Material quality | Select (Economy / Standard / Premium / Luxury) |
| Priority | Select (Maximize rooms / Maximize quality / Maximize space) |

### Step 5: Regulatory Information
| Field | Type | Notes |
|---|---|---|
| Owner full name | Text | |
| Father's / Spouse name | Text | |
| Plot/Khasra number | Text | GDA/authority parcel ID |
| Khatoni / Khatauni number | Text | Revenue record ID |
| Local body / Nagar Palika | Text | Auto-filled from city |
| Municipality zone | Select | Authority-specific zones |
| Intended use | Select | Residential / Commercial / Mixed |
| Plot registration number | Text | Sale deed ref |

> **Privacy:** Aadhaar/PAN are never stored. Regulatory fields are collected only to pre-fill authority forms and are encrypted at rest.

### Step 6: Review & Submit
- Summary card of all inputs
- Selected plan tier (Free / Paid)
- Estimated generation time (Free: 2 mins / Paid: 5 mins)
- Payment flow (Razorpay) if paid tier selected
- Submit button → triggers plan generation pipeline

---

## 5. Plan Generation Pipeline

```
User submits wizard
        │
        ▼
1. Validate inputs (setback rules, FAR limits for city)
        │
        ▼
2. Build Gemini prompt (plot data + requirements + city rules)
        │
        ▼
3. Call Gemini API → receive HousePlan JSON
        │
        ├──→ 4a. Save plan JSON to Firestore
        │
        ├──→ 4b. Validate: check setbacks, FAR, ground coverage
        │         Flag violations → feedback to user
        │
        ├──→ 4c. Render 2D SVG floor plans (server-side, React SSR)
        │
        ├──→ 4d. Generate 3D GLB model (Three.js → GLB export)
        │
        ├──→ 4e. Generate budget BOQ (area × city material rates)
        │
        ├──→ 4f. Generate regulatory docs (template + plan data)
        │
        └──→ 4g. Generate PDF package (Puppeteer, all above)
                        │
                        ▼
               Save all files to Firebase Storage
                        │
                        ▼
               Update Firestore project status → "ready"
                        │
                        ▼
               User notified (email + in-app)
```

### HousePlan JSON Schema

```typescript
interface HousePlan {
  plot: {
    width: number;        // feet
    length: number;       // feet
    facing: Direction;
    area: number;         // sq ft
  };
  setbacks: {
    front: number;        // feet
    rear: number;
    left: number;
    right: number;
  };
  floors: FloorPlan[];
  structural: {
    columns: Point[];     // column grid positions
    beams: Beam[];
    footingType: string;  // "isolated" | "combined" | "raft"
    slabType: string;     // "RCC flat slab" | "one-way slab"
  };
  electrical: {
    byRoom: RoomElectrical[];
  };
  plumbing: {
    inletPoints: Point[];
    outletPoints: Point[];
    drainLines: Line[];
  };
  budget: {
    lineItems: BudgetItem[];
    total: number;        // INR
    currency: "INR";
  };
  facade: {
    style: string;
    features: string[];
    exteriorMaterial: string;
    roofType: string;
  };
  regulatory: {
    far: number;
    groundCoverage: number;  // percentage
    builtUpArea: number;
    violations: string[];    // empty if compliant
  };
}

interface FloorPlan {
  level: number;           // 0 = ground, 1 = first, etc.
  rooms: Room[];
}

interface Room {
  name: string;
  x: number;               // feet from plot origin
  y: number;
  width: number;
  length: number;
  doors: Door[];
  windows: Window[];
}
```

---

## 6. Deliverables Package

### Free Tier
- Basic 2D floor plan — ground floor only (SVG/PDF, no dimensions)
- Rough budget estimate (range, not itemized)
- Site plan (plot boundary + basic setbacks)
- Watermarked — "Upgrade to download full package"

### Paid Tier (Complete Package)
| # | Deliverable | Format |
|---|---|---|
| 1 | 2D Floor Plans — all floors with dimensions | SVG + PDF |
| 2 | Site Plan with setbacks, north arrow, approach road | SVG + PDF |
| 3 | Front, Rear, Left, Right Elevations (façade drawings) | SVG + PDF |
| 4 | Section Drawing (cross-section, floor heights, slab) | SVG + PDF |
| 5 | Structural Layout (column/beam grid, footing plan) | SVG + PDF |
| 6 | Electrical Layout (room-wise points) | SVG + PDF |
| 7 | Plumbing Layout (supply + drainage) | SVG + PDF |
| 8 | Detailed BOQ (item-wise material + labour) | PDF + Excel |
| 9 | Specifications Sheet (material grades, finishes) | PDF |
| 10 | Interactive 3D Viewer | Web (Three.js) |
| 11 | 3D Model Export | GLB file |
| 12 | Regulatory Package (authority forms, affidavit, NOC checklist) | PDF |

---

## 7. Regulatory Engine

### Architecture
- `regulatoryRules` Firestore collection: one document per authority code (e.g., `GDA_GHAZIABAD`, `MCD_DELHI_SOUTH`)
- Each document stores: setback rules, FAR limits, ground coverage limits, form template IDs, required document list

### Validation Logic
```typescript
function validatePlan(plan: HousePlan, rules: RegulatoryRules): ValidationResult {
  const violations = [];
  if (plan.setbacks.front < rules.setbacks.front) violations.push(`Front setback violation: need ${rules.setbacks.front}ft, got ${plan.setbacks.front}ft`);
  if (plan.regulatory.far > rules.maxFAR) violations.push(`FAR exceeded: max ${rules.maxFAR}, got ${plan.regulatory.far}`);
  if (plan.regulatory.groundCoverage > rules.maxGroundCoverage) violations.push(`Ground coverage exceeded`);
  return { valid: violations.length === 0, violations };
}
```

### Supported Authorities at Launch
| Authority | City | State |
|---|---|---|
| GDA (Ghaziabad Dev. Authority) | Ghaziabad | UP |
| NVDA / Nagar Nigam | Noida | UP |
| MCD (Municipal Corporation of Delhi) | Delhi | Delhi |
| GNIDA | Greater Noida | UP |

### Regulatory Document Templates
Each authority has a form template (PDF template with fillable fields). The engine:
1. Loads the authority's template
2. Maps plan data → form fields
3. Generates pre-filled PDF using `pdf-lib`
4. Attaches checklist of documents user must physically submit

---

## 8. Data Model (Firestore)

### `users/{userId}`
```
{
  name: string,
  email: string,
  phone: string,
  tier: "free" | "paid" | "architect",
  projectCount: number,
  createdAt: Timestamp
}
```

### `projects/{projectId}`
```
{
  userId: string,
  status: "draft" | "generating" | "validating" | "ready" | "error",
  tier: "free" | "paid",
  inputs: {
    plot: PlotInput,
    requirements: RequirementsInput,
    preferences: PreferencesInput,
    budget: BudgetInput,
    regulatory: RegulatoryInput,
    location: { city, state, pincode, authorityCode }
  },
  planJson: HousePlan,           // populated after generation
  error: string | null,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### `plans/{planId}`
```
{
  projectId: string,
  deliverables: {
    floorplan2d_url: string,     // Firebase Storage URL
    pdf_package_url: string,
    glb_3d_url: string,
    approval_docs_url: string,
    boq_excel_url: string
  },
  generatedAt: Timestamp,
  architectReviewStatus: "pending" | "in-review" | "approved" | null
}
```

### `regulatoryRules/{authorityCode}`
```
{
  authorityName: string,
  city: string,
  state: string,
  zones: Zone[],
  setbacks: { front, rear, left, right },   // in feet, by zone
  maxFAR: number,
  maxGroundCoverage: number,                // percentage
  maxHeight: number,                        // feet
  formTemplateId: string,
  requiredDocuments: string[],
  lastUpdated: Timestamp
}
```

### `materialRates/{cityCode}`
```
{
  city: string,
  state: string,
  rates: {
    brick_per_1000: number,        // INR
    cement_bag: number,
    steel_per_kg: number,
    sand_per_cft: number,
    labour_per_sqft: number,       // civil labour
    tiling_per_sqft: number,
    painting_per_sqft: number
  },
  lastUpdated: Timestamp
}
```

---

## 9. Page Map

| Route | Page | Tier |
|---|---|---|
| `/` | Landing page | Public |
| `/start` | 6-step intake wizard | Public (save requires auth) |
| `/dashboard` | My projects list | Auth |
| `/projects/[id]` | Plan viewer (2D / 3D / Budget / Docs tabs) | Auth |
| `/projects/[id]/approval` | Regulatory docs + submission guide | Auth (Paid) |
| `/pricing` | Free vs Paid comparison | Public |
| `/blog` | Educational articles | Public |
| `/admin` | Architect review queue | Admin only |
| `/api/generate-plan` | POST — triggers plan generation | Server |
| `/api/export-pdf` | POST — generates PDF package | Server |
| `/api/regulatory/[city]` | GET — returns city rules + form data | Server |

---

## 10. Key UI Components

| Component | Purpose |
|---|---|
| `<WizardStep />` | Multi-step form with progress stepper |
| `<CityAutocomplete />` | City search with regulatory authority auto-detection |
| `<FloorPlanSVG />` | Renders room JSON as interactive SVG (zoom, pan, click room) |
| `<ThreeDViewer />` | Three.js canvas with orbit controls, exterior/interior toggle |
| `<ElevationSVG />` | Front/rear/side elevation drawings |
| `<BudgetBreakdown />` | Itemized table + donut chart (civil / finishing / services) |
| `<RegulatoryChecklist />` | City-specific tick-off checklist with download buttons |
| `<PlanStatusBadge />` | Shows generating / ready / error with real-time Firestore updates |
| `<UpgradePrompt />` | Freemium conversion CTA with feature comparison |

---

## 11. Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend framework | Next.js 14 (App Router) | SSR for SEO, RSC for performance |
| UI library | Tailwind CSS + shadcn/ui | Fast, consistent, accessible |
| 2D rendering | SVG (React-rendered) | Scalable, printable, interactive |
| 3D rendering | Three.js + @react-three/fiber | Browser-native, no GPU server needed |
| PDF generation | Puppeteer (server-side) | Pixel-perfect PDF from HTML/SVG |
| Form filling | pdf-lib | Fill existing authority PDF templates |
| AI | Gemini 1.5 Pro (google-genai SDK) | Structured JSON output, strong reasoning |
| Auth | Firebase Auth | Google OAuth, Email, Phone OTP |
| Database | Cloud Firestore | Real-time plan status, flexible schema |
| File storage | Firebase Storage | PDFs, GLBs, images |
| Payments | Razorpay | India-optimized, UPI/cards/wallets |
| Hosting | Vercel | Next.js-native, edge functions |
| Excel export | ExcelJS | BOQ spreadsheet generation |

---

## 12. Freemium & Monetization

### Tiers
| Feature | Free | Paid (₹999/plan or ₹2999/month) |
|---|---|---|
| Basic 2D floor plan (GF only) | ✅ | ✅ |
| Full 2D plans (all floors) | ❌ | ✅ |
| Elevations & sections | ❌ | ✅ |
| Structural drawings | ❌ | ✅ |
| Electrical & plumbing | ❌ | ✅ |
| Interactive 3D viewer | Preview (watermarked) | ✅ Full |
| 3D GLB export | ❌ | ✅ |
| Detailed BOQ + Excel | ❌ | ✅ |
| Regulatory docs (GDA etc.) | ❌ | ✅ |
| PDF download | ❌ | ✅ |
| Human architect review | ❌ | Add-on (₹4999/plan) |

---

## 13. Security & Privacy

- Gemini API key: server-side only (never exposed to client)
- Regulatory personal info (owner name, plot number): Firestore with security rules, user-only read/write
- Aadhaar/PAN: **never stored** — used only in session for form pre-fill, cleared after PDF generation
- Firebase Security Rules: users can only read/write their own `projects/` and `plans/`
- PDF files in Storage: signed URLs with expiry (7 days)
- Payment data: handled entirely by Razorpay (PCI-compliant), never stored in Firebase

---

## 14. Scope: Phase 1 (MVP)

**In scope:**
- Intake wizard (all 6 steps)
- AI plan generation (Gemini) → HousePlan JSON
- 2D floor plan renderer (SVG)
- Basic 3D viewer (Three.js)
- Budget breakdown
- PDF package export (full plan)
- Regulatory engine: GDA Ghaziabad pilot
- Firebase Auth + Firestore + Storage
- Freemium gate (free preview → paid download)
- Razorpay payment integration

**Out of scope for Phase 1:**
- Human architect review marketplace
- CAD/DWG export
- Additional regulatory authorities (Phase 2)
- Mobile app
- Blog / CMS
- Admin panel (basic version only)

---

## 15. Open Questions (for implementation)

1. **Gemini structured output:** Use `responseSchema` / JSON mode to enforce `HousePlan` schema — need to validate reliability with complex plans
2. **3D model quality:** Three.js procedural generation from room JSON — may need fallback to pre-designed 3D templates for complex facades
3. **Regulatory form templates:** GDA forms need to be procured as fillable PDFs — confirm availability of official digital versions
4. **Material rate database:** Initial rates to be seeded manually per city; plan for quarterly update mechanism
5. **PDF generation at scale:** Puppeteer is memory-intensive — consider moving to worker queue (BullMQ/Cloud Tasks) for concurrent plan generation
