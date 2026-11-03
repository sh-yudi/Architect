'use client';

import React, { useState } from 'react';
import { HousePlan } from '@/types/plan';
import { formatFeetInches } from '../floorplan/RoomBox';

interface StructuralGridSheetProps {
  plan: HousePlan;
  plotWidth: number;
  plotLength: number;
}

export const StructuralGridSheet: React.FC<StructuralGridSheetProps> = ({
  plan,
  plotWidth,
  plotLength,
}) => {
  const [theme, setTheme] = useState<'blueprint' | 'paper'>('paper');
  const isBlueprint = theme === 'blueprint';

  const scale = 14;
  const padding = 55;
  const svgWidth = plotWidth * scale + padding * 2;
  const svgHeight = plotLength * scale + padding * 2;

  // Grid line positions based on building envelope
  const frontSetback = plan.setbacks.front;
  const rearSetback = plan.setbacks.rear;
  const leftSetback = plan.setbacks.left;
  const rightSetback = plan.setbacks.right;

  const buildableW = plotWidth - leftSetback - rightSetback;
  const buildableL = plotLength - frontSetback - rearSetback;

  // Centerline grid coordinates
  const colA = leftSetback;
  const colB = leftSetback + Math.round(buildableW * 0.35 * 10) / 10;
  const colC = leftSetback + Math.round(buildableW * 0.7 * 10) / 10;
  const colD = leftSetback + buildableW;

  const row1 = frontSetback;
  const row2 = frontSetback + Math.round(buildableL * 0.28 * 10) / 10;
  const row3 = frontSetback + Math.round(buildableL * 0.55 * 10) / 10;
  const row4 = frontSetback + Math.round(buildableL * 0.78 * 10) / 10;
  const row5 = frontSetback + buildableL;

  const verticalGrids = [
    { label: 'A', x: colA },
    { label: 'B', x: colB },
    { label: 'C', x: colC },
    { label: 'D', x: colD },
  ];

  const horizontalGrids = [
    { label: '1', y: row1 },
    { label: '2', y: row2 },
    { label: '3', y: row3 },
    { label: '4', y: row4 },
    { label: '5', y: row5 },
  ];

  // Column nodes at grid intersections
  const columnNodes: { id: string; colName: string; x: number; y: number; mark: string; size: string }[] = [];
  let count = 1;
  verticalGrids.forEach((vg) => {
    horizontalGrids.forEach((hg) => {
      // Corner columns C0, boundary C1, interior heavy C2
      const isCorner = (vg.label === 'A' || vg.label === 'D') && (hg.label === '1' || hg.label === '5');
      const isCenter = (vg.label === 'B' || vg.label === 'C') && (hg.label === '2' || hg.label === '3');
      const mark = isCorner ? 'C0' : isCenter ? 'C2' : 'C1';
      const size = isCenter ? '9"×18"' : '9"×15"';

      columnNodes.push({
        id: `col-${vg.label}-${hg.label}`,
        colName: `C${count++}`,
        x: vg.x,
        y: hg.y,
        mark,
        size,
      });
    });
  });

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl shadow-sm border transition-colors ${
        isBlueprint
          ? 'bg-slate-950 border-sky-900 text-sky-100'
          : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      {/* Sheet Header & Controls */}
      <div className="w-full flex flex-wrap justify-between items-center gap-3 mb-4 px-2">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded border border-amber-300 dark:border-amber-800">
                SHEET S-01
              </span>
              <h3 className="font-bold text-lg tracking-tight">Column Centerline Grid Plan</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-sky-400 mt-0.5">
              Structural Center-to-Center Column Layout &bull; IS: 456-2000 Compliant
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

      {/* Centerline Grid SVG Drawing */}
      <div className="overflow-auto max-w-full p-2 w-full flex justify-center">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className={`rounded-xl shadow-inner transition-colors duration-200 ${
            isBlueprint ? 'bg-[#061220]' : 'bg-[#fafafa]'
          }`}
        >
          {/* Outer Plot Boundary */}
          <rect
            x={padding}
            y={padding}
            width={plotWidth * scale}
            height={plotLength * scale}
            fill="none"
            stroke={isBlueprint ? '#0284c7' : '#94a3b8'}
            strokeWidth="1.2"
            strokeDasharray="4 3"
          />

          {/* Vertical Centerline Grid Lines */}
          {verticalGrids.map((vg, i) => {
            const gx = padding + vg.x * scale;
            return (
              <g key={`vgrid-${i}`}>
                <line
                  x1={gx}
                  y1={padding - 20}
                  x2={gx}
                  y2={padding + plotLength * scale + 20}
                  stroke={isBlueprint ? '#38bdf8' : '#dc2626'}
                  strokeWidth="1"
                  strokeDasharray="6 3 2 3"
                  opacity={0.8}
                />
                {/* Top Grid Bubble */}
                <circle
                  cx={gx}
                  cy={padding - 28}
                  r="10"
                  fill={isBlueprint ? '#0f172a' : '#ffffff'}
                  stroke={isBlueprint ? '#38bdf8' : '#dc2626'}
                  strokeWidth="1.5"
                />
                <text
                  x={gx}
                  y={padding - 24}
                  textAnchor="middle"
                  fill={isBlueprint ? '#38bdf8' : '#dc2626'}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {vg.label}
                </text>
                {/* Bottom Grid Bubble */}
                <circle
                  cx={gx}
                  cy={padding + plotLength * scale + 28}
                  r="10"
                  fill={isBlueprint ? '#0f172a' : '#ffffff'}
                  stroke={isBlueprint ? '#38bdf8' : '#dc2626'}
                  strokeWidth="1.5"
                />
                <text
                  x={gx}
                  y={padding + plotLength * scale + 32}
                  textAnchor="middle"
                  fill={isBlueprint ? '#38bdf8' : '#dc2626'}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {vg.label}
                </text>
              </g>
            );
          })}

          {/* Horizontal Centerline Grid Lines */}
          {horizontalGrids.map((hg, i) => {
            const gy = padding + hg.y * scale;
            return (
              <g key={`hgrid-${i}`}>
                <line
                  x1={padding - 20}
                  y1={gy}
                  x2={padding + plotWidth * scale + 20}
                  y2={gy}
                  stroke={isBlueprint ? '#38bdf8' : '#dc2626'}
                  strokeWidth="1"
                  strokeDasharray="6 3 2 3"
                  opacity={0.8}
                />
                {/* Left Grid Bubble */}
                <circle
                  cx={padding - 28}
                  cy={gy}
                  r="10"
                  fill={isBlueprint ? '#0f172a' : '#ffffff'}
                  stroke={isBlueprint ? '#38bdf8' : '#dc2626'}
                  strokeWidth="1.5"
                />
                <text
                  x={padding - 28}
                  y={gy + 3.5}
                  textAnchor="middle"
                  fill={isBlueprint ? '#38bdf8' : '#dc2626'}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {hg.label}
                </text>
                {/* Right Grid Bubble */}
                <circle
                  cx={padding + plotWidth * scale + 28}
                  cy={gy}
                  r="10"
                  fill={isBlueprint ? '#0f172a' : '#ffffff'}
                  stroke={isBlueprint ? '#38bdf8' : '#dc2626'}
                  strokeWidth="1.5"
                />
                <text
                  x={padding + plotWidth * scale + 28}
                  y={gy + 3.5}
                  textAnchor="middle"
                  fill={isBlueprint ? '#38bdf8' : '#dc2626'}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {hg.label}
                </text>
              </g>
            );
          })}

          {/* Offset Dimensions between vertical grids */}
          {verticalGrids.slice(0, -1).map((vg, i) => {
            const nextVg = verticalGrids[i + 1];
            const x1 = padding + vg.x * scale;
            const x2 = padding + nextVg.x * scale;
            const dist = nextVg.x - vg.x;
            const yPos = padding - 45;
            return (
              <g key={`vdim-${i}`}>
                <line x1={x1} y1={yPos} x2={x2} y2={yPos} stroke={isBlueprint ? '#7dd3fc' : '#475569'} strokeWidth="1" />
                <line x1={x1 - 2} y1={yPos + 2} x2={x1 + 2} y2={yPos - 2} stroke={isBlueprint ? '#7dd3fc' : '#0f172a'} strokeWidth="1.5" />
                <line x1={x2 - 2} y1={yPos + 2} x2={x2 + 2} y2={yPos - 2} stroke={isBlueprint ? '#7dd3fc' : '#0f172a'} strokeWidth="1.5" />
                <text
                  x={(x1 + x2) / 2}
                  y={yPos - 3}
                  textAnchor="middle"
                  fill={isBlueprint ? '#7dd3fc' : '#334155'}
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {formatFeetInches(dist)}
                </text>
              </g>
            );
          })}

          {/* Offset Dimensions between horizontal grids */}
          {horizontalGrids.slice(0, -1).map((hg, i) => {
            const nextHg = horizontalGrids[i + 1];
            const y1 = padding + hg.y * scale;
            const y2 = padding + nextHg.y * scale;
            const dist = nextHg.y - hg.y;
            const xPos = padding - 45;
            return (
              <g key={`hdim-${i}`}>
                <line x1={xPos} y1={y1} x2={xPos} y2={y2} stroke={isBlueprint ? '#7dd3fc' : '#475569'} strokeWidth="1" />
                <line x1={xPos - 2} y1={y1 + 2} x2={xPos + 2} y2={y1 - 2} stroke={isBlueprint ? '#7dd3fc' : '#0f172a'} strokeWidth="1.5" />
                <line x1={xPos - 2} y1={y2 + 2} x2={xPos + 2} y2={y2 - 2} stroke={isBlueprint ? '#7dd3fc' : '#0f172a'} strokeWidth="1.5" />
                <text
                  x={xPos - 4}
                  y={(y1 + y2) / 2}
                  textAnchor="middle"
                  transform={`rotate(-90, ${xPos - 4}, ${(y1 + y2) / 2})`}
                  fill={isBlueprint ? '#7dd3fc' : '#334155'}
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {formatFeetInches(dist)}
                </text>
              </g>
            );
          })}

          {/* RCC Columns at Intersections */}
          {columnNodes.map((col) => {
            const cx = padding + col.x * scale;
            const cy = padding + col.y * scale;
            const colW = 10;
            const colH = 16;
            return (
              <g key={col.id} transform={`translate(${cx}, ${cy})`}>
                {/* Column cross-section rectangle */}
                <rect
                  x={-colW / 2}
                  y={-colH / 2}
                  width={colW}
                  height={colH}
                  fill={isBlueprint ? '#0284c7' : '#0f172a'}
                  stroke={isBlueprint ? '#38bdf8' : '#ffffff'}
                  strokeWidth="1"
                />
                {/* Concrete hatch lines inside column */}
                <line x1={-colW / 2} y1={-colH / 2} x2={colW / 2} y2={colH / 2} stroke={isBlueprint ? '#ffffff' : '#94a3b8'} strokeWidth="0.5" />
                {/* Column Designation Tag */}
                <rect
                  x={colW / 2 + 3}
                  y={-6}
                  width={20}
                  height={12}
                  rx={2}
                  fill={isBlueprint ? '#0f172a' : '#ffffff'}
                  stroke={isBlueprint ? '#38bdf8' : '#0f172a'}
                  strokeWidth="0.8"
                />
                <text
                  x={colW / 2 + 13}
                  y={2.5}
                  textAnchor="middle"
                  fill={isBlueprint ? '#38bdf8' : '#0f172a'}
                  fontSize="7.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {col.mark}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Structural Schedule & Notes Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-3 border-t border-inherit">
        {/* Column Schedule Table */}
        <div
          className={`p-4 rounded-xl border text-xs font-mono ${
            isBlueprint
              ? 'bg-slate-900/80 border-sky-900 text-slate-200'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3 border-b border-inherit pb-2">
            <span className="font-bold text-sm text-sky-600 dark:text-sky-400">
              SCHEDULE OF COLUMNS (IS: 456-2000)
            </span>
            <span className="text-[10px] text-slate-500">20 Total Columns</span>
          </div>
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-slate-300 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-1">MARK</th>
                <th className="py-1">SIZE</th>
                <th className="py-1">MAIN REBAR</th>
                <th className="py-1">TIES (STIRRUPS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              <tr>
                <td className="py-1.5 font-bold text-sky-600">C0 (Corner)</td>
                <td>9&quot; × 15&quot;</td>
                <td>4-16&phi; + 2-12&phi; Fe500D</td>
                <td>8&phi; @ 6&quot; c/c (4&quot; at joints)</td>
              </tr>
              <tr>
                <td className="py-1.5 font-bold text-sky-600">C1 (Peripheral)</td>
                <td>9&quot; × 15&quot;</td>
                <td>4-16&phi; + 2-12&phi; Fe500D</td>
                <td>8&phi; @ 6&quot; c/c (4&quot; at joints)</td>
              </tr>
              <tr>
                <td className="py-1.5 font-bold text-sky-600">C2 (Core Heavy)</td>
                <td>9&quot; × 18&quot;</td>
                <td>6-16&phi; + 2-16&phi; Fe500D</td>
                <td>8&phi; @ 5&quot; c/c (3.5&quot; at joints)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Structural Design Notes */}
        <div
          className={`p-4 rounded-xl border text-xs font-mono leading-relaxed ${
            isBlueprint
              ? 'bg-slate-900/80 border-sky-900 text-slate-200'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="font-bold text-sm text-sky-600 dark:text-sky-400 mb-2 border-b border-inherit pb-2">
            GENERAL STRUCTURAL SPECIFICATIONS
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 list-disc list-inside">
            <li><strong>CONCRETE GRADE:</strong> M-20 (1:1.5:3) for all RCC footing, columns, beams &amp; slabs.</li>
            <li><strong>LEAN CONCRETE (P.C.C.):</strong> 1:4:8 under footings, 100mm (4&quot;) thick with sand cushion.</li>
            <li><strong>STEEL:</strong> High Yield Strength Deformed (HYSD) TMT Fe-500D bars (IS: 1786).</li>
            <li><strong>CLEAR COVERS:</strong> Footing: 50mm, Column: 40mm, Beam: 25mm, Slab: 15mm.</li>
            <li><strong>DEVELOPMENT LENGTH:</strong> Ld = 50 &times; bar diameter (&phi;) for tension laps.</li>
            <li><strong>SOIL BEARING CAPACITY (SBC):</strong> Assumed 180 kN/m² at 5&apos;-0&quot; depth below N.G.L.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
