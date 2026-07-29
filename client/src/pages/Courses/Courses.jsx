import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  FileText,
  Grid2X2,
  IndianRupee,
  List,
  Search,
  SlidersHorizontal,
  Tags,
  UsersRound
} from 'lucide-react'
import { PublicNavbar } from '../../components/Navbar'
import { PublicFAQ, PublicFooter } from '../../components/PublicExtras/PublicExtras'
import { API_BASE_URL as API_BASE } from '../../config/api'
import {
  COURSE_CATEGORIES,
  getCourseCategory,
  getCourseImage
} from './courseCatalog'
import './Courses.css'

const priceFilters = [
  { value: 'all', label: 'All Courses' },
  { value: 'free', label: 'Free Course' },
  { value: 'premium', label: 'Premium Courses' }
]

const sortOptions = [
  { value: 'recent', label: 'Newest' },
  { value: 'priceLow', label: 'Price: Low to High' },
  { value: 'priceHigh', label: 'Price: High to Low' },
  { value: 'title', label: 'Title A-Z' }
]

const durationFilters = [
  { value: 'all', label: 'Any Duration' },
  { value: 'short', label: 'Short / Crash' },
  { value: 'medium', label: '1-3 Months' },
  { value: 'long', label: '4+ Months' }
]

const blankApplicationForm = {
  name: '',
  email: '',
  phone: '',
  message: ''
}

