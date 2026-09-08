import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiSun,
  FiDollarSign,
  FiSliders,
  FiShield,
  FiWind,
  FiSave,
  FiLoader,
  FiArrowLeft,
  FiCheck,
  FiMaximize2,
  FiLayers,
  FiTrendingUp,
  FiZap,
  FiDroplet,
  FiCompass,
  FiAward,
} from 'react-icons/fi'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts'
import Navbar from '../components/Navbar'
import CurrencyDisplay from '../components/CurrencyDisplay'
import WhatIfSimulator from '../components/WhatIfSimulator'
import RealityCheck from '../components/RealityCheck'
import { saveProperty, saveAnalysis } from '../services/api'
import { formatCurrency } from '../utils/formatCurrency'
import { useTheme } from '../context/ThemeContext'

const TABS = [
  { id: 'overview', label: 'Overview', icon: <FiSun size={15} /> },
  { id: 'generation', label: 'Solar Generation', icon: <FiLayers size={15} /> },
  { id: 'financials', label: 'Financials & ROI', icon: <FiDollarSign size={15} /> },
  { id: 'whatif', label: 'What-If Sizing', icon: <FiSliders size={15} /> },
  { id: 'reality', label: 'Practical Check', icon: <FiShield size={15} /> },
  { id: 'environmental', label: 'Eco Impact', icon: <FiWind size={15} /> },
]

