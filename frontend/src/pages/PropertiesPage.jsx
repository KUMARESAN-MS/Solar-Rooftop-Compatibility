import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiTrash2, FiMapPin, FiLayers } from 'react-icons/fi'
import { getProperties, deleteProperty } from '../services/api'
import Navbar from '../components/Navbar'
import { SkeletonCard } from '../components/LoadingStates'

export default function PropertiesPage() {
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const res = await getProperties()
      setProperties(res.data || [])
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login')
      } else {
        console.error('Failed to fetch properties', err)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this property?')) return

    try {
      await deleteProperty(id)
      setProperties(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error('Failed to delete property', err)
      alert('Failed to delete property.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--surface-bg)' }}>
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Saved Properties
            </h1>
            <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Previously evaluated rooftops and solar feasibility records.
            </p>
          </div>

          <button
            onClick={() => navigate('/map')}
            className="btn-primary py-2 px-4 text-xs sm:text-sm"
          >
            <FiPlus size={14} /> Add New Roof
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : properties.length === 0 ? (
          <div className="surface-card p-12 text-center max-w-md mx-auto space-y-4">
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              No saved properties yet.
            </p>
            <button
              onClick={() => navigate('/map')}
              className="btn-primary py-2 px-5 text-xs sm:text-sm"
            >
              Analyze Your First Rooftop
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map((prop) => (
              <div
                key={prop.id}
                onClick={() => navigate('/wizard', { state: { latitude: prop.latitude, longitude: prop.longitude, address: prop.name } })}
                className="surface-card p-6 cursor-pointer surface-card-hover flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {prop.name}
                    </h3>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(prop.id, e)}
                      className="p-1 rounded text-gray-400 hover:text-red-500 bg-transparent border-none cursor-pointer transition-colors"
                      title="Delete property"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>

                  <p className="text-xs flex items-center gap-1 mb-4" style={{ color: 'var(--text-muted)' }}>
                    <FiMapPin size={12} />
                    {prop.latitude.toFixed(4)}°, {prop.longitude.toFixed(4)}°
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div>
                    <span className="block text-[11px]" style={{ color: 'var(--text-muted)' }}>Roof Area</span>
                    <span className="font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{prop.roof_area_sqm} m²</span>
                  </div>
                  <div>
                    <span className="block text-[11px]" style={{ color: 'var(--text-muted)' }}>Monthly Bill</span>
                    <span className="font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>${prop.monthly_bill}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
