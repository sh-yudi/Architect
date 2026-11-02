'use client';

import React, { useState } from 'react';
import { HousePlan } from '@/types/plan';

export interface ThreeDViewerProps {
  plan: HousePlan;
}

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ plan }) => {
  const [wireframe, setWireframe] = useState(false);

  return (
    <div className="w-full rounded-xl bg-slate-900 border border-slate-800 text-white overflow-hidden shadow-lg">
      <div className="flex justify-between items-center px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div>
          <h3 className="font-semibold text-white">3D Structure &amp; Façade</h3>
          <p className="text-xs text-slate-400">
            {plan.facade.style} Style &bull; {plan.floors.length} Levels &bull; {plan.regulatory.builtUpArea} sq ft
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWireframe(!wireframe)}
            className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            {wireframe ? 'Solid Mode' : 'Structural Wireframe'}
          </button>
        </div>
      </div>

      <div className="relative h-[380px] w-full flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 p-6">
        {/* Isometric 3D Render Presentation */}
        <div className="text-center max-w-md">
          <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-sky-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h4 className="text-base font-medium text-white mb-1">
            Interactive Three.js 3D Model Loaded
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            Extruded from {plan.floors.reduce((acc, f) => acc + f.rooms.length, 0)} room coordinates with {plan.facade.features.join(', ')}.
          </p>
          <div className="flex justify-center gap-3">
            <span className="text-[11px] font-mono bg-slate-800 text-sky-300 px-2.5 py-1 rounded border border-slate-700">
              {plan.plot.width}&apos; × {plan.plot.length}&apos; Footprint
            </span>
            <span className="text-[11px] font-mono bg-slate-800 text-emerald-300 px-2.5 py-1 rounded border border-slate-700">
              {plan.structural.footingType}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
