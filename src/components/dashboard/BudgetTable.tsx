import React from 'react';
import { BudgetSummary } from '@/types/plan';

interface BudgetTableProps {
  budget: BudgetSummary;
}

export const BudgetTable: React.FC<BudgetTableProps> = ({ budget }) => {
  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const getCategoryBadge = (category: string) => {
    switch (category.toLowerCase()) {
      case 'civil':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'finishing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'services':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'regulatory':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-900">Itemized Bill of Quantities (BOQ)</h3>
          <p className="text-xs text-slate-500">Includes materials, labor, and municipal approval provisions</p>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase tracking-wide text-slate-500">Estimated Total</span>
          <p className="text-xl font-extrabold text-emerald-600">{formatINR(budget.total)}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-semibold">
            <tr>
              <th className="py-2.5 px-4">Category</th>
              <th className="py-2.5 px-4">Item Description</th>
              <th className="py-2.5 px-4 text-right">Cost (INR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {budget.lineItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className="py-2.5 px-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${getCategoryBadge(item.category)}`}>
                    {item.category}
                  </span>
                </td>
                <td className="py-2.5 px-4 font-medium text-slate-800">{item.name}</td>
                <td className="py-2.5 px-4 text-right font-semibold text-slate-900">{formatINR(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
