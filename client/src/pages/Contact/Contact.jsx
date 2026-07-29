import { useState } from 'react'
import { Clock3, Mail, MapPin, Phone, Send } from 'lucide-react'
import { PublicNavbar } from '../../components/Navbar'
import { PublicFAQ, PublicFooter } from '../../components/PublicExtras/PublicExtras'
import { API_BASE_URL as API_BASE } from '../../config/api'
import './Contact.css'

const initialContactForm = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
}

const contactItems = [
  {
    icon: MapPin,
    title: 'Visit Us',
    text: '123 Education Street, Bangalore, Karnataka 560001'
  },
  {
    icon: Phone,
    title: 'Call Us',
    text: '+91 98765 43210 / +91 98765 43211'
  },
  {
    icon: Mail,
    title: 'Email Us',
    text: 'info@mahadevcoaching.com / admissions@mahadevcoaching.com'
  },
  {
    icon: Clock3,
    title: 'Working Hours',
    text: 'Mon-Sat: 9:00 AM - 7:00 PM'
  }
]

function Contact({ onHome, onLibrary, onCourses, onSignIn, onSchedule }) {
  const [form, setForm] = useState(initialContactForm)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateField(field, value) {
    setStatus('')
    setError('')
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setStatus('')
    setError('')

    try {
      const response = await fetch(`${API_BASE}/contact/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const body = await response.json()

      if (!response.ok) throw new Error(formatContactError(body))

      setForm(initialContactForm)
      setStatus('Message sent successfully. Our team will contact you soon.')
    } catch (err) {
      setError(err.message || 'Unable to send message right now.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="contact-page">
      <PublicNavbar
        active="contact"
        onHome={onHome}
        onLibrary={onLibrary}
        onCourses={onCourses}
        onContact={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onSignIn={onSignIn}
      />

      <section className="contact-hero">
        <h1>Get in Touch</h1>
        <p>We're here to help you start your academic journey with Mahadev Coaching</p>
      </section>

      <section className="contact-layout">
        <form className="contact-card contact-form" onSubmit={handleSubmit}>
          <h2>Send us a Message</h2>
          <label>
            <span>Your Name *</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="John Doe"
              required
            />
          </label>
          <label>
            <span>Email Address *</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="john@example.com"
              required
            />
          </label>
          <label>
            <span>Phone Number *</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              placeholder="+91 98765 43210"
              required
            />
          </label>
          <label>
            <span>Subject *</span>
            <select
              value={form.subject}
              onChange={(event) => updateField('subject', event.target.value)}
              required
            >
              <option value="">Select a subject</option>
              <option value="Admission inquiry">Admission inquiry</option>
              <option value="Course details">Course details</option>
              <option value="Batch timing">Batch timing</option>
              <option value="Fees and payment">Fees and payment</option>
            </select>
          </label>
          <label>
            <span>Message *</span>
            <textarea
              value={form.message}
              onChange={(event) => updateField('message', event.target.value)}
              placeholder="Tell us how we can help you..."
              required
            />
          </label>
          {status && <div className="contact-success">{status}</div>}
          {error && <div className="contact-error">{error}</div>}
          <button className="contact-submit" type="submit" disabled={submitting}>
            <Send size={19} />
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        <div className="contact-side">
          <section className="contact-card contact-info">
            <h2>Contact Information</h2>
            {contactItems.map((item) => {
              const Icon = item.icon
              return (
                <article className="contact-info-row" key={item.title}>
                  <div className="contact-icon">
                    <Icon size={23} />
                  </div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              )
            })}
          </section>

          <section className="contact-card location-card">
            <h2>Our Location</h2>
            <div className="map-placeholder">
              <MapPin size={48} />
              <strong>Map View</strong>
              <span>123 Education Street, Bangalore</span>
            </div>
          </section>

          <section className="questions-card">
            <h2>Have Questions?</h2>
            <p>Check out our frequently asked questions or schedule a free counseling session with our experts.</p>
            <button type="button" onClick={onSchedule}>Schedule Free Counseling</button>
          </section>
        </div>
      </section>
      <PublicFAQ />
      <PublicFooter onHome={onHome} onLibrary={onLibrary} onCourses={onCourses} onContact={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
    </main>
  )
}

function formatContactError(body) {
  if (!body?.details) return body?.message || 'Unable to send message right now.'

  const detailText = Object.values(body.details).flat().filter(Boolean).join(', ')
  return detailText ? `${body.message}: ${detailText}` : body.message
}

export default Contact
