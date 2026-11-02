'use client';

import React, { useState } from 'react';
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
  const [zoom, setZoom] = useState<number>(1);
  const [theme, setTheme] = useState<'light' | 'blueprint'>('light');

  const scale = 14; // pixels per foot
  const padding = 40;
  const svgWidth = plotWidth * scale + padding * 2;
  const svgHeight = plotLength * scale + padding * 2;
  const isBlueprint = theme === 'blueprint';

  // Calculate total carpet area for this floor
  const totalFloorArea = floor.rooms.reduce(
    (sum, room) => sum + (room.width || 0) * (room.length || 0),
    0
  );

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl shadow-sm border transition-colors ${
        isBlueprint
          ? 'bg-slate-950 border-sky-900 text-sky-100'
          : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      {/* Top Header & Interactive Toolbar */}
      <div className="w-full flex flex-wrap justify-between items-center gap-3 mb-4 px-2">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-lg tracking-tight">{floor.floorName}</h3>
          <span
            className={`text-xs font-mono px-2.5 py-1 rounded-full border ${
              isBlueprint
                ? 'bg-sky-950/80 border-sky-800 text-sky-300'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            Plot: {plotWidth}&apos; × {plotLength}&apos; ({plotWidth * plotLength} sq ft)
          </span>
          <span
            className={`text-xs font-mono px-2 py-0.5 rounded border hidden sm:inline ${
              isBlueprint
                ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            Carpet: {totalFloorArea} sq ft
          </span>
        </div>

        {/* Blueprint & Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setTheme(isBlueprint ? 'light' : 'blueprint')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 shadow-sm ${
              isBlueprint
                ? 'bg-sky-900/60 border-sky-700 text-sky-200 hover:bg-sky-850'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>{isBlueprint ? '📐 Blueprint Mode' : '📄 Paper View'}</span>
          </button>

          {/* Zoom Buttons */}
          <div
            className={`flex items-center rounded-lg border shadow-sm ${
              isBlueprint
                ? 'bg-slate-900 border-sky-900 text-sky-300'
                : 'bg-slate-50 border-slate-300 text-slate-700'
            }`}
          >
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.6, Math.round((z - 0.15) * 100) / 100))}
              aria-label="Zoom Out"
              className="px-2.5 py-1 text-sm font-bold hover:opacity-75 border-r border-inherit transition"
            >
              -
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              aria-label="Reset Zoom"
              className="px-2 py-1 text-xs font-mono font-medium hover:opacity-75"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.2, Math.round((z + 0.15) * 100) / 100))}
              aria-label="Zoom In"
              className="px-2.5 py-1 text-sm font-bold hover:opacity-75 border-l border-inherit transition"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="overflow-auto max-w-full p-2 w-full flex justify-center">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="inline-block"
        >
          <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className={`rounded-xl shadow-inner transition-colors duration-200 ${
              isBlueprint ? 'bg-[#071527]' : 'bg-[#fafafa]'
            }`}
          >
            {/* Definitions for architectural grid pattern */}
            <defs>
              <pattern
                id={`cad-grid-${floor.level}`}
                width={scale}
                height={scale}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${scale} 0 L 0 0 0 ${scale}`}
                  fill="none"
                  stroke={isBlueprint ? 'rgba(56, 189, 248, 0.08)' : 'rgba(148, 163, 184, 0.12)'}
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>

            {/* Background Grid */}
            <rect width={svgWidth} height={svgHeight} fill={`url(#cad-grid-${floor.level})`} />

            {/* Exterior Dimension String (Top Dimension Line) */}
            <g transform={`translate(${padding}, ${padding - 18})`}>
              <line
                x1={0}
                y1={0}
                x2={plotWidth * scale}
                y2={0}
                stroke={isBlueprint ? '#38bdf8' : '#64748b'}
                strokeWidth="1"
              />
              {/* CAD 45° Tick Marks */}
              <line
                x1={-3}
                y1={3}
                x2={3}
                y2={-3}
                stroke={isBlueprint ? '#38bdf8' : '#0f172a'}
                strokeWidth="1.5"
              />
              <line
                x1={plotWidth * scale - 3}
                y1={3}
                x2={plotWidth * scale + 3}
                y2={-3}
                stroke={isBlueprint ? '#38bdf8' : '#0f172a'}
                strokeWidth="1.5"
              />
              <text
                x={(plotWidth * scale) / 2}
                y={-6}
                textAnchor="middle"
                fill={isBlueprint ? '#7dd3fc' : '#475569'}
                fontSize="10"
                fontFamily="monospace"
                fontWeight="600"
              >
                {plotWidth}&apos;-0&quot; PLOT WIDTH
              </text>
            </g>

            {/* Exterior Dimension String (Left Dimension Line) */}
            <g transform={`translate(${padding - 18}, ${padding})`}>
              <line
                x1={0}
                y1={0}
                x2={0}
                y2={plotLength * scale}
                stroke={isBlueprint ? '#38bdf8' : '#64748b'}
                strokeWidth="1"
              />
              <line
                x1={-3}
                y1={3}
                x2={3}
                y2={-3}
                stroke={isBlueprint ? '#38bdf8' : '#0f172a'}
                strokeWidth="1.5"
              />
              <line
                x1={-3}
                y1={plotLength * scale + 3}
                x2={3}
                y2={plotLength * scale - 3}
                stroke={isBlueprint ? '#38bdf8' : '#0f172a'}
                strokeWidth="1.5"
              />
              <text
                x={-6}
                y={(plotLength * scale) / 2}
                textAnchor="middle"
                transform={`rotate(-90, -6, ${(plotLength * scale) / 2})`}
                fill={isBlueprint ? '#7dd3fc' : '#475569'}
                fontSize="10"
                fontFamily="monospace"
                fontWeight="600"
              >
                {plotLength}&apos;-0&quot; PLOT LENGTH
              </text>
            </g>

            {/* Outer Plot Boundary Dashed Line */}
            <rect
              x={padding}
              y={padding}
              width={plotWidth * scale}
              height={plotLength * scale}
              fill="none"
              stroke={isBlueprint ? '#0284c7' : '#94a3b8'}
              strokeWidth="1.5"
              strokeDasharray="5 4"
            />

            {/* Setback Area Label */}
            <text
              x={padding + 8}
              y={padding + 16}
              className={`text-[9px] font-mono uppercase tracking-wider ${
                isBlueprint ? 'fill-sky-400' : 'fill-slate-400'
              }`}
            >
              Plot Boundary (Front Facing North/East)
            </text>

            {/* Vastu Compass Rose / North Arrow in Top Right */}
            <g transform={`translate(${svgWidth - padding - 28}, ${padding + 18})`}>
              <circle
                r="16"
                fill={isBlueprint ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)'}
                stroke={isBlueprint ? '#38bdf8' : '#cbd5e1'}
                strokeWidth="1"
              />
              {/* North Arrow Needle */}
              <polygon
                points="0,-12 4,2 0,0 -4,2"
                fill={isBlueprint ? '#ef4444' : '#dc2626'}
              />
              <polygon
                points="0,12 4,-2 0,0 -4,-2"
                fill={isBlueprint ? '#94a3b8' : '#64748b'}
              />
              <text
                x="0"
                y="-14"
                textAnchor="middle"
                fontSize="8"
                fontWeight="bold"
                fill={isBlueprint ? '#f87171' : '#dc2626'}
              >
                N
              </text>
            </g>

            {/* Scale Bar in Bottom Left */}
            <g transform={`translate(${padding + 8}, ${svgHeight - padding - 8})`}>
              <rect x="0" y="0" width="28" height="4" fill={isBlueprint ? '#38bdf8' : '#0f172a'} />
              <rect x="28" y="0" width="28" height="4" fill={isBlueprint ? '#0369a1' : '#cbd5e1'} />
              <text
                x="0"
                y="-3"
                fontSize="7"
                fontFamily="monospace"
                fill={isBlueprint ? '#7dd3fc' : '#64748b'}
              >
                0
              </text>
              <text
                x="28"
                y="-3"
                fontSize="7"
                fontFamily="monospace"
                fill={isBlueprint ? '#7dd3fc' : '#64748b'}
              >
                2&apos;
              </text>
              <text
                x="56"
                y="-3"
                fontSize="7"
                fontFamily="monospace"
                fill={isBlueprint ? '#7dd3fc' : '#64748b'}
              >
                4&apos; CAD
              </text>
            </g>

            {/* Rooms Layer */}
            <g transform={`translate(${padding}, ${padding})`}>
              {floor.rooms.map((room) => (
                <RoomBox key={room.id} room={room} scale={scale} theme={theme} />
              ))}
            </g>
          </svg>
        </div>
      </div>

      {/* Professional Title Block (CAD Sheet Footer) */}
      <div
        className={`w-full mt-3 p-3 rounded-xl border flex flex-wrap justify-between items-center text-xs font-mono gap-2 ${
          isBlueprint
            ? 'bg-slate-900/80 border-sky-900 text-sky-300'
            : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}
      >
        <div className="flex items-center gap-4">
          <span className="font-semibold uppercase tracking-wider text-sky-600">
            DRAWING: {floor.floorName.toUpperCase()}
          </span>
          <span className="hidden sm:inline">SCALE: 1&quot; = 1&apos;-0&quot;</span>
          <span className="hidden sm:inline">AUTOCAD / DXF COMPLIANT</span>
        </div>
        <div className="flex items-center gap-3">
          <span>UPOBPAS / GDA APPROVED GRID</span>
          <span className="font-bold text-emerald-600">{totalFloorArea} SQ FT</span>
        </div>
      </div>
    </div>
  );
};
