'use client';

import React, { useState } from 'react';
import { HousePlan } from '@/types/plan';
import { formatFeetInches } from '../floorplan/RoomBox';

interface FoundationRCCSheetProps {
  plan: HousePlan;
  plotWidth: number;
  plotLength: number;
}

export const FoundationRCCSheet: React.FC<FoundationRCCSheetProps> = ({
  plan,
  plotWidth,
  plotLength,
}) => {
  const [theme, setTheme] = useState<'blueprint' | 'paper'>('paper');
  const isBlueprint = theme === 'blueprint';

  const scale = 14;
  const padding = 50;
  const svgWidth = plotWidth * scale + padding * 2;
  const svgHeight = plotLength * scale + padding * 2;

  const footings = [
    { type: 'F1', excavation: "6'-8\" × 6'-0\"", size: "6'-0\" × 5'-4\"", depth: "4'-6\"", d: '14"', rebarL: '10φ @ 6" c/c', rebarB: '10φ @ 6" c/c', count: 8 },
    { type: 'F2', excavation: "7'-4\" × 6'-8\"", size: "6'-8\" × 6'-0\"", depth: "4'-6\"", d: '16"', rebarL: '10φ @ 5.5" c/c', rebarB: '10φ @ 5.5" c/c', count: 6 },
    { type: 'F3', excavation: "8'-0\" × 7'-4\"", size: "7'-4\" × 6'-8\"", depth: "5'-0\"", d: '18"', rebarL: '12φ @ 6" c/c', rebarB: '12φ @ 6" c/c', count: 4 },
    { type: 'F4', excavation: "9'-0\" × 8'-0\"", size: "8'-4\" × 7'-4\"", depth: "5'-6\"", d: '20"', rebarL: '12φ @ 5" c/c', rebarB: '12φ @ 5" c/c', count: 2 },
  ];

  const plinthBeams = [
    { mark: 'PB-1', size: '9" × 12"', top: '2-12φ', bottom: '2-16φ + 1-12φ', stirrups: '8φ @ 5" c/c', location: 'External Perimeter' },
    { mark: 'PB-2', size: '9" × 15"', top: '3-12φ', bottom: '3-16φ', stirrups: '8φ @ 4.5" c/c', location: 'Internal Load Bearing' },
    { mark: 'PB-3', size: '9" × 18"', top: '3-16φ', bottom: '4-16φ', stirrups: '8φ @ 4" c/c', location: 'Lift & Staircase Core' },
  ];

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl shadow-sm border transition-colors ${
        isBlueprint
          ? 'bg-slate-950 border-sky-900 text-sky-100'
          : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      {/* Sheet Header */}
      <div className="w-full flex flex-wrap justify-between items-center gap-3 mb-4 px-2">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded border border-amber-300 dark:border-amber-800">
                SHEET S-03 &amp; S-08
              </span>
              <h3 className="font-bold text-lg tracking-tight">Foundation &amp; RCC Reinforcement Schedules</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-sky-400 mt-0.5">
              Isolated Trapezoidal Footing Details, Plinth Beams &amp; Sunken Slab Waterproofing
            </p>
          </div>
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

      {/* Typical Footing Detail Cross-Section (SVG Vector Drawing) */}
      <div className="overflow-auto max-w-full p-2 w-full flex justify-center">
        <svg
          width={650}
          height={320}
          viewBox="0 0 650 320"
          className={`rounded-xl shadow-inner border transition-colors duration-200 ${
            isBlueprint ? 'bg-[#061220] border-sky-900' : 'bg-[#fafafa] border-slate-200'
          }`}
        >
          {/* Ground Level Line */}
          <line x1={40} y1={70} x2={610} y2={70} stroke={isBlueprint ? '#38bdf8' : '#334155'} strokeWidth="1.5" />
          <text x={50} y={62} fill={isBlueprint ? '#7dd3fc' : '#475569'} fontSize="9" fontFamily="monospace" fontWeight="bold">
            NATURAL GROUND LEVEL (N.G.L. ±0&apos;-0&quot;)
          </text>
          {/* Plinth Level Line */}
          <line x1={40} y1={35} x2={610} y2={35} stroke={isBlueprint ? '#38bdf8' : '#0284c7'} strokeWidth="1.2" strokeDasharray="5 3" />
          <text x={50} y={28} fill={isBlueprint ? '#38bdf8' : '#0284c7'} fontSize="9" fontFamily="monospace" fontWeight="bold">
            PLINTH LEVEL (+3&apos;-0&quot;)
          </text>

          {/* Excavation Trench Pit */}
          <path
            d="M 120 70 L 160 260 L 490 260 L 530 70"
            fill={isBlueprint ? 'rgba(56, 189, 248, 0.04)' : 'rgba(100, 116, 139, 0.05)'}
            stroke={isBlueprint ? '#0284c7' : '#94a3b8'}
            strokeWidth="1"
            strokeDasharray="4 2"
          />
          <text x={180} y={250} fill={isBlueprint ? '#38bdf8' : '#64748b'} fontSize="8" fontFamily="monospace">
            EXCAVATION TRENCH (DEPTH: 5&apos;-0&quot; BELOW N.G.L.)
          </text>

          {/* PCC 1:4:8 Bed */}
          <rect
            x={180}
            y={260}
            width={290}
            height={20}
            fill={isBlueprint ? 'rgba(56, 189, 248, 0.15)' : '#e2e8f0'}
            stroke={isBlueprint ? '#38bdf8' : '#64748b'}
            strokeWidth="1"
          />
          <text x={325} y={274} textAnchor="middle" fill={isBlueprint ? '#38bdf8' : '#334155'} fontSize="8.5" fontFamily="monospace" fontWeight="bold">
            100mm THK. P.C.C. 1:4:8 BEDDING WITH SAND CUSHION
          </text>

          {/* RCC Trapezoidal Footing Block */}
          {/* Base slab */}
          <rect
            x={200}
            y={225}
            width={250}
            height={35}
            fill={isBlueprint ? 'rgba(2, 132, 199, 0.25)' : '#f1f5f9'}
            stroke={isBlueprint ? '#38bdf8' : '#0f172a'}
            strokeWidth="1.8"
          />
          {/* Trapezoidal Slope */}
          <polygon
            points="200,225 295,160 355,160 450,225"
            fill={isBlueprint ? 'rgba(2, 132, 199, 0.2)' : '#f8fafc'}
            stroke={isBlueprint ? '#38bdf8' : '#0f172a'}
            strokeWidth="1.8"
          />

          {/* Column Neck */}
          <rect
            x={295}
            y={20}
            width={60}
            height={140}
            fill={isBlueprint ? 'rgba(2, 132, 199, 0.35)' : '#e2e8f0'}
            stroke={isBlueprint ? '#38bdf8' : '#0f172a'}
            strokeWidth="2"
          />
          <text x={325} y={115} textAnchor="middle" fill={isBlueprint ? '#ffffff' : '#0f172a'} fontSize="8.5" fontFamily="monospace" fontWeight="bold">
            9&quot;×15&quot; COL
          </text>

          {/* Footing Reinforcement Mesh (L & B rebar) */}
          <line x1={208} y1={250} x2={442} y2={250} stroke={isBlueprint ? '#f43f5e' : '#dc2626'} strokeWidth="2" />
          {/* End bend hooks */}
          <line x1={208} y1={250} x2={208} y2={235} stroke={isBlueprint ? '#f43f5e' : '#dc2626'} strokeWidth="2" />
          <line x1={442} y1={250} x2={442} y2={235} stroke={isBlueprint ? '#f43f5e' : '#dc2626'} strokeWidth="2" />
          <text x={325} y={244} textAnchor="middle" fill={isBlueprint ? '#f43f5e' : '#dc2626'} fontSize="8" fontFamily="monospace" fontWeight="bold">
            BOTTOM MESH: 10φ TMT @ 6&quot; C/C BOTH WAYS (CLEAR COVER 50mm)
          </text>

          {/* Column Dowels & L-Bends */}
          <path
            d="M 305 20 L 305 245 L 235 245"
            fill="none"
            stroke={isBlueprint ? '#38bdf8' : '#0284c7'}
            strokeWidth="1.8"
          />
          <path
            d="M 345 20 L 345 245 L 415 245"
            fill="none"
            stroke={isBlueprint ? '#38bdf8' : '#0284c7'}
            strokeWidth="1.8"
          />
          <text x={375} y={150} fill={isBlueprint ? '#38bdf8' : '#0284c7'} fontSize="7.5" fontFamily="monospace">
            DOWEL L-BEND = 300mm (12&quot;)
          </text>
        </svg>
      </div>

      {/* Tables Section */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-3 border-t border-inherit">
        {/* Footing Schedule */}
        <div
          className={`p-4 rounded-xl border text-xs font-mono ${
            isBlueprint
              ? 'bg-slate-900/80 border-sky-900 text-slate-200'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="font-bold text-sm text-sky-600 dark:text-sky-400 mb-2 border-b border-inherit pb-2">
            SCHEDULE OF REINFORCEMENT FOR FOOTINGS (IS: 456)
          </div>
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-slate-300 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-1">TYPE</th>
                <th className="py-1">EXCAVATION</th>
                <th className="py-1">L &amp; B REBAR</th>
                <th className="py-1">THK (d)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {footings.map((f) => (
                <tr key={f.type}>
                  <td className="py-1.5 font-bold text-sky-600">{f.type}</td>
                  <td>{f.excavation}</td>
                  <td>{f.rebarL}</td>
                  <td>{f.d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Plinth Beam Schedule */}
        <div
          className={`p-4 rounded-xl border text-xs font-mono ${
            isBlueprint
              ? 'bg-slate-900/80 border-sky-900 text-slate-200'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="font-bold text-sm text-sky-600 dark:text-sky-400 mb-2 border-b border-inherit pb-2">
            PLINTH BEAM (PB) REINFORCEMENT SCHEDULE
          </div>
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-slate-300 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-1">BEAM</th>
                <th className="py-1">SIZE</th>
                <th className="py-1">TOP STEEL</th>
                <th className="py-1">BOTTOM STEEL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {plinthBeams.map((b) => (
                <tr key={b.mark}>
                  <td className="py-1.5 font-bold text-sky-600">{b.mark}</td>
                  <td>{b.size}</td>
                  <td>{b.top}</td>
                  <td>{b.bottom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Slab Schedule & 7" Sunken Slab Note */}
        <div
          className={`p-4 rounded-xl border text-xs font-mono md:col-span-2 ${
            isBlueprint
              ? 'bg-slate-900/80 border-sky-900 text-slate-200'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="font-bold text-sm text-sky-600 dark:text-sky-400 mb-2 border-b border-inherit pb-2">
            SLAB SCHEDULE &amp; SUNKEN SLAB DETAIL (TOILETS &amp; BALCONIES)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed">
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Typical Floor RCC Slab (5&quot; / 125mm Thick M20):
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                <li><strong>Main Steel:</strong> 10φ TMT @ 5&quot; c/c alternate bent-up / cranked at L/4 from supports.</li>
                <li><strong>Distribution Steel:</strong> 8φ TMT @ 6&quot; c/c throughout the span.</li>
                <li><strong>Clear Cover:</strong> 15mm with cement mortar spacer blocks.</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                7&quot; Sunken Slab for Attached Toilets &amp; Bathrooms:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                <li><strong>Drop:</strong> 175mm (7&quot;) drop provided below general floor finish for sanitary pipes.</li>
                <li><strong>Waterproofing:</strong> 2 coats of polymer modified elastomeric coating + 20mm IPS with coving.</li>
                <li><strong>Filling:</strong> Light cinder brick bat filling with slope towards 110mm floor trap.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
