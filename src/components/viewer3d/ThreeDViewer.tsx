'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { HousePlan } from '@/types/plan';

const BuildingCanvas = dynamic(
  () => import('./BuildingCanvas').then((m) => m.BuildingCanvas),
  {
    ssr: false,
    loading: () => <div className="text-xs text-slate-400">Loading 3D WebGL Canvas...</div>,
  }
);

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

      <div className="relative h-[380px] w-full flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 p-6 overflow-hidden">
        {/* Interactive 3D WebGL Canvas */}
        <BuildingCanvas plan={plan} wireframe={wireframe} />

        {/* Footer Badges and Facade Overlay */}
        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center pointer-events-none">
          <div className="flex gap-2">
            <span className="text-[11px] font-mono bg-slate-800/90 text-sky-300 px-2.5 py-1 rounded border border-slate-700 pointer-events-auto">
              {plan.plot.width}&apos; × {plan.plot.length}&apos; Footprint
            </span>
            <span className="text-[11px] font-mono bg-slate-800/90 text-emerald-300 px-2.5 py-1 rounded border border-slate-700 pointer-events-auto">
              {plan.structural.footingType}
            </span>
          </div>
          {plan.facade.features.length > 0 && (
            <span className="text-[11px] bg-slate-800/90 text-slate-300 px-2.5 py-1 rounded border border-slate-700 pointer-events-auto">
              {plan.facade.features.join(', ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
