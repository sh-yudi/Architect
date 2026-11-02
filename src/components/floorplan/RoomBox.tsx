import React from 'react';
import { Room } from '@/types/plan';

interface RoomBoxProps {
  room: Room;
  scale: number;
  theme?: 'light' | 'blueprint';
}

export const RoomBox: React.FC<RoomBoxProps> = ({ room, scale, theme = 'light' }) => {
  const x = room.x * scale;
  const y = room.y * scale;
  const width = room.width * scale;
  const height = room.length * scale;
  const isBlueprint = theme === 'blueprint';

  // Room categorization for architectural color fills and accents
  const lowerName = room.name.toLowerCase();
  let fillColor = isBlueprint ? 'rgba(30, 58, 138, 0.25)' : '#ffffff';
  let accentColor = isBlueprint ? '#38bdf8' : '#334155';
  let badgeBg = isBlueprint ? 'rgba(56, 189, 248, 0.15)' : '#f1f5f9';
  let badgeText = isBlueprint ? '#38bdf8' : '#475569';
  let isStairs = lowerName.includes('stair');
  let isBalcony = lowerName.includes('balcony') || lowerName.includes('terrace') || lowerName.includes('deck');
  let isParking = lowerName.includes('parking') || lowerName.includes('porch') || lowerName.includes('garage');

  if (lowerName.includes('bed') || lowerName.includes('master')) {
    fillColor = isBlueprint ? 'rgba(59, 130, 246, 0.18)' : '#f8fafc';
    accentColor = isBlueprint ? '#60a5fa' : '#2563eb';
  } else if (lowerName.includes('kitchen') || lowerName.includes('pantry')) {
    fillColor = isBlueprint ? 'rgba(245, 158, 11, 0.18)' : '#fffbeb';
    accentColor = isBlueprint ? '#fbbf24' : '#d97706';
    badgeBg = isBlueprint ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7';
    badgeText = isBlueprint ? '#fbbf24' : '#b45309';
  } else if (lowerName.includes('bath') || lowerName.includes('toilet') || lowerName.includes('powder') || lowerName.includes('wc')) {
    fillColor = isBlueprint ? 'rgba(6, 182, 212, 0.18)' : '#f0f9ff';
    accentColor = isBlueprint ? '#22d3ee' : '#0891b2';
    badgeBg = isBlueprint ? 'rgba(6, 182, 212, 0.2)' : '#e0f2fe';
    badgeText = isBlueprint ? '#22d3ee' : '#0e7490';
  } else if (lowerName.includes('pooja') || lowerName.includes('mandir')) {
    fillColor = isBlueprint ? 'rgba(234, 179, 8, 0.22)' : '#fefce8';
    accentColor = isBlueprint ? '#fde047' : '#ca8a04';
    badgeBg = isBlueprint ? 'rgba(234, 179, 8, 0.25)' : '#fef9c3';
    badgeText = isBlueprint ? '#fde047' : '#a16207';
  } else if (lowerName.includes('living') || lowerName.includes('drawing') || lowerName.includes('hall') || lowerName.includes('foyer') || lowerName.includes('dining')) {
    fillColor = isBlueprint ? 'rgba(16, 185, 129, 0.16)' : '#f0fdf4';
    accentColor = isBlueprint ? '#34d399' : '#059669';
    badgeBg = isBlueprint ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7';
    badgeText = isBlueprint ? '#34d399' : '#15803d';
  } else if (isBalcony) {
    fillColor = isBlueprint ? 'rgba(168, 85, 247, 0.15)' : '#faf5ff';
    accentColor = isBlueprint ? '#c084fc' : '#9333ea';
  } else if (isParking) {
    fillColor = isBlueprint ? 'rgba(100, 116, 139, 0.2)' : '#f1f5f9';
    accentColor = isBlueprint ? '#94a3b8' : '#475569';
  }

  const wallStroke = isBlueprint ? '#7dd3fc' : '#0f172a';
  const textColor = isBlueprint ? '#f0f9ff' : '#0f172a';
  const dimColor = isBlueprint ? '#93c5fd' : '#475569';

  return (
    <g className="transition-all hover:opacity-95 select-none" data-room-id={room.id}>
      {/* Outer Wall Boundary (Thick CAD Wall Line) */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fillColor}
        stroke={wallStroke}
        strokeWidth={isBalcony ? 2 : 3.5}
        strokeDasharray={isBalcony ? '5 3' : 'none'}
        className="transition-colors"
      />

      {/* Interior wall offset contour line (double-wall CAD effect) */}
      {!isBalcony && width > 24 && height > 24 && (
        <rect
          x={x + 3}
          y={y + 3}
          width={width - 6}
          height={height - 6}
          fill="none"
          stroke={isBlueprint ? 'rgba(125, 211, 252, 0.35)' : 'rgba(15, 23, 42, 0.18)'}
          strokeWidth="0.8"
        />
      )}

      {/* Staircase Treads Pattern */}
      {isStairs && (
        <g opacity={isBlueprint ? 0.6 : 0.45}>
          {Array.from({ length: Math.max(3, Math.floor(height / 10)) }).map((_, i) => (
            <line
              key={`tread-${i}`}
              x1={x + 4}
              y1={y + (i + 1) * (height / (Math.floor(height / 10) + 1))}
              x2={x + width - 4}
              y2={y + (i + 1) * (height / (Math.floor(height / 10) + 1))}
              stroke={wallStroke}
              strokeWidth="1"
            />
          ))}
          <path
            d={`M ${x + width / 2} ${y + height - 10} L ${x + width / 2} ${y + 12} L ${x + width / 2 - 4} ${y + 18} M ${x + width / 2} ${y + 12} L ${x + width / 2 + 4} ${y + 18}`}
            stroke={accentColor}
            strokeWidth="1.5"
            fill="none"
          />
        </g>
      )}

      {/* Parking Chevron / Tile Mark */}
      {isParking && (
        <g opacity={isBlueprint ? 0.4 : 0.35}>
          <rect
            x={x + width * 0.2}
            y={y + height * 0.2}
            width={width * 0.6}
            height={height * 0.6}
            fill="none"
            stroke={accentColor}
            strokeWidth="1.2"
            strokeDasharray="4 2"
            rx="4"
          />
        </g>
      )}

      {/* Architectural Windows */}
      {room.windows?.map((win, idx) => {
        const winOffset = (win.offset || 2) * scale;
        const winWidth = Math.max(win.width * scale, 16);

        if (win.wall === 'top' || win.wall === 'bottom') {
          const wy = win.wall === 'top' ? y : y + height;
          const wx = Math.min(x + winOffset, x + width - winWidth - 2);
          return (
            <g key={`win-${idx}`}>
              {/* Wall opening cutout mask */}
              <line
                x1={wx}
                y1={wy}
                x2={wx + winWidth}
                y2={wy}
                stroke={isBlueprint ? '#071527' : '#ffffff'}
                strokeWidth="4"
              />
              {/* Double glass pane lines */}
              <line
                x1={wx}
                y1={wy - 1.5}
                x2={wx + winWidth}
                y2={wy - 1.5}
                stroke={isBlueprint ? '#38bdf8' : '#0284c7'}
                strokeWidth="1.5"
              />
              <line
                x1={wx}
                y1={wy + 1.5}
                x2={wx + winWidth}
                y2={wy + 1.5}
                stroke={isBlueprint ? '#38bdf8' : '#0284c7'}
                strokeWidth="1.5"
              />
              {/* Sill end ticks */}
              <line x1={wx} y1={wy - 3} x2={wx} y2={wy + 3} stroke={isBlueprint ? '#7dd3fc' : '#334155'} strokeWidth="1" />
              <line x1={wx + winWidth} y1={wy - 3} x2={wx + winWidth} y2={wy + 3} stroke={isBlueprint ? '#7dd3fc' : '#334155'} strokeWidth="1" />
            </g>
          );
        } else {
          const wx = win.wall === 'left' ? x : x + width;
          const wy = Math.min(y + winOffset, y + height - winWidth - 2);
          return (
            <g key={`win-${idx}`}>
              <line
                x1={wx}
                y1={wy}
                x2={wx}
                y2={wy + winWidth}
                stroke={isBlueprint ? '#071527' : '#ffffff'}
                strokeWidth="4"
              />
              <line
                x1={wx - 1.5}
                y1={wy}
                x2={wx - 1.5}
                y2={wy + winWidth}
                stroke={isBlueprint ? '#38bdf8' : '#0284c7'}
                strokeWidth="1.5"
              />
              <line
                x1={wx + 1.5}
                y1={wy}
                x2={wx + 1.5}
                y2={wy + winWidth}
                stroke={isBlueprint ? '#38bdf8' : '#0284c7'}
                strokeWidth="1.5"
              />
              <line x1={wx - 3} y1={wy} x2={wx + 3} y2={wy} stroke={isBlueprint ? '#7dd3fc' : '#334155'} strokeWidth="1" />
              <line x1={wx - 3} y1={wy + winWidth} x2={wx + 3} y2={wy + winWidth} stroke={isBlueprint ? '#7dd3fc' : '#334155'} strokeWidth="1" />
            </g>
          );
        }
      })}

      {/* Architectural Door Openings with 90° Swing Arcs */}
      {room.doors?.map((door, idx) => {
        const doorOffset = (door.offset || 1.5) * scale;
        const doorWidth = Math.max((door.width || 3) * scale, 14);

        if (door.wall === 'top') {
          const dx = Math.min(x + doorOffset, x + width - doorWidth - 2);
          const dy = y;
          return (
            <g key={`door-${idx}`}>
              {/* Clear wall opening */}
              <line x1={dx} y1={dy} x2={dx + doorWidth} y2={dy} stroke={fillColor} strokeWidth="4.5" />
              {/* Open door leaf line */}
              <line x1={dx} y1={dy} x2={dx} y2={dy + doorWidth} stroke={isBlueprint ? '#38bdf8' : '#0f172a'} strokeWidth="1.8" />
              {/* 90-degree swing arc */}
              <path
                d={`M ${dx + doorWidth} ${dy} A ${doorWidth} ${doorWidth} 0 0 1 ${dx} ${dy + doorWidth}`}
                fill="none"
                stroke={isBlueprint ? '#7dd3fc' : '#94a3b8'}
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            </g>
          );
        } else if (door.wall === 'bottom') {
          const dx = Math.min(x + doorOffset, x + width - doorWidth - 2);
          const dy = y + height;
          return (
            <g key={`door-${idx}`}>
              <line x1={dx} y1={dy} x2={dx + doorWidth} y2={dy} stroke={fillColor} strokeWidth="4.5" />
              <line x1={dx} y1={dy} x2={dx} y2={dy - doorWidth} stroke={isBlueprint ? '#38bdf8' : '#0f172a'} strokeWidth="1.8" />
              <path
                d={`M ${dx + doorWidth} ${dy} A ${doorWidth} ${doorWidth} 0 0 0 ${dx} ${dy - doorWidth}`}
                fill="none"
                stroke={isBlueprint ? '#7dd3fc' : '#94a3b8'}
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            </g>
          );
        } else if (door.wall === 'left') {
          const dx = x;
          const dy = Math.min(y + doorOffset, y + height - doorWidth - 2);
          return (
            <g key={`door-${idx}`}>
              <line x1={dx} y1={dy} x2={dx} y2={dy + doorWidth} stroke={fillColor} strokeWidth="4.5" />
              <line x1={dx} y1={dy} x2={dx + doorWidth} y2={dy} stroke={isBlueprint ? '#38bdf8' : '#0f172a'} strokeWidth="1.8" />
              <path
                d={`M ${dx} ${dy + doorWidth} A ${doorWidth} ${doorWidth} 0 0 0 ${dx + doorWidth} ${dy}`}
                fill="none"
                stroke={isBlueprint ? '#7dd3fc' : '#94a3b8'}
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            </g>
          );
        } else {
          // right wall
          const dx = x + width;
          const dy = Math.min(y + doorOffset, y + height - doorWidth - 2);
          return (
            <g key={`door-${idx}`}>
              <line x1={dx} y1={dy} x2={dx} y2={dy + doorWidth} stroke={fillColor} strokeWidth="4.5" />
              <line x1={dx} y1={dy} x2={dx - doorWidth} y2={dy} stroke={isBlueprint ? '#38bdf8' : '#0f172a'} strokeWidth="1.8" />
              <path
                d={`M ${dx} ${dy + doorWidth} A ${doorWidth} ${doorWidth} 0 0 1 ${dx - doorWidth} ${dy}`}
                fill="none"
                stroke={isBlueprint ? '#7dd3fc' : '#94a3b8'}
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            </g>
          );
        }
      })}

      {/* Center Information Block */}
      <g transform={`translate(${x + width / 2}, ${y + height / 2})`} className="pointer-events-none select-none">
        {/* Room Name */}
        <text
          x={0}
          y={-10}
          textAnchor="middle"
          fill={textColor}
          fontSize={Math.max(10, Math.min(13, width / 7))}
          fontWeight="700"
          letterSpacing="0.02em"
        >
          {room.name}
        </text>

        {/* Room Dimensions in Feet & Inches */}
        <text
          x={0}
          y={7}
          textAnchor="middle"
          fill={dimColor}
          fontSize={Math.max(9, Math.min(11, width / 8))}
          fontFamily="monospace"
          fontWeight="500"
        >
          {`${room.width}' × ${room.length}'`}
        </text>

        {/* Area Badge in Sq Ft */}
        {width > 45 && height > 40 && (
          <g transform="translate(0, 22)">
            <rect
              x={-28}
              y={-8}
              width={56}
              height={14}
              rx={3}
              fill={badgeBg}
            />
            <text
              x={0}
              y={2}
              textAnchor="middle"
              fill={badgeText}
              fontSize="8"
              fontFamily="monospace"
              fontWeight="600"
            >
              {room.width * room.length} sq ft
            </text>
          </g>
        )}
      </g>
    </g>
  );
};
