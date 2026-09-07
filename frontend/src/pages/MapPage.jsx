import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import { FiArrowRight, FiMapPin, FiSearch, FiNavigation, FiLoader } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import L from 'leaflet'
import { reverseGeocode, searchLocation } from '../services/api'

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

// Component to handle map clicks and moving the map view programmatically
function MapController({ position, setPosition }) {
  const map = useMap()
  
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom())
    }
  }, [position, map])

  useMapEvents({
    click(e) {
      setPosition(e.latlng)
    },
  })

  return null
}

export default function MapPage() {
  const navigate = useNavigate()
  const [position, setPosition] = useState(null)
  const [address, setAddress] = useState('')
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false)
  const defaultCenter = [37.7749, -122.4194] // San Francisco
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true)
        try {
          const res = await searchLocation(searchQuery)
          setSearchResults(res.data)
          setShowDropdown(true)
        } catch (error) {
          console.error("Search failed", error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setShowDropdown(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  // Reverse geocode when position changes
  useEffect(() => {
    const fetchAddress = async () => {
      if (position) {
        setIsReverseGeocoding(true)
        try {
          const res = await reverseGeocode(position.lat, position.lng)
          setAddress(res.data.display_name)
        } catch (error) {
          console.error("Reverse geocoding failed", error)
          setAddress(`${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`)
        } finally {
          setIsReverseGeocoding(false)
        }
      }
    }
    fetchAddress()
  }, [position])

  const handleNext = () => {
    if (position) {
      navigate('/wizard', { state: { latitude: position.lat, longitude: position.lng, address } })
    }
  }

  const handleGeolocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      }, (error) => {
        alert("Failed to get location. Please check your browser permissions.")
      })
    } else {
      alert("Geolocation is not supported by your browser.")
    }
  }

  const handleSelectResult = (result) => {
    setPosition({ lat: result.latitude, lng: result.longitude })
    setSearchQuery(result.display_name)
    setShowDropdown(false)
  }

  return (
    <div className="h-screen w-screen flex flex-col relative" style={{ background: 'var(--color-bg-primary)' }}>
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-6 pointer-events-none flex justify-center">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card px-6 py-4 flex flex-col md:flex-row items-center gap-4 text-center pointer-events-auto max-w-4xl w-full"
        >
          <div className="flex items-center gap-4 w-full md:w-auto shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(14, 165, 233, 0.15)', color: 'var(--color-accent-400)' }}>
              <FiMapPin size={20} />
            </div>
            <div className="text-left hidden md:block">
              <h2 className="text-xl font-bold">Where is your roof?</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Click map or search to drop a pin.</p>
            </div>
          </div>
          
          <div className="flex-1 w-full flex gap-2 relative">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                {isSearching ? <FiLoader className="animate-spin" /> : <FiSearch />}
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2 rounded-lg border-none focus:ring-2 focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--color-text-primary)', ringColor: 'var(--color-accent-500)' }}
                placeholder="Search for an address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if(searchResults.length > 0) setShowDropdown(true) }}
              />
              
              <AnimatePresence>
                {showDropdown && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 rounded-lg shadow-xl overflow-hidden glass-card"
                  >
                    {searchResults.map((res, i) => (
                      <div
                        key={i}
                        className="p-3 text-sm text-left cursor-pointer border-b border-white/10 last:border-0 hover:bg-white/10 transition-colors"
                        onClick={() => handleSelectResult(res)}
                      >
                        {res.display_name}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button 
              onClick={handleGeolocation}
              className="p-2 rounded-lg flex items-center justify-center cursor-pointer border-none bg-white/10 hover:bg-white/20 transition-colors text-white"
              title="Use My Location"
            >
              <FiNavigation size={20} />
            </button>
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
          <MapController position={position} setPosition={setPosition} />
          {position && (
            <Marker 
              position={position} 
              draggable={true} 
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target
                  setPosition(marker.getLatLng())
                }
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Footer Overlay */}
      {position && (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] p-6 pointer-events-none flex justify-center">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-card p-6 flex flex-col md:flex-row items-center gap-6 pointer-events-auto max-w-3xl w-full justify-between"
          >
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Selected Location</p>
              {isReverseGeocoding ? (
                <div className="flex items-center gap-2 mt-1 justify-center md:justify-start">
                  <FiLoader className="animate-spin text-sm" />
                  <span className="text-sm">Finding address...</span>
                </div>
              ) : (
                <p className="text-sm mt-1 line-clamp-2" title={address}>
                  {address}
                </p>
              )}
              <p className="text-xs mt-1 opacity-60 font-mono">
                {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold cursor-pointer border-none shrink-0"
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
