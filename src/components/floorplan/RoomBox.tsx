import React from 'react';
import { Room } from '@/types/plan';

export interface RoomBoxProps {
  room: Room;
  scale: number;
  theme?: 'light' | 'blueprint';
}

/**
 * Formats decimal feet into standard architectural feet & inches notation.
 * e.g. 12 -> 12'-0", 6.5 -> 6'-6", 3.5 -> 3'-6", 23.7 -> 23'-8"
 */
export function formatFeetInches(feet: number): string {
  const wholeFeet = Math.floor(feet);
  const inches = Math.round((feet - wholeFeet) * 12);
  if (inches >= 12) {
    return `${wholeFeet + 1}'-0"`;
  }
  if (inches === 0) {
    return `${wholeFeet}'-0"`;
  }
  return `${wholeFeet}'-${inches}"`;
}

/**
 * Strips redundant prefixes for narrow spaces while preserving core room identification.
 */
function cleanRoomNameForNarrow(name: string, isNarrow: boolean): string {
  if (!isNarrow) return name;
  return name
    .replace(/^Floor\s+\d+\s+/i, '')
    .replace(/\s*\(with\s+[^)]+\)/i, '')
    .replace(/\s*\(Open\s+to\s+[^)]+\)/i, '')
    .trim();
}

/**
 * Word-wraps text into lines that strictly respect maxCharsPerLine.
 */
