import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { login, register } from '../services/api'
import Navbar from '../components/Navbar'

export default function AuthPages() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  })

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let res
      if (isLogin) {
        res = await login(formData.email, formData.password)
      } else {
        res = await register(formData.email, formData.password, formData.name)
      }

      const token = res.data.access_token
      localStorage.setItem('solar_token', token)
      navigate('/properties')
    } catch (err) {
      console.error('Auth error:', err)
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--surface-bg)' }}>
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="surface-card w-full max-w-md p-8 space-y-6"
        >
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {isLogin ? 'Sign In' : 'Create an Account'}
            </h1>
            <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
              {isLogin ? 'Access your saved solar feasibility reports' : 'Save and compare multiple rooftop analyses'}
            </p>
          </div>

          {error && (
            <div
              className="p-3 rounded-xl text-xs"
              style={{
                backgroundColor: 'var(--semantic-danger-surface)',
                color: 'var(--semantic-danger)',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Smith"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--surface-input)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--surface-input)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--surface-input)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl text-sm font-semibold mt-2"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              className="text-xs font-medium cursor-pointer bg-transparent border-none"
              style={{ color: 'var(--accent-primary)' }}
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
