import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHome, FiSun, FiDollarSign, FiTrendingUp, FiInfo, FiWind } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts'

const TABS = ['Summary', 'Generation', 'Financials', 'Environmental']

export default function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Summary')
  
  const result = location.state?.result
  const propertyData = location.state?.propertyData

  if (!result || !propertyData) {
    navigate('/')
    return null
  }

  // Monthly generation mock data for chart (assuming uniform distribution for simplicity, backend gives annual)
  const monthlyData = [
    { name: 'Jan', kWh: result.prediction_source === 'ml' ? result.ml_predicted_kwh / 12 : result.annual_generation_kwh / 12 },
    { name: 'Feb', kWh: result.prediction_source === 'ml' ? result.ml_predicted_kwh / 12 : result.annual_generation_kwh / 12 },
    { name: 'Mar', kWh: (result.prediction_source === 'ml' ? result.ml_predicted_kwh / 12 : result.annual_generation_kwh / 12) * 1.2 },
    { name: 'Apr', kWh: (result.prediction_source === 'ml' ? result.ml_predicted_kwh / 12 : result.annual_generation_kwh / 12) * 1.3 },
    { name: 'May', kWh: (result.prediction_source === 'ml' ? result.ml_predicted_kwh / 12 : result.annual_generation_kwh / 12) * 1.5 },
    { name: 'Jun', kWh: (result.prediction_source === 'ml' ? result.ml_predicted_kwh / 12 : result.annual_generation_kwh / 12) * 1.6 },
    { name: 'Jul', kWh: (result.prediction_source === 'ml' ? result.ml_predicted_kwh / 12 : result.annual_generation_kwh / 12) * 1.6 },
    { name: 'Aug', kWh: (result.prediction_source === 'ml' ? result.ml_predicted_kwh / 12 : result.annual_generation_kwh / 12) * 1.5 },
    { name: 'Sep', kWh: (result.prediction_source === 'ml' ? result.ml_predicted_kwh / 12 : result.annual_generation_kwh / 12) * 1.3 },
    { name: 'Oct', kWh: (result.prediction_source === 'ml' ? result.ml_predicted_kwh / 12 : result.annual_generation_kwh / 12) * 1.1 },
    { name: 'Nov', kWh: result.prediction_source === 'ml' ? result.ml_predicted_kwh / 12 : result.annual_generation_kwh / 12 },
    { name: 'Dec', kWh: (result.prediction_source === 'ml' ? result.ml_predicted_kwh / 12 : result.annual_generation_kwh / 12) * 0.9 },
  ]

  // Financial projection data (25 years)
  const financialData = Array.from({ length: 25 }, (_, i) => {
    const year = i + 1
    const cumulativeSavings = result.annual_savings * year
    const netCost = result.net_cost
    return {
      year: `Year ${year}`,
      cashFlow: cumulativeSavings - netCost,
      breakEven: 0
    }
  })

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
            className="px-6 py-2 rounded-lg font-semibold text-white border-none cursor-pointer"
            style={{ background: 'var(--gradient-primary)' }}
            onClick={() => alert("Save functionality requires login, coming soon.")}
          >
            Save Analysis
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
              <p className="text-3xl font-bold font-mono">{result.system_size_kw.toFixed(1)} kW</p>
            </div>
            
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-success-400)' }}>
                <FiDollarSign size={24} />
              </div>
              <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Estimated Net Cost</h3>
              <p className="text-3xl font-bold font-mono">${result.net_cost.toLocaleString()}</p>
              <p className="text-xs mt-2 text-green-400">After ${result.subsidy.toLocaleString()} subsidy</p>
            </div>

            <div className="glass-card p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center" style={{ background: 'rgba(249, 115, 22, 0.1)', color: 'var(--color-primary-400)' }}>
                <FiTrendingUp size={24} />
              </div>
              <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Payback Period</h3>
              <p className="text-3xl font-bold font-mono">{result.payback_years.toFixed(1)} yrs</p>
              <p className="text-xs mt-2 text-orange-400">${result.annual_savings.toLocaleString()} / yr savings</p>
            </div>

            <div className="col-span-1 md:col-span-3 glass-card p-6 mt-4">
              <h3 className="flex items-center gap-2 font-semibold mb-4 text-orange-400">
                <FiInfo /> AI Prediction Insights
              </h3>
              <p className="text-sm leading-relaxed text-gray-300">
                This analysis used our <strong>{result.prediction_source === 'ml' ? 'Hybrid Machine Learning' : 'Physics-based'}</strong> model. 
                {result.prediction_source === 'ml' 
                  ? ` By applying historical performance data, the AI adjusted the base physics estimate from ${result.annual_generation_kwh.toFixed(0)} kWh to a more realistic ${result.ml_predicted_kwh.toFixed(0)} kWh per year.` 
                  : ' Machine learning prediction was unavailable or opted out, relying purely on PVGIS physics formulas.'}
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
              <p className="text-4xl font-mono text-blue-400">{result.co2_saved_tonnes.toFixed(1)} Tonnes</p>
              <p className="text-sm mt-4 text-gray-400">Over the 25-year lifespan of the system.</p>
            </div>

            <div className="glass-card p-8 flex flex-col items-center justify-center text-center h-[300px]">
              <div className="w-16 h-16 rounded-full mb-6 flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-success-400)' }}>
                <FiHome size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Equivalent Trees Planted</h3>
              <p className="text-4xl font-mono text-green-400">{result.trees_equivalent}</p>
              <p className="text-sm mt-4 text-gray-400">The amount of carbon sequestered by adult trees.</p>
            </div>
          </motion.div>
        )}

      </main>
    </div>
  )
}
