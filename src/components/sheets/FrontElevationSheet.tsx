'use client';

import React, { useState } from 'react';
import { HousePlan } from '@/types/plan';

interface FrontElevationSheetProps {
  plan: HousePlan;
}

export const FrontElevationSheet: React.FC<FrontElevationSheetProps> = ({ plan }) => {
  const [theme, setTheme] = useState<'blueprint' | 'paper'>('paper');
  const isBlueprint = theme === 'blueprint';

  const facadeSpecifications = [
    {
      element: 'Base Stilt Columns & Boundary Plinth',
      material: 'Granite Stone Cladding (Sadahalli Grey) + M20 RCC Columns',
      finish: 'Water-resistant hone finish with 12mm expansion groove',
      level: 'Road ±0\'-0" to Plinth +3\'-0"',
    },
    {
      element: 'Main Body Exterior Walls (Levels 1-4)',
      material: 'Asian Paints Apex Ultima Protek (High-Performance Exterior Emulsion)',
      finish: 'Base Shade: 0414 Almond Frost (Off-White) with Teflon Surface Protector',
      level: '+3\'-0" to +44\'-0"',
    },
    {
      element: 'Architectural Horizontal Groove Bands',
      material: 'Recessed V-Groove Plaster (15mm × 15mm)',
      finish: 'Accent Shade: 8295 Charcoal Dusk (Dark Grey Matte)',
      level: 'Sill & Lintel continuous bands',
    },
    {
      element: 'Duplex & Suite Balcony Railings',
      material: '12mm Toughened Clear Safety Glass with SS-304 Base Spigots',
      finish: 'Continuously polished top handrail in Brushed Stainless Steel',
      level: '+12\'-6", +23\'-0", +33\'-6", +44\'-0"',
    },
    {
      element: 'Privacy & Climate Screening Jali',
      material: 'CNC Precision-Cut Terracotta / High-Density Exterior HPL Screen',
      finish: 'Natural Terracotta Ochre with UV-resistant polyurethane coating',
      level: 'Staircase void & Master Suite Balcony',
    },
    {
      element: '5th Floor Penthouse Terrace Pergola & Bar',
      material: 'Powder-Coated MS Heavy Hollow Box Sections (100mm × 50mm)',
      finish: 'Warm Teak Wood Poly-Grain Finish + 8mm Polycarbonate Skylight',
      level: '+54\'-6" to +63\'-0"',
    },
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
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded border border-amber-300 dark:border-amber-800">
              SHEET W-01
            </span>
            <h3 className="font-bold text-lg tracking-tight">Front Elevation Working Drawing</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-sky-400 mt-0.5">
            2D Facade Datums, Floor Heights, Exterior Material Specs &amp; Architectural Jali Details
          </p>
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

      {/* Front Elevation 2D Vector CAD Drawing */}
      <div className="overflow-auto max-w-full p-2 w-full flex justify-center">
        <svg
          width={680}
          height={560}
          viewBox="0 0 680 560"
          className={`rounded-xl shadow-inner border transition-colors duration-200 ${
            isBlueprint ? 'bg-[#061220] border-sky-900' : 'bg-[#fafafa] border-slate-200'
          }`}
        >
          {/* Vertical Height Datum Lines on Left */}
          {/* Road Level */}
          <line x1={40} y1={520} x2={640} y2={520} stroke={isBlueprint ? '#38bdf8' : '#0f172a'} strokeWidth="2" />
          <text x={45} y={514} fill={isBlueprint ? '#7dd3fc' : '#475569'} fontSize="8" fontFamily="monospace" fontWeight="bold">
            ROAD LEVEL &bull; ±0&apos;-0&quot;
          </text>

          {/* Plinth Level */}
          <line x1={40} y1={495} x2={640} y2={495} stroke={isBlueprint ? '#38bdf8' : '#0284c7'} strokeWidth="1" strokeDasharray="4 2" />
          <text x={45} y={490} fill={isBlueprint ? '#38bdf8' : '#0284c7'} fontSize="8" fontFamily="monospace" fontWeight="bold">
            PLINTH LEVEL &bull; +3&apos;-0&quot;
          </text>

          {/* 1st Floor Level */}
          <line x1={40} y1={415} x2={640} y2={415} stroke={isBlueprint ? '#38bdf8' : '#64748b'} strokeWidth="1" strokeDasharray="4 2" />
          <text x={45} y={410} fill={isBlueprint ? '#7dd3fc' : '#475569'} fontSize="8" fontFamily="monospace" fontWeight="bold">
            1ST FLOOR &bull; +12&apos;-6&quot; (STILT HT 9&apos;-6&quot;)
          </text>

          {/* 2nd Floor Level */}
          <line x1={40} y1={335} x2={640} y2={335} stroke={isBlueprint ? '#38bdf8' : '#64748b'} strokeWidth="1" strokeDasharray="4 2" />
          <text x={45} y={330} fill={isBlueprint ? '#7dd3fc' : '#475569'} fontSize="8" fontFamily="monospace" fontWeight="bold">
            2ND FLOOR &bull; +23&apos;-0&quot; (HT 10&apos;-6&quot;)
          </text>

          {/* 3rd Floor Level (Duplex Lower) */}
          <line x1={40} y1={255} x2={640} y2={255} stroke={isBlueprint ? '#38bdf8' : '#64748b'} strokeWidth="1" strokeDasharray="4 2" />
          <text x={45} y={250} fill={isBlueprint ? '#7dd3fc' : '#475569'} fontSize="8" fontFamily="monospace" fontWeight="bold">
            3RD FLOOR (DUPLEX) &bull; +33&apos;-6&quot; (HT 10&apos;-6&quot;)
          </text>

          {/* 4th Floor Level (Duplex Upper) */}
          <line x1={40} y1={175} x2={640} y2={175} stroke={isBlueprint ? '#38bdf8' : '#64748b'} strokeWidth="1" strokeDasharray="4 2" />
          <text x={45} y={170} fill={isBlueprint ? '#7dd3fc' : '#475569'} fontSize="8" fontFamily="monospace" fontWeight="bold">
            4TH FLOOR (DUPLEX) &bull; +44&apos;-0&quot; (HT 10&apos;-6&quot;)
          </text>

          {/* 5th Floor Level (Penthouse & Terrace) */}
          <line x1={40} y1={95} x2={640} y2={95} stroke={isBlueprint ? '#38bdf8' : '#64748b'} strokeWidth="1" strokeDasharray="4 2" />
          <text x={45} y={90} fill={isBlueprint ? '#7dd3fc' : '#475569'} fontSize="8" fontFamily="monospace" fontWeight="bold">
            5TH FLOOR (TERRACE &amp; BAR) &bull; +54&apos;-6&quot;
          </text>

          {/* Mumty / Parapet Level */}
          <line x1={40} y1={45} x2={640} y2={45} stroke={isBlueprint ? '#38bdf8' : '#64748b'} strokeWidth="1" strokeDasharray="4 2" />
          <text x={45} y={40} fill={isBlueprint ? '#7dd3fc' : '#475569'} fontSize="8" fontFamily="monospace" fontWeight="bold">
            MUMTY &amp; OVERHEAD TANK &bull; +63&apos;-0&quot;
          </text>

          {/* Main Building Facade Massing */}
          {/* Ground Stilt Car Porch */}
          <rect
            x={220}
            y={415}
            width={380}
            height={80}
            fill={isBlueprint ? 'rgba(56, 189, 248, 0.05)' : '#f8fafc'}
            stroke={isBlueprint ? '#38bdf8' : '#0f172a'}
            strokeWidth="2"
          />
          {/* Stilt Columns */}
          <rect x={240} y={415} width={20} height={80} fill={isBlueprint ? '#0284c7' : '#334155'} />
          <rect x={360} y={415} width={20} height={80} fill={isBlueprint ? '#0284c7' : '#334155'} />
          <rect x={480} y={415} width={20} height={80} fill={isBlueprint ? '#0284c7' : '#334155'} />
          <text x={310} y={460} fill={isBlueprint ? '#7dd3fc' : '#64748b'} fontSize="8" fontFamily="monospace">
            STILT CAR PARKING ENTRANCE (CLEAR HT: 9&apos;-6&quot;)
          </text>

          {/* Floor 1 & 2 Solid Massing */}
          <rect
            x={220}
            y={255}
            width={380}
            height={160}
            fill={isBlueprint ? 'rgba(56, 189, 248, 0.08)' : '#ffffff'}
            stroke={isBlueprint ? '#38bdf8' : '#0f172a'}
            strokeWidth="2"
          />
          {/* Windows on Floor 1 & 2 */}
          <rect x={240} y={355} width={60} height={45} fill={isBlueprint ? '#0284c7' : '#e0f2fe'} stroke={isBlueprint ? '#38bdf8' : '#0284c7'} strokeWidth="1.2" />
          <rect x={330} y={355} width={60} height={45} fill={isBlueprint ? '#0284c7' : '#e0f2fe'} stroke={isBlueprint ? '#38bdf8' : '#0284c7'} strokeWidth="1.2" />
          <rect x={240} y={275} width={60} height={45} fill={isBlueprint ? '#0284c7' : '#e0f2fe'} stroke={isBlueprint ? '#38bdf8' : '#0284c7'} strokeWidth="1.2" />
          <rect x={330} y={275} width={60} height={45} fill={isBlueprint ? '#0284c7' : '#e0f2fe'} stroke={isBlueprint ? '#38bdf8' : '#0284c7'} strokeWidth="1.2" />

          {/* CNC Jali Vertical Feature Panel (Levels 1 to 4) */}
          <rect
            x={430}
            y={175}
            width={70}
            height={240}
            fill={isBlueprint ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7'}
            stroke={isBlueprint ? '#fbbf24' : '#d97706'}
            strokeWidth="1.5"
          />
          {/* Jali Pattern Diamonds */}
          {Array.from({ length: 6 }).map((_, i) => (
            <polygon
              key={`jali-${i}`}
              points={`465,${195 + i * 36} 450,${210 + i * 36} 465,${225 + i * 36} 480,${210 + i * 36}`}
              fill="none"
              stroke={isBlueprint ? '#fbbf24' : '#d97706'}
              strokeWidth="1.2"
            />
          ))}
          <text x={465} y={310} textAnchor="middle" transform="rotate(-90, 465, 310)" fill={isBlueprint ? '#fbbf24' : '#b45309'} fontSize="8" fontFamily="monospace" fontWeight="bold">
            CNC TERRACOTTA JALI SCREEN
          </text>

          {/* Duplex Double-Height Living Glass Front (Levels 3 & 4) */}
          <rect
            x={220}
            y={175}
            width={190}
            height={80}
            fill={isBlueprint ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe'}
            stroke={isBlueprint ? '#38bdf8' : '#0284c7'}
            strokeWidth="1.8"
          />
          {/* Glass Grid Lines */}
          <line x1={283} y1={175} x2={283} y2={255} stroke={isBlueprint ? '#38bdf8' : '#0284c7'} strokeWidth="1" />
          <line x1={346} y1={175} x2={346} y2={255} stroke={isBlueprint ? '#38bdf8' : '#0284c7'} strokeWidth="1" />
          <text x={315} y={220} textAnchor="middle" fill={isBlueprint ? '#38bdf8' : '#0369a1'} fontSize="8.5" fontFamily="monospace" fontWeight="bold">
            DUPLEX DOUBLE-HEIGHT GLAZING
          </text>

          {/* Level 5 Penthouse & Open Terrace */}
          <rect
            x={220}
            y={95}
            width={160}
            height={80}
            fill={isBlueprint ? 'rgba(56, 189, 248, 0.08)' : '#ffffff'}
            stroke={isBlueprint ? '#38bdf8' : '#0f172a'}
            strokeWidth="2"
          />
          <text x={300} y={140} textAnchor="middle" fill={isBlueprint ? '#ffffff' : '#0f172a'} fontSize="8" fontFamily="monospace" fontWeight="bold">
            PENTHOUSE SUITE
          </text>

          {/* Open Sky Terrace & Bar Pergola */}
          <rect
            x={390}
            y={95}
            width={210}
            height={80}
            fill="none"
            stroke={isBlueprint ? '#38bdf8' : '#0f172a'}
            strokeWidth="1"
            strokeDasharray="4 2"
          />
          {/* Pergola Beams */}
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={`perg-${i}`}
              x1={400 + i * 34}
              y1={95}
              x2={400 + i * 34}
              y2={115}
              stroke={isBlueprint ? '#f59e0b' : '#b45309'}
              strokeWidth="2.5"
            />
          ))}
          {/* Glass Railing on Terrace */}
          <rect x={390} y={150} width={210} height={25} fill="none" stroke={isBlueprint ? '#38bdf8' : '#0284c7'} strokeWidth="1.5" />
          <text x={495} y={140} textAnchor="middle" fill={isBlueprint ? '#f59e0b' : '#b45309'} fontSize="8" fontFamily="monospace" fontWeight="bold">
            OPEN TERRACE &amp; BAR PERGOLA
          </text>

          {/* Mumty & Water Tank Top */}
          <rect
            x={220}
            y={45}
            width={110}
            height={50}
            fill={isBlueprint ? '#0284c7' : '#e2e8f0'}
            stroke={isBlueprint ? '#38bdf8' : '#0f172a'}
            strokeWidth="2"
          />
          <text x={275} y={75} textAnchor="middle" fill={isBlueprint ? '#ffffff' : '#0f172a'} fontSize="8" fontFamily="monospace" fontWeight="bold">
            MUMTY &amp; OHT
          </text>
        </svg>
      </div>

      {/* Exterior Finish Materials Table */}
      <div className="w-full mt-4 pt-3 border-t border-inherit">
        <div
          className={`p-4 rounded-xl border text-xs font-mono overflow-x-auto ${
            isBlueprint
              ? 'bg-slate-900/80 border-sky-900 text-slate-200'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="font-bold text-sm text-sky-600 dark:text-sky-400 mb-2 border-b border-inherit pb-2 flex items-center justify-between">
            <span>EXTERIOR FINISH &amp; MATERIAL SCHEDULE (ASIAN PAINTS ULTIMA)</span>
            <span className="text-[11px] text-slate-500">Weather-Proof 10-Yr Warranty</span>
          </div>
          <table className="w-full text-left border-collapse text-[11px] min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-300 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-1">FACADE ZONE</th>
                <th className="py-1">SPECIFICATION &amp; MATERIAL</th>
                <th className="py-1">SHADE / COLOR CODE</th>
                <th className="py-1">ELEVATION LEVEL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {facadeSpecifications.map((spec, idx) => (
                <tr key={idx}>
                  <td className="py-2 font-bold text-sky-600 dark:text-sky-400">{spec.element}</td>
                  <td>{spec.material}</td>
                  <td className="font-semibold text-slate-900 dark:text-slate-100">{spec.finish}</td>
                  <td>{spec.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
