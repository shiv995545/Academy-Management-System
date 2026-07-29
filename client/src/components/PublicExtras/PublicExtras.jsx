import { BookOpen, Mail, MapPin, Phone } from 'lucide-react'
import './PublicExtras.css'

const faqItems = [
  ['Can I browse courses without login?', 'Yes. Courses, library resources, timings, and contact details are public.'],
  ['How do I apply for a course?', 'Open a course, click apply, and submit your contact details. The admin team can review it.'],
  ['Are class levels fixed?', 'No. Admin can add more classes such as Class 11 and Class 12 from the dashboard.'],
  ['Who updates library resources?', 'Teachers and admins manage resources. Public visitors can only browse and open them.']
]

function PublicFAQ() {
  return (
    <section className="public-faq">
      <div className="public-section-heading">
        <p>Questions</p>
        <h2>Helpful answers before you contact us</h2>
      </div>
      <div className="faq-grid">
        {faqItems.map(([question, answer]) => (
          <article key={question}>
            <h3>{question}</h3>
            <p>{answer}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function PublicFooter({ onHome, onLibrary, onCourses, onContact }) {
  return (
    <footer className="public-footer">
      <div className="footer-brand">
        <BookOpen size={30} />
        <div>
          <strong>Mahadev Coaching</strong>
          <span>Structured learning support for school students.</span>
        </div>
      </div>
      <nav aria-label="Footer navigation">
        <button type="button" onClick={onHome}>Home</button>
        <button type="button" onClick={onLibrary}>Library</button>
        <button type="button" onClick={onCourses}>Courses</button>
        <button type="button" onClick={onContact}>Contact</button>
      </nav>
      <div className="footer-contact">
        <span><Phone size={17} /> +91 98765 43210</span>
        <span><Mail size={17} /> info@mahadevcoaching.com</span>
        <span><MapPin size={17} /> 123 Education Street, Bangalore</span>
      </div>
    </footer>
  )
}

export { PublicFAQ, PublicFooter }
