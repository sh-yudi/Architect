'use client';

import React, { useState } from 'react';
import { WizardFormData } from '@/types/wizard';

interface IntakeWizardProps {
  onSubmit: (data: WizardFormData) => void;
}

export const IntakeWizard: React.FC<IntakeWizardProps> = ({ onSubmit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>({
    customWishlist: '',
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

  const floorPresets = [
    { label: 'Ground (G)', floors: 1 },
    { label: 'G + 1', floors: 2 },
    { label: 'G + 2', floors: 3 },
    { label: 'G + 3', floors: 4 },
    { label: 'G + 4', floors: 5 },
    { label: 'G + 5', floors: 6 },
  ];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
          <span>
            Step {step} of 6:{' '}
            {
              [
                'Plot Details',
                'House Requirements',
                'Lifestyle Preferences',
                'Budget & Materials',
                'Authority & Legal',
                'Review & Generate',
              ][step - 1]
            }
          </span>
          <span>{Math.round((step / 6) * 100)}% Completed</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-sky-600 h-full transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Plot Details & Vision */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Enter Your Plot Details &amp; Vision</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify your land dimensions, facing, and describe your personalized dream house vision.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="plot-width" className="block text-xs font-semibold text-slate-700 mb-1">
                Plot Width (ft)
              </label>
              <input
                id="plot-width"
                type="number"
                min="10"
                max="200"
                value={formData.plot.width}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    plot: { ...formData.plot, width: Number(e.target.value) },
                  })
                }
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label htmlFor="plot-length" className="block text-xs font-semibold text-slate-700 mb-1">
                Plot Length (ft)
              </label>
              <input
                id="plot-length"
                type="number"
                min="10"
                max="300"
                value={formData.plot.length}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    plot: { ...formData.plot, length: Number(e.target.value) },
                  })
                }
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="plot-facing" className="block text-xs font-semibold text-slate-700 mb-1">
              Facing Direction (Vastu)
            </label>
            <select
              id="plot-facing"
              value={formData.plot.facing}
              onChange={(e) =>
                setFormData({ ...formData, plot: { ...formData.plot, facing: e.target.value as any } })
              }
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            >
              <option value="East">East (Most Auspicious - Sun Facing)</option>
              <option value="North">North (Wealth &amp; Kubera)</option>
              <option value="North-East">North-East (Ishan Corner)</option>
              <option value="West">West (Varuna Facing)</option>
              <option value="South">South (Yama / Solid Frontage)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="plot-city" className="block text-xs font-semibold text-slate-700 mb-1">
                City
              </label>
              <input
                id="plot-city"
                type="text"
                value={formData.plot.city}
                onChange={(e) =>
                  setFormData({ ...formData, plot: { ...formData.plot, city: e.target.value } })
                }
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label htmlFor="plot-pincode" className="block text-xs font-semibold text-slate-700 mb-1">
                Pincode
              </label>
              <input
                id="plot-pincode"
                type="text"
                value={formData.plot.pincode}
                onChange={(e) =>
                  setFormData({ ...formData, plot: { ...formData.plot, pincode: e.target.value } })
                }
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Prominent Custom Vision & Wishlist Paragraph Input */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="custom-wishlist" className="block text-xs font-bold text-sky-900">
                Describe Your Dream House in Your Own Words (Custom Wishlist)
              </label>
              <span className="text-[10px] text-sky-700 font-medium">Detailed Vision</span>
            </div>
            <textarea
              id="custom-wishlist"
              rows={4}
              placeholder="Explain exactly how you want your house! For example: 'We want a modern open kitchen connected to the dining area, a double-height living room facing North-East with full glass facade, master bedroom with walk-in closet on ground floor for elderly parents, home theatre and gym on 2nd floor, open terrace garden with wooden pergola, servant room with separate exterior staircase, covered parking for 2 cars with EV charger point...'"
              value={formData.customWishlist || ''}
              onChange={(e) => setFormData({ ...formData, customWishlist: e.target.value })}
              className="w-full rounded-xl border border-sky-200 bg-sky-50/30 p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 transition"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Our AI architect will review your exact paragraph to customize room zoning, doors, windows, terrace features, and municipal authority setbacks.
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Requirements */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">House Rooms &amp; Structure</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose your floor count (no fixed limits: Ground, G+1 up to G+10+) and room requirements.
            </p>
          </div>

          {/* Dynamic Floor Selection */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <label htmlFor="req-floors" className="block text-xs font-bold text-slate-800">
                Number of Floors
              </label>
              <span className="text-xs font-mono font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                {formData.requirements.floors === 1
                  ? 'Ground Only (G)'
                  : `Ground + ${formData.requirements.floors - 1} Floors (G+${formData.requirements.floors - 1})`}
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {floorPresets.map((preset) => (
                <button
                  key={preset.floors}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      requirements: { ...formData.requirements, floors: preset.floors },
                    })
                  }
                  className={`py-2 px-1 text-xs font-medium rounded-lg border text-center transition ${
                    formData.requirements.floors === preset.floors
                      ? 'bg-sky-600 border-sky-600 text-white shadow-sm font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Floor Input for taller multi-story structures */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs text-slate-600">Or type custom floor count:</span>
              <input
                id="req-floors"
                type="number"
                min="1"
                max="15"
                value={formData.requirements.floors}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requirements: {
                      ...formData.requirements,
                      floors: Math.max(1, Math.min(15, Number(e.target.value) || 1)),
                    },
                  })
                }
                className="w-24 rounded-lg border border-slate-300 p-1.5 text-center text-sm font-semibold focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-white"
              />
              <span className="text-xs text-slate-500">(Supports up to 15 floors)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="req-bedrooms" className="block text-xs font-semibold text-slate-700 mb-1">
                Bedrooms
              </label>
              <input
                id="req-bedrooms"
                type="number"
                min="1"
                max="25"
                value={formData.requirements.bedrooms}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requirements: { ...formData.requirements, bedrooms: Number(e.target.value) },
                  })
                }
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label htmlFor="req-bathrooms" className="block text-xs font-semibold text-slate-700 mb-1">
                Bathrooms
              </label>
              <input
                id="req-bathrooms"
                type="number"
                min="1"
                max="25"
                value={formData.requirements.bathrooms}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requirements: { ...formData.requirements, bathrooms: Number(e.target.value) },
                  })
                }
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="req-kitchen" className="block text-xs font-semibold text-slate-700 mb-1">
                Kitchen Style
              </label>
              <select
                id="req-kitchen"
                value={formData.requirements.kitchenType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requirements: { ...formData.requirements, kitchenType: e.target.value as any },
                  })
                }
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                <option value="modular">Modern Modular Kitchen</option>
                <option value="open">Open American Concept</option>
                <option value="closed">Traditional Closed Kitchen</option>
              </select>
            </div>
            <div>
              <label htmlFor="req-parking" className="block text-xs font-semibold text-slate-700 mb-1">
                Car Parking Spaces
              </label>
              <input
                id="req-parking"
                type="number"
                min="0"
                max="10"
                value={formData.requirements.parkingSpots}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requirements: { ...formData.requirements, parkingSpots: Number(e.target.value) },
                  })
                }
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requirements.hasPoojaRoom}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requirements: { ...formData.requirements, hasPoojaRoom: e.target.checked },
                  })
                }
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              Pooja Room (Mandir)
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requirements.hasTerrace}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requirements: { ...formData.requirements, hasTerrace: e.target.checked },
                  })
                }
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              Rooftop Terrace
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requirements.hasBasement}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requirements: { ...formData.requirements, hasBasement: e.target.checked },
                  })
                }
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              Basement Floor
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requirements.hasServantQuarter}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requirements: { ...formData.requirements, hasServantQuarter: e.target.checked },
                  })
                }
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              Servant Room
            </label>
          </div>
        </div>
      )}

      {/* Step 3: Preferences */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Façade &amp; Style</h2>
          <div>
            <label htmlFor="pref-style" className="block text-xs font-semibold text-slate-700 mb-1">
              Architectural Elevation Style
            </label>
            <select
              id="pref-style"
              value={formData.preferences.style}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, style: e.target.value as any },
                })
              }
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            >
              <option value="Modern">Modern Minimalist</option>
              <option value="Contemporary">Contemporary Luxury</option>
              <option value="Traditional">Traditional Indian Haveli</option>
              <option value="Colonial">Classic Colonial</option>
              <option value="Farmhouse">Farmhouse Rustica</option>
            </select>
          </div>
          <div>
            <label htmlFor="pref-garden" className="block text-xs font-semibold text-slate-700 mb-1">
              Garden / Lawn Space
            </label>
            <select
              id="pref-garden"
              value={formData.preferences.garden}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, garden: e.target.value as any },
                })
              }
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
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
            <label htmlFor="bud-range" className="block text-xs font-semibold text-slate-700 mb-1">
              Target Budget Range
            </label>
            <select
              id="bud-range"
              value={formData.budget.range}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  budget: { ...formData.budget, range: e.target.value as any },
                })
              }
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            >
              <option value="15-25L">₹15 Lakhs – ₹25 Lakhs</option>
              <option value="25-40L">₹25 Lakhs – ₹40 Lakhs</option>
              <option value="40-60L">₹40 Lakhs – ₹60 Lakhs</option>
              <option value="60-100L">₹60 Lakhs – ₹1 Crore</option>
              <option value="100L+">Above ₹1 Crore</option>
            </select>
          </div>
          <div>
            <label htmlFor="bud-tier" className="block text-xs font-semibold text-slate-700 mb-1">
              Material Quality Tier
            </label>
            <select
              id="bud-tier"
              value={formData.budget.qualityTier}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  budget: { ...formData.budget, qualityTier: e.target.value as any },
                })
              }
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
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
            <label htmlFor="reg-owner" className="block text-xs font-semibold text-slate-700 mb-1">
              Owner Full Name (on Registry)
            </label>
            <input
              id="reg-owner"
              type="text"
              placeholder="e.g. Ramesh Chandra Sharma"
              value={formData.regulatory.ownerName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  regulatory: { ...formData.regulatory, ownerName: e.target.value },
                })
              }
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <label htmlFor="reg-parent" className="block text-xs font-semibold text-slate-700 mb-1">
              Father&apos;s / Spouse Name
            </label>
            <input
              id="reg-parent"
              type="text"
              placeholder="e.g. Late Shri O. P. Sharma"
              value={formData.regulatory.fatherOrSpouseName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  regulatory: { ...formData.regulatory, fatherOrSpouseName: e.target.value },
                })
              }
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="reg-khasra" className="block text-xs font-semibold text-slate-700 mb-1">
                Plot / Khasra No.
              </label>
              <input
                id="reg-khasra"
                type="text"
                placeholder="e.g. 104/A"
                value={formData.regulatory.khasraNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    regulatory: { ...formData.regulatory, khasraNumber: e.target.value },
                  })
                }
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label htmlFor="reg-khatauni" className="block text-xs font-semibold text-slate-700 mb-1">
                Khatauni No.
              </label>
              <input
                id="reg-khatauni"
                type="text"
                placeholder="e.g. 52"
                value={formData.regulatory.khatauniNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    regulatory: { ...formData.regulatory, khatauniNumber: e.target.value },
                  })
                }
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 6: Review */}
      {step === 6 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Review &amp; Generate Blueprint</h2>
          <div className="bg-slate-50 p-4 rounded-xl space-y-2.5 text-xs text-slate-700 border border-slate-200">
            <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span className="font-semibold text-slate-900">Plot Footprint:</span>
              <span>
                {formData.plot.width}&apos; × {formData.plot.length}&apos; (
                {formData.plot.width * formData.plot.length} sq ft), Facing {formData.plot.facing}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span className="font-semibold text-slate-900">Floors &amp; Structure:</span>
              <span className="font-medium text-sky-800">
                {formData.requirements.floors === 1
                  ? 'Ground Only (1 Floor)'
                  : `Ground + ${formData.requirements.floors - 1} (${formData.requirements.floors} Floors)`}
                {formData.requirements.hasBasement ? ' + Basement' : ''}
                {formData.requirements.hasTerrace ? ' + Terrace' : ''}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span className="font-semibold text-slate-900">Rooms:</span>
              <span>
                {formData.requirements.bedrooms} Bedrooms, {formData.requirements.bathrooms} Bathrooms,{' '}
                {formData.requirements.parkingSpots} Car Parking
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span className="font-semibold text-slate-900">Elevation Style:</span>
              <span>{formData.preferences.style}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span className="font-semibold text-slate-900">Authority Rules:</span>
              <span>Ghaziabad Development Authority (GDA / UPOBPAS)</span>
            </div>

            {/* Custom Wishlist Review */}
            <div className="pt-1">
              <span className="font-semibold text-slate-900 block mb-1">Your Custom House Vision:</span>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-600 italic">
                {formData.customWishlist?.trim()
                  ? `"${formData.customWishlist}"`
                  : 'No custom notes provided — generating based on standard architectural optimization.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              &larr; Back
            </button>
          ) : null}
          <a
            href="/"
            className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            Exit
          </a>
        </div>

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
