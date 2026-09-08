import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiSun, FiMoon, FiMapPin, FiFolder, FiLogIn, FiLogOut } from 'react-icons/fi'
import { checkHealth } from '../services/api'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [backendStatus, setBackendStatus] = useState(null)
  const token = localStorage.getItem('solar_token')

  useEffect(() => {
    checkHealth()
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('offline'))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('solar_token')
    navigate('/')
  }

  const navLinks = [
    { path: '/map', label: 'Analyze Roof', icon: <FiMapPin size={15} /> },
    { path: '/properties', label: 'Saved Properties', icon: <FiFolder size={15} /> },
  ]

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-3.5 backdrop-blur-md transition-colors border-b"
      style={{
        backgroundColor: theme === 'dark' ? 'rgba(19, 22, 28, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2.5 no-underline group">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
          style={{ backgroundColor: 'var(--accent-primary)', color: '#FFFFFF' }}
        >
          <FiSun size={17} />
        </div>
        <span
          className="text-base font-semibold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          SolarPredict
        </span>
      </Link>

      {/* Navigation items */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path
          return (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors no-underline"
              style={{
                backgroundColor: isActive ? 'var(--accent-surface)' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
            >
              {link.icon}
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          )
        })}

        {/* API Health Dot (Subtle, non-distracting) */}
        {backendStatus && (
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              color: backendStatus === 'connected' ? 'var(--semantic-success)' : 'var(--text-muted)',
            }}
            title={backendStatus === 'connected' ? 'API Server Online' : 'API Server Offline'}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: backendStatus === 'connected' ? 'var(--semantic-success)' : '#EF4444',
              }}
            />
            <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              {backendStatus === 'connected' ? 'Online' : 'Offline'}
            </span>
          </div>
        )}

        {/* Light/Dark Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none transition-colors"
          style={{
            backgroundColor: 'var(--surface-subtle)',
            color: 'var(--text-secondary)',
          }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <FiSun size={15} /> : <FiMoon size={15} />}
        </button>

        {/* Auth action */}
        {token ? (
          <button
            type="button"
            onClick={handleLogout}
            className="btn-ghost text-xs"
            title="Log Out"
          >
            <FiLogOut size={14} />
            <span className="hidden sm:inline">Log out</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="btn-ghost text-xs no-underline"
          >
            <FiLogIn size={14} />
            <span className="hidden sm:inline">Sign In</span>
          </Link>
        )}
      </div>
    </nav>
  )
}
