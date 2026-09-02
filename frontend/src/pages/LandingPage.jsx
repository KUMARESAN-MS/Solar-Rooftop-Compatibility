import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { checkHealth } from '../services/api'
import { FiSun, FiCpu, FiDollarSign, FiArrowRight } from 'react-icons/fi'

const features = [
  {
    icon: <FiSun size={28} />,
    title: 'Location-Aware',
    description: 'Real solar irradiance data for your exact coordinates, pulled from global satellite databases.',
  },
  {
    icon: <FiCpu size={28} />,
    title: 'AI-Powered',
    description: 'Physics-based calculations refined by machine learning for more accurate generation estimates.',
  },
  {
    icon: <FiDollarSign size={28} />,
    title: 'Transparent Results',
    description: 'Clear financials with cited assumptions — see exactly how every number was calculated.',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
  }),
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [backendStatus, setBackendStatus] = useState(null)

  useEffect(() => {
    checkHealth()
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('offline'))
  }, [])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--gradient-hero)' }}>
      {/* Ambient background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'var(--color-primary-500)', top: '-10%', right: '-10%' }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]"
          style={{ background: 'var(--color-accent-500)', bottom: '-5%', left: '-5%' }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <FiSun className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Solar<span className="gradient-text">Predict</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          {backendStatus && (
            <span
              className="text-xs px-3 py-1 rounded-full flex items-center gap-1.5"
              style={{
                background: backendStatus === 'connected'
                  ? 'rgba(34, 197, 94, 0.15)'
                  : 'rgba(239, 68, 68, 0.15)',
                color: backendStatus === 'connected'
                  ? 'var(--color-success-400)'
                  : '#EF4444',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: backendStatus === 'connected'
                    ? 'var(--color-success-400)'
                    : '#EF4444',
                }}
              />
              API {backendStatus === 'connected' ? 'Connected' : 'Offline'}
            </span>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-8"
            style={{
              background: 'rgba(249, 115, 22, 0.1)',
              border: '1px solid rgba(249, 115, 22, 0.25)',
              color: 'var(--color-primary-400)',
            }}
          >
            <FiSun size={14} />
            AI-Powered Solar Analysis
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Is solar{' '}
            <span className="gradient-text">worth it</span>
            <br />
            for your roof?
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-lg md:text-xl max-w-xl mx-auto mb-10"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Drop a pin. Answer 3 questions. Get a complete solar analysis —
            system size, savings, payback period, and environmental impact —
            powered by real data and AI.
          </motion.p>

          {/* CTA Button */}
          <motion.button
            variants={fadeUp}
            custom={3}
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(249, 115, 22, 0.35)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/map')}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-white font-semibold text-lg cursor-pointer border-none"
            style={{ background: 'var(--gradient-primary)' }}
            id="cta-analyze"
          >
            Analyze Your Roof
            <FiArrowRight size={20} />
          </motion.button>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-20 mb-12 w-full"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              custom={i + 4}
              className="glass-card p-6 text-left"
              whileHover={{ y: -4, borderColor: 'rgba(249, 115, 22, 0.3)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(249, 115, 22, 0.12)', color: 'var(--color-primary-400)' }}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer
        className="relative z-10 text-center py-6 text-sm"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Solar Rooftop Prediction System — Academic Project
      </footer>
    </div>
  )
}
