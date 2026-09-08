import React, { useState } from 'react'
import { FiShield } from 'react-icons/fi'

export default function RealityCheck({
  annualGenerationKwh = 5000,
  systemSizeKw = 3.0,
}) {
  const [shadeLevel, setShadeLevel] = useState('none')
  const [roofType, setRoofType] = useState('flat')

  const shadeFactors = {
    none: { label: 'Zero Shade', factor: 1.0, impactText: 'Optimal 100% solar radiation capture throughout the day.' },
    minor: { label: 'Minor / Seasonal Shade', factor: 0.92, impactText: 'Expect ~8% loss from nearby trees, parapet walls, or low winter angles.' },
    heavy: { label: 'Partial / Heavy Shade', factor: 0.78, impactText: 'Expect ~22% loss. We strongly recommend microinverters or DC power optimizers.' },
  }

  const adjustedGeneration = Math.round(annualGenerationKwh * shadeFactors[shadeLevel].factor)

  const roofTypes = {
    flat: {
      name: 'Flat Concrete Roof',
      racking: 'Ballasted or anchor mountings',
      tilt: 'Elevated 15°–25° for rain drainage and optimal solar yield',
      notes: 'Most common in urban homes. Ideal for easy panel maintenance and washing.',
    },
    metal: {
      name: 'Metal / Standing Seam',
      racking: 'Direct non-penetrating clamping',
      tilt: 'Flush with existing roof slope',
      notes: 'Fastest installation, lightweight, zero leak risk with modern seam clamps.',
    },
    tile: {
      name: 'Clay / Concrete Tile',
      racking: 'Stainless steel tile hooks to rafters',
      tilt: 'Matches existing pitch',
      notes: 'Requires careful tile bracket placement to ensure complete weather sealing.',
    },
  }

  return (
    <div className="surface-card p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Practical Installation Factors
        </h2>
        <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Real-world rooftop performance factors to verify before obtaining installer quotes.
        </p>
      </div>

      {/* Grid of 4 Key Practical Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Factor 1: Shading Sensitivity */}
        <div className="p-5 rounded-xl border space-y-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            1. Shading & Obstacles
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Select your roof condition to observe generation derating:
          </p>

          <div className="flex gap-2">
            {Object.entries(shadeFactors).map(([key, info]) => {
              const isSelected = shadeLevel === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setShadeLevel(key)}
                  className="flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border cursor-pointer transition-colors"
                  style={{
                    backgroundColor: isSelected ? 'var(--accent-surface)' : 'var(--surface-subtle)',
                    borderColor: isSelected ? 'var(--accent-primary)' : 'transparent',
                    color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {info.label.split('/')[0]}
                </button>
              )
            })}
          </div>

          <div className="p-3 rounded-lg text-xs leading-relaxed" style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--text-secondary)' }}>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Adjusted Yield: </span>
            {adjustedGeneration.toLocaleString()} kWh/yr ({Math.round(shadeFactors[shadeLevel].factor * 100)}% baseline). {shadeFactors[shadeLevel].impactText}
          </div>
        </div>

        {/* Factor 2: Roof Pitch & Mounting */}
        <div className="p-5 rounded-xl border space-y-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            2. Roof Construction Type
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Mounting structure requirements vary by surface:
          </p>

          <div className="flex gap-2">
            {Object.entries(roofTypes).map(([key, info]) => {
              const isSelected = roofType === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRoofType(key)}
                  className="flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border cursor-pointer transition-colors"
                  style={{
                    backgroundColor: isSelected ? 'var(--accent-surface)' : 'var(--surface-subtle)',
                    borderColor: isSelected ? 'var(--accent-primary)' : 'transparent',
                    color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {key === 'flat' ? 'Flat Roof' : key === 'metal' ? 'Metal' : 'Tile'}
                </button>
              )
            })}
          </div>

          <div className="p-3 rounded-lg text-xs space-y-1" style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--text-secondary)' }}>
            <p><strong style={{ color: 'var(--text-primary)' }}>Racking: </strong>{roofTypes[roofType].racking}</p>
            <p><strong style={{ color: 'var(--text-primary)' }}>Tilt Angle: </strong>{roofTypes[roofType].tilt}</p>
            <p><strong style={{ color: 'var(--text-primary)' }}>Note: </strong>{roofTypes[roofType].notes}</p>
          </div>
        </div>

        {/* Factor 3: Grid Net Metering Policy */}
        <div className="p-5 rounded-xl border space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            3. Grid Net Metering vs Gross Metering
          </h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            In a 1:1 net metering framework, energy produced during daytime runs your meter backward at full retail tariff rates. In gross metering or feed-in systems, exported power is credited at lower avoided-cost rates.
          </p>
          <div className="text-[11px] pt-1" style={{ color: 'var(--text-muted)' }}>
            Tip: Sizing your system to meet 80–100% of daytime consumption minimizes export risk.
          </div>
        </div>

        {/* Factor 4: 25-Year Degradation Warranty */}
        <div className="p-5 rounded-xl border space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            4. 25-Year Equipment Longevity
          </h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Tier-1 monocrystalline panels feature linear degradation warranties guaranteeing &ge;84% rated power output after 25 operational years (annual degradation typically 0.4%–0.55%/year).
          </p>
          <div className="text-[11px] pt-1" style={{ color: 'var(--text-muted)' }}>
            Inverters typically require replacement or service once between Year 10 and Year 15.
          </div>
        </div>
      </div>
    </div>
  )
}
