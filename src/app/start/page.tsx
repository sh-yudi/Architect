'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IntakeWizard } from '@/components/wizard/IntakeWizard';
import { WizardFormData } from '@/types/wizard';

export default function StartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (formData: WizardFormData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.projectId) {
        throw new Error(data.error || 'Failed to generate plan. Please try again.');
      }
      sessionStorage.setItem(`plan_${data.projectId}`, JSON.stringify(data.plan));
      sessionStorage.setItem(`form_${data.projectId}`, JSON.stringify(formData));
      router.push(`/projects/${data.projectId}`);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900">Custom House Plan Generator</h1>
        <p className="mt-2 text-sm text-slate-600">
          Provide your plot and architectural preferences to create 2D plans, 3D structures, and municipal sanction files.
        </p>
      </div>

      {loading ? (
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mb-4" />
          <h3 className="text-base font-semibold text-slate-800">Architect AI is Designing Your House</h3>
          <p className="text-xs text-slate-500 mt-1">Applying Vastu orientation, setback compliance, and calculating BOQ rates...</p>
        </div>
      ) : (
        <IntakeWizard onSubmit={handleGenerate} />
      )}
    </div>
  );
}
