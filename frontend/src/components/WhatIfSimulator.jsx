import React, { useState, useMemo } from 'react'
import { FiRotateCcw } from 'react-icons/fi'
import CurrencyDisplay from './CurrencyDisplay'

export default function WhatIfSimulator({
  originalResult,
  roofAreaSqm = 50,
  monthlyBill = 100,
  locale = 'en-US',
  currency = 'USD',
}) {
  const recommendedKw = originalResult?.recommended_system_size_kw || 3.0
  const maxRoofCapacityKw = Math.max(1.0, Math.floor((roofAreaSqm / 5.0) * 10) / 10)
  const sliderMax = Math.max(10.0, Math.min(25.0, maxRoofCapacityKw))

  const [currentKw, setCurrentKw] = useState(recommendedKw)

  const simulated = useMemo(() => {
    const ratio = currentKw / (recommendedKw || 1.0)
    const annualGen = Math.round(originalResult.annual_generation_kwh * ratio)
    const origFin = originalResult.financials
    const grossCost = Math.round(origFin.gross_cost.amount * ratio)
    const subsidy = Math.min(grossCost * 0.4, Math.round(origFin.subsidy.amount * Math.min(1.2, ratio)))
    const netCost = Math.max(0, grossCost - subsidy)
    const annualSavings = Math.round(Math.min(origFin.annual_savings.amount * ratio, monthlyBill * 12 * 1.1))
    const payback = annualSavings > 0 ? (netCost / annualSavings).toFixed(1) : '—'
    const panelsCount = Math.ceil((currentKw * 1000) / 400)
    const footprintSqm = Math.round(currentKw * 5.0)
    const roofUsagePercent = Math.min(100, Math.round((footprintSqm / (roofAreaSqm || 1)) * 100))
    const co2Saved = Number((originalResult.environmental.co2_saved_tonnes * ratio).toFixed(1))

    return {
      kw: currentKw,
      annualGen,
      grossCost,
      subsidy,
      netCost,
      annualSavings,
      payback,
      panelsCount,
      footprintSqm,
      roofUsagePercent,
      co2Saved,
      isOverRoof: footprintSqm > roofAreaSqm,
    }
  }, [currentKw, recommendedKw, originalResult, monthlyBill, roofAreaSqm])

  return (
    <div className="surface-card p-6 sm:p-8 space-y-6">
      {/* Header & Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            System Size Simulator
          </h2>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            Adjust installed capacity to see the instant impact on upfront cost, payback period, and roof fit.
          </p>
        </div>

        {currentKw !== recommendedKw && (
          <button
            type="button"
            onClick={() => setCurrentKw(recommendedKw)}
            className="btn-ghost text-xs self-start sm:self-auto"
          >
            <FiRotateCcw size={12} />
            Reset to Recommended ({recommendedKw} kW)
          </button>
        )}
      </div>

      {/* Main Interactive Capacity Slider */}
      <div
        className="p-5 rounded-xl space-y-3"
        style={{ backgroundColor: 'var(--surface-subtle)' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Selected Capacity
          </span>
          <div className="flex items-baseline gap-1">
            <span
              className="text-3xl font-extrabold tracking-tight font-sans"
              style={{ color: 'var(--accent-primary)' }}
            >
              {currentKw.toFixed(1)}
            </span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              kWp
            </span>
          </div>
        </div>

        <input
          type="range"
          min="1.0"
          max={sliderMax}
          step="0.5"
          value={currentKw}
          onChange={(e) => setCurrentKw(Number(e.target.value))}
          className="w-full"
        />

        <div className="flex justify-between text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
          <span>1.0 kWp</span>
          <span>Recommended ({recommendedKw} kWp)</span>
          <span>Max ({sliderMax} kWp)</span>
        </div>
      </div>

      {/* Real-Time Outcome Metrics (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Net Investment */}
        <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
          <span className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>
            Estimated Net Cost
          </span>
          <CurrencyDisplay
            amount={simulated.netCost}
            currency={currency}
            locale={locale}
            size="lg"
            className="text-emerald-600 dark:text-emerald-400"
          />
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
            After subsidy deduction
          </p>
        </div>

        {/* Metric 2: Payback Period */}
        <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
          <span className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>
            Payback Period
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {simulated.payback}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>years</span>
          </div>
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
            ROI break-even point
          </p>
        </div>

        {/* Metric 3: Panel Count & Space */}
        <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
          <span className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>
            Roof Space Used
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {simulated.roofUsagePercent}%
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({simulated.footprintSqm} m²)</span>
          </div>
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
            {simulated.panelsCount} panels (400W)
          </p>
        </div>

        {/* Metric 4: Annual Generation */}
        <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
          <span className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>
            Annual Generation
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {simulated.annualGen.toLocaleString()}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>kWh/yr</span>
          </div>
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
            ~{simulated.co2Saved} T CO₂ offset/yr
          </p>
        </div>
      </div>
    </div>
  )
}
