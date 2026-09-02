import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiHome, FiDollarSign, FiMaximize } from 'react-icons/fi'

export default function WizardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get coordinates from MapPage
  const { latitude, longitude } = location.state || { latitude: null, longitude: null }
  
  const [formData, setFormData] = useState({
    name: 'My Property',
    roof_area_sqm: 50,
    monthly_bill: 100,
  })

  // If no coordinates, redirect back to map
  if (latitude === null || longitude === null) {
    navigate('/map')
    return null
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' ? value : Number(value)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Combine location with form data
    const analysisData = {
      ...formData,
      latitude,
      longitude
    }
    
    // Navigate to loading screen with data
    navigate('/loading', { state: { analysisData } })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--gradient-hero)' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-lg p-8 relative overflow-hidden"
      >
        <div 
          className="absolute top-0 left-0 w-full h-1" 
          style={{ background: 'var(--gradient-primary)' }}
        />
        
        <h2 className="text-3xl font-bold mb-2 text-center" style={{ fontFamily: 'var(--font-display)' }}>
          Property Details
        </h2>
        <p className="text-center mb-8 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Tell us a bit about your roof and current electricity usage to get an accurate analysis.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Name */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <FiHome className="text-gray-400" />
              Property Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-transparent border rounded-lg px-4 py-3 focus:outline-none"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              required
            />
          </div>

          {/* Roof Area */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <FiMaximize className="text-gray-400" />
              Available Roof Area (m²)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                name="roof_area_sqm"
                min="10"
                max="500"
                step="5"
                value={formData.roof_area_sqm}
                onChange={handleChange}
                className="w-full accent-orange-500"
              />
              <span className="font-mono text-xl w-16 text-right">
                {formData.roof_area_sqm}
              </span>
            </div>
          </div>

          {/* Monthly Bill */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <FiDollarSign className="text-gray-400" />
              Average Monthly Electricity Bill ($)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                name="monthly_bill"
                min="20"
                max="1000"
                step="10"
                value={formData.monthly_bill}
                onChange={handleChange}
                className="w-full accent-orange-500"
              />
              <span className="font-mono text-xl w-16 text-right">
                ${formData.monthly_bill}
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-lg text-white font-semibold mt-8 border-none"
            style={{ background: 'var(--gradient-primary)' }}
          >
            Generate Analysis
            <FiArrowRight size={18} />
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
