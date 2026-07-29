import { useEffect, useState } from 'react'
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Clock3,
  IndianRupee,
  TrendingUp,
  UserRoundCheck,
  UsersRound
} from 'lucide-react'
import { PublicNavbar } from '../../components/Navbar'
import { PublicFAQ, PublicFooter } from '../../components/PublicExtras/PublicExtras'
import { API_BASE_URL as API_BASE } from '../../config/api'
import './Home.css'

const fallbackCourses = [
  {
    id: 'physics',
    title: 'Physics',
    duration: '6 months',
    fee: 0,
    description: 'Concept-focused coaching with practice, doubt sessions, and revision support.'
  },
  {
    id: 'mathematics',
    title: 'Mathematics',
    duration: '6 months',
    fee: 0,
    description: 'Step-by-step problem solving for school exams, boards, and competitive foundations.'
  },
  {
    id: 'commerce',
    title: 'Commerce',
    duration: '6 months',
    fee: 0,
    description: 'Structured classes for accounts, economics, and business studies fundamentals.'
  },
  {
    id: 'english',
    title: 'English',
    duration: '6 months',
    fee: 0,
    description: 'Grammar, comprehension, and writing practice with regular feedback.'
  }
]

const heroSlides = [
  {
    image: '/images/home-hero.png',
    alt: 'Students studying in a classroom'
  },
  {
    image: '/images/home-slide-science.svg',
    alt: 'Science coaching classroom sample'
  },
  {
    image: '/images/home-slide-library.svg',
    alt: 'Study library coaching session sample'
  }
]

const reasons = [
  {
    icon: Award,
    title: 'Expert Faculty',
    text: 'Learn with experienced teachers who explain concepts clearly and patiently'
  },
  {
    icon: Clock3,
    title: 'Doubt Support',
    text: 'Regular doubt sessions help students fix weak topics before tests'
  },
  {
    icon: UsersRound,
    title: 'Small Batches',
    text: 'Focused batch sizes make classroom attention more personal and practical'
  },
  {
    icon: TrendingUp,
    title: 'Test Series',
    text: 'Chapter tests and revision checks keep exam preparation steady'
  }
]

const stories = [
  {
    quote:
      'Mahadev Coaching helped me score 95% in Physics. The conceptual clarity I gained was incredible!',
    name: 'Rahul Sharma',
    detail: 'IIT Delhi - Engineering'
  },
  {
    quote:
      'Best coaching institute! The faculty is extremely supportive and made complex topics easy to understand.',
    name: 'Priya Patel',
    detail: 'SRCC - Commerce'
  },
  {
    quote:
      'From struggling with Maths to scoring 98%! The personalized attention here makes all the difference.',
    name: 'Amit Kumar',
    detail: 'St. Stephens - Economics'
  }
]

