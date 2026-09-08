import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { runAnalysis } from '../services/api'
import { SolarSpinner } from '../components/LoadingStates'
import ErrorMessage from '../components/ErrorMessage'

const STATUS_MESSAGES = [
  'Querying satellite solar irradiance...',
  'Computing seasonal sun angles...',
  'Simulating rooftop panel layout...',
  'Calculating electricity tariff & payback...',
  'Finalizing feasibility report...',
]

export default function LoadingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState(null)
  const [stepIndex, setStepIndex] = useState(0)

  const analysisData = location.state?.analysisData

  useEffect(() => {
    if (!analysisData) {
      navigate('/map')
      return
    }

    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < STATUS_MESSAGES.length - 1 ? prev + 1 : prev))
    }, 1100)

    let isMounted = true

    const performAnalysis = async () => {
      try {
        const response = await runAnalysis(analysisData)
        if (!isMounted) return

        setTimeout(() => {
          navigate('/results/new', {
            state: { result: response.data, propertyData: analysisData },
          })
        }, 600)
      } catch (err) {
        if (!isMounted) return
        console.error('Analysis failed:', err)
        setError(
          err.response?.data?.detail ||
          'Unable to complete solar analysis. Please check your internet connection or try another coordinates.'
        )
      }
    }

    performAnalysis()

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [analysisData, navigate])

  const handleRetry = () => {
    setError(null)
    setStepIndex(0)
    window.location.reload()
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
      style={{ backgroundColor: 'var(--surface-bg)' }}
    >
      <div className="w-full max-w-md">
        {error ? (
          <ErrorMessage
            title="Analysis Could Not Be Completed"
            message={error}
            onRetry={handleRetry}
            onBack={() => navigate('/wizard', { state: analysisData })}
            backLabel="Adjust Property Inputs"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="surface-card p-8 md:p-10 flex flex-col items-center justify-center space-y-6"
          >
            <SolarSpinner size="lg" />

            <div className="space-y-2">
              <h1
                className="text-xl sm:text-2xl font-bold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                Analyzing Rooftop Solar
              </h1>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
                {analysisData?.name || 'Your property'} • {analysisData?.roof_area_sqm} m² roof
              </p>
            </div>

            {/* Apple-style single updating line of status text */}
            <div className="h-6 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="text-xs sm:text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {STATUS_MESSAGES[stepIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
