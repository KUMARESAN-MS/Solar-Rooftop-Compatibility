import React from 'react'
import { motion } from 'framer-motion'
import { FiAlertTriangle, FiRefreshCw, FiArrowLeft } from 'react-icons/fi'

export default function ErrorMessage({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while processing your request.',
  onRetry = null,
  onBack = null,
  backLabel = 'Go Back',
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`surface-card p-8 text-center max-w-md w-full mx-auto space-y-4 ${className}`}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
        style={{
          backgroundColor: 'var(--semantic-danger-surface)',
          color: 'var(--semantic-danger)',
        }}
      >
        <FiAlertTriangle size={22} />
      </div>

      <div className="space-y-1">
        <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="btn-primary py-2 px-4 text-xs sm:text-sm w-full sm:w-auto"
          >
            <FiRefreshCw size={14} /> Try Again
          </button>
        )}

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary py-2 px-4 text-xs sm:text-sm w-full sm:w-auto"
          >
            <FiArrowLeft size={14} /> {backLabel}
          </button>
        )}
      </div>
    </motion.div>
  )
}
