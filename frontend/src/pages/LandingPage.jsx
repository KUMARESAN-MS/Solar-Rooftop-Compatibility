import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FiArrowRight, FiSun, FiMapPin, FiShield, FiTrendingUp } from 'react-icons/fi'
import Navbar from '../components/Navbar'

const features = [
  {
    icon: <FiMapPin size={20} />,
    title: 'Location-Specific Irradiance',
    description: 'Direct integration with global satellite climate databases (PVGIS / NASA POWER) for accurate solar radiation.',
  },
  {
    icon: <FiSun size={20} />,
    title: 'Physics-Based Generation',
    description: 'Hourly insolation angles, panel temperature coefficients, and system losses computed down to the kilowatt-hour.',
  },
  {
    icon: <FiTrendingUp size={20} />,
    title: 'Clear Financial Modeling',
    description: 'Realistic 25-year cash flows with domestic tariff slabs, state subsidies, and transparent net metering assumptions.',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: 'var(--surface-bg)' }}>
      <Navbar />

      {/* Subtle background radial ambient glow — restrained & elegant */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[480px] pointer-events-none opacity-40 dark:opacity-25 blur-3xl"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(217, 119, 6, 0.15) 0%, rgba(217, 119, 6, 0) 70%)',
        }}
      />

      {/* Hero Section — Real Full Page Container */}
      <main className="flex-1 w-full">
        <section className="app-container pt-16 sm:pt-20 pb-16 text-center flex flex-col items-center">
          {/* Subtle pill tag */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{
              backgroundColor: 'var(--accent-surface)',
              color: 'var(--accent-primary)',
            }}
          >
            <FiShield size={14} />
            Satellite Climate Data & Physics Engine
          </motion.div>

          {/* Hero Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl"
            style={{ color: 'var(--text-primary)', lineHeight: 1.12 }}
          >
            Is solar worth it <br className="hidden sm:inline" />
            for your rooftop?
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Drop a pin on your building. Answer three quick questions. Receive an unbiased rooftop feasibility report — system size, true cost, bill offset, and payback period.
          </motion.p>

          {/* Primary Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mb-16"
          >
            <button
              onClick={() => navigate('/map')}
              className="btn-primary text-base py-3.5 px-8 rounded-full shadow-lg"
              id="cta-analyze"
            >
              Analyze Your Roof
              <FiArrowRight size={18} />
            </button>
          </motion.div>

          {/* 3 Balanced Feature Cards Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
          >
            {features.map((feature) => (
              <div
                key={feature.title}
                className="surface-card flex flex-col justify-start"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    backgroundColor: 'var(--surface-subtle)',
                    color: 'var(--accent-primary)',
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  className="text-base font-bold tracking-tight mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="py-8 text-center text-xs border-t"
        style={{
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-muted)',
        }}
      >
        SolarPredict Rooftop Feasibility Analysis System • Academic Research Project
      </footer>
    </div>
  )
}
