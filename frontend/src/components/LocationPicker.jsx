import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polygon, useMap, useMapEvents } from 'react-leaflet'
import { FiMapPin, FiSearch, FiNavigation, FiMaximize, FiCheck, FiInfo } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import L from 'leaflet'
import { reverseGeocode, searchLocation } from '../services/api'

// Leaflet default icon fix
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

// Calculate geodesic area of polygon in square meters
function calculatePolygonArea(latlngs) {
  if (!latlngs || latlngs.length < 3) return 0
  const points = latlngs.map(p => [p.lat, p.lng])
  const earthRadius = 6378137 // meters
  let area = 0

  if (points.length > 2) {
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i]
      const p2 = points[(i + 1) % points.length]
      area += ((p2[1] - p1[1]) * Math.PI / 180) *
              (2 + Math.sin(p1[0] * Math.PI / 180) + Math.sin(p2[0] * Math.PI / 180))
    }
    area = Math.abs((area * earthRadius * earthRadius) / 2.0)
  }
  return Math.round(area)
}

function MapController({ position, setPosition, isDrawing, addPolygonPoint }) {
  const map = useMap()

  useEffect(() => {
    if (position && !isDrawing) {
      map.flyTo(position, Math.max(map.getZoom(), 16), { duration: 1.2 })
    }
  }, [position, map, isDrawing])

  useMapEvents({
    click(e) {
      if (isDrawing) {
        addPolygonPoint(e.latlng)
      } else {
        setPosition(e.latlng)
      }
    },
  })

  return null
}

