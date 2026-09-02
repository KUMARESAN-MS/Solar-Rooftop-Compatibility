import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiSun } from 'react-icons/fi'
import { runAnalysis } from '../services/api'

export default function LoadingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState(null)
  
  // Get data from WizardPage
  const analysisData = location.state?.analysisData

  useEffect(() => {
    if (!analysisData) {
      navigate('/map')
      return
    }

    const performAnalysis = async () => {
      try {
        const response = await runAnalysis(analysisData)
        // Simulate a slight delay so the loading animation is visible and feels "heavy"
        setTimeout(() => {
          navigate('/results/new', { state: { result: response.data, propertyData: analysisData } })
        }, 1500)
      } catch (err) {
        console.error('Analysis failed:', err)
        setError('Failed to run analysis. The server might be offline or returned an error.')
      }
    }

    performAnalysis()
  }, [analysisData, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--gradient-hero)' }}>
      {error ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center max-w-md w-full"
        >
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
            <span className="text-xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Analysis Failed</h2>
          <p className="text-sm text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/wizard', { state: analysisData })}
            className="w-full py-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-24 h-24 rounded-full flex items-center justify-center mb-8"
            style={{ 
              background: 'rgba(249, 115, 22, 0.15)',
              boxShadow: 'var(--shadow-glow-orange)' 
            }}
          >
            <FiSun size={48} style={{ color: 'var(--color-primary-400)' }} />
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Analyzing Your Roof...
          </h2>
          
          <div className="flex flex-col gap-3 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0 }}
            >
              Fetching satellite irradiance data...
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Running physics simulations...
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              Applying ML optimization models...
            </motion.p>
          </div>
        </div>
      )}
    </div>
  )
}
