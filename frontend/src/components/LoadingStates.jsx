import React from 'react'
import { motion } from 'framer-motion'
import { FiSun } from 'react-icons/fi'

/**
 * SolarSpinner: Minimal, Apple-style pulsing solar indicator
 */
export function SolarSpinner({ size = 'md' }) {
  const sizeMap = {
    sm: { container: 'w-10 h-10', icon: 18 },
    md: { container: 'w-16 h-16', icon: 28 },
    lg: { container: 'w-20 h-20', icon: 36 },
  }
  const s = sizeMap[size] || sizeMap.md

  return (
    <div className="flex items-center justify-center">
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          rotate: 360,
        }}
        transition={{
          scale: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 16, repeat: Infinity, ease: 'linear' },
        }}
        className={`${s.container} rounded-full flex items-center justify-center`}
        style={{
          backgroundColor: 'var(--accent-surface)',
          color: 'var(--accent-primary)',
        }}
      >
        <FiSun size={s.icon} />
      </motion.div>
    </div>
  )
}

/**
 * SkeletonCard: Clean card placeholder
 */
export function SkeletonCard({ height = 'h-36', className = '' }) {
  return (
    <div className={`surface-card p-6 ${height} ${className} relative overflow-hidden flex flex-col justify-between`}>
      <div className="w-1/3 h-4 rounded" style={{ backgroundColor: 'var(--surface-subtle)' }} />
      <div className="w-2/3 h-7 rounded" style={{ backgroundColor: 'var(--surface-subtle)' }} />
      <div className="w-1/2 h-3 rounded" style={{ backgroundColor: 'var(--surface-subtle)' }} />
    </div>
  )
}

/**
 * ProgressSteps: Backward compatible step component if needed
 */
export function ProgressSteps({ currentStep = 0, steps = [] }) {
  return (
    <div className="w-full max-w-sm mx-auto text-center">
      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
        {steps[currentStep] || 'Processing your analysis...'}
      </p>
    </div>
  )
}