function CoursesPage({ onHome, onLibrary, onContact, onSignIn }) {
  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [priceFilter, setPriceFilter] = useState('all')
  const [durationFilter, setDurationFilter] = useState('all')
  const [classFilter, setClassFilter] = useState('all')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [compareIds, setCompareIds] = useState([])
  const [applyingCourse, setApplyingCourse] = useState(null)
  const [applicationForm, setApplicationForm] = useState(blankApplicationForm)
  const [applicationStatus, setApplicationStatus] = useState('')
  const [applicationError, setApplicationError] = useState('')
  const [submittingApplication, setSubmittingApplication] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadCourses() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${API_BASE}/courses/public`)
        const body = await response.json()
        if (!response.ok) throw new Error(body.message || 'Unable to load courses')

        if (mounted) setCourses(body.courses || [])
      } catch (err) {
        if (mounted) setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadCourses()

    return () => {
      mounted = false
    }
  }, [])

  const categoryCounts = useMemo(() => {
    return courses.reduce((counts, course) => {
      const courseCategory = getCourseCategory(course)
      counts[courseCategory] = (counts[courseCategory] || 0) + 1
      return counts
    }, {})
  }, [courses])

  const classOptions = useMemo(() => uniqueCourseValues(courses, (course) => course.class_level || course.classLevel), [courses])
  const subjectOptions = useMemo(() => uniqueCourseValues(courses, (course) => course.subject), [courses])

  const visibleCourses = useMemo(() => {
    const query = search.trim().toLowerCase()

    const filtered = courses.filter((course) => {
      const courseCategory = getCourseCategory(course)
      const fee = Number(course.fee || 0)
      const courseClass = String(course.class_level || course.classLevel || '')
      const courseSubject = course.subject || ''
      const matchesCategory = category === 'all' || courseCategory === category
      const matchesPrice =
        priceFilter === 'all' ||
        (priceFilter === 'free' && fee <= 0) ||
        (priceFilter === 'premium' && fee > 0)
      const matchesDuration = durationFilter === 'all' || durationBucket(course.duration) === durationFilter
      const matchesClass = classFilter === 'all' || courseClass === String(classFilter)
      const matchesSubject = subjectFilter === 'all' || courseSubject === subjectFilter
      const matchesSearch =
        !query ||
        [course.title, course.description, course.details, courseSubject, course.tags, courseCategory, course.duration]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query))

      return matchesCategory && matchesPrice && matchesDuration && matchesClass && matchesSubject && matchesSearch
    })

    return [...filtered].sort((left, right) => {
      if (sortBy === 'priceLow') return Number(left.fee || 0) - Number(right.fee || 0)
      if (sortBy === 'priceHigh') return Number(right.fee || 0) - Number(left.fee || 0)
      if (sortBy === 'title') return left.title.localeCompare(right.title)

      return Number(right.id || 0) - Number(left.id || 0)
    })
  }, [category, classFilter, courses, durationFilter, priceFilter, search, sortBy, subjectFilter])

  const compareCourses = useMemo(
    () => courses.filter((course) => compareIds.includes(course.id)),
    [compareIds, courses]
  )

  function toggleCompare(courseId) {
    setCompareIds((current) => {
      if (current.includes(courseId)) return current.filter((id) => id !== courseId)
      if (current.length >= 3) return current
      return [...current, courseId]
    })
  }

  return (
    <main className="courses-page">
      <PublicNavbar
        active="courses"
        onHome={onHome}
        onLibrary={onLibrary}
        onCourses={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onContact={onContact}
        onSignIn={onSignIn}
      />

      <section className="courses-hero">
        <div>
          <span>Mahadev Coaching Courses</span>
          <h1>Find the right course for your next academic goal.</h1>
          <p>
            Browse admin-managed classroom programs by category, fee, and duration. Every course card here comes
            directly from the course catalog maintained by the admin.
          </p>
        </div>
      </section>

      <section className="courses-browser">
        <aside className="courses-sidebar" aria-label="Course filters">
          <FilterGroup title="Course Category">
            <button
              className={category === 'all' ? 'active' : ''}
              type="button"
              onClick={() => setCategory('all')}
            >
              <BookShelfIcon />
              <span>All Categories</span>
              <strong>{courses.length}</strong>
            </button>
            {COURSE_CATEGORIES.map((item) => {
              const Icon = item.icon
              return (
                <button
                  className={category === item.value ? 'active' : ''}
                  key={item.value}
                  type="button"
                  onClick={() => setCategory(item.value)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  <strong>{categoryCounts[item.value] || 0}</strong>
                </button>
              )
            })}
          </FilterGroup>

          <FilterGroup title="Price Filter">
            {priceFilters.map((filter) => (
              <button
                className={priceFilter === filter.value ? 'active' : ''}
                key={filter.value}
                type="button"
                onClick={() => setPriceFilter(filter.value)}
              >
                <IndianRupee size={18} />
                <span>{filter.label}</span>
              </button>
            ))}
          </FilterGroup>
          <FilterGroup title="Duration">
            {durationFilters.map((filter) => (
              <button
                className={durationFilter === filter.value ? 'active' : ''}
                key={filter.value}
                type="button"
                onClick={() => setDurationFilter(filter.value)}
              >
                <Clock3 size={18} />
                <span>{filter.label}</span>
              </button>
            ))}
          </FilterGroup>
          <FilterGroup title="Class & Subject">
            <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
              <option value="all">All Classes</option>
              {classOptions.map((item) => (
                <option key={item} value={item}>Class {item}</option>
              ))}
            </select>
            <select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}>
              <option value="all">All Subjects</option>
              {subjectOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </FilterGroup>
        </aside>

        <div className="courses-content">
          <div className="courses-toolbar">
            <label className="course-search">
              <input
                type="search"
                value={search}
                placeholder="Search"
                onChange={(event) => setSearch(event.target.value)}
              />
              <Search size={22} />
            </label>

            <label className="sort-select">
              <span>Sort By:</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="view-toggle" aria-label="Course view">
              <button
                className={viewMode === 'grid' ? 'active' : ''}
                type="button"
                title="Grid view"
                onClick={() => setViewMode('grid')}
              >
                <Grid2X2 size={20} />
              </button>
              <button
                className={viewMode === 'list' ? 'active' : ''}
                type="button"
                title="List view"
                onClick={() => setViewMode('list')}
              >
                <List size={22} />
              </button>
              <button type="button" title="Filters" onClick={() => setCategory('all')}>
                <SlidersHorizontal size={20} />
              </button>
            </div>
          </div>

          {loading && <div className="course-state">Loading courses...</div>}
          {error && <div className="course-state error">{error}</div>}
          {!loading && !error && visibleCourses.length === 0 && (
            <div className="course-state">No courses match the selected filters.</div>
          )}

          <div className={viewMode === 'list' ? 'course-card-grid list' : 'course-card-grid'}>
            {visibleCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                compareSelected={compareIds.includes(course.id)}
                compareDisabled={!compareIds.includes(course.id) && compareIds.length >= 3}
                onCompare={() => toggleCompare(course.id)}
                onDetails={setSelectedCourse}
              />
            ))}
          </div>
          {compareCourses.length > 0 && (
            <CompareTray courses={compareCourses} onClear={() => setCompareIds([])} />
          )}
        </div>
      </section>

      {selectedCourse && (
        <CourseDetailsModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onApply={() => {
            setApplyingCourse(selectedCourse)
            setSelectedCourse(null)
          }}
        />
      )}
      <PublicFAQ />
      <PublicFooter onHome={onHome} onLibrary={onLibrary} onCourses={() => window.scrollTo({ top: 0, behavior: 'smooth' })} onContact={onContact} />
      {applyingCourse && (
        <ApplicationModal
          course={applyingCourse}
          form={applicationForm}
          status={applicationStatus}
          error={applicationError}
          submitting={submittingApplication}
          onField={(field, value) => {
            setApplicationStatus('')
            setApplicationError('')
            setApplicationForm((current) => ({ ...current, [field]: value }))
          }}
          onClose={() => {
            setApplyingCourse(null)
            setApplicationForm(blankApplicationForm)
            setApplicationStatus('')
            setApplicationError('')
          }}
          onSubmit={async (event) => {
            event.preventDefault()
            setSubmittingApplication(true)
            setApplicationStatus('')
            setApplicationError('')

            try {
              const response = await fetch(`${API_BASE}/course-applications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...applicationForm,
                  courseId: applyingCourse.id,
                  courseTitle: applyingCourse.title
                })
              })
              const body = await response.json()
              if (!response.ok) throw new Error(formatApplicationError(body))

              setApplicationForm(blankApplicationForm)
              setApplicationStatus('Application submitted. Our team will contact you soon.')
            } catch (err) {
              setApplicationError(err.message || 'Unable to submit application right now.')
            } finally {
              setSubmittingApplication(false)
            }
          }}
        />
      )}
    </main>
  )
}

