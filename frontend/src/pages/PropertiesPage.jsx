import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiPlus, FiLogOut, FiHome, FiMapPin, FiTrash2 } from 'react-icons/fi'
import { getProperties, deleteProperty } from '../services/api'

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
      setProperties(res.data)
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login')
      } else {
        console.error("Failed to fetch properties", err)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm("Are you sure you want to delete this property?")) return
    
    try {
      await deleteProperty(id)
      setProperties(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error("Failed to delete property", err)
      alert("Failed to delete property.")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('solar_token')
    navigate('/login')
  }

  return (
    <div className="min-h-screen p-6 md:p-12" style={{ background: 'var(--color-bg-primary)' }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>My Dashboard</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Manage your saved properties and solar analyses.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-colors bg-transparent text-gray-300 cursor-pointer"
          >
            <FiLogOut /> Logout
          </button>
          <button 
            className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-white border-none cursor-pointer"
            style={{ background: 'var(--gradient-primary)' }}
            onClick={() => navigate('/map')}
          >
            <FiPlus /> New Analysis
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card p-6 h-48 skeleton"></div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="glass-card p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center bg-gray-800 text-gray-400">
              <FiHome size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2">No properties yet</h3>
            <p className="text-gray-400 mb-6 max-w-md">
              You haven't run any solar analyses yet. Drop a pin on the map to get started.
            </p>
            <button 
              onClick={() => navigate('/map')}
              className="px-6 py-3 rounded-full font-semibold text-white border-none cursor-pointer"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Analyze Your Roof
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 flex flex-col relative group cursor-pointer"
                onClick={() => alert('Viewing historical analyses is not yet fully implemented in the UI.')}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(249, 115, 22, 0.1)', color: 'var(--color-primary-400)' }}>
                      <FiHome size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{property.name}</h3>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <FiMapPin size={10} /> {property.latitude.toFixed(2)}, {property.longitude.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleDelete(property.id, e)}
                    className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer p-2"
                  >
                    <FiTrash2 />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <div>
                    <p className="text-xs text-gray-500">Roof Area</p>
                    <p className="font-mono">{property.roof_area_sqm} m²</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Current Bill</p>
                    <p className="font-mono">${property.monthly_bill}/mo</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