export default function LocationPicker({
  initialPosition = null,
  onPositionSelect,
  onRoofAreaMeasured = null,
  showSearch = true,
  showDrawTool = true,
  height = '100%',
  className = '',
}) {
  const [position, setPosition] = useState(initialPosition)
  const [address, setAddress] = useState('')
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false)
  const defaultCenter = [17.3850, 78.4867]

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  // Draw polygon state
  const [isDrawing, setIsDrawing] = useState(false)
  const [polygonPoints, setPolygonPoints] = useState([])
  const [measuredArea, setMeasuredArea] = useState(0)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true)
        try {
          const res = await searchLocation(searchQuery)
          setSearchResults(res.data || [])
          setShowDropdown(true)
        } catch (error) {
          console.error('Search failed', error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setShowDropdown(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reverse geocode when position changes
  useEffect(() => {
    const fetchAddress = async () => {
      if (position) {
        setIsReverseGeocoding(true)
        try {
          const res = await reverseGeocode(position.lat, position.lng)
          const name = res.data?.display_name || `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`
          setAddress(name)
          if (onPositionSelect) {
            onPositionSelect({ lat: position.lat, lng: position.lng, address: name })
          }
        } catch (error) {
          const fallback = `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`
          setAddress(fallback)
          if (onPositionSelect) {
            onPositionSelect({ lat: position.lat, lng: position.lng, address: fallback })
          }
        } finally {
          setIsReverseGeocoding(false)
        }
      }
    }
    fetchAddress()
  }, [position])

  const handleSelectResult = (res) => {
    const lat = parseFloat(res.lat)
    const lng = parseFloat(res.lon)
    const newPos = { lat, lng }
    setPosition(newPos)
    setAddress(res.display_name)
    setShowDropdown(false)
    setSearchQuery('')
    if (onPositionSelect) {
      onPositionSelect({ lat, lng, address: res.display_name })
    }
  }

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setPosition(newPos)
        },
        () => alert('Unable to retrieve your location. Please drop a pin manually on the map.')
      )
    }
  }

  const addPolygonPoint = (latlng) => {
    const updated = [...polygonPoints, latlng]
    setPolygonPoints(updated)
    if (updated.length >= 3) {
      const area = calculatePolygonArea(updated)
      setMeasuredArea(area)
      if (onRoofAreaMeasured) onRoofAreaMeasured(area)
    }
  }

  const mapCenter = position ? [position.lat, position.lng] : defaultCenter

  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ height }}>
      {/* Top Search & Controls Bar */}
      {showSearch && (
        <div className="absolute top-4 left-4 right-4 z-[1000] flex justify-center pointer-events-none">
          <div className="w-full max-w-xl flex items-center gap-2 pointer-events-auto">
            {/* Search Input Container */}
            <div className="relative flex-1">
              <div
                className="surface-card flex items-center px-3.5 py-2.5 rounded-xl shadow-lg border"
                style={{
                  backgroundColor: 'var(--surface-card)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <FiSearch className="text-gray-400 mr-2.5 shrink-0" size={16} />
                <input
                  type="text"
                  className="w-full bg-transparent border-none outline-none text-sm"
                  style={{ color: 'var(--text-primary)' }}
                  placeholder="Search street, landmark, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if (searchResults.length > 0) setShowDropdown(true) }}
                />
              </div>

              {/* Autocomplete Dropdown */}
              <AnimatePresence>
                {showDropdown && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute top-full left-0 right-0 mt-1.5 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto border z-50"
                    style={{
                      backgroundColor: 'var(--surface-card)',
                      borderColor: 'var(--border-subtle)',
                    }}
                  >
                    {searchResults.map((res, i) => (
                      <div
                        key={i}
                        className="px-4 py-2.5 text-xs text-left cursor-pointer transition-colors border-b last:border-0"
                        style={{
                          borderColor: 'var(--border-subtle)',
                          color: 'var(--text-secondary)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--surface-subtle)'
                          e.currentTarget.style.color = 'var(--text-primary)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.color = 'var(--text-secondary)'
                        }}
                        onClick={() => handleSelectResult(res)}
                      >
                        {res.display_name}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Geolocation Button */}
            <button
              type="button"
              onClick={handleGeolocation}
              className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer border transition-colors shadow-sm shrink-0"
              style={{
                backgroundColor: 'var(--surface-card)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
              title="Use current location"
            >
              <FiNavigation size={15} />
            </button>

            {/* Polygon Draw Tool */}
            {showDrawTool && (
              <button
                type="button"
                onClick={() => {
                  setIsDrawing(!isDrawing)
                  if (!isDrawing) setPolygonPoints([])
                }}
                className="h-10 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer border transition-colors shadow-sm shrink-0"
                style={{
                  backgroundColor: isDrawing ? 'var(--accent-primary)' : 'var(--surface-card)',
                  borderColor: isDrawing ? 'var(--accent-primary)' : 'var(--border-subtle)',
                  color: isDrawing ? '#FFFFFF' : 'var(--text-primary)',
                }}
                title="Trace roof boundary"
              >
                <FiMaximize size={14} />
                <span className="hidden sm:inline">{isDrawing ? 'Done Tracing' : 'Trace Roof'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Drawing mode banner */}
      {isDrawing && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
          <div
            className="surface-card px-4 py-2 rounded-full text-xs font-medium shadow-md flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Click corners of your roof to trace area ({polygonPoints.length} points • {measuredArea} m²)</span>
          </div>
        </div>
      )}

      {/* Leaflet Map */}
      <MapContainer
        center={mapCenter}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          position={position}
          setPosition={setPosition}
          isDrawing={isDrawing}
          addPolygonPoint={addPolygonPoint}
        />

        {position && !isDrawing && (
          <Marker
            position={[position.lat, position.lng]}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target
                const newPos = marker.getLatLng()
                setPosition(newPos)
              },
            }}
          />
        )}

        {polygonPoints.length > 1 && (
          <Polygon
            positions={polygonPoints.map(p => [p.lat, p.lng])}
            pathOptions={{
              color: '#D97706',
              fillColor: '#F59E0B',
              fillOpacity: 0.25,
              weight: 2,
            }}
          />
        )}
      </MapContainer>
    </div>
  )
}
