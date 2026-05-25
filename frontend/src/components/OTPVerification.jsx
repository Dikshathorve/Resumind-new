import { useState, useEffect } from 'react'
import { X, Lock, Clock, AlertCircle } from 'lucide-react'
import './OTPVerification.css'
import { sendOTPEmail } from '../services/emailService'

export default function OTPVerification({ email, fullName, signupData, onVerified, onCancel, onResendClick }) {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes in seconds
  const [canResend, setCanResend] = useState(false)

  // Timer for OTP expiry
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true)
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
  }, [timeLeft])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      setLoading(false)
      return
    }

    try {
      // Verify OTP
      const verifyResponse = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otp
        })
      })

      const verifyData = await verifyResponse.json()

      if (!verifyResponse.ok) {
        setError(verifyData.message || 'Failed to verify OTP')
        setLoading(false)
        return
      }

      setSuccess('Email verified successfully!')

      // Step 2: Create user account after OTP verification
      const signupResponse = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(signupData)
      })

      const signupDataResponse = await signupResponse.json()

      if (!signupResponse.ok) {
        setError(signupDataResponse.message || 'Signup failed')
        setLoading(false)
        return
      }

      // Success! Show success message and alert
      setSuccess('✅ OTP is correct! Signing you in...')
      
      // Show success alert
      setTimeout(() => {
        alert('🎉 Sign up successful! You are now logged in.')
      }, 300)

      // Call the onVerified callback with user data after a short delay
      setTimeout(() => {
        onVerified(signupDataResponse.user)
      }, 1000)
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('OTP verification error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Step 1: Request new OTP from backend
      const response = await fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          fullName: fullName
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to resend OTP')
        setLoading(false)
        return
      }

      // Step 2: Send OTP email from frontend using EmailJS
      try {
        await sendOTPEmail(email, fullName, data.otp)
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
    <div className="otp-verification-overlay">
      <div className="otp-verification-modal">
        <button 
          className="otp-close-btn" 
          onClick={onCancel} 
          aria-label="Close"
          title="Close OTP verification"
          disabled={loading}
        >
          <X size={24} />
        </button>

        <div className="otp-content">
          <div className="otp-header">
            <Lock size={40} className="otp-icon" />
            <h2 className="otp-title">Verify Your Email</h2>
            <p className="otp-subtitle">Enter the OTP sent to {email}</p>
          </div>

          {error && (
            <div className="otp-alert otp-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="otp-alert otp-success">
              <span>✓ {success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="otp-form">
            <div className="otp-input-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={handleOtpChange}
                placeholder="000000"
                maxLength="6"
                autoComplete="off"
                disabled={loading}
                className="otp-input"
              />
            </div>

            <div className="otp-timer">
              <Clock size={16} />
              <span>Expires in: {formatTime(timeLeft)}</span>
            </div>

            <button 
              type="submit" 
              className="otp-submit-btn"
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <div className="otp-footer">
            <p className="otp-resend-text">
              Didn't receive the OTP?{' '}
              <button
                type="button"
                className="otp-resend-btn"
                onClick={handleResend}
                disabled={!canResend || loading}
              >
                {canResend ? 'Resend OTP' : `Resend in ${Math.ceil(timeLeft / 60)}m`}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