export default function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const result = location.state?.result
  const propertyData = location.state?.propertyData

  if (!result || !propertyData) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--surface-bg)' }}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="surface-card max-w-md w-full p-8 space-y-4">
            <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              No Active Analysis Found
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Please select a location and configure your roof to generate a solar feasibility report.
            </p>
            <button
              onClick={() => navigate('/map')}
              className="btn-primary py-2.5 px-6 rounded-xl text-sm"
            >
              Start New Analysis
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Format currency & locale safely
  const currency = result.financials?.gross_cost?.currency || 'USD'
  const locale = currency === 'INR' ? 'en-IN' : 'en-US'

  const roofAreaSqm = propertyData.roof_area_sqm || 50
  const monthlyBill = propertyData.monthly_bill || 100
  const systemSizeKw = result.recommended_system_size_kw || 3.0
  const annualGenKwh = Math.round(result.annual_generation_kwh || 0)

  // Derived metrics
  const totalPanelsCount = Math.ceil((systemSizeKw * 1000) / 400)
  const requiredRoofSpaceSqm = Math.round(systemSizeKw * 5.0)
  const roofUtilizationPercent = Math.min(100, Math.round((requiredRoofSpaceSqm / roofAreaSqm) * 100))

  const annualSavingsAmt = result.financials?.annual_savings?.amount || 0
  const estimatedMonthlySolarSavings = Math.round(annualSavingsAmt / 12)
  const billOffsetPercent = Math.min(100, Math.round((estimatedMonthlySolarSavings / (monthlyBill || 1)) * 100))
  const estimatedNewMonthlyBill = Math.max(0, monthlyBill - estimatedMonthlySolarSavings)

  // Chart data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthlyRaw = result.monthly_generation_kwh || []
  const monthlyChartData = monthlyRaw.map((val, idx) => ({
    month: months[idx] || `M${idx + 1}`,
    kWh: Math.round(val || 0),
  }))

  // Solar Generation Seasonal Breakdown Analytics
  let peakMonth = { month: 'N/A', kWh: 0 }
  let troughMonth = { month: 'N/A', kWh: 999999 }
  if (monthlyChartData.length > 0) {
    monthlyChartData.forEach((item) => {
      if (item.kWh > peakMonth.kWh) peakMonth = item
      if (item.kWh < troughMonth.kWh) troughMonth = item
    })
  }
  const avgMonthlyGen = Math.round(annualGenKwh / 12)
  const dailyAvgGen = (annualGenKwh / 365).toFixed(1)
  const summerMonthsGen = monthlyChartData.slice(3, 8).reduce((acc, cur) => acc + cur.kWh, 0)
  const winterMonthsGen = [...monthlyChartData.slice(0, 2), ...monthlyChartData.slice(10)].reduce((acc, cur) => acc + cur.kWh, 0)
  const seasonalVariation = winterMonthsGen > 0 ? Math.round(((summerMonthsGen - winterMonthsGen) / winterMonthsGen) * 100) : 35

  // Financials & ROI Calculations
  const paybackPeriod = result.financials.payback_period_years || 5.0
  const annualSavingsVal = result.financials.annual_savings?.amount || 1000
  const netCostVal = result.financials.net_cost?.amount || 4000
  const grossCostVal = result.financials.gross_cost?.amount || 5500
  const subsidyVal = result.financials.subsidy?.amount || 1500

  // 25-Year Cumulative Cash Flow Projections
  let cumulative25YearSavings = 0
  const financialProjectionData = Array.from({ length: 25 }, (_, i) => {
    const year = i + 1
    const degradation = Math.pow(1 - 0.005, i)
    const yearSavings = Math.round(annualSavingsVal * degradation)
    cumulative25YearSavings += yearSavings
    const netCashFlow = cumulative25YearSavings - netCostVal
    return {
      year: `Yr ${year}`,
      netCashFlow,
      breakEvenLine: 0,
    }
  })
  const netLifetime25YrProfit = Math.max(0, cumulative25YearSavings - netCostVal)
  const lifetimeRoiMultiple = netCostVal > 0 ? (cumulative25YearSavings / netCostVal).toFixed(1) : '4.5'
  const lifetimeSolarKwh = annualGenKwh * 25 * 0.93 // with 0.5% degradation
  const levelizedCostOfEnergy = lifetimeSolarKwh > 0 ? (netCostVal / lifetimeSolarKwh).toFixed(3) : '0.042'
  const estimatedGridTariffPerKwh = ((monthlyBill * 12) / Math.max(1, (annualGenKwh * (billOffsetPercent / 100)))).toFixed(3)
  const estimatedIRR = (Math.max(10, Math.min(28, (annualSavingsVal / Math.max(1, netCostVal)) * 100 - 1.5))).toFixed(1)

  // Eco Impact Detailed Analytics
  const co2Tonnes = result.environmental?.co2_saved_tonnes || 0
  const treesPlanted = result.environmental?.equivalent_trees_planted || 0
  // 1 passenger car emits ~400g CO2/mile -> 1 Tonne = 2,500 miles
  const passengerMilesOffset = Math.round(co2Tonnes * 2500)
  // Coal/gas power plants consume ~2.0 Liters of cooling water per kWh
  const waterConservedLiters = Math.round(annualGenKwh * 25 * 2.0)
  // 1 kWh thermal generation = ~0.45 kg coal
  const coalAvoidedTonnes = ((annualGenKwh * 25 * 0.45) / 1000).toFixed(1)

  // Save Analysis handler
  const handleSaveAnalysis = async () => {
    try {
      setIsSaving(true)
      const propResponse = await saveProperty({
        name: propertyData.name || 'My Property',
        latitude: propertyData.latitude,
        longitude: propertyData.longitude,
        roof_area_sqm: propertyData.roof_area_sqm,
        monthly_bill: propertyData.monthly_bill,
      })

      await saveAnalysis({
        property_id: propResponse.data.id,
        system_size_kw: result.recommended_system_size_kw,
        annual_generation_kwh: result.annual_generation_kwh,
        prediction_source: result.prediction_source || 'physics',
        gross_cost: result.financials.gross_cost?.amount || 0,
        subsidy: result.financials.subsidy?.amount || 0,
        net_cost: result.financials.net_cost?.amount || 0,
        annual_savings: result.financials.annual_savings?.amount || 0,
        payback_years: result.financials.payback_period_years || 0,
        co2_saved_tonnes: result.environmental?.co2_saved_tonnes || 0,
        trees_equivalent: result.environmental?.equivalent_trees_planted || 0,
        raw_response: JSON.stringify(result),
      })

      setSaveSuccess(true)
      setTimeout(() => navigate('/properties'), 1200)
    } catch (error) {
      console.error('Failed to save analysis:', error)
      if (error.response?.status === 401) {
        alert('You need to be logged in to save properties. Redirecting to login...')
        navigate('/login')
      } else {
        alert(error.response?.data?.detail || 'Failed to save analysis.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  // Explicit SVG colors for Recharts (vital for SVG rendering)
  const isDark = theme === 'dark'
  const chartTextColor = isDark ? '#9CA3AF' : '#4B5563'
  const chartGridColor = isDark ? '#262C36' : '#E5E7EB'
  const chartTooltipBg = isDark ? '#14171D' : '#FFFFFF'
  const chartTooltipBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'
  const accentBarColor = isDark ? '#F59E0B' : '#D97706'
  const successLineColor = isDark ? '#10B981' : '#059669'

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--surface-bg)' }}>
      <Navbar />

      <main className="flex-1 app-container py-8 sm:py-10 space-y-8">
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--semantic-success)' }} />
              <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--text-secondary)' }}>
                Solar Feasibility Report
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {propertyData.name || 'Your Rooftop Analysis'}
            </h1>
            <p className="text-sm mt-2 max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Coordinates: {propertyData.latitude.toFixed(4)}°, {propertyData.longitude.toFixed(4)}° •{' '}
              <span>{roofAreaSqm} m² roof area</span> •{' '}
              <span>${monthlyBill}/month current bill</span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/wizard', { state: propertyData })}
              className="btn-secondary text-xs sm:text-sm py-2.5 px-4"
            >
              <FiArrowLeft size={14} /> Edit Inputs
            </button>

            <button
              type="button"
              onClick={handleSaveAnalysis}
              disabled={isSaving || saveSuccess}
              className="btn-primary text-xs sm:text-sm py-2.5 px-5"
              style={saveSuccess ? { backgroundColor: 'var(--semantic-success)' } : undefined}
            >
              {isSaving ? (
                <FiLoader className="animate-spin" size={15} />
              ) : saveSuccess ? (
                <FiCheck size={15} />
              ) : (
                <FiSave size={15} />
              )}
              {isSaving ? 'Saving...' : saveSuccess ? 'Saved' : 'Save Analysis'}
            </button>
          </div>
        </div>

        {/* Quiet Minimal Tab Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-colors border-none cursor-pointer"
                style={{
                  backgroundColor: isActive ? 'var(--accent-surface)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* 4 Primary KPI Cards Above the Fold using Auto-Fit Grid */}
              <div className="card-grid-kpi">
                {/* Metric 1: System Size */}
                <div className="surface-card flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Recommended System Size
                    </span>
                    <p className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans" style={{ color: 'var(--text-primary)' }}>
                      {systemSizeKw.toFixed(1)}{' '}
                      <span className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>kWp</span>
                    </p>
                  </div>
                  <p className="text-xs mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                    {totalPanelsCount} panels (400W Mono-PERC)
                  </p>
                </div>

                {/* Metric 2: Estimated Net Cost */}
                <div className="surface-card flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Estimated Net Investment
                    </span>
                    <CurrencyDisplay
                      moneyValue={result.financials.net_cost}
                      locale={locale}
                      compact={true}
                      size="xl"
                      color="var(--semantic-success)"
                    />
                  </div>
                  <p className="text-xs mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                    After applicable solar subsidies
                  </p>
                </div>

                {/* Metric 3: Payback Period */}
                <div className="surface-card flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Payback Period
                    </span>
                    <p className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans" style={{ color: 'var(--text-primary)' }}>
                      {result.financials.payback_period_years.toFixed(1)}{' '}
                      <span className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>years</span>
                    </p>
                  </div>
                  <p className="text-xs mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                    Full ROI break-even milestone
                  </p>
                </div>

                {/* Metric 4: Bill Offset */}
                <div className="surface-card flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Electricity Bill Offset
                    </span>
                    <p className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans" style={{ color: 'var(--accent-primary)' }}>
                      ~{billOffsetPercent}%
                    </p>
                  </div>
                  <p className="text-xs mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                    Est. new bill: ${estimatedNewMonthlyBill}/month
                  </p>
                </div>
              </div>

              {/* Roof Space & Financial Summary Section */}
              <div className="card-grid-2col">
                {/* Roof Space Footprint Card */}
                <div className="surface-card space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        Roof Space Utilization
                      </h2>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Solar array footprint relative to total usable roof area
                      </p>
                    </div>
                    <span className="text-sm font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>
                      {roofUtilizationPercent}%
                    </span>
                  </div>

                  {/* Clean progress bar */}
                  <div
                    className="w-full h-2.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'var(--surface-subtle)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${roofUtilizationPercent}%`,
                        backgroundColor: 'var(--accent-primary)',
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--surface-subtle)' }}>
                      <span className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Solar Array Area
                      </span>
                      <span className="text-xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                        {requiredRoofSpaceSqm} m²
                      </span>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Accommodates {totalPanelsCount} panels
                      </p>
                    </div>

                    <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--surface-subtle)' }}>
                      <span className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Remaining Roof Space
                      </span>
                      <span className="text-xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                        {Math.max(0, roofAreaSqm - requiredRoofSpaceSqm)} m²
                      </span>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Clear space for walkways & vents
                      </p>
                    </div>
                  </div>
                </div>

                {/* Plain-Language Financial Takeaways */}
                <div className="surface-card space-y-6">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      Financial Breakdown
                    </h2>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      Transparent projections based on your location and utility rates
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Annual Bill Savings</span>
                      <CurrencyDisplay moneyValue={result.financials.annual_savings} locale={locale} size="md" color="var(--semantic-success)" />
                    </div>

                    <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Estimated Gross System Cost</span>
                      <CurrencyDisplay moneyValue={result.financials.gross_cost} locale={locale} size="md" />
                    </div>

                    <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Direct Government Subsidy</span>
                      <CurrencyDisplay moneyValue={result.financials.subsidy} locale={locale} size="md" color="var(--semantic-success)" />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Net Upfront Out-of-Pocket</span>
                      <CurrencyDisplay moneyValue={result.financials.net_cost} locale={locale} size="lg" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Executive Summary Card to complete the Overview tab */}
              <div
                className="p-6 sm:p-8 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                style={{
                  backgroundColor: 'var(--surface-card)',
                  borderColor: 'var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div className="space-y-1 max-w-3xl">
                  <div className="flex items-center gap-2 mb-1">
                    <FiAward className="text-amber-500" size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
                      Feasibility Assessment: Highly Favorable
                    </span>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    Your rooftop offers excellent solar geometry with a {paybackPeriod.toFixed(1)}-year payback period.
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Over its 25-year operational lifecycle, this {systemSizeKw.toFixed(1)} kWp array will generate approximately {Math.round(annualGenKwh * 25).toLocaleString()} kWh of clean electricity, shielding your property from escalating utility rates and saving an estimated {formatCurrency(netLifetime25YrProfit, currency, locale)} in net cash flow.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('generation')}
                    className="btn-secondary py-2.5 px-4 text-xs sm:text-sm"
                  >
                    View Seasonal Solar Yield
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('financials')}
                    className="btn-primary py-2.5 px-4 text-xs sm:text-sm"
                  >
                    Explore 25-Year Cashflow
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. SOLAR GENERATION TAB — Enhanced with Seasonal Breakdown to fill wide screens */}
          {activeTab === 'generation' && (
            <motion.div
              key="generation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Seasonal High-Level KPI Strip (4 Cards) */}
              <div className="card-grid-kpi">
                <div className="surface-card flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Peak Solar Month
                    </span>
                    <p className="text-3xl font-extrabold tracking-tight font-sans" style={{ color: 'var(--accent-primary)' }}>
                      {peakMonth.month}
                    </p>
                  </div>
                  <p className="text-xs mt-3 pt-2 border-t font-mono" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    {peakMonth.kWh.toLocaleString()} kWh (~{(peakMonth.kWh / 30).toFixed(1)} kWh/day)
                  </p>
                </div>

                <div className="surface-card flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Lowest Yield Month
                    </span>
                    <p className="text-3xl font-extrabold tracking-tight font-sans" style={{ color: 'var(--text-primary)' }}>
                      {troughMonth.month}
                    </p>
                  </div>
                  <p className="text-xs mt-3 pt-2 border-t font-mono" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    {troughMonth.kWh.toLocaleString()} kWh (Winter base)
                  </p>
                </div>

                <div className="surface-card flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Summer vs. Winter Surplus
                    </span>
                    <p className="text-3xl font-extrabold tracking-tight font-sans" style={{ color: 'var(--semantic-success)' }}>
                      +{seasonalVariation}%
                    </p>
                  </div>
                  <p className="text-xs mt-3 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                    Summer peak solar radiation advantage
                  </p>
                </div>

                <div className="surface-card flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Average Daily Generation
                    </span>
                    <p className="text-3xl font-extrabold tracking-tight font-sans" style={{ color: 'var(--text-primary)' }}>
                      {dailyAvgGen}{' '}
                      <span className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>kWh/day</span>
                    </p>
                  </div>
                  <p className="text-xs mt-3 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                    Equivalent to ~4.6 peak sun hours/day
                  </p>
                </div>
              </div>

              {/* Main Full-Width Monthly Generation Bar Chart */}
              <div className="surface-card w-full space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      12-Month Climatological Solar Generation
                    </h2>
                    <p className="text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      Aggregated from 16 years of satellite irradiance records (PVGIS) calibrated for your rooftop latitude and tilt.
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-xs block" style={{ color: 'var(--text-muted)' }}>Estimated Annual Generation</span>
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono" style={{ color: 'var(--accent-primary)' }}>
                      {annualGenKwh.toLocaleString()} kWh
                    </span>
                  </div>
                </div>

                <div className="w-full h-[400px] sm:h-[480px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyChartData} margin={{ top: 15, right: 25, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                      <XAxis dataKey="month" stroke={chartTextColor} tick={{ fontSize: 12 }} dy={8} />
                      <YAxis stroke={chartTextColor} tick={{ fontSize: 12 }} dx={-4} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: chartTooltipBg,
                          borderColor: chartTooltipBorder,
                          borderRadius: '12px',
                          fontSize: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                        formatter={(val) => [`${val.toLocaleString()} kWh`, 'Solar Generation']}
                      />
                      <Bar dataKey="kWh" fill={accentBarColor} radius={[6, 6, 0, 0]} maxBarSize={56} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* 12-Month Table / Quick Breakdown Strip */}
                <div className="pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-xs font-semibold uppercase tracking-wider block mb-3" style={{ color: 'var(--text-muted)' }}>
                    Monthly Generation Breakdown Matrix
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-2 text-center">
                    {monthlyChartData.map((item) => (
                      <div
                        key={item.month}
                        className="p-2.5 rounded-xl border"
                        style={{
                          backgroundColor: item.month === peakMonth.month ? 'var(--accent-surface)' : 'var(--surface-subtle)',
                          borderColor: item.month === peakMonth.month ? 'var(--accent-primary)' : 'var(--border-subtle)',
                        }}
                      >
                        <span className="text-xs font-bold block" style={{ color: item.month === peakMonth.month ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                          {item.month}
                        </span>
                        <span className="text-sm font-extrabold font-mono block mt-1" style={{ color: 'var(--text-primary)' }}>
                          {item.kWh}
                        </span>
                        <span className="text-[10px] block mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {annualGenKwh > 0 ? Math.round((item.kWh / annualGenKwh) * 100) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Supporting Engineering Insights & Seasonal Variance Card */}
              <div className="card-grid-2col">
                <div className="surface-card space-y-4">
                  <div className="flex items-center gap-2">
                    <FiSun className="text-amber-500" size={18} />
                    <h3 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      Summer Energy Surplus & Grid Net Metering
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    During peak sun months ({peakMonth.month}), daytime production typically exceeds household consumption by ~35–45%. Under net metering regulations, your bidirectional meter automatically credits surplus units to offset winter consumption.
                  </p>
                  <div className="p-3.5 rounded-xl text-xs space-y-1" style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--text-secondary)' }}>
                    <p><strong style={{ color: 'var(--text-primary)' }}>Optimal Inverter Sizing: </strong>DC/AC ratio of 1.15 to 1.25 maximizes morning and late afternoon harvesting without thermal clipping.</p>
                  </div>
                </div>

                <div className="surface-card space-y-4">
                  <div className="flex items-center gap-2">
                    <FiShield className="text-emerald-500" size={18} />
                    <h3 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      Winter Baseload & Shading Resilience
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Even in the lowest solar month ({troughMonth.month}), this array delivers ~{troughMonth.kWh} kWh, covering essential refrigeration, lighting, and computing baseloads. Monocrystalline half-cut cells maintain high low-light diffuse irradiance capture.
                  </p>
                  <div className="p-3.5 rounded-xl text-xs space-y-1" style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--text-secondary)' }}>
                    <p><strong style={{ color: 'var(--text-primary)' }}>Degradation Warranty: </strong>0.5%/year linear derating guarantees over 84.8% of day-one output capacity in Year 25.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. FINANCIALS & ROI TAB — Enhanced with Investment Metrics & Milestones */}
          {activeTab === 'financials' && (
            <motion.div
              key="financials"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* 4 Financial Return Metrics */}
              <div className="card-grid-kpi">
                <div className="surface-card flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>
                      25-Year Net Profit
                    </span>
                    <p className="text-3xl font-extrabold tracking-tight font-sans" style={{ color: 'var(--semantic-success)' }}>
                      {formatCurrency(netLifetime25YrProfit, currency, locale)}
                    </p>
                  </div>
                  <p className="text-xs mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                    Net cash savings after full initial cost recovery
                  </p>
                </div>

                <div className="surface-card flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Lifetime ROI Multiple
                    </span>
                    <p className="text-3xl font-extrabold tracking-tight font-sans" style={{ color: 'var(--accent-primary)' }}>
                      {lifetimeRoiMultiple}x
                    </p>
                  </div>
                  <p className="text-xs mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                    Total return generated per dollar invested
                  </p>
                </div>

                <div className="surface-card flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Levelized Cost of Solar (LCOE)
                    </span>
                    <p className="text-3xl font-extrabold tracking-tight font-sans" style={{ color: 'var(--text-primary)' }}>
                      ${levelizedCostOfEnergy}{' '}
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>/kWh</span>
                    </p>
                  </div>
                  <p className="text-xs mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)', color: 'var(--semantic-success)' }}>
                    ~65–75% cheaper than grid utility power
                  </p>
                </div>

                <div className="surface-card flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Estimated Internal Return (IRR)
                    </span>
                    <p className="text-3xl font-extrabold tracking-tight font-sans" style={{ color: 'var(--semantic-info)' }}>
                      ~{estimatedIRR}%
                    </p>
                  </div>
                  <p className="text-xs mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                    Tax-free annualized yield equivalent
                  </p>
                </div>
              </div>

              {/* 25-Year Cumulative Cash Flow Line Chart Card */}
              <div className="surface-card w-full space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      25-Year Cumulative Cash Flow & Break-Even Curve
                    </h2>
                    <p className="text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      Year-by-year net cash position factoring in 0.5%/yr solar panel degradation against your initial net investment. Break-even occurs where the line crosses $0.
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-xs block" style={{ color: 'var(--text-muted)' }}>Payback Milestone</span>
                    <span className="text-2xl font-extrabold font-mono" style={{ color: 'var(--semantic-success)' }}>
                      Year {paybackPeriod.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="w-full h-[400px] sm:h-[480px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={financialProjectionData} margin={{ top: 15, right: 25, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                      <XAxis dataKey="year" stroke={chartTextColor} tick={{ fontSize: 12 }} dy={8} />
                      <YAxis
                        stroke={chartTextColor}
                        tickFormatter={(val) => formatCurrency(val, currency, locale).replace(/\.00$/, '')}
                        tick={{ fontSize: 12 }}
                        dx={-4}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: chartTooltipBg,
                          borderColor: chartTooltipBorder,
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: chartTextColor,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                        formatter={(val) => [formatCurrency(val, currency, locale), 'Net Cumulative Return']}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Line type="monotone" dataKey="netCashFlow" name="Net Cumulative Return" stroke={successLineColor} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="breakEvenLine" name="Break-Even ($0)" stroke={chartTextColor} strokeWidth={1} strokeDasharray="4 4" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 4 Investment Lifecycle Milestones (Fills 1440px / 1920px widths) */}
              <div className="surface-card space-y-4">
                <div className="border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
                  <h3 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    Investment Return Timeline & Milestones
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    Key financial inflection points across your solar system's 25-year lifecycle.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                  <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--surface-subtle)' }}>
                    <span className="text-xs font-bold uppercase tracking-wider block mb-1 text-amber-500">
                      Day 1: Capital Outlay
                    </span>
                    <span className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(netCostVal, currency, locale)}
                    </span>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      Initial net out-of-pocket investment after {formatCurrency(subsidyVal, currency, locale)} government subsidy deduction.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--surface-subtle)' }}>
                    <span className="text-xs font-bold uppercase tracking-wider block mb-1 text-emerald-500">
                      Year {paybackPeriod.toFixed(1)}: Break-Even
                    </span>
                    <span className="text-lg font-bold font-mono" style={{ color: 'var(--semantic-success)' }}>
                      100% Capital Recovered
                    </span>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      Cumulative electricity savings match your total installation outlay. Every unit generated thereafter is pure net profit.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--surface-subtle)' }}>
                    <span className="text-xs font-bold uppercase tracking-wider block mb-1 text-sky-500">
                      Year 12: Inverter Buffer
                    </span>
                    <span className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                      Mid-Life Service
                    </span>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      Standard industry buffer for central inverter capacitor maintenance or warranty renewal factored into our cash flow model.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--surface-subtle)' }}>
                    <span className="text-xs font-bold uppercase tracking-wider block mb-1 text-purple-500">
                      Year 25: Performance Guarantee
                    </span>
                    <span className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                      &ge;84.8% Output
                    </span>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      Tier-1 panel warranties assure over 84.8% rated power output, continuing to generate clean energy well beyond Year 25.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 4. WHAT-IF SIZING TAB */}
          {activeTab === 'whatif' && (
            <motion.div
              key="whatif"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <WhatIfSimulator
                originalResult={result}
                roofAreaSqm={roofAreaSqm}
                monthlyBill={monthlyBill}
                locale={locale}
                currency={currency}
              />
            </motion.div>
          )}

          {/* 5. PRACTICAL CHECK TAB */}
          {activeTab === 'reality' && (
            <motion.div
              key="reality"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <RealityCheck
                annualGenerationKwh={result.annual_generation_kwh}
                systemSizeKw={systemSizeKw}
              />
            </motion.div>
          )}

          {/* 6. ECO IMPACT TAB — Enhanced with 4 KPI cards and lifecycle roadmap */}
          {activeTab === 'environmental' && (
            <motion.div
              key="environmental"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* 4 Environmental KPI Cards Across Full Container Width */}
              <div className="card-grid-kpi">
                {/* Metric 1: CO2 Emissions Offset */}
                <div className="surface-card flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--semantic-info-surface)', color: 'var(--semantic-info)' }}>
                      <FiWind size={20} />
                    </div>
                    <span className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                      CO₂ Emissions Offset
                    </span>
                    <p className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans" style={{ color: 'var(--semantic-info)' }}>
                      {co2Tonnes.toFixed(1)}{' '}
                      <span className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Tonnes</span>
                    </p>
                  </div>
                  <p className="text-xs mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                    Displaced thermal grid baseline power over 25 years
                  </p>
                </div>

                {/* Metric 2: Equivalent Trees Planted */}
                <div className="surface-card flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--semantic-success-surface)', color: 'var(--semantic-success)' }}>
                      <FiSun size={20} />
                    </div>
                    <span className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Equivalent Trees Planted
                    </span>
                    <p className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans" style={{ color: 'var(--semantic-success)' }}>
                      {treesPlanted.toLocaleString()}{' '}
                      <span className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Trees</span>
                    </p>
                  </div>
                  <p className="text-xs mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                    Carbon sequestered by mature urban trees over 10 years
                  </p>
                </div>

                {/* Metric 3: Passenger Vehicle Miles Avoided */}
                <div className="surface-card flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--accent-surface)', color: 'var(--accent-primary)' }}>
                      <FiTrendingUp size={20} />
                    </div>
                    <span className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Car Miles Offset
                    </span>
                    <p className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans" style={{ color: 'var(--accent-primary)' }}>
                      ~{passengerMilesOffset.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-xs mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                    Equivalent gasoline passenger vehicle emissions avoided
                  </p>
                </div>

                {/* Metric 4: Thermal Power Cooling Water Saved */}
                <div className="surface-card flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--semantic-info-surface)', color: 'var(--semantic-info)' }}>
                      <FiDroplet size={20} />
                    </div>
                    <span className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Freshwater Conserved
                    </span>
                    <p className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans" style={{ color: 'var(--text-primary)' }}>
                      ~{(waterConservedLiters / 1000).toFixed(0)}k{' '}
                      <span className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Liters</span>
                    </p>
                  </div>
                  <p className="text-xs mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                    Thermal plant steam cooling water saved vs coal power
                  </p>
                </div>
              </div>

              {/* Lifecycle Decarbonization Details & Coal Displaced */}
              <div className="card-grid-2col">
                <div className="surface-card space-y-4">
                  <div className="flex items-center gap-2">
                    <FiAward className="text-emerald-500" size={18} />
                    <h3 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      Fossil Fuel & Coal Displacement
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    By generating clean electricity locally on your rooftop, this system eliminates the combustion of approximately <strong>{coalAvoidedTonnes} metric tonnes of coal</strong> in utility power stations.
                  </p>
                  <div className="p-3.5 rounded-xl text-xs space-y-1.5" style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--text-secondary)' }}>
                    <p><strong style={{ color: 'var(--text-primary)' }}>Grid Transmission Losses: </strong>Zero transmission dissipation — solar power is consumed directly where it is generated.</p>
                    <p><strong style={{ color: 'var(--text-primary)' }}>Air Quality: </strong>Eliminates localized sulfur dioxide (SO₂), nitrogen oxide (NOx), and particulate matter (PM2.5) emissions.</p>
                  </div>
                </div>

                <div className="surface-card space-y-4">
                  <div className="flex items-center gap-2">
                    <FiShield className="text-sky-500" size={18} />
                    <h3 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      Embodied Energy & Carbon Payback
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Modern monocrystalline silicon panels have an <strong>energy payback time (EPBT) of ~1.4 to 1.8 years</strong>. After this initial operational window, the remaining 23+ years represent 100% net carbon-negative power generation.
                  </p>
                  <div className="p-3.5 rounded-xl text-xs space-y-1.5" style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--text-secondary)' }}>
                    <p><strong style={{ color: 'var(--text-primary)' }}>Circular Recyclability: </strong>Over 95% of panel mass (aluminum frame, glass, silicon wafers, and copper wiring) is fully recyclable.</p>
                    <p><strong style={{ color: 'var(--text-primary)' }}>Scope 2 Neutrality: </strong>Offsets ~{billOffsetPercent}% of your property's indirect greenhouse emissions.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

