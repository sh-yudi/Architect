'use client';

import React, { useState } from 'react';
import { WizardFormData } from '@/types/wizard';

interface IntakeWizardProps {
  onSubmit: (data: WizardFormData) => void;
}

export const IntakeWizard: React.FC<IntakeWizardProps> = ({ onSubmit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>({
    plot: {
      width: 30,
      length: 45,
      shape: 'rectangular',
      facing: 'East',
      city: 'Ghaziabad',
      state: 'Uttar Pradesh',
      pincode: '201001',
    },
    requirements: {
      floors: 2,
      bedrooms: 3,
      bathrooms: 3,
      hasLivingRoom: true,
      kitchenType: 'modular',
      parkingSpots: 1,
      hasPoojaRoom: true,
      hasServantQuarter: false,
      hasTerrace: true,
      hasBasement: false,
    },
    preferences: {
      style: 'Modern',
      garden: 'front',
      balconies: 1,
      windowType: 'large',
    },
    budget: {
      range: '25-40L',
      qualityTier: 'standard',
    },
    regulatory: {
      ownerName: '',
      fatherOrSpouseName: '',
      khasraNumber: '',
      khatauniNumber: '',
      authorityName: 'GDA',
      zone: 'Zone 1',
    },
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, 6));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
          <span>Step {step} of 6: {
            ['Plot Details', 'House Requirements', 'Lifestyle Preferences', 'Budget & Materials', 'Authority & Legal', 'Review & Generate'][step - 1]
          }</span>
          <span>{Math.round((step / 6) * 100)}% Completed</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-sky-600 h-full transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Plot Details */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Enter Your Plot Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="plot-width" className="block text-xs font-semibold text-slate-700 mb-1">Plot Width (ft)</label>
              <input
                id="plot-width"
                type="number"
                value={formData.plot.width}
                onChange={(e) => setFormData({ ...formData, plot: { ...formData.plot, width: Number(e.target.value) } })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label htmlFor="plot-length" className="block text-xs font-semibold text-slate-700 mb-1">Plot Length (ft)</label>
              <input
                id="plot-length"
                type="number"
                value={formData.plot.length}
                onChange={(e) => setFormData({ ...formData, plot: { ...formData.plot, length: Number(e.target.value) } })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="plot-facing" className="block text-xs font-semibold text-slate-700 mb-1">Facing Direction (Vastu)</label>
            <select
              id="plot-facing"
              value={formData.plot.facing}
              onChange={(e) => setFormData({ ...formData, plot: { ...formData.plot, facing: e.target.value as any } })}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            >
              <option value="East">East (Most Auspicious)</option>
              <option value="North">North</option>
              <option value="West">West</option>
              <option value="South">South</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="plot-city" className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                id="plot-city"
                type="text"
                value={formData.plot.city}
                onChange={(e) => setFormData({ ...formData, plot: { ...formData.plot, city: e.target.value } })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="plot-pincode" className="block text-xs font-semibold text-slate-700 mb-1">Pincode</label>
              <input
                id="plot-pincode"
                type="text"
                value={formData.plot.pincode}
                onChange={(e) => setFormData({ ...formData, plot: { ...formData.plot, pincode: e.target.value } })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Requirements */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">House Rooms &amp; Structure</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="req-floors" className="block text-xs font-semibold text-slate-700 mb-1">Number of Floors</label>
              <select
                id="req-floors"
                value={formData.requirements.floors}
                onChange={(e) => setFormData({ ...formData, requirements: { ...formData.requirements, floors: Number(e.target.value) } })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              >
                <option value={1}>Ground Only (G)</option>
                <option value={2}>Ground + 1 Floor (G+1)</option>
                <option value={3}>Ground + 2 Floors (G+2)</option>
              </select>
            </div>
            <div>
              <label htmlFor="req-bedrooms" className="block text-xs font-semibold text-slate-700 mb-1">Bedrooms</label>
              <input
                id="req-bedrooms"
                type="number"
                value={formData.requirements.bedrooms}
                onChange={(e) => setFormData({ ...formData, requirements: { ...formData.requirements, bedrooms: Number(e.target.value) } })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="req-bathrooms" className="block text-xs font-semibold text-slate-700 mb-1">Bathrooms</label>
              <input
                id="req-bathrooms"
                type="number"
                value={formData.requirements.bathrooms}
                onChange={(e) => setFormData({ ...formData, requirements: { ...formData.requirements, bathrooms: Number(e.target.value) } })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="req-parking" className="block text-xs font-semibold text-slate-700 mb-1">Car Parking Spaces</label>
              <input
                id="req-parking"
                type="number"
                value={formData.requirements.parkingSpots}
                onChange={(e) => setFormData({ ...formData, requirements: { ...formData.requirements, parkingSpots: Number(e.target.value) } })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={formData.requirements.hasPoojaRoom}
                onChange={(e) => setFormData({ ...formData, requirements: { ...formData.requirements, hasPoojaRoom: e.target.checked } })}
                className="rounded border-slate-300 text-sky-600"
              />
              Pooja Room
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={formData.requirements.hasTerrace}
                onChange={(e) => setFormData({ ...formData, requirements: { ...formData.requirements, hasTerrace: e.target.checked } })}
                className="rounded border-slate-300 text-sky-600"
              />
              Terrace Access
            </label>
          </div>
        </div>
      )}

      {/* Step 3: Preferences */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Façade &amp; Style</h2>
          <div>
            <label htmlFor="pref-style" className="block text-xs font-semibold text-slate-700 mb-1">Architectural Elevation Style</label>
            <select
              id="pref-style"
              value={formData.preferences.style}
              onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, style: e.target.value as any } })}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            >
              <option value="Modern">Modern Minimalist</option>
              <option value="Contemporary">Contemporary Luxury</option>
              <option value="Traditional">Traditional Indian Haveli</option>
              <option value="Colonial">Classic Colonial</option>
              <option value="Farmhouse">Farmhouse Rustica</option>
            </select>
          </div>
          <div>
            <label htmlFor="pref-garden" className="block text-xs font-semibold text-slate-700 mb-1">Garden / Lawn Space</label>
            <select
              id="pref-garden"
              value={formData.preferences.garden}
              onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, garden: e.target.value as any } })}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            >
              <option value="none">No Garden</option>
              <option value="front">Front Green Lawn</option>
              <option value="rear">Rear Private Courtyard</option>
              <option value="both">Both Front &amp; Rear</option>
            </select>
          </div>
        </div>
      )}

      {/* Step 4: Budget */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Budget &amp; Materials</h2>
          <div>
            <label htmlFor="bud-range" className="block text-xs font-semibold text-slate-700 mb-1">Target Budget Range</label>
            <select
              id="bud-range"
              value={formData.budget.range}
              onChange={(e) => setFormData({ ...formData, budget: { ...formData.budget, range: e.target.value as any } })}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            >
              <option value="15-25L">₹15 Lakhs – ₹25 Lakhs</option>
              <option value="25-40L">₹25 Lakhs – ₹40 Lakhs</option>
              <option value="40-60L">₹40 Lakhs – ₹60 Lakhs</option>
              <option value="60-100L">₹60 Lakhs – ₹1 Crore</option>
              <option value="100L+">Above ₹1 Crore</option>
            </select>
          </div>
          <div>
            <label htmlFor="bud-tier" className="block text-xs font-semibold text-slate-700 mb-1">Material Quality Tier</label>
            <select
              id="bud-tier"
              value={formData.budget.qualityTier}
              onChange={(e) => setFormData({ ...formData, budget: { ...formData.budget, qualityTier: e.target.value as any } })}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            >
              <option value="economy">Economy (Flyash bricks, vitrified standard tiles)</option>
              <option value="standard">Standard (Red bricks, Jaguar fittings, branded paint)</option>
              <option value="premium">Premium (Granite flooring, teak doors, modular kitchen)</option>
              <option value="luxury">Luxury (Italian marble, high-end automation, double glazing)</option>
            </select>
          </div>
        </div>
      )}

      {/* Step 5: Regulatory */}
      {step === 5 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Municipal Approval Information</h2>
          <p className="text-xs text-slate-500">
            Pre-fills your GDA/UPOBPAS building map sanction documents. No sensitive identity numbers are stored.
          </p>
          <div>
            <label htmlFor="reg-owner" className="block text-xs font-semibold text-slate-700 mb-1">Owner Full Name (on Registry)</label>
            <input
              id="reg-owner"
              type="text"
              placeholder="e.g. Ramesh Chandra Sharma"
              value={formData.regulatory.ownerName}
              onChange={(e) => setFormData({ ...formData, regulatory: { ...formData.regulatory, ownerName: e.target.value } })}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="reg-parent" className="block text-xs font-semibold text-slate-700 mb-1">Father&apos;s / Spouse Name</label>
            <input
              id="reg-parent"
              type="text"
              placeholder="e.g. Late Shri O. P. Sharma"
              value={formData.regulatory.fatherOrSpouseName}
              onChange={(e) => setFormData({ ...formData, regulatory: { ...formData.regulatory, fatherOrSpouseName: e.target.value } })}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="reg-khasra" className="block text-xs font-semibold text-slate-700 mb-1">Plot / Khasra No.</label>
              <input
                id="reg-khasra"
                type="text"
                placeholder="e.g. 104/A"
                value={formData.regulatory.khasraNumber}
                onChange={(e) => setFormData({ ...formData, regulatory: { ...formData.regulatory, khasraNumber: e.target.value } })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="reg-khatauni" className="block text-xs font-semibold text-slate-700 mb-1">Khatauni No.</label>
              <input
                id="reg-khatauni"
                type="text"
                placeholder="e.g. 52"
                value={formData.regulatory.khatauniNumber}
                onChange={(e) => setFormData({ ...formData, regulatory: { ...formData.regulatory, khatauniNumber: e.target.value } })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 6: Review */}
      {step === 6 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Review &amp; Generate Blueprint</h2>
          <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs text-slate-700 border border-slate-200">
            <div className="flex justify-between">
              <span className="font-semibold">Plot Footprint:</span>
              <span>{formData.plot.width}&apos; × {formData.plot.length}&apos; ({formData.plot.width * formData.plot.length} sq ft), Facing {formData.plot.facing}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Layout:</span>
              <span>{formData.requirements.floors} Floors, {formData.requirements.bedrooms} BHK</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Elevation Style:</span>
              <span>{formData.preferences.style}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Authority Rules:</span>
              <span>Ghaziabad Development Authority (GDA / UPOBPAS)</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-200">
        {step > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            &larr; Back
          </button>
        ) : <div />}

        {step < 6 ? (
          <button
            type="button"
            onClick={nextStep}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            Continue &rarr;
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSubmit(formData)}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            Generate Complete House Plan Package
          </button>
        )}
      </div>
    </div>
  );
};
