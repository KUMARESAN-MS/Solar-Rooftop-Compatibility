import React from 'react'
import { FiSliders, FiMaximize2, FiCheck } from 'react-icons/fi'

// Real-world relatable presets with accurate typical metrics
export const ROOF_PRESETS = [
  {
    id: 'compact',
    label: 'Apartment Terrace',
    area: 30,
    icon: '🏢',
    desc: 'Terrace or flat apartment roof',
    panels: '8–12 panels',
    typicalCap: '3–4 kWp',
  },
  {
    id: 'townhouse',
    label: 'Townhouse',
    area: 60,
    icon: '🏡',
    desc: 'Urban row house or semi-detached',
    panels: '18–24 panels',
    typicalCap: '7–9 kWp',
  },
  {
    id: 'detached',
    label: 'Single Family Home',
    area: 120,
    icon: '🏠',
    desc: 'Suburban detached home',
    panels: '35–48 panels',
    typicalCap: '14–18 kWp',
  },
  {
    id: 'villa',
    label: 'Large Estate / Villa',
    area: 250,
    icon: '🏰',
    desc: 'Expansive multi-slope residence',
    panels: '75–100 panels',
    typicalCap: '30–40 kWp',
  },
]

export default function RoofAreaSelector({
  value = 60,
  onChange,
  onOpenMapDraw = null,
}) {
  const matchingPreset = ROOF_PRESETS.find((p) => p.area === value)

  const handleSelectPreset = (presetArea) => {
    onChange(presetArea)
  }

  const handleSliderChange = (e) => {
    onChange(Number(e.target.value))
  }

  return (
    <div className="space-y-6">
      {/* Preset Cards Grid — Large, responsive, tappable cards that fill width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {ROOF_PRESETS.map((preset) => {
          const isSelected = value === preset.area
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset.area)}
              className="p-5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between group hover:border-amber-500/60"
              style={{
                backgroundColor: isSelected ? 'var(--accent-surface)' : 'var(--surface-subtle)',
                borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
                boxShadow: isSelected ? 'var(--shadow-accent)' : 'none',
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl p-1.5 rounded-xl transition-transform group-hover:scale-110">
                    {preset.icon}
                  </span>
                  {isSelected ? (
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                      style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}
                    >
                      <FiCheck size={13} />
                    </span>
                  ) : (
                    <span
                      className="w-5 h-5 rounded-full border border-dashed"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    />
                  )}
                </div>

                <h4
                  className="text-base font-bold tracking-tight mb-1"
                  style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}
                >
                  {preset.label}
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {preset.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                <div>
                  <span className="text-base font-extrabold font-mono" style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                    {preset.area} m²
                  </span>
                  <span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>
                    ~{Math.round(preset.area * 10.764)} sq ft
                  </span>
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                  style={{
                    backgroundColor: isSelected ? 'var(--surface-card)' : 'var(--surface-card)',
                    color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {preset.typicalCap}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Integrated Fine-Tuning Slider Section */}
      <div
        className="p-5 sm:p-6 rounded-2xl border space-y-4"
        style={{
          backgroundColor: 'var(--surface-subtle)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FiSliders className="text-amber-500" size={16} />
            <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Fine-Tune Exact Usable Area
            </span>
            {matchingPreset && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                Preset: {matchingPreset.label}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono" style={{ color: 'var(--accent-primary)' }}>
              {value} m²
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              (~{Math.round(value * 10.764).toLocaleString()} sq ft)
            </span>
          </div>
        </div>

        <input
          type="range"
          min="15"
          max="500"
          step="5"
          value={value}
          onChange={handleSliderChange}
          className="w-full"
        />

        <div className="flex justify-between text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          <span>15 m² (Apartment)</span>
          <span>60 m² (Townhouse)</span>
          <span>120 m² (Single Family)</span>
          <span>250 m² (Estate)</span>
          <span>500 m² (Commercial)</span>
        </div>

        {onOpenMapDraw && (
          <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Prefer to measure directly on satellite imagery?
            </span>
            <button
              type="button"
              onClick={onOpenMapDraw}
              className="btn-ghost py-1.5 px-3 text-xs inline-flex items-center gap-1.5"
            >
              <FiMaximize2 size={13} />
              Open Map Polygon Tool
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
