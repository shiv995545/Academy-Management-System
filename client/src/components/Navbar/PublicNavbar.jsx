import { BookOpen, ChevronDown, Globe, Phone } from 'lucide-react'
import './PublicNavbar.css'

function PublicNavbar({ active = 'home', onHome, onLibrary, onCourses, onContact, onSignIn }) {
  return (
    <header className="public-navbar">
      <div className="public-nav-inner">
        <div className="public-left">
          <button className="public-brand" type="button" onClick={onHome} aria-label="Mahadev Coaching home">
            <BookOpen size={30} />
            <span>Mahadev Coaching</span>
          </button>
          <nav className="public-links" aria-label="Primary navigation">
            <button className={active === 'home' ? 'active' : ''} type="button" onClick={onHome}>
              Home
            </button>
            <button className={active === 'library' ? 'active' : ''} type="button" onClick={onLibrary}>
              Library
            </button>
            <button className={active === 'courses' ? 'active' : ''} type="button" onClick={onCourses}>
              Courses
            </button>
          </nav>
        </div>

        <div className="public-actions">
          <button type="button" className="language-button" title="Language selection">
            <Globe size={18} />
            EN
            <ChevronDown size={16} />
          </button>
          <button className={active === 'login' ? 'active' : ''} type="button" onClick={onSignIn}>
            Sign In
          </button>
          <button className={active === 'contact' ? 'active' : ''} type="button" onClick={onContact}>
            Contact Us
          </button>
          <a href="tel:+919876543210" className="phone-link">
            <Phone size={18} />
            +91 98765 43210
          </a>
        </div>
      </div>
    </header>
  )
}

export default PublicNavbar
