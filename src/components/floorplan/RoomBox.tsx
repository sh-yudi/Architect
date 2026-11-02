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