function Home({ onLibrary, onCourses, onContact, onSignIn, onEnroll }) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [courses, setCourses] = useState(fallbackCourses)
  const [upcomingCourses, setUpcomingCourses] = useState([])
  const [publicBatches, setPublicBatches] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(true)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length)
    }, 4500)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    let mounted = true

    async function loadPublicBatches() {
      try {
        const response = await fetch(`${API_BASE}/batches/public`)
        const body = await response.json()
        if (!response.ok) return
        if (mounted) setPublicBatches(body.batches || [])
      } catch (err) {
        if (mounted) setPublicBatches([])
      }
    }

    loadPublicBatches()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function loadFeaturedCourses() {
      try {
        const response = await fetch(`${API_BASE}/courses/public`)
        const body = await response.json()
        if (!response.ok) throw new Error(body.message || 'Unable to load courses')

        if (mounted && body.courses?.length) {
          const publicCourses = body.courses || []
          const featured = publicCourses.filter((course) => course.is_featured ?? course.isFeatured)
          setCourses(featured.length ? featured : publicCourses)
          setUpcomingCourses(publicCourses.filter((course) => course.is_upcoming ?? course.isUpcoming))
        }
      } catch (err) {
        if (mounted) setCourses(fallbackCourses)
      } finally {
        if (mounted) setCoursesLoading(false)
      }
    }

    loadFeaturedCourses()

    return () => {
      mounted = false
    }
  }, [])

  function scrollToCourses() {
    document.getElementById('popular-courses')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function showPreviousSlide() {
    setActiveSlide((current) => (current === 0 ? heroSlides.length - 1 : current - 1))
  }

  function showNextSlide() {
    setActiveSlide((current) => (current + 1) % heroSlides.length)
  }

  return (
    <main className="home-page">
      <PublicNavbar
        active="home"
        onHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onLibrary={onLibrary}
        onCourses={onCourses || scrollToCourses}
        onContact={onContact}
        onSignIn={onSignIn}
      />

      <section className="home-hero" aria-label="Mahadev Coaching classroom">
        {heroSlides.map((slide, index) => (
          <img
            key={slide.image}
            src={slide.image}
            alt={slide.alt}
            className={activeSlide === index ? 'active' : ''}
            aria-hidden={activeSlide !== index}
          />
        ))}
        <div className="home-hero-overlay" />
        <button className="hero-arrow hero-arrow-left" type="button" title="Previous slide" onClick={showPreviousSlide}>
          <ChevronLeft size={34} />
        </button>
        <button className="hero-arrow hero-arrow-right" type="button" title="Next slide" onClick={showNextSlide}>
          <ChevronRight size={34} />
        </button>
        <div className="hero-dots" aria-label="Hero slides">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.image}
              className={activeSlide === index ? 'active' : ''}
              type="button"
              aria-label={`Show slide ${index + 1}`}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
      </section>

      <section className="home-cta">
        <h1>Master Your Subjects with Mahadev Coaching</h1>
        <p>Transform your academic journey with expert guidance and personalized attention</p>
        <div className="home-cta-actions">
          <button type="button" onClick={onEnroll}>Enroll Now</button>
          <button type="button" className="outline" onClick={onCourses || scrollToCourses}>View Courses</button>
          <button type="button" className="outline" onClick={onContact}>Contact Counselor</button>
        </div>
      </section>

      <section className="home-section why-section">
        <h2>Why Choose Mahadev Coaching?</h2>
        <div className="reason-grid">
          {reasons.map((reason) => {
            const Icon = reason.icon
            return (
              <article className="reason-card" key={reason.title}>
                <Icon size={54} />
                <h3>{reason.title}</h3>
                <p>{reason.text}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="home-section course-section" id="popular-courses">
        <h2>Featured Courses</h2>
        {coursesLoading && <p className="course-loading">Loading latest courses...</p>}
        <div className="course-grid">
          {courses.map((course) => (
            <article className="home-course-card" key={course.id || course.title}>
              <h3>{course.title}</h3>
              <p><Clock3 size={18} /> {course.duration || 'Duration will be announced'}</p>
              <p><IndianRupee size={18} /> {formatCourseFee(course.fee)}</p>
              <p className="course-description">{course.description || 'Course details will be updated soon.'}</p>
              <button type="button" onClick={onEnroll}>Enroll Now</button>
            </article>
          ))}
        </div>
      </section>

      {upcomingCourses.length > 0 && (
        <section className="home-section upcoming-section">
          <h2>Upcoming Courses</h2>
          <div className="upcoming-grid">
            {upcomingCourses.slice(0, 3).map((course) => (
              <article className="upcoming-card" key={course.id || course.title}>
                <span>{formatCourseDate(course.start_date || course.startDate)}</span>
                <h3>{course.title}</h3>
                <p>{course.details || course.description || 'Upcoming batch details will be updated soon.'}</p>
                <small>{course.class_count || course.classCount || 'Flexible'} classes · {course.duration || 'Duration TBA'}</small>
              </article>
            ))}
          </div>
        </section>
      )}

      {publicBatches.length > 0 && (
        <section className="home-section batch-section">
          <h2>Upcoming Batches</h2>
          <div className="upcoming-grid">
            {publicBatches.slice(0, 3).map((batch) => (
              <article className="upcoming-card" key={batch.id}>
                <span>{batch.schedule || 'Schedule TBA'}</span>
                <h3>{batch.name}</h3>
                <p>{batch.course_title || 'Course to be announced'}</p>
                <small>{batch.teacher_name || 'Faculty TBA'} · {batch.course_category || 'Academy batch'}</small>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="home-section stories-section">
        <h2>Success Stories</h2>
        <div className="story-grid">
          {stories.map((story) => (
            <article className="story-card" key={story.name}>
              <div className="story-stars" aria-label="5 star rating">
                {Array.from({ length: 5 }, (_, index) => (
                  <UserRoundCheck size={24} key={index} />
                ))}
              </div>
              <blockquote>&quot;{story.quote}&quot;</blockquote>
              <strong>{story.name}</strong>
              <span>{story.detail}</span>
            </article>
          ))}
        </div>
      </section>
      <PublicFAQ />
      <PublicFooter onHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })} onLibrary={onLibrary} onCourses={onCourses} onContact={onContact} />
    </main>
  )
}

function formatCourseFee(value) {
  const amount = Number(value || 0)
  if (amount <= 0) return 'Fee on request'

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

function formatCourseDate(value) {
  if (!value) return 'Starting soon'

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value))
}

export default Home
