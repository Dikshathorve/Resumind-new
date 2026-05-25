import './HeroSection.css'
import { Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function HeroSection({ onStart, onSignUp }) {
  const { isAuthenticated } = useAuth()

  return (
    <section className="hero" id="home">
      <div className="hero-badge">
        <Users size={18} color="#8b5cf6" strokeWidth={2} />
        <span>Trusted by <span className="badge-number">100,000+</span> professionals worldwide</span>
      </div>

      <div className="hero-content">
        <h2>
          Build your CV <br />
          <span className="gradient-text">smarter, faster, better</span>
        </h2>
        <p className="hero-subtitle">
          AI-powered resume builder tailored to your dream job.<br />
          Get matched with the right keywords, tone, and layout — in minutes.
        </p>
        <div className="hero-buttons">
          {isAuthenticated ? (
            <button className="primary-button" onClick={onStart} title="Start building your resume">Build my CV</button>
          ) : (
            <button className="primary-button" onClick={onSignUp} title="Sign up and build your resume">Build my CV</button>
          )}
        </div>
      </div>
    </section>
  )
}
