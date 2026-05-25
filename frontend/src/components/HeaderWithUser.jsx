import { useState } from 'react'
import './Header.css'
import { Sparkles } from 'lucide-react'

export default function HeaderWithUser({ onLogout, userName = 'Avinosh', navActions = null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
          {/* Navigation items removed as per requirement */}
        </nav>
        {navActions && (
          <div className="nav-actions-center">
            {navActions}
          </div>
        )}
        <div className="header-actions">
          <div className="user-info-header">
            <span className="user-name-header">Hi, {userName}</span>
            <button className="logout-btn-header" onClick={onLogout} title="Logout from your account">Logout</button>
          </div>
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
