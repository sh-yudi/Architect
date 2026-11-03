'use client';

import React, { useState, useEffect } from 'react';
import { Room } from '@/types/plan';
import { formatFeetInches } from './RoomBox';

export interface SpaceModifierBlockProps {
  selectedRoom: Room | null;
  floorLevel: number | null;
  floorName?: string;
  plotWidth: number;
  plotLength: number;
  onUpdateSpace: (params: {
    prompt?: string;
    directChanges?: {
      name?: string;
      width?: number;
      length?: number;
    };
    syncAllFloors?: boolean;
  }) => Promise<void> | void;
  onClose: () => void;
  isLoading?: boolean;
}

export const SpaceModifierBlock: React.FC<SpaceModifierBlockProps> = ({
  selectedRoom,
  floorLevel,
  floorName,
  plotWidth,
  plotLength,
  onUpdateSpace,
  onClose,
  isLoading = false,
}) => {
  const [prompt, setPrompt] = useState('');
  const [roomName, setRoomName] = useState('');
  const [width, setWidth] = useState<number>(10);
  const [length, setLength] = useState<number>(10);
  const [syncAllFloors, setSyncAllFloors] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Sync state whenever selected room changes
  useEffect(() => {
    if (selectedRoom) {
      setRoomName(selectedRoom.name);
      setWidth(selectedRoom.width);
      setLength(selectedRoom.length);
      setPrompt('');
      setStatusMessage(null);

      const isVertical =
        selectedRoom.name.toLowerCase().includes('stair') ||
        selectedRoom.name.toLowerCase().includes('lift') ||
        selectedRoom.id.includes('stair') ||
        selectedRoom.id.includes('lift') ||
        selectedRoom.id.includes('ots');
      setSyncAllFloors(isVertical);
    }
  }, [selectedRoom]);

  if (!selectedRoom) {
    return (
      <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4 sm:p-5 text-center shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-left">
            <span className="text-xl">💡</span>
            <div>
              <p className="font-bold text-sky-900">Click Any Room or Space to Inspect &amp; Modify</p>
              <p className="text-slate-600 mt-0.5">
                Click on the Staircase, Bedroom, Kitchen, or Balcony on the plan to open the AI Space Modifier and update only that space.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-semibold px-2.5 py-1 bg-white border border-sky-300 rounded-lg text-sky-700 shadow-2xs whitespace-nowrap">
            Interactive 2D Plan
          </span>
        </div>
      </div>
    );
  }

  const isStairs = selectedRoom.name.toLowerCase().includes('stair') || selectedRoom.id.includes('stair');
  const isLift = selectedRoom.name.toLowerCase().includes('lift') || selectedRoom.id.includes('lift');
  const isBath = selectedRoom.name.toLowerCase().includes('bath') || selectedRoom.name.toLowerCase().includes('toilet');
  const isBed = selectedRoom.name.toLowerCase().includes('bed') || selectedRoom.name.toLowerCase().includes('suite');
  const isGarden = selectedRoom.name.toLowerCase().includes('garden') || selectedRoom.name.toLowerCase().includes('ots');

  const getRoomIcon = () => {
    if (isStairs) return '🪜';
    if (isLift) return '🛗';
    if (isBath) return '🚿';
    if (isBed) return '🛏️';
    if (isGarden) return '🌿';
    if (selectedRoom.name.toLowerCase().includes('kitchen')) return '🍳';
    if (selectedRoom.name.toLowerCase().includes('balcony')) return '🏞️';
    if (selectedRoom.name.toLowerCase().includes('bar')) return '🍸';
    if (selectedRoom.name.toLowerCase().includes('pooja')) return '🪔';
    return '📐';
  };

  const quickChips = isStairs
    ? [
        'Make dog-legged stairs with 8ft width',
        'Add cantilever floating stairs',
        'Contemporary spiral stairs',
        'Expand width +2ft',
      ]
    : isBed
    ? [
        'Add walk-in wardrobe',
        'Expand width to 12ft',
        'Add French balcony',
        'Convert to study / home office',
      ]
    : isBath
    ? [
        'Luxury glass shower cubicle',
        'Expand bathroom to 6x8',
        'Add soaking tub & vanity',
        'Convert to powder room',
      ]
    : [
        'Convert to pooja mandir',
        'Expand width +2ft',
        'Add sit-out balcony',
        'Reconfigure layout',
      ];

  const handleApplyAI = async (customPrompt?: string) => {
    const textToSubmit = customPrompt || prompt;
    if (!textToSubmit.trim() && !hasDimensionChanges()) return;

    setStatusMessage('Applying AI architectural updates...');
    try {
      await onUpdateSpace({
        prompt: textToSubmit.trim() || undefined,
        directChanges: {
          name: roomName,
          width,
          length,
        },
        syncAllFloors: (isStairs || isLift) && syncAllFloors,
      });
      setStatusMessage('Space updated successfully! Plan refreshed.');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (e: any) {
      setStatusMessage(e?.message || 'Failed to update space');
    }
  };

  const handleApplyDirect = async () => {
    setStatusMessage('Saving dimensional changes...');
    try {
      await onUpdateSpace({
        directChanges: {
          name: roomName,
          width,
          length,
        },
        syncAllFloors: (isStairs || isLift) && syncAllFloors,
      });
      setStatusMessage('Direct dimensions applied successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (e: any) {
      setStatusMessage(e?.message || 'Failed to apply changes');
    }
  };

  const hasDimensionChanges = () => {
    return (
      roomName !== selectedRoom.name ||
      width !== selectedRoom.width ||
      length !== selectedRoom.length
    );
  };

  return (
    <div className="bg-white border-2 border-sky-500 rounded-2xl p-5 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl p-2 bg-sky-50 border border-sky-200 rounded-xl">{getRoomIcon()}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
                AI Space Modifier &amp; Inspector
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-full text-slate-600">
                {floorName || `Level ${floorLevel ?? 0}`}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-sky-100 text-sky-800 rounded">
                #{selectedRoom.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Modifying <span className="font-semibold text-slate-800">{selectedRoom.name}</span>. Changes will update only this space.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-xs font-bold text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition"
          aria-label="Close inspector"
        >
          ✕ Close
        </button>
      </div>

      {/* Specifications & Direct Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
        {/* Room Title Editor */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 flex items-center gap-1">
            <span>🏷️ Space Name</span>
          </label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-sky-500"
          />
        </div>

        {/* Width Steppers */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-700">↔️ Width</span>
            <span className="font-mono font-bold text-sky-700">{formatFeetInches(width)} ({width}ft)</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setWidth((w) => Math.max(3, Math.round((w - 1) * 2) / 2))}
              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-xs font-bold transition"
            >
              -1&apos;
            </button>
            <button
              type="button"
              onClick={() => setWidth((w) => Math.max(3, Math.round((w - 0.5) * 2) / 2))}
              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-xs font-bold transition"
            >
              -0.5&apos;
            </button>
            <input
              type="number"
              min={3}
              max={plotWidth}
              step={0.5}
              value={width}
              onChange={(e) => setWidth(parseFloat(e.target.value) || width)}
              className="w-16 px-2 py-1 text-center bg-white border border-slate-300 rounded text-xs font-mono font-bold"
            />
            <button
              type="button"
              onClick={() => setWidth((w) => Math.min(plotWidth, Math.round((w + 0.5) * 2) / 2))}
              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-xs font-bold transition"
            >
              +0.5&apos;
            </button>
            <button
              type="button"
              onClick={() => setWidth((w) => Math.min(plotWidth, Math.round((w + 1) * 2) / 2))}
              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-xs font-bold transition"
            >
              +1&apos;
            </button>
          </div>
        </div>

        {/* Length Steppers */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-700">↕️ Length (Depth)</span>
            <span className="font-mono font-bold text-sky-700">{formatFeetInches(length)} ({length}ft)</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setLength((l) => Math.max(3, Math.round((l - 1) * 2) / 2))}
              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-xs font-bold transition"
            >
              -1&apos;
            </button>
            <button
              type="button"
              onClick={() => setLength((l) => Math.max(3, Math.round((l - 0.5) * 2) / 2))}
              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-xs font-bold transition"
            >
              -0.5&apos;
            </button>
            <input
              type="number"
              min={3}
              max={plotLength}
              step={0.5}
              value={length}
              onChange={(e) => setLength(parseFloat(e.target.value) || length)}
              className="w-16 px-2 py-1 text-center bg-white border border-slate-300 rounded text-xs font-mono font-bold"
            />
            <button
              type="button"
              onClick={() => setLength((l) => Math.min(plotLength, Math.round((l + 0.5) * 2) / 2))}
              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-xs font-bold transition"
            >
              +0.5&apos;
            </button>
            <button
              type="button"
              onClick={() => setLength((l) => Math.min(plotLength, Math.round((l + 1) * 2) / 2))}
              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-xs font-bold transition"
            >
              +1&apos;
            </button>
          </div>
        </div>
      </div>

      {/* Carpet Area Badge */}
      <div className="flex flex-wrap items-center justify-between text-xs px-1 text-slate-600">
        <div className="flex items-center gap-3">
          <span>
            Calculated Area: <strong className="text-slate-900 font-mono">{Math.round(width * length * 10) / 10} sq ft</strong>
          </span>
          <span>&bull;</span>
          <span>
            Doors: <strong className="text-slate-900">{selectedRoom.doors?.length || 0}</strong>
          </span>
          <span>&bull;</span>
          <span>
            Windows: <strong className="text-slate-900">{selectedRoom.windows?.length || 0}</strong>
          </span>
        </div>

        {/* Vertical Synchronization Checkbox for Stairs & Lifts */}
        {(isStairs || isLift) && (
          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
            <input
              type="checkbox"
              checked={syncAllFloors}
              onChange={(e) => setSyncAllFloors(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500"
            />
            <span>Sync this vertical core across all floors</span>
          </label>
        )}
      </div>

      {/* AI Prompt Input (The User's Feature!) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span>✨ AI Prompt for this Space</span>
            <span className="text-[10px] font-normal text-slate-500">(Only updates this specific room)</span>
          </span>
          <span className="text-[10px] text-sky-600 font-mono">Gemini 2.5 Flash Powered</span>
        </label>
        <div className="relative">
          <textarea
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              isStairs
                ? 'e.g. Make this a dog-legged staircase with 8ft width, add landing at 4.5ft, and SS railing'
                : isBed
                ? 'e.g. Make this 12ft wide master bedroom with walk-in wardrobe and attached balcony'
                : 'e.g. Expand this space, change orientation, add pooja room or attached bath'
            }
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-sky-500 focus:ring-1 focus:ring-sky-500 transition shadow-inner"
          />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] text-slate-400 font-medium mr-1">Quick Suggestions:</span>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPrompt(chip);
                handleApplyAI(chip);
              }}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 border border-slate-200 rounded-full text-slate-600 transition disabled:opacity-50"
            >
              + {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons & Feedback */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
        <div className="text-xs">
          {statusMessage && (
            <span className="font-semibold text-sky-700 flex items-center gap-1.5 animate-pulse">
              <span>⚡</span> {statusMessage}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasDimensionChanges() && (
            <button
              type="button"
              onClick={handleApplyDirect}
              disabled={isLoading}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition shadow-xs disabled:opacity-50"
            >
              Save Direct Dimensions
            </button>
          )}

          <button
            type="button"
            onClick={() => handleApplyAI()}
            disabled={isLoading || (!prompt.trim() && !hasDimensionChanges())}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                <span>Updating Space...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>Update Space via AI</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
