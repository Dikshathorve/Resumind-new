import { useState } from 'react'
import { X, Mail, Lock } from 'lucide-react'
import './SignIn.css'
import { useAuth } from '../context/AuthContext'

export default function SignIn({ onClose, onSuccess, onShowSignUp }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { login } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${apiBaseUrl}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Login failed')
        setLoading(false)
        return
      }

      setSuccess('Logged in successfully!')
      
      // Use auth context to update login state
      login(data.user)

      // Clear form
      setFormData({
        email: '',
        password: '',
      })

      // Close modal and call success callback after 1 second
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        }
        onClose()
      }, 1000)
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Signin error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signin-page">
      {/* Full-screen blur background */}
      <div className="signin-backdrop" onClick={onClose}></div>

      {/* Modal form */}
      <div className="signin-modal">
        <button className="signin-close" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>

        <div className="signin-content">
          <h2 className="signin-title">Welcome Back</h2>
          <p className="signin-subtitle">Login to your account</p>

          {error && <div className="signin-error">{error}</div>}
          {success && <div className="signin-success">{success}</div>}

          <form onSubmit={handleSubmit} className="signin-form">
            <div className="signin-form-group">
              <label htmlFor="email">Email Address</label>
              <div className="signin-input-wrapper">
                <Mail size={18} className="signin-input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="signin-form-group">
              <label htmlFor="password">Password</label>
              <div className="signin-input-wrapper">
                <Lock size={18} className="signin-input-icon" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="signin-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="signin-footer">
            Don't have an account? <a href="#" onClick={(e) => {
              e.preventDefault()
              if (onShowSignUp) onShowSignUp()
            }}>Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  )
}
