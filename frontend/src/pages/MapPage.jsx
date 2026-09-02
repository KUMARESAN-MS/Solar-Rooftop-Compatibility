import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { FiArrowRight, FiMapPin } from 'react-icons/fi'
import { motion } from 'framer-motion'
import L from 'leaflet'

// Fix for default Leaflet marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
    },
  })

  return position === null ? null : (
    <Marker position={position}></Marker>
  )
}

export default function MapPage() {
  const navigate = useNavigate()
  // Default to a central location (e.g., somewhere in the US or Europe)
  const [position, setPosition] = useState(null)
  const defaultCenter = [37.7749, -122.4194] // San Francisco

  const handleNext = () => {
    if (position) {
      navigate('/wizard', { state: { latitude: position.lat, longitude: position.lng } })
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col relative" style={{ background: 'var(--color-bg-primary)' }}>
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-6 pointer-events-none flex justify-center">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card px-6 py-4 flex items-center gap-4 text-center pointer-events-auto"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(14, 165, 233, 0.15)', color: 'var(--color-accent-400)' }}>
            <FiMapPin size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Where is your roof?</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Click on the map to drop a pin.</p>
          </div>
        </motion.div>
      </div>

      {/* Map */}
      <div className="flex-1 z-0 relative">
        <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>

      {/* Footer Overlay */}
      {position && (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] p-6 pointer-events-none flex justify-center">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-card p-6 flex flex-col md:flex-row items-center gap-6 pointer-events-auto max-w-2xl w-full justify-between"
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Selected Location</p>
              <p className="text-lg font-mono">
                {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold cursor-pointer border-none"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Confirm Location
              <FiArrowRight size={18} />
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
