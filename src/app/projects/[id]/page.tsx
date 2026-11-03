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
import { StructuralGridSheet } from '@/components/sheets/StructuralGridSheet';
import { FoundationRCCSheet } from '@/components/sheets/FoundationRCCSheet';
import { DoorWindowScheduleSheet } from '@/components/sheets/DoorWindowScheduleSheet';
import { MEPServicesSheet } from '@/components/sheets/MEPServicesSheet';
import { FrontElevationSheet } from '@/components/sheets/FrontElevationSheet';
import {
  getPlanHistory,
  getPlanHistoryItem,
  savePlanToHistory,
  deletePlanFromHistory,
  clearPlanHistory,
  PlanHistoryItem,
} from '@/lib/storage/history';

export default function ProjectDetailsPage() {
  const params = useParams();
  const id = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : '';
  const [isLoading, setIsLoading] = useState(true);
  const [plan, setPlan] = useState<HousePlan | null>(null);
  const [formData, setFormData] = useState<WizardFormData | null>(null);
  const [history, setHistory] = useState<PlanHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<
    '2d' | 'structural' | 'foundation' | 'openings' | 'services' | 'elevation' | '3d' | 'budget' | 'regulatory' | 'history'
  >('2d');
  const [isExportingCAD, setIsExportingCAD] = useState(false);
  const [isExportingAffidavit, setIsExportingAffidavit] = useState(false);
  const [isExportingBlueprint, setIsExportingBlueprint] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && id) {
      let loadedPlan: HousePlan | null = null;
      let loadedForm: WizardFormData | null = null;

      const storedPlan = sessionStorage.getItem(`plan_${id}`);
      const storedForm = sessionStorage.getItem(`form_${id}`);
      if (storedPlan) {
        try {
          loadedPlan = JSON.parse(storedPlan);
        } catch (e) {
          console.error('Failed to parse plan from sessionStorage', e);
        }
      }
      if (storedForm) {
        try {
          loadedForm = JSON.parse(storedForm);
        } catch (e) {
          console.error('Failed to parse form from sessionStorage', e);
        }
      }

      // Fallback to localStorage history if not in sessionStorage
      if (!loadedPlan) {
        const item = getPlanHistoryItem(id);
        if (item) {
          loadedPlan = item.plan;
          loadedForm = item.formData;
          try {
            sessionStorage.setItem(`plan_${id}`, JSON.stringify(loadedPlan));
            if (loadedForm) {
              sessionStorage.setItem(`form_${id}`, JSON.stringify(loadedForm));
            }
          } catch (e) {
            console.warn('Failed to sync to sessionStorage', e);
          }
        }
      } else if (loadedForm) {
        // Ensure plan is recorded in local history
        savePlanToHistory(id, loadedPlan, loadedForm);
      }

      if (loadedPlan) setPlan(loadedPlan);
      if (loadedForm) setFormData(loadedForm);
      setHistory(getPlanHistory());
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

  const handleDownloadCADForPlan = async (targetPlan: HousePlan, targetId: string) => {
    try {
      const res = await fetch('/api/export-cad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: targetPlan }),
      });
      if (!res.ok) throw new Error('CAD export failed');
      const blob = await res.blob();
      triggerDownload(blob, `house-plan-${targetId || 'blueprint'}.dxf`);
    } catch (e) {
      console.error(e);
      alert('Failed to download CAD drawing. Please try again.');
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

  const handleDownloadBlueprintPDF = async () => {
    if (isExportingBlueprint) return;
    setIsExportingBlueprint(true);
    try {
      const res = await fetch('/api/export-blueprint-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, formData }),
      });
      if (!res.ok) throw new Error('Blueprint PDF export failed');
      const blob = await res.blob();
      triggerDownload(blob, `Architectural-Blueprint-Set-${id || 'Package'}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Failed to download complete blueprint set. Please try again.');
    } finally {
      setIsExportingBlueprint(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-sky-600 font-bold uppercase tracking-wider">
                Project #{id || '1'}
              </span>
              {history.length > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className="text-[11px] font-semibold text-slate-500 hover:text-sky-600 bg-slate-100 hover:bg-sky-50 px-2 py-0.5 rounded-full border border-slate-200 transition"
                >
                  📜 {history.length} Saved Plans
                </button>
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              Architectural House Plan Package
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {plan.plot.width}&apos; × {plan.plot.length}&apos; ({plan.plot.area} sq ft) &bull;{' '}
              {plan.facade.style} Façade &bull; {plan.floors.length} Levels &bull; Ghaziabad (GDA)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadBlueprintPDF}
              disabled={isExportingBlueprint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-700 hover:bg-sky-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              {isExportingBlueprint ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                  <span>Generating A3 PDF...</span>
                </>
              ) : (
                <>
                  <span>📥</span>
                  <span>Download Blueprint Package (A3 PDF)</span>
                </>
              )}
            </button>
            <Link
              href="/start"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <span>+ Create Another Plan</span>
            </Link>
            <button
              onClick={handleDownloadCAD}
              disabled={isExportingCAD}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              {isExportingCAD ? 'Exporting CAD...' : 'Export CAD (.DXF)'}
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition"
            >
              <span>Exit</span>
            </Link>
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
        <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold text-slate-600 overflow-x-auto whitespace-nowrap pb-1 sm:pb-0">
          {(
            [
              '2d',
              'structural',
              'foundation',
              'openings',
              'services',
              'elevation',
              '3d',
              'budget',
              'regulatory',
              'history',
            ] as const
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 capitalize transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'border-sky-600 text-sky-600 font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <span>
                {tab === '2d'
                  ? '2D Floor Plans'
                  : tab === 'structural'
                  ? 'Structural Grid (S-01)'
                  : tab === 'foundation'
                  ? 'Foundation & RCC (S-03)'
                  : tab === 'openings'
                  ? 'Doors & Windows (W-07)'
                  : tab === 'services'
                  ? 'MEP Services (E-01)'
                  : tab === 'elevation'
                  ? 'Front Elevation (W-01)'
                  : tab === '3d'
                  ? '3D Structure'
                  : tab === 'budget'
                  ? 'Cost & BOQ'
                  : tab === 'regulatory'
                  ? 'Municipal Sanction (GDA)'
                  : 'Plan History'}
              </span>
              {tab === 'history' && history.length > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeTab === 'history'
                      ? 'bg-sky-100 text-sky-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {history.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === '2d' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sky-700">🏛️ SHEET P-01: ARCHITECTURAL WORKING FLOOR PLANS</span>
                <span className="text-slate-400">&bull;</span>
                <span className="text-slate-600">{plan.floors.length} Levels Defined</span>
              </div>
              <button
                onClick={handleDownloadBlueprintPDF}
                disabled={isExportingBlueprint}
                className="px-3 py-1.5 bg-sky-700 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-sm transition"
              >
                📥 Download Blueprint Set (PDF)
              </button>
            </div>
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
          </div>
        )}

        {activeTab === 'structural' && (
          <StructuralGridSheet
            plan={plan}
            plotWidth={plan.plot.width}
            plotLength={plan.plot.length}
          />
        )}

        {activeTab === 'foundation' && (
          <FoundationRCCSheet
            plan={plan}
            plotWidth={plan.plot.width}
            plotLength={plan.plot.length}
          />
        )}

        {activeTab === 'openings' && <DoorWindowScheduleSheet plan={plan} />}

        {activeTab === 'services' && <MEPServicesSheet plan={plan} />}

        {activeTab === 'elevation' && <FrontElevationSheet plan={plan} />}

        {activeTab === '3d' && <ThreeDViewer plan={plan} />}

        {activeTab === 'budget' && <BudgetTable budget={plan.budget} />}

        {activeTab === 'regulatory' && (
          <RegulatoryCard
            plan={plan}
            onDownloadCAD={handleDownloadCAD}
            onDownloadAffidavit={handleDownloadAffidavit}
          />
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Saved Architectural Plans & Revisions
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  All blueprints generated on this device are archived here. You can switch between revisions or download CAD drawings directly.
                </p>
              </div>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear your local blueprint history?')) {
                      clearPlanHistory();
                      setHistory([]);
                    }
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition"
                >
                  Clear History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-2xl">
                  📜
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800">No Past Plans Found</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Generate a new house plan to start building your architectural archive.
                  </p>
                </div>
                <div>
                  <Link
                    href="/start"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                  >
                    + Create a House Plan
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {history.map((item) => {
                  const isActive = item.id === id;
                  const dateStr = new Date(item.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl p-5 border transition-all space-y-4 shadow-sm ${
                        isActive
                          ? 'border-sky-500 ring-2 ring-sky-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-sky-700 font-bold">
                              #{item.id}
                            </span>
                            {isActive && (
                              <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-300">
                                ✓ Currently Active Blueprint
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-slate-900 text-sm mt-1">
                            {item.title}
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">{dateStr}</p>
                        </div>
                        <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          ₹{(item.estimatedCost / 100000).toFixed(1)}L
                        </span>
                      </div>

                      {/* Specs badges */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600">
                        <div>
                          <span className="font-semibold text-slate-700">Plot: </span>
                          {item.plot.width}&apos; × {item.plot.length}&apos; ({item.plot.area} sq ft)
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Facing: </span>
                          {item.plot.facing}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Floors: </span>
                          {item.floorsCount} Level(s)
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Location: </span>
                          {item.plot.city}
                        </div>
                      </div>

                      {/* Wishlist snippet if available */}
                      {item.customWishlist && (
                        <p className="text-[11px] text-slate-500 italic line-clamp-2 bg-sky-50/50 p-2 rounded-lg border border-sky-100">
                          &ldquo;{item.customWishlist}&rdquo;
                        </p>
                      )}

                      {/* Card Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div>
                          {!isActive ? (
                            <Link
                              href={`/projects/${item.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                            >
                              <span>Switch to Blueprint &rarr;</span>
                            </Link>
                          ) : (
                            <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                              ● Viewing Now
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDownloadCADForPlan(item.plan, item.id)}
                            className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-300 transition"
                          >
                            CAD (.DXF)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Delete this plan from your history?')) {
                                deletePlanFromHistory(item.id);
                                setHistory(getPlanHistory());
                              }
                            }}
                            aria-label={`Delete ${item.id}`}
                            className="text-xs font-medium text-rose-500 hover:text-rose-700 p-1.5 rounded hover:bg-rose-50 transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Need to generate another house layout with different dimensions or wishlist?
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/start"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <span>+ Create Another Plan</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition"
            >
              <span>Exit</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
