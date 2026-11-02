# 🏛️ ArchitectAI — AI House Planner & Municipal Approval Platform

> **Instant architectural house plans, 2D floor layouts, interactive 3D structures, itemized construction budgets (BOQ), and municipal authority sanction packages (GDA / UPOBPAS).**

[![Next.js 14](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?style=flat&logo=three.js)](https://threejs.org/)
[![Vitest](https://img.shields.io/badge/Tests-75%2F75%20Passing-brightgreen?style=flat&logo=vitest)](https://vitest.dev/)
[![Bylaws: GDA / UP](https://img.shields.io/badge/Bylaws-GDA%20Ghaziabad%20%2F%20UPOBPAS-orange?style=flat)]()

---

## 🌟 Key Features

### 1. 📋 6-Step Intuitive Intake Wizard
- **Plot Dimensions & Orientation**: Plot width, length, shape, facing direction (incorporating Indian Vastu guidelines).
- **House Requirements**: Number of floors (G, G+1, G+2), bedrooms, bathrooms, modular kitchen type, car parking spots, pooja room, terrace.
- **Architectural Styles**: Modern Minimalist, Contemporary Luxury, Traditional Haveli, Colonial, and Farmhouse.
- **Budget & Materials**: Realistic Indian residential construction tiers (`economy`, `standard`, `premium`, `luxury`).
- **Authority Details**: Plot Khasra/Khatauni numbers and owner records for automated sanction pre-filling (no Aadhaar/PAN stored).

### 2. 🗺️ Scaled 2D Interactive Vector Floor Plans
- Built with pure SVG rendering walls, room labels, dimensions in feet (`14' × 16'`), and plot setbacks.
- Color-coded architectural inner tints and boundary indicators.

### 3. 🏠 Interactive 3D WebGL Structure & Façade Viewer
- Powered by **Three.js** and **`@react-three/fiber`** with smooth OrbitControls.
- Level extrusion, floor slabs, room volumes, and roof parapet profiles.
- One-click toggle between **Solid Mode** and **Structural Wireframe Mode**.

### 4. 📊 Itemized Bill of Quantities (BOQ) in INR (₹)
- Empirical civil engineering cost approximations based on city material indexes (Cement, Steel Fe500D, Red Bricks, Civil/Finishing Labour).
- Supported metro zones: **Delhi/NCR**, **Ghaziabad**, **Mumbai**, and **Bengaluru**.
- Category breakdown across **Civil Structure**, **Finishes**, **Services (Plumbing/Electrical)**, and **Regulatory Fees**.

### 5. 🏛️ Municipal Sanction Package (Ghaziabad GDA Pilot)
- **By-laws Validation Engine**: Enforces UP Urban Planning setback tables (scaled to plot area tiers), permissible FAR limits (max 2.0), and ground coverage (max 60%).
- **AutoCAD DXF (.DXF) Export**: Formatted with standard **AutoDCR layers** (`PLOT_BOUNDARY`, `BUILDING_ENVELOPE`, `ROOMS_WALLS`, `TEXT_ANNOTATIONS`) with horizontal spatial floor offsets.
- **Notarized Legal Affidavit (.PDF)**: Generated via **`pdf-lib`** prefilled with owner declarations, plot dimensions, and statutory compliance clauses for submission on [upobpas.in](https://upobpas.in).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server Components & Route Handlers) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & [Lucide Icons](https://lucide.dev/) |
| **AI Generation** | [Google Gemini API](https://ai.google.dev/) via `@google/genai` (Structured Schema Enforcement) |
| **3D Rendering** | [Three.js](https://threejs.org/), `@react-three/fiber`, `@react-three/drei` |
| **CAD Export** | `dxf-writer` (AutoCAD AutoDCR layer compliance) |
| **PDF Generation** | `pdf-lib` (Client & Server-side A4 document assembly) |
| **Schema Validation**| [Zod](https://zod.dev/) |
| **Testing** | [Vitest](https://vitest.dev/), `@testing-library/react`, `jsdom` (75 passing tests) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+ or 20+
- npm or yarn

### Installation
```bash
git clone https://github.com/sh-yudi/Architect.git
cd Architect
npm install
```

### Environment Variables (Optional)
If you wish to use live Google Gemini AI generation instead of the built-in deterministic fallback engine, create `.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Without an API key, the platform automatically utilizes its built-in deterministic architectural plan generator.)*

### Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

- Visit `/` for the landing page.
- Visit `/start` to run the 6-step house requirement wizard.
- View the generated blueprint, 2D floor plans, 3D model, BOQ, and authority downloads at `/projects/[id]`.

### Running Tests & Building
```bash
# Run unit & integration test suite (75 tests)
npm test

# Check TypeScript typing
npx tsc --noEmit

# Production build
npm run build
```

---

## 📂 Project Structure

```
Architect/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate-plan/      # POST: Blueprint generation orchestrator
│   │   │   ├── export-cad/         # POST: UPOBPAS AutoDCR DXF streaming
│   │   │   └── export-affidavit/   # POST: GDA Affidavit PDF streaming
│   │   ├── projects/[id]/          # Project Deliverables Dashboard
│   │   ├── start/                  # 6-step User Intake Wizard Page
│   │   ├── globals.css             # Tailwind CSS tokens
│   │   ├── layout.tsx              # Root HTML shell & metadata
│   │   └── page.tsx                # Landing page hero
│   ├── components/
│   │   ├── dashboard/              # BudgetTable, RegulatoryCard
│   │   ├── floorplan/              # FloorPlanSVG, RoomBox
│   │   ├── viewer3d/               # BuildingMesh, BuildingCanvas, ThreeDViewer
│   │   └── wizard/                 # IntakeWizard
│   ├── lib/
│   │   ├── ai/                     # Gemini client, prompt builder, plan generator
│   │   ├── export/                 # DXF CAD writer, PDF affidavit generator
│   │   ├── rates/                  # City material rates & BOQ calculation engine
│   │   ├── regulatory/             # Municipal rules engine & GDA UP by-laws
│   │   └── schemas/                # Zod schemas for HousePlan & WizardFormData
│   └── types/                      # Core TypeScript definitions (plan.ts, wizard.ts)
├── tests/                          # 13 test suites (75 Vitest tests)
├── docs/                           # Architecture specifications & implementation plans
└── README.md
```

---

## 📜 License
This project is licensed under the MIT License.