function FilterGroup({ title, children }) {
  return (
    <section className="filter-group">
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  )
}

function CourseCard({ course, compareSelected, compareDisabled, onCompare, onDetails }) {
  const category = getCourseCategory(course)
  const tags = parseTags(course.tags)

  return (
    <article className="public-course-card">
      <img src={course.image_url || course.imageUrl || getCourseImage(category)} alt={`${category} course`} />
      <div className="public-course-card-body">
        <span>{category}</span>
        <h2>{course.title}</h2>
        <p>{course.description || 'Course details will be updated by the admin soon.'}</p>
        <div className="course-tag-row">
          {tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <div className="course-meta-row">
          <small>
            <Clock3 size={16} />
            {course.duration || 'Duration will be announced'}
          </small>
          <small>
            <IndianRupee size={16} />
            {formatCourseFee(course.fee)}
          </small>
          <small>
            <UsersRound size={16} />
            {course.available_seats || course.availableSeats || 'Seats TBA'} seats
          </small>
        </div>
        <div className="course-card-actions">
          <button type="button" onClick={() => onDetails(course)}>
            Details
            <ArrowRight size={18} />
          </button>
          <button type="button" className="compare-button" disabled={compareDisabled} onClick={onCompare}>
            {compareSelected ? 'Remove' : 'Compare'}
          </button>
        </div>
      </div>
    </article>
  )
}

function CourseDetailsModal({ course, onClose, onApply }) {
  const category = getCourseCategory(course)
  const tags = parseTags(course.tags)
  const syllabusItems = parseList(course.syllabus)

  return (
    <div className="course-detail-backdrop">
      <article className="course-detail-modal">
        <header>
          <div>
            <span>{category}</span>
            <h2>{course.title}</h2>
          </div>
          <button type="button" onClick={onClose}>Close</button>
        </header>
        <img src={course.image_url || course.imageUrl || getCourseImage(category)} alt={`${course.title} course`} />
        <p>{course.details || course.description || 'Detailed syllabus and batch information will be updated soon.'}</p>
        {tags.length > 0 && (
          <div className="course-detail-tags">
            <Tags size={18} />
            {tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        )}
        <div className="course-detail-facts">
          <span><Clock3 size={17} /> {course.duration || 'Duration TBA'}</span>
          <span><IndianRupee size={17} /> {formatCourseFee(course.fee)}</span>
          <span><FileText size={17} /> {course.class_count || course.classCount || 'Flexible'} classes</span>
          <span><CalendarDays size={17} /> {formatCourseDate(course.start_date || course.startDate)}</span>
          <span><UsersRound size={17} /> {course.teacher_name || course.teacherName || 'Faculty TBA'}</span>
          <span><UsersRound size={17} /> {course.available_seats || course.availableSeats || 'Seats TBA'} seats</span>
          <span><Clock3 size={17} /> {course.batch_timing || course.batchTiming || 'Batch timing TBA'}</span>
          <span><BookShelfIcon /> {course.class_level || course.classLevel ? `Class ${course.class_level || course.classLevel}` : 'All classes'}</span>
        </div>
        {syllabusItems.length > 0 && (
          <section className="course-syllabus">
            <h3>Syllabus / Modules</h3>
            <ul>
              {syllabusItems.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>
        )}
        <footer>
          <button type="button" onClick={onApply}>Apply for this course</button>
        </footer>
      </article>
    </div>
  )
}

function CompareTray({ courses, onClear }) {
  return (
    <section className="compare-tray">
      <header>
        <h2>Compare Courses</h2>
        <button type="button" onClick={onClear}>Clear</button>
      </header>
      <div className="compare-grid">
        {courses.map((course) => (
          <article key={course.id}>
            <strong>{course.title}</strong>
            <span>{getCourseCategory(course)}</span>
            <span>{course.duration || 'Duration TBA'}</span>
            <span>{formatCourseFee(course.fee)}</span>
            <span>{course.teacher_name || course.teacherName || 'Faculty TBA'}</span>
            <span>{course.available_seats || course.availableSeats || 'Seats TBA'} seats</span>
          </article>
        ))}
      </div>
    </section>
  )
}

function ApplicationModal({ course, form, status, error, submitting, onField, onClose, onSubmit }) {
  return (
    <div className="course-detail-backdrop">
      <form className="course-application-modal" onSubmit={onSubmit}>
        <header>
          <div>
            <span>Apply for</span>
            <h2>{course.title}</h2>
          </div>
          <button type="button" onClick={onClose}>Close</button>
        </header>
        <label>
          Name
          <input value={form.name} onChange={(event) => onField('name', event.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(event) => onField('email', event.target.value)} required />
        </label>
        <label>
          Phone
          <input value={form.phone} onChange={(event) => onField('phone', event.target.value)} required />
        </label>
        <label>
          Message
          <textarea
            value={form.message}
            onChange={(event) => onField('message', event.target.value)}
            placeholder="Preferred timing, class, or questions..."
          />
        </label>
        {status && <div className="application-success">{status}</div>}
        {error && <div className="application-error">{error}</div>}
        <button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Application'}</button>
      </form>
    </div>
  )
}

function formatApplicationError(body) {
  if (!body?.details) return body?.message || 'Unable to submit application right now.'
  const detailText = Object.values(body.details).flat().filter(Boolean).join(', ')
  return detailText ? `${body.message}: ${detailText}` : body.message
}

function BookShelfIcon() {
  return <UsersRound size={18} />
}

function formatCourseFee(value) {
  const amount = Number(value || 0)
  if (amount <= 0) return 'Free'

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

function parseTags(value = '') {
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseList(value = '') {
  return String(value)
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function uniqueCourseValues(courses, getter) {
  return [...new Set(courses.map(getter).filter(Boolean).map(String))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
}

function durationBucket(duration = '') {
  const text = String(duration).toLowerCase()
  if (!text.trim()) return 'unknown'
  const number = Number((text.match(/\d+/) || [0])[0])

  if (text.includes('week') || text.includes('crash') || number <= 1) return 'short'
  if (number <= 3) return 'medium'
  return 'long'
}

export default CoursesPage
