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
