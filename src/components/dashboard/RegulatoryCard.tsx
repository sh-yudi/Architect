import React from 'react';
import { HousePlan } from '@/types/plan';

export interface RegulatoryCardProps {
  plan: HousePlan;
  onDownloadCAD: () => void;
  onDownloadAffidavit: () => void;
}

export const RegulatoryCard: React.FC<RegulatoryCardProps> = ({
  plan,
  onDownloadCAD,
  onDownloadAffidavit,
}) => {
  const isCompliant = !plan.regulatory.violations || plan.regulatory.violations.length === 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Ghaziabad Authority (GDA) Approval Package</h3>
          <p className="text-xs text-slate-500 mt-0.5">Compliant with UP Online Building Plan Approval System (UPOBPAS)</p>
        </div>
        <span
          className={`px-3 py-1 font-semibold text-xs rounded-full ${
            isCompliant
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {isCompliant ? 'Bylaws Compliant' : 'Review Required'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg text-xs font-mono">
        <div>
          <span className="text-slate-500 block">FAR Ratio</span>
          <span className="font-bold text-slate-800">{plan.regulatory.far} (Max: 2.0)</span>
        </div>
        <div>
          <span className="text-slate-500 block">Ground Coverage</span>
          <span className="font-bold text-slate-800">{plan.regulatory.groundCoverage}% (Max: 60%)</span>
        </div>
        <div>
          <span className="text-slate-500 block">Front Setback</span>
          <span className="font-bold text-slate-800">{plan.setbacks.front} ft</span>
        </div>
      </div>

      {!isCompliant && plan.regulatory.violations.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
          <p className="font-semibold">Bylaw Observations:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {plan.regulatory.violations.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="pt-2 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onDownloadCAD}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-[0.98]"
        >
          Download UPOBPAS AutoDCR Drawing (.DXF)
        </button>
        <button
          type="button"
          onClick={onDownloadAffidavit}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-[0.98]"
        >
          Download GDA Notarized Affidavit (.PDF)
        </button>
      </div>
    </div>
  );
};
