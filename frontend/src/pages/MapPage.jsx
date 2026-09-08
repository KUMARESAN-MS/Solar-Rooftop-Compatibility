import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiLayers } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import LocationPicker from '../components/LocationPicker'

export default function MapPage() {
  const navigate = useNavigate()
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [measuredRoofArea, setMeasuredRoofArea] = useState(null)

  const handlePositionSelect = (loc) => {
    setSelectedLocation(loc)
  }

  const handleRoofAreaMeasured = (area) => {
    setMeasuredRoofArea(area)
  }

  const handleConfirm = () => {
    if (selectedLocation) {
      navigate('/wizard', {
        state: {
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
          address: selectedLocation.address,
          measuredArea: measuredRoofArea,
        },
      })
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: 'var(--surface-bg)' }}>
      <Navbar />

      {/* Main Map Container */}
      <div className="flex-1 relative w-full h-full">
        <LocationPicker
          onPositionSelect={handlePositionSelect}
          onRoofAreaMeasured={handleRoofAreaMeasured}
          showSearch={true}
          showDrawTool={true}
        />

        {/* Bottom confirmation card — Calm elevation, no orange borders */}
        {selectedLocation && (
          <div className="absolute bottom-6 left-4 right-4 z-[1000] pointer-events-none flex justify-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="surface-card p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 pointer-events-auto max-w-2xl w-full shadow-xl border"
              style={{
                backgroundColor: 'var(--surface-card)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex-1 text-center md:text-left min-w-0">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--semantic-success)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    Location Confirmed
                  </span>
                  {measuredRoofArea && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-mono flex items-center gap-1"
                      style={{
                        backgroundColor: 'var(--surface-subtle)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <FiLayers size={11} /> {measuredRoofArea} m² measured
                    </span>
                  )}
                </div>

                <p
                  className="text-sm font-medium truncate"
                  title={selectedLocation.address}
                  style={{ color: 'var(--text-primary)' }}
                >
                  {selectedLocation.address}
                </p>
                <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {selectedLocation.lat.toFixed(4)}°, {selectedLocation.lng.toFixed(4)}°
                </p>
              </div>

              <button
                type="button"
                onClick={handleConfirm}
                className="btn-primary py-3 px-6 rounded-xl text-sm shrink-0 w-full md:w-auto"
              >
                Configure Property
                <FiArrowRight size={15} />
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
