import { useState, useEffect } from 'react'
import { X, User, Mail, Lock, Clock, AlertCircle } from 'lucide-react'
import './SignUp.css'
import { useAuth } from '../context/AuthContext'
import { sendOTPEmail } from '../services/emailService'

export default function SignUp({ onClose, onSuccess, onShowSignIn }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes in seconds
  const [canResend, setCanResend] = useState(false)
  const { login } = useAuth()

  // Timer for OTP expiry
  useEffect(() => {
    if (!otpSent || timeLeft <= 0) {
      if (timeLeft <= 0) setCanResend(true)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, otpSent])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // If OTP has been sent, verify it
    if (otpSent) {
      if (!otp || otp.length !== 6) {
        setError('Please enter a valid 6-digit OTP')
        setLoading(false)
        return
      }

      try {
        // Verify OTP
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        const verifyResponse = await fetch(`${apiBaseUrl}/auth/verify-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            otp: otp
          })
        })

        const verifyData = await verifyResponse.json()

        if (!verifyResponse.ok) {
          setError(verifyData.message || 'Failed to verify OTP')
          setLoading(false)
          return
        }

        // Step 2: Create user account after OTP verification
        const signupResponse = await fetch(`${apiBaseUrl}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData)
        })

        const signupDataResponse = await signupResponse.json()

        if (!signupResponse.ok) {
          setError(signupDataResponse.message || 'Signup failed')
          setLoading(false)
          return
        }

        // Success!
        setSuccess('✅ OTP is correct! Signing you in...')
        
        // Show success alert
        setTimeout(() => {
          alert('🎉 Sign up successful! You are now logged in.')
        }, 300)

        // Login user
        login(signupDataResponse.user)

        // Close modal after 1.5 seconds
        setTimeout(() => {
          if (onSuccess) {
            onSuccess()
          }
          onClose()
        }, 1500)
      } catch (err) {
        setError('An error occurred. Please try again.')
        console.error('OTP verification error:', err)
      } finally {
        setLoading(false)
      }
      return
    }

    // First time: Validation and send OTP
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      // Step 1: Request OTP generation from backend
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const otpResponse = await fetch(`${apiBaseUrl}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
        })
      })

      const otpData = await otpResponse.json()

      if (!otpResponse.ok) {
        setError(otpData.message || 'Failed to generate OTP')
        setLoading(false)
        return
      }

      // Step 2: Send OTP email from frontend using EmailJS
      try {
        await sendOTPEmail(formData.email, formData.fullName, otpData.otp)
        console.log('✅ OTP email sent from frontend')
      } catch (emailError) {
        console.error('Email sending failed:', emailError)
        setError(`Failed to send email: ${emailError.message}`)
        setLoading(false)
        return
      }

      // Step 3: Show OTP input in form
      setOtpSent(true)
      setTimeLeft(900)
      setCanResend(false)
      setSuccess('OTP sent! Please check your email.')
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Request new OTP from backend
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${apiBaseUrl}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to resend OTP')
        setLoading(false)
        return
      }

      // Send OTP email from frontend using EmailJS
      try {
        await sendOTPEmail(formData.email, formData.fullName, data.otp)
        console.log('✅ OTP email resent from frontend')
      } catch (emailError) {
        console.error('Email resend failed:', emailError)
        setError(`Failed to send email: ${emailError.message}`)
        setLoading(false)
        return
      }

      setSuccess('OTP resent! Check your email.')
      setOtp('')
      setTimeLeft(900)
      setCanResend(false)
    } catch (err) {
      setError('Failed to resend OTP')
      console.error('Resend OTP error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="signup-page">
        {/* Full-screen blur background */}
        <div className="signup-backdrop" onClick={onClose}></div>

        {/* Modal form */}
        <div className="signup-modal">
          <button className="signup-close" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>

          <div className="signup-content">
            <h2 className="signup-title">Create Account</h2>
            <p className="signup-subtitle">Join Resumind to build your perfect resume</p>

            {error && <div className="signup-error">{error}</div>}
            {success && <div className="signup-success">{success}</div>}

            <form onSubmit={handleSubmit} className="signup-form">
              {!otpSent ? (
                <>
                  <div className="signup-form-group">
                    <label htmlFor="fullName">Full Name</label>
                    <div className="signup-input-wrapper">
                      <User size={18} className="signup-input-icon" />
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div className="signup-form-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="signup-input-wrapper">
                      <Mail size={18} className="signup-input-icon" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="signup-form-group">
                    <label htmlFor="password">Password</label>
                    <div className="signup-input-wrapper">
                      <Lock size={18} className="signup-input-icon" />
                      <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="signup-form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="signup-input-wrapper">
                      <Lock size={18} className="signup-input-icon" />
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button type="submit" className="signup-button" disabled={loading}>
                    {loading ? 'Sending OTP...' : 'Create Account'}
                  </button>
                </>
              ) : (
                <>
                  <div className="otp-section">
                    <h3>📧 Verify Your Email</h3>
                    <p>Enter the 6-digit OTP sent to <strong>{formData.email}</strong></p>

                    <div className="signup-form-group">
                      <label htmlFor="otp">Enter OTP</label>
                      <input
                        type="text"
                        id="otp"
                        value={otp}
                        onChange={handleOtpChange}
                        placeholder="000000"
                        maxLength="6"
                        disabled={loading}
                        className="otp-input-field"
                      />
                    </div>

                    <div className="otp-timer">
                      <Clock size={16} />
                      <span>⏱️ Expires in: <strong>{formatTime(timeLeft)}</strong></span>
                    </div>

                    <button 
                      type="submit" 
                      className="signup-button"
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>

                    <div className="otp-resend">
                      <p>Didn't receive the OTP?{' '}
                        <button
                          type="button"
                          className="resend-btn"
                          onClick={handleResendOTP}
                          disabled={!canResend || loading}
                        >
                          {canResend ? 'Resend OTP' : `Resend in ${Math.ceil(timeLeft / 60)}m`}
                        </button>
                      </p>
                    </div>
                  </div>
                </>
              )}
            </form>

            <p className="signup-footer">
              Already have an account? <a href="#" onClick={(e) => {
                e.preventDefault()
                if (onShowSignIn) onShowSignIn()
              }}>Sign In</a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
