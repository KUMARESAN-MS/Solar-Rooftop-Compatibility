import React, { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiArrowRight,
  FiArrowLeft,
  FiSun,
  FiLayers,
  FiDollarSign,
  FiCheck,
  FiMapPin,
  FiTrendingUp,
  FiShield,
  FiZap,
} from 'react-icons/fi'
import Navbar from '../components/Navbar'
import RoofAreaSelector from '../components/RoofAreaSelector'
import {
  getCurrencyForCountry,
  detectCountryCodeFromAddress,
  detectCountryFromCoordinates,
  getBillPresetsForCurrency,
  getSliderRangeForCurrency,
  getSliderLabelsForCurrency,
  getDefaultBillForCurrency,
  getEstimatedTariffForCurrency,
} from '../utils/currencyMapping'
import { formatCurrency } from '../utils/formatCurrency'

export default function WizardPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // Sensible default fallback coordinates if navigated to directly
  const defaultLat = 17.3850
  const defaultLng = 78.4867
  const defaultAddress = 'Hyderabad, Telangana, India'

  const hasLocation = Boolean(location.state?.latitude && location.state?.longitude)
  const latitude = hasLocation ? location.state.latitude : defaultLat
  const longitude = hasLocation ? location.state.longitude : defaultLng
  const address = hasLocation ? (location.state.address || '') : defaultAddress
  const measuredArea = location.state?.measuredArea || null

  // Determine country code — prefer explicit code from geocoder,
  // fall back to parsing address string, then coordinates bounding box
  const countryCode = location.state?.country_code
    || detectCountryCodeFromAddress(address)
    || detectCountryFromCoordinates(latitude, longitude)
    || 'IN' // fallback for default Hyderabad address

  // Derive currency from the country
  const currencyInfo = useMemo(() => getCurrencyForCountry(countryCode), [countryCode])
  const currencyCode = currencyInfo.code
  const currencySymbol = currencyInfo.symbol
  const currencyLocale = currencyInfo.locale

  // Currency-aware presets and slider config
  const billPresets = useMemo(() => getBillPresetsForCurrency(currencyCode), [currencyCode])
  const sliderRange = useMemo(() => getSliderRangeForCurrency(currencyCode), [currencyCode])
  const sliderLabels = useMemo(() => getSliderLabelsForCurrency(currencyCode, currencySymbol), [currencyCode, currencySymbol])
  const defaultBill = useMemo(() => getDefaultBillForCurrency(currencyCode), [currencyCode])

  const [formData, setFormData] = useState({
    name: address ? address.split(',')[0] || 'My Property' : 'My Property',
    roof_area_sqm: measuredArea || 60,
    monthly_bill: defaultBill,
  })

  const handleBillPreset = (val) => {
    setFormData((prev) => ({ ...prev, monthly_bill: val }))
  }

  // Live calculated preliminary estimations using the same sizing logic as the backend:
  // min(roof capacity limit, energy demand needed)
  const estTariff = getEstimatedTariffForCurrency(currencyCode)
  // 1. Max size that fits on the usable roof (65% realistic usable coverage, 5.0 sqm/kW)
  const maxKwRoof = Math.max(1.0, (formData.roof_area_sqm * 0.65) / 5.0)
  // 2. Size needed to offset electricity consumption
  const targetMonthlyKwh = formData.monthly_bill / Math.max(0.01, estTariff)
  const neededKw = targetMonthlyKwh / 125.0 // ~125 kWh/mo per kW
  // Sizing: min(roof limit, demand), at least 1.0 kW if roof permits
  const recommendedKw = Math.min(maxKwRoof, Math.max(1.0, neededKw))
  const estPanels = Math.max(3, Math.ceil((recommendedKw * 1000) / 400))
  const estKw = ((estPanels * 400) / 1000).toFixed(1)
  const estMonthlyGen = Math.round(Number(estKw) * 125)
  const estMonthlySavings = Math.min(formData.monthly_bill, Math.round(estMonthlyGen * estTariff))
  const billOffsetPercent = Math.min(100, Math.round((estMonthlyGen / Math.max(1, targetMonthlyKwh)) * 100))
  const estFirstYearSavings = Math.round(estMonthlySavings * 12)

  const handleSubmit = (e) => {
    e.preventDefault()
    const analysisData = {
      ...formData,
      latitude,
      longitude,
      country_code: countryCode,
      currency: currencyCode,
    }
    navigate('/loading', { state: { analysisData } })
  }

  // Number of visual panel cells to render in the mini simulation graphic (capped at 36 for visual balance)
  const visualCellsCount = Math.min(36, estPanels)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--surface-bg)' }}>
      <Navbar />

      <main className="flex-1 app-container py-10 sm:py-14 space-y-10">
        {/* Page Top Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <button
              type="button"
              onClick={() => navigate('/map')}
              className="btn-ghost text-xs pl-0 mb-2 inline-flex items-center gap-1.5"
            >
              <FiArrowLeft size={13} /> Return to Map Selection
            </button>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Configure Rooftop & Energy Consumption
            </h1>
            <p className="text-sm mt-1.5 max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Provide your usable roof boundary and power bills to size a high-yield, cost-optimal solar array.
            </p>
          </div>

          {/* Location Context Pill */}
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border shrink-0 text-xs sm:text-sm self-start sm:self-center"
            style={{ backgroundColor: 'var(--surface-subtle)', borderColor: 'var(--border-subtle)' }}
          >
            <FiMapPin className="text-amber-500 shrink-0" size={16} />
            <div className="flex flex-col">
              <span className="font-semibold truncate max-w-[240px]" style={{ color: 'var(--text-primary)' }} title={address}>
                {address}
              </span>
              <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Split Layout: Full-Width Stepped Form (8 Cols) vs Live Visual Preview (4 Cols) */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Form Stepped Sections */}
          <div className="lg:col-span-8 space-y-8">
            {/* Step 1: Property Name / Nickname */}
            <section className="surface-card space-y-5 p-6 sm:p-8">
              <div className="border-b pb-4 flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--accent-primary)' }}>
                    Step 1 of 3
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    Property Identification
                  </h2>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-lg" style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--text-secondary)' }}>
                  Record Label
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Property Name or Nickname
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3.5 rounded-xl text-sm border outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--surface-input)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="e.g. Primary Residence, Terrace Rooftop, Warehouse Office"
                  required
                />
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  This label will appear on your generated solar feasibility report and saved property records.
                </p>
              </div>
            </section>

            {/* Step 2: Rooftop Area */}
            <section className="surface-card space-y-5 p-6 sm:p-8">
              <div className="border-b pb-4 flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--accent-primary)' }}>
                    Step 2 of 3
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    Usable Rooftop Area
                  </h2>
                </div>
                <span className="text-xs font-mono font-bold" style={{ color: 'var(--accent-primary)' }}>
                  {formData.roof_area_sqm} m² Selected
                </span>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Choose the preset that closest resembles your rooftop footprint, or adjust the slider for exact measurements.
              </p>

              <RoofAreaSelector
                value={formData.roof_area_sqm}
                onChange={(val) => setFormData((prev) => ({ ...prev, roof_area_sqm: val }))}
                onOpenMapDraw={() => navigate('/map')}
              />
            </section>

            {/* Step 3: Monthly Power Bill */}
            <section className="surface-card space-y-5 p-6 sm:p-8">
              <div className="border-b pb-4 flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--accent-primary)' }}>
                    Step 3 of 3
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    Average Monthly Electricity Bill
                  </h2>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold font-mono" style={{ color: 'var(--accent-primary)' }}>
                    {currencySymbol}{formData.monthly_bill.toLocaleString()}
                  </span>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>/mo</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Your current utility bill enables our sizing engine to balance solar production against tiered grid tariffs.
              </p>

              {/* Quick Preset Buttons */}
              <div>
                <span className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Common Monthly Bill Brackets
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {billPresets.map((val) => {
                    const isSelected = formData.monthly_bill === val
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleBillPreset(val)}
                        className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold font-mono border transition-all cursor-pointer"
                        style={{
                          backgroundColor: isSelected ? 'var(--accent-surface)' : 'var(--surface-subtle)',
                          borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
                          color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                          boxShadow: isSelected ? 'var(--shadow-accent)' : 'none',
                        }}
                      >
                        {currencySymbol}{val.toLocaleString()}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Interactive Range Slider */}
              <div className="space-y-2 pt-2">
                <input
                  type="range"
                  min={sliderRange.min}
                  max={sliderRange.max}
                  step={sliderRange.step}
                  value={formData.monthly_bill}
                  onChange={(e) => setFormData((prev) => ({ ...prev, monthly_bill: Number(e.target.value) }))}
                  className="w-full"
                />

                <div className="flex justify-between text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  {sliderLabels.map((label, i) => (
                    <span key={i}>{label}</span>
                  ))}
                </div>
              </div>
            </section>

            {/* Natural Conclusion Action Bar at the end of the form */}
            <div
              className="p-6 sm:p-8 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-6"
              style={{
                backgroundColor: 'var(--surface-card)',
                borderColor: 'var(--border-subtle)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--semantic-success)' }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--semantic-success)' }}>
                    Configuration Complete
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  Ready to calculate rooftop solar feasibility?
                </h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Includes 25-year financial cashflows, satellite irradiance yield, and local subsidies.
                </p>
              </div>

              <button
                type="submit"
                className="btn-primary py-4 px-8 text-sm sm:text-base font-bold rounded-xl shadow-lg shrink-0 w-full sm:w-auto"
              >
                Run Solar & Financial Analysis
                <FiArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Right Column: Live Interactive Visual Preview (Sticky) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div
              className="surface-card p-6 space-y-6"
              style={{ boxShadow: 'var(--shadow-md)' }}
            >
              {/* Header */}
              <div className="border-b pb-4 flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--accent-primary)' }}>
                    Live Configuration Preview
                  </span>
                  <h3 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    Preliminary Estimation
                  </h3>
                </div>
                <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-primary)' }} />
              </div>

              {/* Dynamic Rooftop Solar Array Visualizer */}
              <div
                className="p-4 rounded-xl border relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--surface-subtle)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-3">
                  <span style={{ color: 'var(--text-primary)' }}>Visual Rooftop Simulation</span>
                  <span className="font-mono text-amber-500 font-bold">
                    {estPanels} Panels
                  </span>
                </div>

                {/* Rooftop Panel Grid Representation */}
                <div
                  className="rounded-lg p-3 border grid grid-cols-6 gap-1.5 min-h-[140px] items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    borderColor: 'rgba(245, 158, 11, 0.25)',
                  }}
                >
                  {Array.from({ length: visualCellsCount }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.15, delay: (i % 6) * 0.02 }}
                      className="aspect-[3/4] rounded-sm relative border border-amber-400/40 shadow-xs"
                      style={{
                        background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)',
                      }}
                    >
                      <div className="absolute inset-0 grid grid-cols-2 grid-rows-3 gap-[1px] opacity-40">
                        <div className="border-b border-r border-amber-300/30" />
                        <div className="border-b border-amber-300/30" />
                        <div className="border-b border-r border-amber-300/30" />
                        <div className="border-b border-amber-300/30" />
                        <div className="border-r border-amber-300/30" />
                        <div />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] mt-3" style={{ color: 'var(--text-muted)' }}>
                  <span>Array footprint: ~{Math.round(estPanels * 2.0)} m²</span>
                  <span>Roof coverage: ~{Math.min(100, Math.round(((estPanels * 2.0) / formData.roof_area_sqm) * 100))}%</span>
                </div>
              </div>

              {/* Preliminary Calculated Metrics List */}
              <div className="space-y-3">
                <div
                  className="p-3.5 rounded-xl border flex items-center justify-between"
                  style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--surface-subtle)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent-surface)', color: 'var(--accent-primary)' }}>
                      <FiSun size={18} />
                    </div>
                    <div>
                      <span className="text-xs block" style={{ color: 'var(--text-muted)' }}>Recommended Array</span>
                      <span className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                        ~{estKw} kWp
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {estPanels} panels
                  </span>
                </div>

                <div
                  className="p-3.5 rounded-xl border flex items-center justify-between"
                  style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--surface-subtle)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--semantic-success-surface)', color: 'var(--semantic-success)' }}>
                      <FiZap size={18} />
                    </div>
                    <div>
                      <span className="text-xs block" style={{ color: 'var(--text-muted)' }}>Est. Monthly Output</span>
                      <span className="text-lg font-bold font-mono" style={{ color: 'var(--semantic-success)' }}>
                        ~{estMonthlyGen} kWh
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono" style={{ color: 'var(--semantic-success)' }}>
                    ~{billOffsetPercent}% offset
                  </span>
                </div>

                <div
                  className="p-3.5 rounded-xl border flex items-center justify-between"
                  style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--surface-subtle)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--semantic-info-surface)', color: 'var(--semantic-info)' }}>
                      <FiDollarSign size={18} />
                    </div>
                    <div>
                      <span className="text-xs block" style={{ color: 'var(--text-muted)' }}>Est. Year 1 Savings</span>
                      <span className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                        ~{formatCurrency(estFirstYearSavings, currencyCode, currencyLocale)}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    ~{formatCurrency(estMonthlySavings, currencyCode, currencyLocale)}/mo
                  </span>
                </div>
              </div>

              {/* Explanatory Note */}
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Upon launching analysis, our physics engine queries 16-year satellite irradiance records (PVGIS) for your exact rooftop coordinates.
              </p>

              {/* Main Submit Action */}
              <button
                type="submit"
                className="btn-primary w-full py-4 text-sm font-bold rounded-xl shadow-lg cursor-pointer"
              >
                Run Solar & Financial Analysis
                <FiArrowRight size={16} />
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}


