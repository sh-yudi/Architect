'use client';

import React, { useState } from 'react';
import { HousePlan } from '@/types/plan';

interface DoorWindowScheduleSheetProps {
  plan: HousePlan;
}

export const DoorWindowScheduleSheet: React.FC<DoorWindowScheduleSheetProps> = ({ plan }) => {
  const [theme, setTheme] = useState<'blueprint' | 'paper'>('paper');
  const isBlueprint = theme === 'blueprint';

  const doorSchedule = [
    {
      mark: 'MD',
      desc: 'Main Entrance Double Door',
      width: "4'-0\"",
      height: "7'-0\"",
      sill: "0'-0\"",
      lintel: "7'-0\"",
      frame: 'CP Teak Wood Frame (5"×2.5")',
      shutter: '35mm Solid Teak Panel Shutter with Polish',
      fittings: 'Godrej 6-lever Brass Mortise Lock, SS Handle, 4x SS Hinges, Peephole',
      count: 1,
    },
    {
      mark: 'DR',
      desc: 'Living / Master Room Door',
      width: "3'-6\"",
      height: "7'-0\"",
      sill: "0'-0\"",
      lintel: "7'-0\"",
      frame: 'Hardwood / Mirzapur Stone Frame',
      shutter: '32mm Factory Pressed Flush Door with 1mm Laminate',
      fittings: 'Cylindrical Keyed Lockset, SS Tower Bolt, Rubber Door Stopper',
      count: 6,
    },
    {
      mark: 'DR1',
      desc: 'Standard Bedroom Door',
      width: "3'-0\"",
      height: "7'-0\"",
      sill: "0'-0\"",
      lintel: "7'-0\"",
      frame: 'Hardwood / UPVC Frame',
      shutter: '30mm Commercial Flush Door with Both Side Laminate',
      fittings: 'Cylindrical Keyless Lockset, 3x SS Butt Hinges',
      count: 12,
    },
    {
      mark: 'DB',
      desc: 'Toilet / Bathroom Door',
      width: "2'-6\"",
      height: "7'-0\"",
      sill: "0'-0\"",
      lintel: "7'-0\"",
      frame: 'Granite Stone / WPC Waterproof Frame',
      shutter: '30mm Solid PVC / FRP Waterproof Shutter',
      fittings: 'SS Bathroom Privacy Latch, 3x SS Hinges',
      count: 10,
    },
    {
      mark: 'SD',
      desc: 'Balcony & Terrace French Sliding Door',
      width: "5'-0\"",
      height: "7'-0\"",
      sill: "0'-0\"",
      lintel: "7'-0\"",
      frame: '3-Track Powder Coated Aluminum Section',
      shutter: 'Toughened 6mm Clear Glass Panels + SS Bug Mesh Track',
      fittings: 'Concealed Touch Latch Locks, Heavy Duty Nylon Rollers',
      count: 5,
    },
  ];

  const windowSchedule = [
    {
      mark: 'W',
      desc: 'Front Facade Panoramic Window',
      width: "6'-0\"",
      height: "5'-0\"",
      sill: "2'-6\"",
      lintel: "7'-6\"",
      type: '3-Track UPVC Sliding System',
      glazing: '5mm Clear Float Saint-Gobain Glass + Mosquito Mesh',
      count: 4,
    },
    {
      mark: 'W1',
      desc: 'Standard Bedroom Window',
      width: "5'-0\"",
      height: "5'-0\"",
      sill: "2'-6\"",
      lintel: "7'-6\"",
      type: '2-Track UPVC Sliding Window',
      glazing: '5mm Clear Float Glass with EPDM Gaskets',
      count: 8,
    },
    {
      mark: 'W4',
      desc: 'Kitchen Counter Window',
      width: "4'-0\"",
      height: "3'-6\"",
      sill: "3'-6\"",
      lintel: "7'-0\"",
      type: 'Openable / Sliding Aluminum Window',
      glazing: '4mm Clear Glazing with Provision for Exhaust Fan',
      count: 3,
    },
    {
      mark: 'V',
      desc: 'Toilet & Bathroom Ventilator',
      width: "2'-3\"",
      height: "1'-6\"",
      sill: "6'-0\"",
      lintel: "7'-6\"",
      type: 'Top-Hung / Louvered Aluminum Ventilator',
      glazing: '4mm Frosted Pinhead Glass with Exhaust Cut-out',
      count: 10,
    },
  ];

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl shadow-sm border transition-colors ${
        isBlueprint
          ? 'bg-slate-950 border-sky-900 text-sky-100'
          : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      {/* Sheet Header */}
      <div className="w-full flex flex-wrap justify-between items-center gap-3 mb-4 px-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded border border-amber-300 dark:border-amber-800">
              SHEET W-07
            </span>
            <h3 className="font-bold text-lg tracking-tight">Schedule of Doors &amp; Windows</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-sky-400 mt-0.5">
            Complete Architectural Joinery, Fenestration Dimensions &amp; Hardware Specifications
          </p>
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

      <div className="w-full space-y-6">
        {/* Door Schedule Table */}
        <div
          className={`p-4 rounded-xl border text-xs font-mono overflow-x-auto ${
            isBlueprint
              ? 'bg-slate-900/80 border-sky-900 text-slate-200'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="font-bold text-sm text-sky-600 dark:text-sky-400 mb-3 border-b border-inherit pb-2 flex items-center justify-between">
            <span>DOOR OPENING SCHEDULE (DR)</span>
            <span className="text-[11px] text-slate-500">34 Total Doors</span>
          </div>
          <table className="w-full text-left border-collapse text-[11px] min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-300 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-1.5">MARK</th>
                <th className="py-1.5">DESCRIPTION</th>
                <th className="py-1.5">SIZE (W×H)</th>
                <th className="py-1.5">SILL / LINTEL</th>
                <th className="py-1.5">FRAME &amp; SHUTTER</th>
                <th className="py-1.5">HARDWARE / FITTINGS</th>
                <th className="py-1.5 text-center">QTY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {doorSchedule.map((d) => (
                <tr key={d.mark}>
                  <td className="py-2 font-bold text-sky-600 dark:text-sky-400">{d.mark}</td>
                  <td className="font-semibold">{d.desc}</td>
                  <td>{d.width} × {d.height}</td>
                  <td>{d.sill} / {d.lintel}</td>
                  <td>{d.shutter}</td>
                  <td className="text-[10px] text-slate-600 dark:text-slate-400">{d.fittings}</td>
                  <td className="text-center font-bold">{d.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Window Schedule Table */}
        <div
          className={`p-4 rounded-xl border text-xs font-mono overflow-x-auto ${
            isBlueprint
              ? 'bg-slate-900/80 border-sky-900 text-slate-200'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="font-bold text-sm text-sky-600 dark:text-sky-400 mb-3 border-b border-inherit pb-2 flex items-center justify-between">
            <span>WINDOW &amp; VENTILATOR SCHEDULE (W &amp; V)</span>
            <span className="text-[11px] text-slate-500">25 Total Openings</span>
          </div>
          <table className="w-full text-left border-collapse text-[11px] min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-300 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-1.5">MARK</th>
                <th className="py-1.5">DESCRIPTION</th>
                <th className="py-1.5">SIZE (W×H)</th>
                <th className="py-1.5">SILL LEVEL</th>
                <th className="py-1.5">LINTEL LEVEL</th>
                <th className="py-1.5">SYSTEM / TYPE</th>
                <th className="py-1.5">GLAZING SPECIFICATION</th>
                <th className="py-1.5 text-center">QTY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {windowSchedule.map((w) => (
                <tr key={w.mark}>
                  <td className="py-2 font-bold text-sky-600 dark:text-sky-400">{w.mark}</td>
                  <td className="font-semibold">{w.desc}</td>
                  <td>{w.width} × {w.height}</td>
                  <td>{w.sill}</td>
                  <td>{w.lintel}</td>
                  <td>{w.type}</td>
                  <td className="text-[10px] text-slate-600 dark:text-slate-400">{w.glazing}</td>
                  <td className="text-center font-bold">{w.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Joinery Notes */}
        <div
          className={`p-4 rounded-xl border text-xs font-mono leading-relaxed ${
            isBlueprint
              ? 'bg-slate-900/80 border-sky-900 text-slate-200'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="font-bold text-sm text-sky-600 dark:text-sky-400 mb-2 border-b border-inherit pb-2">
            ARCHITECTURAL JOINERY NOTES
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 list-disc list-inside">
            <li>All dimensions of doors and windows are structural opening sizes in brickwork.</li>
            <li>All door frames to be fixed with MS holdfasts (3 nos. on each side) embedded in concrete blocks.</li>
            <li>All hardware and hinges to be SS-304 grade with antique brass or matte black finish.</li>
            <li>UPVC sections shall be multi-chambered lead-free profiles with galvanised steel reinforcement.</li>
            <li>Bathroom doors to have 75mm marble/granite threshold threshold to prevent water seepage.</li>
            <li>Lintel level shall be maintained at 7&apos;-0&quot; uniform throughout each floor.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
