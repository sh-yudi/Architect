'use client';

import React, { useState } from 'react';
import { HousePlan } from '@/types/plan';

interface MEPServicesSheetProps {
  plan: HousePlan;
}

export const MEPServicesSheet: React.FC<MEPServicesSheetProps> = ({ plan }) => {
  const [theme, setTheme] = useState<'blueprint' | 'paper'>('paper');
  const [activeSubTab, setActiveSubTab] = useState<'electrical' | 'plumbing'>('plumbing');
  const isBlueprint = theme === 'blueprint';

  const electricalPoints = [
    { item: 'Ceiling Light Points (LED 12W)', qty: 64, load: '768 W', circuit: 'Lighting Circuit 1.5 sq mm' },
    { item: 'Ceiling Fan Points with Regulators', qty: 22, load: '1,540 W', circuit: 'Lighting Circuit 1.5 sq mm' },
    { item: '6A Convenience Power Sockets', qty: 48, load: '4,800 W', circuit: 'Power Circuit 2.5 sq mm' },
    { item: '16A Heavy Power Outlets (AC 1.5 Ton)', qty: 14, load: '21,000 W', circuit: 'Dedicated 4.0 sq mm Copper' },
    { item: '16A Geyser & Microwave Outlets', qty: 10, load: '15,000 W', circuit: 'Dedicated 4.0 sq mm Copper' },
    { item: 'Distribution Boards (DB) with 30mA RCCB', qty: 6, load: 'Per Floor', circuit: '4-Pole Isolator + 63A MCB' },
    { item: 'Solar Hybrid Inverter Backup Sub-panel', qty: 1, load: '5.5 kVA', circuit: 'Pure Sine Wave Inverter + 4x 150Ah' },
  ];

  const plumbingFixtures = [
    { pipe: 'Soil Pipe (Black Water from WC)', size: '110mm dia S.W.R. PVC', gradient: '1 in 40', termination: 'Inspection Chamber IC-1' },
    { pipe: 'Waste Pipe (Grey Water from Baths & Kitchen)', size: '75mm dia S.W.R. PVC', gradient: '1 in 50', termination: 'Gully Trap GT-1 to IC-2' },
    { pipe: 'Rainwater Downspouts', size: '110mm dia Heavy PVC', gradient: 'Vertical Drops', termination: 'Rainwater Percolation Pit' },
    { pipe: 'Cold Water Internal Distribution', size: '25mm / 20mm CPVC Class 1', pressure: 'SDR 11 (28.4 kg/cm²)', termination: 'Overhead Tank 5,000L' },
    { pipe: 'Hot Water Supply to Bathrooms', size: '20mm Composite / CPVC', insulation: '9mm Nitrile Foam', termination: 'Geyser Outlets' },
  ];

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl shadow-sm border transition-colors ${
        isBlueprint
          ? 'bg-slate-950 border-sky-900 text-sky-100'
          : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      {/* Header */}
      <div className="w-full flex flex-wrap justify-between items-center gap-3 mb-4 px-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded border border-amber-300 dark:border-amber-800">
              SHEET E-01 &amp; D-01
            </span>
            <h3 className="font-bold text-lg tracking-tight">MEP Services &amp; Plumbing Drainage Layout</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-sky-400 mt-0.5">
            Internal Electrical Circuits, Sanitary Plumbing, Drainage Gradients &amp; Water Tank Layout
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tab toggle */}
          <div className="flex rounded-lg border border-slate-300 dark:border-sky-800 p-0.5 bg-slate-100 dark:bg-slate-900 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveSubTab('plumbing')}
              className={`px-3 py-1 rounded-md transition ${
                activeSubTab === 'plumbing'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-sky-300 hover:text-slate-900'
              }`}
            >
              💧 Drainage &amp; Water (D-01)
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('electrical')}
              className={`px-3 py-1 rounded-md transition ${
                activeSubTab === 'electrical'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-sky-300 hover:text-slate-900'
              }`}
            >
              ⚡ Electrical Wiring (E-01)
            </button>
          </div>

          <button
            type="button"
            onClick={() => setTheme(isBlueprint ? 'paper' : 'blueprint')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 shadow-sm ${
              isBlueprint
                ? 'bg-sky-900/60 border-sky-700 text-sky-200 hover:bg-sky-850'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>{isBlueprint ? '📄 Paper View' : '📐 Blueprint Mode'}</span>
          </button>
        </div>
      </div>

      {/* Schematic Diagram */}
      <div className="overflow-auto max-w-full p-2 w-full flex justify-center">
        {activeSubTab === 'plumbing' ? (
          <svg
            width={650}
            height={260}
            viewBox="0 0 650 260"
            className={`rounded-xl shadow-inner border transition-colors duration-200 ${
              isBlueprint ? 'bg-[#061220] border-sky-900' : 'bg-[#fafafa] border-slate-200'
            }`}
          >
            {/* Building Envelope outline */}
            <rect
              x={60}
              y={30}
              width={420}
              height={190}
              fill="none"
              stroke={isBlueprint ? '#38bdf8' : '#64748b'}
              strokeWidth="1.5"
            />
            <text x={70} y={48} fill={isBlueprint ? '#7dd3fc' : '#475569'} fontSize="9" fontFamily="monospace" fontWeight="bold">
              BUILDING BOUNDARY &bull; GROUND / STILT PARKING
            </text>

            {/* Rear Garden Water Tank */}
            <rect
              x={70}
              y={65}
              width={80}
              height={50}
              fill={isBlueprint ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe'}
              stroke={isBlueprint ? '#38bdf8' : '#0284c7'}
              strokeWidth="1.2"
            />
            <text x={110} y={88} textAnchor="middle" fill={isBlueprint ? '#38bdf8' : '#0369a1'} fontSize="8" fontFamily="monospace" fontWeight="bold">
              UNDERGROUND
            </text>
            <text x={110} y={100} textAnchor="middle" fill={isBlueprint ? '#38bdf8' : '#0369a1'} fontSize="7.5" fontFamily="monospace">
              SUMP 8,000L
            </text>

            {/* Borewell Pump Location */}
            <circle cx={185} cy={90} r="12" fill={isBlueprint ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7'} stroke="#10b981" strokeWidth="1.5" />
            <text x={185} y={93} textAnchor="middle" fill="#059669" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
              BW
            </text>
            <text x={185} y={115} textAnchor="middle" fill={isBlueprint ? '#6ee7b7' : '#059669'} fontSize="7" fontFamily="monospace">
              BOREWELL (280 FT)
            </text>

            {/* Drainage Pipe Run along side passage */}
            <line x1={490} y1={50} x2={490} y2={210} stroke={isBlueprint ? '#f43f5e' : '#dc2626'} strokeWidth="2.5" />
            <line x1={490} y1={210} x2={600} y2={210} stroke={isBlueprint ? '#f43f5e' : '#dc2626'} strokeWidth="2.5" />
            {/* Slope arrow */}
            <text x={500} y={130} transform="rotate(90, 500, 130)" fill={isBlueprint ? '#f43f5e' : '#dc2626'} fontSize="8" fontFamily="monospace" fontWeight="bold">
              110mm SWR SOIL PIPE (SLOPE 1:40) &gt;&gt;
            </text>

            {/* Inspection Chambers */}
            <rect x={480} y={50} width={20} height={20} fill="#ffffff" stroke={isBlueprint ? '#f43f5e' : '#dc2626'} strokeWidth="1.5" />
            <text x={490} y={63} textAnchor="middle" fill={isBlueprint ? '#f43f5e' : '#dc2626'} fontSize="7" fontFamily="monospace" fontWeight="bold">IC-1</text>

            <rect x={480} y={120} width={20} height={20} fill="#ffffff" stroke={isBlueprint ? '#f43f5e' : '#dc2626'} strokeWidth="1.5" />
            <text x={490} y={133} textAnchor="middle" fill={isBlueprint ? '#f43f5e' : '#dc2626'} fontSize="7" fontFamily="monospace" fontWeight="bold">IC-2</text>

            <rect x={480} y={200} width={20} height={20} fill="#ffffff" stroke={isBlueprint ? '#f43f5e' : '#dc2626'} strokeWidth="1.5" />
            <text x={490} y={213} textAnchor="middle" fill={isBlueprint ? '#f43f5e' : '#dc2626'} fontSize="7" fontFamily="monospace" fontWeight="bold">IC-3</text>

            {/* Municipal Sewer Connection */}
            <circle cx={600} cy={210} r="14" fill={isBlueprint ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2'} stroke="#ef4444" strokeWidth="1.5" />
            <text x={600} y={213} textAnchor="middle" fill="#dc2626" fontSize="7" fontFamily="monospace" fontWeight="bold">
              SEWER
            </text>
            <text x={600} y={235} textAnchor="middle" fill={isBlueprint ? '#fca5a5' : '#b91c1c'} fontSize="7.5" fontFamily="monospace">
              TO MUNICIPAL MAIN
            </text>
          </svg>
        ) : (
          <svg
            width={650}
            height={260}
            viewBox="0 0 650 260"
            className={`rounded-xl shadow-inner border transition-colors duration-200 ${
              isBlueprint ? 'bg-[#061220] border-sky-900' : 'bg-[#fafafa] border-slate-200'
            }`}
          >
            {/* Electrical DB Layout */}
            <rect x={50} y={30} width={550} height={200} fill="none" stroke={isBlueprint ? '#38bdf8' : '#64748b'} strokeWidth="1.2" />
            <text x={60} y={48} fill={isBlueprint ? '#7dd3fc' : '#475569'} fontSize="9" fontFamily="monospace" fontWeight="bold">
              ELECTRICAL DISTRIBUTION SCHEMATIC (THREE PHASE 415V 50Hz)
            </text>

            {/* Main Meter & Service Cable */}
            <rect x={70} y={75} width={90} height={50} fill={isBlueprint ? '#0f172a' : '#f8fafc'} stroke="#f59e0b" strokeWidth="1.8" rx="3" />
            <text x={115} y={96} textAnchor="middle" fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="bold">MAIN METER</text>
            <text x={115} y={110} textAnchor="middle" fill={isBlueprint ? '#fde68a' : '#b45309'} fontSize="7" fontFamily="monospace">4-POLE 63A MCB</text>

            {/* Main DB */}
            <line x1={160} y1={100} x2={220} y2={100} stroke="#f59e0b" strokeWidth="2" />
            <rect x={220} y={65} width={130} height={70} fill={isBlueprint ? '#0f172a' : '#f8fafc'} stroke="#38bdf8" strokeWidth="1.8" rx="3" />
            <text x={285} y={88} textAnchor="middle" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">CENTRAL DB PANEL</text>
            <text x={285} y={102} textAnchor="middle" fill={isBlueprint ? '#bae6fd' : '#0369a1'} fontSize="7" fontFamily="monospace">6-WAY TPN WITH 30mA RCCB</text>
            <text x={285} y={118} textAnchor="middle" fill="#10b981" fontSize="7" fontFamily="monospace">COPPER BUSBAR 100A</text>

            {/* Floor Sub-meters */}
            <line x1={350} y1={85} x2={420} y2={65} stroke="#38bdf8" strokeWidth="1.5" />
            <line x1={350} y1={100} x2={420} y2={100} stroke="#38bdf8" strokeWidth="1.5" />
            <line x1={350} y1={115} x2={420} y2={135} stroke="#38bdf8" strokeWidth="1.5" />

            <rect x={420} y={50} width={180} height={30} fill={isBlueprint ? '#0f172a' : '#f8fafc'} stroke="#10b981" strokeWidth="1.2" rx="2" />
            <text x={430} y={68} fill="#10b981" fontSize="7.5" fontFamily="monospace" fontWeight="bold">LEVEL 1 &amp; 2 SUB-DB (40A 2-POLE)</text>

            <rect x={420} y={85} width={180} height={30} fill={isBlueprint ? '#0f172a' : '#f8fafc'} stroke="#10b981" strokeWidth="1.2" rx="2" />
            <text x={430} y={103} fill="#10b981" fontSize="7.5" fontFamily="monospace" fontWeight="bold">LEVEL 3 &amp; 4 DUPLEX DB (40A 2-POLE)</text>

            <rect x={420} y={120} width={180} height={30} fill={isBlueprint ? '#0f172a' : '#f8fafc'} stroke="#10b981" strokeWidth="1.2" rx="2" />
            <text x={430} y={138} fill="#10b981" fontSize="7.5" fontFamily="monospace" fontWeight="bold">LEVEL 5 PENTHOUSE DB (32A 2-POLE)</text>

            {/* Earth Pit */}
            <circle cx={115} cy={185} r="12" fill={isBlueprint ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7'} stroke="#10b981" strokeWidth="1.5" />
            <text x={115} y={188} textAnchor="middle" fill="#059669" fontSize="7" fontFamily="monospace" fontWeight="bold">EARTH</text>
            <text x={115} y={210} textAnchor="middle" fill={isBlueprint ? '#6ee7b7' : '#059669'} fontSize="7" fontFamily="monospace">
              COPPER PLATE PIT (&lt; 2 OHMS)
            </text>
          </svg>
        )}
      </div>

      {/* Schedules / Tables */}
      <div className="w-full mt-4 pt-3 border-t border-inherit">
        {activeSubTab === 'plumbing' ? (
          <div
            className={`p-4 rounded-xl border text-xs font-mono overflow-x-auto ${
              isBlueprint
                ? 'bg-slate-900/80 border-sky-900 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="font-bold text-sm text-sky-600 dark:text-sky-400 mb-2 border-b border-inherit pb-2">
              WATER SUPPLY &amp; SANITARY DRAINAGE SPECIFICATIONS (IS: 1742)
            </div>
            <table className="w-full text-left border-collapse text-[11px] min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-300 dark:border-slate-800 text-slate-500 font-semibold">
                  <th className="py-1">SERVICE LINE</th>
                  <th className="py-1">PIPE SPECIFICATION</th>
                  <th className="py-1">GRADIENT / PRESSURE</th>
                  <th className="py-1">DISCHARGE TERMINATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {plumbingFixtures.map((p, idx) => (
                  <tr key={idx}>
                    <td className="py-1.5 font-bold text-sky-600 dark:text-sky-400">{p.pipe}</td>
                    <td>{p.size}</td>
                    <td>{p.gradient || p.pressure || p.insulation}</td>
                    <td>{p.termination}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            className={`p-4 rounded-xl border text-xs font-mono overflow-x-auto ${
              isBlueprint
                ? 'bg-slate-900/80 border-sky-900 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="font-bold text-sm text-sky-600 dark:text-sky-400 mb-2 border-b border-inherit pb-2">
              ELECTRICAL LOAD ESTIMATE &amp; CONDUIT SCHEDULE (IS: 732)
            </div>
            <table className="w-full text-left border-collapse text-[11px] min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-300 dark:border-slate-800 text-slate-500 font-semibold">
                  <th className="py-1">EQUIPMENT / OUTLET</th>
                  <th className="py-1">QUANTITY</th>
                  <th className="py-1">ESTIMATED CONNECTED LOAD</th>
                  <th className="py-1">CIRCUIT CONDUIT &amp; WIRE GAUGE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {electricalPoints.map((e, idx) => (
                  <tr key={idx}>
                    <td className="py-1.5 font-bold text-sky-600 dark:text-sky-400">{e.item}</td>
                    <td>{e.qty}</td>
                    <td>{e.load}</td>
                    <td>{e.circuit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
