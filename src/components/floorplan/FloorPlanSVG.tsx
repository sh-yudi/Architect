'use client';

import React, { useState } from 'react';
import { FloorPlan } from '@/types/plan';
import { RoomBox, formatFeetInches } from './RoomBox';

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

            {/* Exterior Dimension String (Right Dimension Line) */}
            <g transform={`translate(${padding + plotWidth * scale + 18}, ${padding})`}>
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
                x={7}
                y={(plotLength * scale) / 2}
                textAnchor="middle"
                transform={`rotate(90, 7, ${(plotLength * scale) / 2})`}
                fill={isBlueprint ? '#7dd3fc' : '#475569'}
                fontSize="10"
                fontFamily="monospace"
                fontWeight="600"
              >
                {plotLength}&apos;-0&quot; EAST/WEST BOUNDARY
              </text>
            </g>

            {/* Exterior Dimension String (Bottom Dimension Line) */}
            <g transform={`translate(${padding}, ${padding + plotLength * scale + 18})`}>
              <line
                x1={0}
                y1={0}
                x2={plotWidth * scale}
                y2={0}
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
                x1={plotWidth * scale - 3}
                y1={3}
                x2={plotWidth * scale + 3}
                y2={-3}
                stroke={isBlueprint ? '#38bdf8' : '#0f172a'}
                strokeWidth="1.5"
              />
              <text
                x={(plotWidth * scale) / 2}
                y={11}
                textAnchor="middle"
                fill={isBlueprint ? '#7dd3fc' : '#475569'}
                fontSize="10"
                fontFamily="monospace"
                fontWeight="600"
              >
                {plotWidth}&apos;-0&quot; ROAD FRONTAGE &amp; ACCESS
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

            {/* Setbacks & Buildable Envelope Visualization */}
            {floor.rooms.length > 0 && (() => {
              const minX = Math.min(...floor.rooms.map((r) => r.x));
              const minY = Math.min(...floor.rooms.map((r) => r.y));
              const maxX = Math.max(...floor.rooms.map((r) => r.x + r.width));
              const maxY = Math.max(...floor.rooms.map((r) => r.y + r.length));

              const frontSetbackFt = minY;
              const rearSetbackFt = plotLength - maxY;
              const leftSetbackFt = minX;
              const rightSetbackFt = plotWidth - maxX;

              return (
                <g>
                  {/* Front Setback Lawn Shading */}
                  {frontSetbackFt > 0 && (
                    <g>
                      <rect
                        x={padding}
                        y={padding}
                        width={plotWidth * scale}
                        height={frontSetbackFt * scale}
                        fill={isBlueprint ? 'rgba(56, 189, 248, 0.05)' : 'rgba(34, 197, 94, 0.08)'}
                      />
                      <text
                        x={padding + (plotWidth * scale) / 2}
                        y={padding + (frontSetbackFt * scale) / 2 + 3}
                        textAnchor="middle"
                        fill={isBlueprint ? '#38bdf8' : '#15803d'}
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="600"
                        opacity={0.8}
                      >
                        FRONT SETBACK &amp; LAWN ({frontSetbackFt}&apos; REQ.)
                      </text>
                    </g>
                  )}

                  {/* Rear Setback Courtyard Shading */}
                  {rearSetbackFt > 0 && (
                    <g>
                      <rect
                        x={padding}
                        y={padding + maxY * scale}
                        width={plotWidth * scale}
                        height={rearSetbackFt * scale}
                        fill={isBlueprint ? 'rgba(56, 189, 248, 0.05)' : 'rgba(34, 197, 94, 0.08)'}
                      />
                      <text
                        x={padding + (plotWidth * scale) / 2}
                        y={padding + maxY * scale + (rearSetbackFt * scale) / 2 + 3}
                        textAnchor="middle"
                        fill={isBlueprint ? '#38bdf8' : '#15803d'}
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="600"
                        opacity={0.8}
                      >
                        REAR SETBACK / GREEN COURTYARD ({Math.round(rearSetbackFt * 10) / 10}&apos; REQ.)
                      </text>
                    </g>
                  )}

                  {/* Side Passages Shading & Dimensions */}
                  {leftSetbackFt > 0 && (
                    <g>
                      <rect
                        x={padding}
                        y={padding + minY * scale}
                        width={leftSetbackFt * scale}
                        height={(maxY - minY) * scale}
                        fill={isBlueprint ? 'rgba(56, 189, 248, 0.03)' : 'rgba(100, 116, 139, 0.05)'}
                      />
                      <text
                        x={padding + (leftSetbackFt * scale) / 2}
                        y={padding + minY * scale + ((maxY - minY) * scale) / 2}
                        textAnchor="middle"
                        transform={`rotate(-90, ${padding + (leftSetbackFt * scale) / 2}, ${padding + minY * scale + ((maxY - minY) * scale) / 2})`}
                        fill={isBlueprint ? '#38bdf8' : '#64748b'}
                        fontSize="7.5"
                        fontFamily="monospace"
                        fontWeight="600"
                        opacity={0.85}
                      >
                        SIDE: {formatFeetInches(leftSetbackFt)}
                      </text>
                    </g>
                  )}
                  {rightSetbackFt > 0 && (
                    <g>
                      <rect
                        x={padding + maxX * scale}
                        y={padding + minY * scale}
                        width={rightSetbackFt * scale}
                        height={(maxY - minY) * scale}
                        fill={isBlueprint ? 'rgba(56, 189, 248, 0.03)' : 'rgba(100, 116, 139, 0.05)'}
                      />
                      <text
                        x={padding + maxX * scale + (rightSetbackFt * scale) / 2}
                        y={padding + minY * scale + ((maxY - minY) * scale) / 2}
                        textAnchor="middle"
                        transform={`rotate(90, ${padding + maxX * scale + (rightSetbackFt * scale) / 2}, ${padding + minY * scale + ((maxY - minY) * scale) / 2})`}
                        fill={isBlueprint ? '#38bdf8' : '#64748b'}
                        fontSize="7.5"
                        fontFamily="monospace"
                        fontWeight="600"
                        opacity={0.85}
                      >
                        SIDE: {formatFeetInches(rightSetbackFt)}
                      </text>
                    </g>
                  )}

                  {/* Buildable Envelope Border & Boundary Dimensions */}
                  <g>
                    <rect
                      x={padding + minX * scale}
                      y={padding + minY * scale}
                      width={(maxX - minX) * scale}
                      height={(maxY - minY) * scale}
                      fill="none"
                      stroke={isBlueprint ? 'rgba(56, 189, 248, 0.4)' : 'rgba(217, 119, 6, 0.45)'}
                      strokeWidth="1.2"
                      strokeDasharray="4 3"
                    />
                    {/* Top side buildable width annotation */}
                    <text
                      x={padding + minX * scale + ((maxX - minX) * scale) / 2}
                      y={padding + minY * scale - 4}
                      textAnchor="middle"
                      fill={isBlueprint ? '#38bdf8' : '#b45309'}
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="700"
                    >
                      BUILDABLE WIDTH: {formatFeetInches(maxX - minX)}
                    </text>
                    {/* Right side buildable depth annotation */}
                    <text
                      x={padding + maxX * scale + 8}
                      y={padding + minY * scale + ((maxY - minY) * scale) / 2}
                      textAnchor="middle"
                      transform={`rotate(90, ${padding + maxX * scale + 8}, ${padding + minY * scale + ((maxY - minY) * scale) / 2})`}
                      fill={isBlueprint ? '#38bdf8' : '#b45309'}
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="700"
                    >
                      BUILDABLE DEPTH: {formatFeetInches(maxY - minY)}
                    </text>
                  </g>
                </g>
              );
            })()}

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

      {/* Professional Architectural Title Block (CAD Sheet Footer) */}
      <div
        className={`w-full mt-3 p-3.5 rounded-xl border flex flex-col gap-2.5 text-xs font-mono ${
          isBlueprint
            ? 'bg-slate-900/90 border-sky-900 text-sky-300'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}
      >
        <div className="flex flex-wrap justify-between items-center gap-2 border-b border-inherit pb-2">
          <div className="flex items-center gap-3">
            <span className="font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              DRAWING: {floor.floorName.toUpperCase()}
            </span>
            <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-bold">
              SHEET: P-0{floor.level + 1}
            </span>
            <span className="hidden sm:inline">SCALE: 1:100 (N.T.S.)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              CARPET AREA: {totalFloorArea} SQ FT
            </span>
            <span className="hidden md:inline px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px]">
              AUTOCAD / DXF COMPLIANT
            </span>
          </div>
        </div>

        {/* Architectural Notes & Level Markers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] leading-relaxed">
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-slate-100">LEVEL DATUMS:</span>
            <span>ROAD LEVEL: ±0&apos;-0&quot; &bull; PLINTH: +3&apos;-0&quot;</span>
            <span>FLOOR TO CEILING: {floor.level === 0 ? "9'-6\" (STILT)" : "10'-6\" (UPPER)"}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-slate-100">WALL SPECIFICATIONS:</span>
            <span>EXTERNAL WALLS: 9&quot; (230mm) BRICK</span>
            <span>INTERNAL PARTITIONS: 5&quot; (115mm) BRICK</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-slate-100">DOOR &amp; WINDOW SCHEDULE:</span>
            <span>DR: 3&apos;6&quot;×7&apos;0&quot; &bull; DR1: 3&apos;0&quot;×7&apos;0&quot; &bull; DB: 2&apos;6&quot;×7&apos;0&quot;</span>
            <span>W: 6&apos;0&quot;×5&apos;0&quot; &bull; W1: 5&apos;0&quot;×5&apos;0&quot; &bull; V: 2&apos;3&quot;×1&apos;6&quot;</span>
          </div>
        </div>
      </div>

      {/* Room Schedule & Space Breakdown */}
      <div className="w-full mt-4 pt-3 border-t border-inherit">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-sky-300 flex items-center gap-1.5">
            <span>📋</span>
            <span>Room Descriptions &amp; Space Schedule ({floor.rooms.length} Spaces)</span>
          </h4>
          <span className="text-[11px] font-mono text-slate-500">
            Floor Total: {totalFloorArea} sq ft
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {floor.rooms.map((room) => {
            const area = Math.round(room.width * room.length);
            const lower = room.name.toLowerCase();
            const isBed = lower.includes('bed') || lower.includes('suite');
            const isBath = lower.includes('bath') || lower.includes('toilet') || lower.includes('washroom');
            const isGarden = lower.includes('garden') || lower.includes('lawn');
            const isParking = lower.includes('parking') || lower.includes('driveway');
            const isDuplex = lower.includes('drawing') || lower.includes('void') || lower.includes('lounge');
            const isBar = lower.includes('bar') || lower.includes('terrace');

            return (
              <div
                key={room.id}
                className={`p-3 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                  isBlueprint
                    ? 'bg-slate-900/60 border-sky-900/60 text-slate-200'
                    : 'bg-slate-50/80 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5 mb-1.5">
                  <span className="font-bold text-xs leading-snug">{room.name}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0 ${
                      isBed
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
                        : isBath
                        ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200'
                        : isGarden
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                        : isParking
                        ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                        : isDuplex
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                        : isBar
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {area} sq ft
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-sky-400">
                  <span>Dimensions: {formatFeetInches(room.width)} × {formatFeetInches(room.length)}</span>
                  <span>({room.width}&apos; × {room.length}&apos;)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
