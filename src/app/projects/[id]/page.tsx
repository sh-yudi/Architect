'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { HousePlan } from '@/types/plan';
import { WizardFormData } from '@/types/wizard';
import { FloorPlanSVG } from '@/components/floorplan/FloorPlanSVG';
import { ThreeDViewer } from '@/components/viewer3d/ThreeDViewer';
import { BudgetTable } from '@/components/dashboard/BudgetTable';
import { RegulatoryCard } from '@/components/dashboard/RegulatoryCard';

export default function ProjectDetailsPage() {
  const params = useParams();
  const id = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : '';
  const [isLoading, setIsLoading] = useState(true);
  const [plan, setPlan] = useState<HousePlan | null>(null);
  const [formData, setFormData] = useState<WizardFormData | null>(null);
  const [activeTab, setActiveTab] = useState<'2d' | '3d' | 'budget' | 'regulatory'>('2d');
  const [isExportingCAD, setIsExportingCAD] = useState(false);
  const [isExportingAffidavit, setIsExportingAffidavit] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && id) {
      const storedPlan = sessionStorage.getItem(`plan_${id}`);
      const storedForm = sessionStorage.getItem(`form_${id}`);
      if (storedPlan) {
        try {
          setPlan(JSON.parse(storedPlan));
        } catch (e) {
          console.error('Failed to parse plan from sessionStorage', e);
        }
      }
      if (storedForm) {
        try {
          setFormData(JSON.parse(storedForm));
        } catch (e) {
          console.error('Failed to parse form from sessionStorage', e);
        }
      }
      setIsLoading(false);
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mb-3" />
          <p className="font-medium">Loading Architectural Blueprint...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Blueprint Not Found</h2>
            <p className="text-sm text-slate-500 mt-1">
              No active plan found for this session. Please create a new house plan.
            </p>
          </div>
          <div>
            <Link
              href="/start"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm rounded-xl shadow-sm transition"
            >
              Create New House Plan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadCAD = async () => {
    if (isExportingCAD) return;
    setIsExportingCAD(true);
    try {
      const res = await fetch('/api/export-cad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error('CAD export failed');
      const blob = await res.blob();
      triggerDownload(blob, `house-plan-${id || 'blueprint'}.dxf`);
    } catch (e) {
      console.error(e);
      alert('Failed to download CAD drawing. Please try again.');
    } finally {
      setIsExportingCAD(false);
    }
  };

  const handleDownloadAffidavit = async () => {
    if (isExportingAffidavit) return;
    setIsExportingAffidavit(true);
    try {
      const payloadForm = formData || {
        plot: {
          width: plan.plot.width,
          length: plan.plot.length,
          shape: 'rectangular' as const,
          facing: plan.plot.facing,
          city: 'Ghaziabad',
          state: 'Uttar Pradesh',
          pincode: '201001',
        },
        requirements: {
          floors: plan.floors.length,
          bedrooms: 3,
          bathrooms: 2,
          hasLivingRoom: true,
          kitchenType: 'modular' as const,
          parkingSpots: 1,
          hasPoojaRoom: false,
          hasServantQuarter: false,
          hasTerrace: true,
          hasBasement: false,
        },
        preferences: {
          style: (plan.facade.style as any) || 'Modern',
          garden: 'front' as const,
          balconies: 1,
          windowType: 'standard' as const,
        },
        budget: {
          range: '25-40L' as const,
          qualityTier: 'standard' as const,
        },
        regulatory: {
          ownerName: 'Property Owner',
          fatherOrSpouseName: 'S/o Late Shri',
          khasraNumber: '102/4',
          khatauniNumber: '55',
          authorityName: 'Ghaziabad Development Authority (GDA)',
          zone: 'Zone 1',
        },
      };

      const res = await fetch('/api/export-affidavit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, formData: payloadForm }),
      });
      if (!res.ok) throw new Error('Affidavit export failed');
      const blob = await res.blob();
      triggerDownload(blob, `gda-affidavit-${id || 'submission'}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Failed to download GDA affidavit. Please try again.');
    } finally {
      setIsExportingAffidavit(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <span className="text-xs font-mono text-sky-600 font-bold uppercase tracking-wider">
              Project #{id || '1'}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              Architectural House Plan Package
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {plan.plot.width}&apos; × {plan.plot.length}&apos; ({plan.plot.area} sq ft) &bull;{' '}
              {plan.facade.style} Façade &bull; {plan.floors.length} Levels &bull; Ghaziabad (GDA)
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadCAD}
              disabled={isExportingCAD}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              {isExportingCAD ? 'Exporting CAD...' : 'Export CAD (.DXF)'}
            </button>
          </div>
        </div>

        {/* Custom Wishlist / Client Vision Banner */}
        {(plan.customWishlist || formData?.customWishlist) && (
          <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
                Client&apos;s Custom Architectural Vision &amp; Requirements
              </span>
              <span className="text-[10px] bg-sky-200/60 text-sky-800 font-semibold px-2 py-0.5 rounded-full">
                Custom Tailored
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
              &ldquo;{plan.customWishlist || formData?.customWishlist}&rdquo;
            </p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold text-slate-600">
          {(['2d', '3d', 'budget', 'regulatory'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 capitalize transition-all border-b-2 ${
                activeTab === tab
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              {tab === '2d'
                ? '2D Floor Plans'
                : tab === '3d'
                ? '3D Structure'
                : tab === 'budget'
                ? 'Cost & BOQ'
                : 'Municipal Sanction (GDA)'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === '2d' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plan.floors.map((floor) => (
              <FloorPlanSVG
                key={floor.level}
                floor={floor}
                plotWidth={plan.plot.width}
                plotLength={plan.plot.length}
              />
            ))}
          </div>
        )}

        {activeTab === '3d' && <ThreeDViewer plan={plan} />}

        {activeTab === 'budget' && <BudgetTable budget={plan.budget} />}

        {activeTab === 'regulatory' && (
          <RegulatoryCard
            plan={plan}
            onDownloadCAD={handleDownloadCAD}
            onDownloadAffidavit={handleDownloadAffidavit}
          />
        )}
      </div>
    </div>
  );
}
