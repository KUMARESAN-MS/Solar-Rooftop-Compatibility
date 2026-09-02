import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiUser, FiArrowRight } from 'react-icons/fi'
import { login, register } from '../services/api'

export default function AuthPages() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let res;
      if (isLogin) {
        res = await login(formData.email, formData.password)
      } else {
        res = await register(formData.email, formData.password, formData.name)
      }
      
      const token = res.data.access_token
      localStorage.setItem('solar_token', token)
      navigate('/properties')
    } catch (err) {
      console.error("Auth error:", err)
      setError(err.response?.data?.detail || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--gradient-hero)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md p-8"
      >
        <h2 className="text-3xl font-bold mb-2 text-center" style={{ fontFamily: 'var(--font-display)' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-center mb-8 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {isLogin 
            ? 'Log in to view and save your solar analyses.' 
            : 'Sign up to save unlimited roof analyses.'}
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/20 text-red-400 text-sm border border-red-500/30 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2 text-gray-300">
                <FiUser /> Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2 text-gray-300">
              <FiMail /> Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-slate-800/50 border rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2 text-gray-300">
              <FiLock /> Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-slate-800/50 border rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              required
              minLength={6}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white font-semibold mt-6 border-none cursor-pointer disabled:opacity-70"
            style={{ background: 'var(--gradient-primary)' }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
            {!loading && <FiArrowRight size={18} />}
          </motion.button>
        </form>

        <div className="mt-6 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold text-orange-400 hover:text-orange-300 transition-colors bg-transparent border-none cursor-pointer"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
