import { useState } from 'react'
import './Header.css'
import { Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Header({ onSignIn, onSignUp, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    if (onLogout) {
      onLogout()
    }
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <div className="logo-icon">
            <Sparkles size={20} color="#ffffff" />
          </div>
          <h1>Resumind</h1>
        </div>
        <nav className={`nav ${isMenuOpen ? 'active' : ''}`}>
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="header-actions">
          {isAuthenticated && user ? (
            <>
              <span className="username-display">{user.fullName || user.email || 'User'}</span>
              <button className="logout-button" onClick={handleLogout} title="Logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="login-button" onClick={onSignIn} title="Sign in to your account">Sign In</button>
              <button className="cta-button" onClick={onSignUp} title="Create a new account">Sign Up</button>
            </>
          )}
        </div>
        <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle navigation menu" title="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  )
}
