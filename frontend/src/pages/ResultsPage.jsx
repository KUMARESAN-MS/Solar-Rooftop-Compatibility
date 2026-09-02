import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHome, FiSun, FiDollarSign, FiTrendingUp, FiInfo, FiWind, FiLoader } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts'
import { saveProperty, saveAnalysis } from '../services/api'

const TABS = ['Summary', 'Generation', 'Financials', 'Environmental']

export default function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Summary')
  const [isSaving, setIsSaving] = useState(false)
  
  const result = location.state?.result
  const propertyData = location.state?.propertyData

  if (!result || !propertyData) {
    navigate('/')
    return null
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthlyData = result.monthly_generation_kwh
    ? result.monthly_generation_kwh.map((kWh, index) => ({
        name: monthNames[index],
        kWh: kWh
      }))
    : []

  // Financial projection data (25 years)
  const financialData = Array.from({ length: 25 }, (_, i) => {
    const year = i + 1
    const cumulativeSavings = result.financials.annual_savings * year
    const netCost = result.financials.net_cost
    return {
      year: `Year ${year}`,
      cashFlow: cumulativeSavings - netCost,
      breakEven: 0
    }
  })

  const handleSaveAnalysis = async () => {
    try {
      setIsSaving(true)
      
      const propertyPayload = {
        name: propertyData.name || 'My Property',
        latitude: propertyData.latitude,
        longitude: propertyData.longitude,
        roof_area_sqm: propertyData.roof_area_sqm,
        monthly_bill: propertyData.monthly_bill,
      }
      
      const propResponse = await saveProperty(propertyPayload)
      const newPropertyId = propResponse.data.id
      
      const analysisPayload = {
        property_id: newPropertyId,
        system_size_kw: result.recommended_system_size_kw,
        annual_generation_kwh: result.annual_generation_kwh,
        prediction_source: result.prediction_source || 'physics',
        gross_cost: result.financials.gross_cost || 0,
        subsidy: result.financials.subsidy,
        net_cost: result.financials.net_cost,
        annual_savings: result.financials.annual_savings,
        payback_years: result.financials.payback_period_years,
        co2_saved_tonnes: result.environmental.co2_saved_tonnes,
        trees_equivalent: result.environmental.equivalent_trees_planted,
        raw_response: JSON.stringify(result)
      }
      
      await saveAnalysis(analysisPayload)
      
      alert('Analysis saved successfully!')
      navigate('/properties')
    } catch (error) {
      console.error('Failed to save analysis:', error)
      if (error.response?.status === 401) {
        alert('You must be logged in to save an analysis.')
      } else {
        alert(error.response?.data?.detail || 'Failed to save analysis.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-12" style={{ background: 'var(--color-bg-primary)' }}>
      {/* Header */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">{propertyData.name || 'Your Property'}</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {propertyData.latitude.toFixed(4)}, {propertyData.longitude.toFixed(4)} • {propertyData.roof_area_sqm} m²
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
          <button onClick={() => navigate('/properties')} className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors">
            View Saved
          </button>
          <button 
            className="px-6 py-2 rounded-lg font-semibold text-white border-none cursor-pointer flex items-center justify-center gap-2"
            style={{ background: 'var(--gradient-primary)', opacity: isSaving ? 0.7 : 1 }}
            onClick={handleSaveAnalysis}
            disabled={isSaving}
          >
            {isSaving ? <FiLoader className="animate-spin" /> : null}
            {isSaving ? 'Saving...' : 'Save Analysis'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto flex gap-2 mb-8 overflow-x-auto pb-2">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border-none cursor-pointer ${
              activeTab === tab ? 'text-white' : ''
            }`}
            style={{ 
              background: activeTab === tab ? 'var(--color-bg-tertiary)' : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--color-text-muted)'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto">
        
        {/* SUMMARY TAB */}
        {activeTab === 'Summary' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--color-accent-400)' }}>
                <FiSun size={24} />
              </div>
              <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Recommended System</h3>
              <p className="text-3xl font-bold font-mono">{result.recommended_system_size_kw.toFixed(1)} kW</p>
            </div>
            
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-success-400)' }}>
                <FiDollarSign size={24} />
              </div>
              <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Estimated Net Cost</h3>
              <p className="text-3xl font-bold font-mono">${result.financials.net_cost.toLocaleString()}</p>
              <p className="text-xs mt-2 text-green-400">After ${result.financials.subsidy.toLocaleString()} subsidy</p>
            </div>

            <div className="glass-card p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center" style={{ background: 'rgba(249, 115, 22, 0.1)', color: 'var(--color-primary-400)' }}>
                <FiTrendingUp size={24} />
              </div>
              <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Payback Period</h3>
              <p className="text-3xl font-bold font-mono">{result.financials.payback_period_years.toFixed(1)} yrs</p>
              <p className="text-xs mt-2 text-orange-400">${result.financials.annual_savings.toLocaleString()} / yr savings</p>
            </div>

            <div className="col-span-1 md:col-span-3 glass-card p-6 mt-4">
              <h3 className="flex items-center gap-2 font-semibold mb-4 text-orange-400">
                <FiInfo /> Calculation Insights
              </h3>
              <p className="text-sm leading-relaxed text-gray-300">
                This analysis uses a robust physics-based model powered by PVGIS historical solar irradiance data to calculate generation, rather than relying on experimental ML predictions. 
              </p>
            </div>
          </motion.div>
        )}

        {/* GENERATION TAB */}
        {activeTab === 'Generation' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 h-[500px]">
            <h3 className="text-lg font-bold mb-6">Estimated Monthly Generation (kWh)</h3>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#F97316' }}
                />
                <Bar dataKey="kWh" fill="url(#colorOrange)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#FB923C" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* FINANCIALS TAB */}
        {activeTab === 'Financials' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 h-[500px]">
             <h3 className="text-lg font-bold mb-6">25-Year Cash Flow Projection</h3>
             <ResponsiveContainer width="100%" height="90%">
              <LineChart data={financialData} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="year" stroke="#94A3B8" tick={{fontSize: 12}} interval={4} />
                <YAxis stroke="#94A3B8" tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                  formatter={(value) => `$${value.toLocaleString(undefined, {maximumFractionDigits: 0})}`}
                />
                <Legend />
                <Line type="monotone" dataKey="cashFlow" name="Net Cash Flow" stroke="#22C55E" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="breakEven" name="Break Even" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* ENVIRONMENTAL TAB */}
        {activeTab === 'Environmental' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-8 flex flex-col items-center justify-center text-center h-[300px]">
              <div className="w-16 h-16 rounded-full mb-6 flex items-center justify-center" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--color-accent-400)' }}>
                <FiWind size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">CO₂ Emissions Saved</h3>
              <p className="text-4xl font-mono text-blue-400">{result.environmental.co2_saved_tonnes.toFixed(1)} Tonnes</p>
              <p className="text-sm mt-4 text-gray-400">Over the 25-year lifespan of the system.</p>
            </div>

            <div className="glass-card p-8 flex flex-col items-center justify-center text-center h-[300px]">
              <div className="w-16 h-16 rounded-full mb-6 flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-success-400)' }}>
                <FiHome size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Equivalent Trees Planted</h3>
              <p className="text-4xl font-mono text-green-400">{result.environmental.equivalent_trees_planted}</p>
              <p className="text-sm mt-4 text-gray-400">The amount of carbon sequestered by adult trees.</p>
            </div>
          </motion.div>
        )}

      </main>
    </div>
  )
}