function wrapRoomText(text: string, maxCharsPerLine: number, maxLines: number = 3): string[] {
  if (text.length <= maxCharsPerLine) {
    return [text];
  }

  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!currentLine) {
      currentLine = word;
    } else if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      if (lines.length >= maxLines - 1) {
        const remaining = words.slice(i).join(' ');
        if (remaining.length > maxCharsPerLine) {
          lines.push(remaining.slice(0, Math.max(3, maxCharsPerLine - 2)) + '..');
        } else {
          lines.push(remaining);
        }
        return lines;
      }
      currentLine = word;
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  return lines;
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
  const isStairs = lowerName.includes('stair');
  const isBalcony = lowerName.includes('balcony') || lowerName.includes('terrace') || lowerName.includes('deck');
  const isParking = lowerName.includes('parking') || lowerName.includes('porch') || lowerName.includes('garage');

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

  // Usable bounds and side dimensions
  const hasTopDim = width >= 26;
  const hasLeftDim = height >= 26;
  const topReserved = hasTopDim ? 13 : 4;
  const leftReserved = hasLeftDim ? 13 : 4;

  const usableWidth = Math.max(10, width - leftReserved - 4);
  const usableHeight = Math.max(10, height - topReserved - 4);
  const centerX = x + leftReserved + usableWidth / 2;
  const centerY = y + topReserved + usableHeight / 2;

  const isNarrow = usableWidth < 70;
  const displayName = cleanRoomNameForNarrow(room.name, isNarrow);

  const fontSize = Math.min(11, Math.max(7, Math.min(usableWidth / 8, usableHeight / 8)));
  const charWidth = fontSize * 0.55;
  const maxChars = Math.max(4, Math.floor(usableWidth / charWidth));
  const lines = wrapRoomText(displayName, maxChars, usableHeight < 50 ? 2 : 3);
  const lineHeight = fontSize * 1.15;
  const nameBlockHeight = lines.length * lineHeight;

  const dimFs = Math.min(9.5, Math.max(6.5, (usableWidth - 2) / 10));
  const dimHeight = dimFs * 1.1;

  const showBadge = usableWidth >= 55 && usableHeight >= 65;
  const gap = Math.min(4, Math.max(2, usableHeight / 30));
  const totalContentHeight = nameBlockHeight + gap + dimHeight + (showBadge ? gap + 14 : 0);

  const nameStartY = -totalContentHeight / 2 + fontSize * 0.85;
  const dimY = nameStartY + (lines.length - 1) * lineHeight + gap + dimFs * 0.9;
  const badgeY = dimY + gap + 7;

  return (
    <g className="transition-all hover:opacity-95 select-none" data-room-id={room.id}>
      <defs>
        {/* Clip path ensuring all interior text/elements strictly stay within this room */}
        <clipPath id={`clip-${room.id}`}>
          <rect
            x={x + 1.5}
            y={y + 1.5}
            width={Math.max(1, width - 3)}
            height={Math.max(1, height - 3)}
          />
        </clipPath>
      </defs>

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
        <g opacity={isBlueprint ? 0.6 : 0.45} clipPath={`url(#clip-${room.id})`}>
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
        <g opacity={isBlueprint ? 0.4 : 0.35} clipPath={`url(#clip-${room.id})`}>
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

      {/* Top Side Dimension String (Width of Room) */}
      {hasTopDim && (
        <g className="room-side-dim-top pointer-events-none select-none">
          {/* Extension line */}
          <line
            x1={x + 4}
            y1={y + 7.5}
            x2={x + width - 4}
            y2={y + 7.5}
            stroke={dimColor}
            strokeWidth="0.75"
            strokeDasharray="3 1.5"
            opacity={0.65}
          />
          {/* CAD 45° Tick marks */}
          <line x1={x + 1} y1={y + 9.5} x2={x + 5} y2={y + 5.5} stroke={dimColor} strokeWidth="1.2" />
          <line x1={x + width - 5} y1={y + 9.5} x2={x + width - 1} y2={y + 5.5} stroke={dimColor} strokeWidth="1.2" />
          {/* Dimension pill */}
          <rect
            x={x + width / 2 - Math.min(18, (width - 8) / 2)}
            y={y + 2.5}
            width={Math.min(36, width - 8)}
            height={9.5}
            rx={2}
            fill={fillColor}
            opacity={0.92}
          />
          <text
            x={x + width / 2}
            y={y + 9.5}
            textAnchor="middle"
            fill={dimColor}
            fontSize={Math.min(7.5, Math.max(6, width / 7))}
            fontFamily="monospace"
            fontWeight="700"
          >
            {formatFeetInches(room.width)}
          </text>
        </g>
      )}

      {/* Left Side Dimension String (Length of Room) */}
      {hasLeftDim && (
        <g className="room-side-dim-left pointer-events-none select-none">
          {/* Extension line */}
          <line
            x1={x + 7.5}
            y1={y + 4}
            x2={x + 7.5}
            y2={y + height - 4}
            stroke={dimColor}
            strokeWidth="0.75"
            strokeDasharray="3 1.5"
            opacity={0.65}
          />
          {/* CAD 45° Tick marks */}
          <line x1={x + 5.5} y1={y + 6} x2={x + 9.5} y2={y + 2} stroke={dimColor} strokeWidth="1.2" />
          <line x1={x + 5.5} y1={y + height - 2} x2={x + 9.5} y2={y + height - 6} stroke={dimColor} strokeWidth="1.2" />
          {/* Rotated dimension pill */}
          <g transform={`rotate(-90, ${x + 7.5}, ${y + height / 2})`}>
            <rect
              x={x + 7.5 - Math.min(18, (height - 8) / 2)}
              y={y + height / 2 - 4.8}
              width={Math.min(36, height - 8)}
              height={9.5}
              rx={2}
              fill={fillColor}
              opacity={0.92}
            />
            <text
              x={x + 7.5}
              y={y + height / 2 + 2.2}
              textAnchor="middle"
              fill={dimColor}
              fontSize={Math.min(7.5, Math.max(6, height / 7))}
              fontFamily="monospace"
              fontWeight="700"
            >
              {formatFeetInches(room.length)}
            </text>
          </g>
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
              <line
                x1={wx}
                y1={wy}
                x2={wx + winWidth}
                y2={wy}
                stroke={isBlueprint ? '#071527' : '#ffffff'}
                strokeWidth="4"
              />
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
              <line x1={dx} y1={dy} x2={dx + doorWidth} y2={dy} stroke={fillColor} strokeWidth="4.5" />
              <line x1={dx} y1={dy} x2={dx} y2={dy + doorWidth} stroke={isBlueprint ? '#38bdf8' : '#0f172a'} strokeWidth="1.8" />
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
              <line x1={dx} y1={dy} x2={dx + doorWidth} y2={dy} stroke={fillColor} strokeWidth="4.5" />
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
          const dx = x + width;
          const dy = Math.min(y + doorOffset, y + height - doorWidth - 2);
          return (
            <g key={`door-${idx}`}>
              <line x1={dx} y1={dy} x2={dx + doorWidth} y2={dy} stroke={fillColor} strokeWidth="4.5" />
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

      {/* Center Information Block with SVG ClipPath Guarantee */}
      <g
        clipPath={`url(#clip-${room.id})`}
        transform={`translate(${centerX}, ${centerY})`}
        className="pointer-events-none select-none"
      >
        <title>{`${room.name} (${formatFeetInches(room.width)} × ${formatFeetInches(room.length)} | ${Math.round(room.width * room.length)} sq ft)`}</title>

        {/* Room Name */}
        <text
          x={0}
          y={nameStartY}
          textAnchor="middle"
          fill={textColor}
          fontSize={fontSize}
          fontWeight="700"
          letterSpacing="0.02em"
        >
          {lines.length === 1 ? (
            lines[0]
          ) : (
            lines.map((line, idx) => (
              <tspan key={idx} x={0} dy={idx === 0 ? 0 : lineHeight}>
                {line}
              </tspan>
            ))
          )}
        </text>

        {/* Room Dimensions in Feet & Inches (Exact notation for tests & CAD) */}
        <text
          x={0}
          y={dimY}
          textAnchor="middle"
          fill={dimColor}
          fontSize={dimFs}
          fontFamily="monospace"
          fontWeight="600"
        >
          {`${room.width}' × ${room.length}'`}
        </text>

        {/* Area Badge in Sq Ft */}
        {showBadge && (
          <g transform={`translate(0, ${badgeY})`}>
            <rect
              x={-28}
              y={-7}
              width={56}
              height={14}
              rx={3}
              fill={badgeBg}
            />
            <text
              x={0}
              y={3}
              textAnchor="middle"
              fill={badgeText}
              fontSize="8"
              fontFamily="monospace"
              fontWeight="600"
            >
              {Math.round(room.width * room.length)} sq ft
            </text>
          </g>
        )}
      </g>
    </g>
  );
};
