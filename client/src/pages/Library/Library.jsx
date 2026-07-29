import { useEffect, useMemo, useState } from 'react'
import {
  BookMarked,
  BookOpen,
  Brain,
  Award,
  ChevronRight,
  ClipboardList,
  Download,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  MonitorPlay,
  NotebookPen,
  Play,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  UsersRound
} from 'lucide-react'
import { PublicNavbar } from '../../components/Navbar'
import { PublicFAQ, PublicFooter } from '../../components/PublicExtras/PublicExtras'
import './Library.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

const fallbackClasses = Array.from({ length: 10 }, (_, index) => {
  const classNumber = index + 1
  const stage = classNumber <= 5 ? 'Foundation focus' : classNumber <= 8 ? 'Concept building' : 'Board prep'
  return { value: classNumber, label: `Class ${classNumber}`, stage }
})

const subjects = ['All Subjects', 'Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Computer Science']

const categories = [
  { name: 'NCERT Solutions', icon: BookOpen },
  { name: 'Worksheets', icon: NotebookPen },
  { name: 'Sample Papers', icon: FileText },
  { name: 'Video Lessons', icon: MonitorPlay },
  { name: 'Quizzes', icon: Brain },
  { name: 'Olympiad Prep', icon: Sparkles },
  { name: 'Revision Notes', icon: BookMarked },
  { name: 'Parent Resources', icon: UsersRound }
]

const classVisuals = [
  { tone: 'pink', icon: Sparkles },
  { tone: 'violet', icon: BookOpen },
  { tone: 'blue', icon: NotebookPen },
  { tone: 'cyan', icon: ClipboardList },
  { tone: 'teal', icon: TrendingUp },
  { tone: 'green', icon: GraduationCap },
  { tone: 'lime', icon: Brain },
  { tone: 'amber', icon: Award },
  { tone: 'orange', icon: Star },
  { tone: 'rose', icon: BookMarked }
]

const subjectCards = [
  { name: 'Mathematics', icon: Brain, tone: 'blue' },
  { name: 'Science', icon: Sparkles, tone: 'green' },
  { name: 'English', icon: BookOpen, tone: 'violet' },
  { name: 'Social Studies', icon: UsersRound, tone: 'amber' },
  { name: 'Hindi', icon: NotebookPen, tone: 'rose' },
  { name: 'Computer Science', icon: MonitorPlay, tone: 'cyan' }
]

const tabItems = [
  { id: 'all', label: 'All Resources', icon: BookOpen },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'new', label: 'New Uploads', icon: Sparkles },
  { id: 'popular', label: 'Most Popular', icon: Star }
]

const resources = [
  {
    title: 'Counting and Number Names Practice',
    classLevel: 1,
    subject: 'Mathematics',
    category: 'Worksheets',
    description: 'Gentle counting, number names, and picture-based sums for early foundation practice.',
    meta: 'Worksheet · 15 min',
    views: 128,
    downloads: 42,
    access: 'Free',
    tone: 'blue'
  },
  {
    title: 'Reading Comprehension - Short Stories',
    classLevel: 2,
    subject: 'English',
    category: 'Worksheets',
    description: 'Short passages with simple questions to build reading habits and sentence confidence.',
    meta: 'Worksheet · 18 min',
    views: 96,
    downloads: 30,
    access: 'Free',
    tone: 'purple'
  },
  {
    title: 'Plants Around Us Revision Notes',
    classLevel: 3,
    subject: 'Science',
    category: 'Revision Notes',
    description: 'Simple notes on roots, stems, leaves, flowers, and everyday plant examples.',
    meta: 'Notes · 12 min',
    views: 111,
    downloads: 38,
    access: 'Free',
    tone: 'green'
  },
  {
    title: 'Complete NCERT Solutions - Integers',
    classLevel: 7,
    subject: 'Mathematics',
    category: 'NCERT Solutions',
    description: 'Step-by-step integer examples with coaching-style shortcuts and solved textbook questions.',
    meta: 'PDF · 25 min',
    featured: true,
    views: 316,
    downloads: 118,
    access: 'Free',
    tone: 'blue'
  },
  {
    title: 'Photosynthesis Worksheet with Answers',
    classLevel: 6,
    subject: 'Science',
    category: 'Worksheets',
    description: 'Practice diagrams, fill-in-the-blanks, and answer key for quick checking after class.',
    meta: 'Worksheet · 20 min',
    featured: true,
    views: 281,
    downloads: 104,
    access: 'Free',
    tone: 'green'
  },
  {
    title: 'English Grammar Tenses Practice Test',
    classLevel: 8,
    subject: 'English',
    category: 'Quizzes',
    description: 'Mixed tense questions for daily grammar practice with answer explanations.',
    meta: 'Quiz · 15 min',
    views: 172,
    downloads: 54,
    access: 'Free',
    tone: 'purple'
  },
  {
    title: 'Fractions Made Easy Video Tutorial',
    classLevel: 5,
    subject: 'Mathematics',
    category: 'Video Lessons',
    description: 'A calm visual walkthrough for comparing, adding, and simplifying fractions.',
    meta: 'Video · 18 min',
    views: 208,
    downloads: 0,
    access: 'Free',
    tone: 'blue'
  },
  {
    title: 'IMO Olympiad Practice Set',
    classLevel: 4,
    subject: 'Mathematics',
    category: 'Olympiad Prep',
    description: 'Logical reasoning and number pattern questions for foundation olympiad practice.',
    meta: 'Practice set · 30 min',
    featured: true,
    views: 245,
    downloads: 88,
    access: 'Free',
    tone: 'amber'
  },
  {
    title: 'Cell Structure Quick Quiz',
    classLevel: 9,
    subject: 'Science',
    category: 'Quizzes',
    description: 'Quick concept check for cell organelles, functions, and important diagrams.',
    meta: 'Quiz · 12 min',
    views: 151,
    downloads: 24,
    access: 'Free',
    tone: 'green'
  },
  {
    title: 'Indian History Timeline Notes',
    classLevel: 10,
    subject: 'Social Studies',
    category: 'Revision Notes',
    description: 'Chapter-wise timeline notes for fast revision before school tests and boards.',
    meta: 'Notes · 22 min',
    views: 198,
    downloads: 67,
    access: 'Free',
    tone: 'slate'
  },
  {
    title: 'Hindi Vyakaran Sandhi Practice',
    classLevel: 8,
    subject: 'Hindi',
    category: 'Worksheets',
    description: 'Practice worksheet for Sandhi rules with examples, exercises, and answer hints.',
    meta: 'Worksheet · 25 min',
    views: 142,
    downloads: 49,
    access: 'Free',
    tone: 'rose'
  },
  {
    title: 'Computer Basics Sample Paper',
    classLevel: 6,
    subject: 'Computer Science',
    category: 'Sample Papers',
    description: 'School-style sample paper covering hardware, software, internet, and safety basics.',
    meta: 'Sample paper · 40 min',
    views: 119,
    downloads: 36,
    access: 'Free',
    tone: 'cyan'
  },
  {
    title: 'Weekly Study Rhythm for Classes 6 to 8',
    classLevel: 7,
    subject: 'All Subjects',
    category: 'Parent Resources',
    description: 'A practical weekly home study plan parents can follow without adding pressure.',
    meta: 'Parent guide · 10 min',
    views: 134,
    downloads: 41,
    access: 'Free',
    tone: 'slate'
  }
]

const quizTopics = ['Algebra Basics', 'Parts of Speech', 'Chemical Reactions', 'Indian History', 'Cell Structure']

const parentGuides = [
  'Weekly study rhythm for Classes 6 to 8',
  'How to revise NCERT chapters without cramming',
  'Board exam checklist for parents and students'
]

function Library({ onHome, onCourses, onContact, onSignIn }) {
  const [selectedClass, setSelectedClass] = useState(7)
  const [subject, setSubject] = useState('All Subjects')
  const [category, setCategory] = useState('All Categories')
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [notice, setNotice] = useState('')
  const [sharedResources, setSharedResources] = useState([])
  const [classLevels, setClassLevels] = useState(fallbackClasses)
  const [selectedResource, setSelectedResource] = useState(null)

  useEffect(() => {
    async function loadClassLevels() {
      try {
        const response = await fetch(`${API_BASE}/class-levels/public`)
        const body = await response.json()
        if (!response.ok || !body.classLevels?.length) return

        const mapped = body.classLevels.map((classLevel) => ({
          value: Number(classLevel.value),
          label: classLevel.label,
          stage: classLevel.stage || 'Academy class'
        }))
        setClassLevels(mapped)
        if (!mapped.some((item) => item.value === selectedClass)) {
          setSelectedClass(mapped[0].value)
        }
      } catch (err) {
        setClassLevels(fallbackClasses)
      }
    }

    loadClassLevels()
  }, [selectedClass])

  useEffect(() => {
    async function loadPublicUploads() {
      try {
        const response = await fetch(`${API_BASE}/resources`)
        const body = await response.json()
        if (!response.ok) return
        setSharedResources(
          (body.resources || []).map((resource) => ({
            id: resource.id,
            title: resource.title,
            classLevel: Number(resource.class_level || selectedClass),
            subject: resource.subject || 'All Subjects',
            category: resource.category || 'Uploaded Resources',
            description: resource.description || 'Shared by academy faculty.',
            meta: `${resource.resource_type || 'Resource'} · ${resource.original_file_name || 'Open online'}`,
            featured: resource.featured || false,
            views: Number(resource.views || 0),
            downloads: Number(resource.downloads || 0),
            createdAt: resource.created_at,
            access: resource.file_url ? 'Free' : 'Preview',
            tone: 'cyan',
            shared: true,
            fileUrl: resource.file_url
          }))
        )
      } catch (err) {
        setSharedResources([])
      }
    }

    loadPublicUploads()
  }, [selectedClass])

  const allResources = useMemo(() => [...resources, ...sharedResources], [sharedResources])

  const visibleResources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return allResources.filter((resource) => {
      const matchesClass = resource.classLevel === selectedClass
      const matchesSubject = subject === 'All Subjects' || resource.subject === subject || resource.subject === 'All Subjects'
      const matchesCategory = category === 'All Categories' || resource.category === category
      const matchesQuery =
        !normalizedQuery ||
        [resource.title, resource.subject, resource.category, resource.description]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      return matchesClass && matchesSubject && matchesCategory && matchesQuery
    })
  }, [allResources, category, query, selectedClass, subject])

  const popularResources = useMemo(
    () => [...allResources].sort((left, right) => Number(right.views || 0) - Number(left.views || 0)).slice(0, 3),
    [allResources]
  )

  const recentResources = useMemo(
    () =>
      [...allResources]
        .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
        .slice(0, 3),
    [allResources]
  )

  const tabResources = useMemo(() => {
    if (activeTab === 'trending') return allResources.filter((resource) => resource.featured).slice(0, 3)
    if (activeTab === 'new') return recentResources
    if (activeTab === 'popular') return popularResources
    return popularResources
  }, [activeTab, allResources, popularResources, recentResources])

  async function openResource(resource) {
    if (!resource.id) {
      setSelectedResource(resource)
      return
    }

    try {
      const response = await fetch(`${API_BASE}/resources/${resource.id}`)
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || 'Unable to open resource')
      const updated = {
        ...resource,
        ...body.resource,
        classLevel: Number(body.resource.class_level || resource.classLevel),
        fileUrl: body.resource.file_url,
        views: Number(body.resource.views || resource.views || 0) + 1,
        downloads: Number(body.resource.downloads || resource.downloads || 0)
      }
      setSelectedResource(updated)
      setSharedResources((current) => current.map((item) => (item.id === resource.id ? updated : item)))
    } catch (err) {
      setSelectedResource(resource)
    }
  }

  function scrollTo(sectionId) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="library-page">
      <PublicNavbar
        active="library"
        onHome={onHome}
        onLibrary={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onCourses={onCourses}
        onContact={onContact}
        onSignIn={onSignIn}
      />

      <LibraryHero
        query={query}
        classLevels={classLevels}
        resourceCount={allResources.length}
        videoCount={allResources.filter((resource) => resource.category === 'Video Lessons' || resource.meta?.toLowerCase().includes('video')).length}
        downloadCount={allResources.reduce((total, resource) => total + Number(resource.downloads || 0), 0)}
        onQuery={setQuery}
      />
      <ClassSelector classes={classLevels} selectedClass={selectedClass} onSelect={setSelectedClass} />
      {selectedClass && <SubjectPicker subject={subject} onSubject={setSubject} />}

      <section className="library-section resource-browser" id="library-resources">
        <div className="section-heading">
          <p>Browse by Type</p>
          <h2>Pick the resource format you need</h2>
        </div>
        <ResourceCategoryGrid selectedCategory={category} onSelect={setCategory} />
        <TrendingResources activeTab={activeTab} resources={tabResources} onTab={setActiveTab} onOpen={openResource} />
        <ResourceFilters
          query={query}
          subject={subject}
          category={category}
          onQuery={setQuery}
          onSubject={setSubject}
          onCategory={setCategory}
        />
        <ResourceHighlights popularResources={popularResources} recentResources={recentResources} onOpen={openResource} />
        {notice && <div className="library-notice">{notice}</div>}
        <div className="resource-grid">
          {visibleResources.length > 0 ? (
            visibleResources.map((resource) => (
              <ResourceCard key={resource.title} resource={resource} onOpen={() => openResource(resource)} />
            ))
          ) : (
            <div className="empty-resources">
              <Search size={28} />
              <strong>No resources found</strong>
              <span>Try another subject, category, search term, or class.</span>
            </div>
          )}
        </div>
      </section>

      <PracticeFlow />
      <QuizBanner onOpen={() => scrollTo('library-practice')} />
      <QuizPreview onOpen={(topic) => setNotice(`${topic} practice is available as a sample preview.`)} />
      <ParentResources />
      <PublicFAQ />
      <PublicFooter onHome={onHome} onLibrary={() => window.scrollTo({ top: 0, behavior: 'smooth' })} onCourses={onCourses} onContact={onContact} />
      {selectedResource && (
        <ResourceDetailsModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
        />
      )}
    </main>
  )
}

function getClassVisual(classValue) {
  const index = Math.max(0, Number(classValue || 1) - 1) % classVisuals.length
  return classVisuals[index]
}

function getResourceIcon(resource) {
  if (resource.category === 'Video Lessons' || resource.meta?.toLowerCase().includes('video')) return Play
  if (resource.category === 'Quizzes') return Brain
  if (resource.category === 'Worksheets') return NotebookPen
  if (resource.category === 'Sample Papers') return ClipboardList
  return BookOpen
}

function LibraryHero({ query, classLevels, resourceCount, videoCount, downloadCount, onQuery }) {
  const firstClass = classLevels[0]?.label || 'Class 1'
  const lastClass = classLevels[classLevels.length - 1]?.label || 'Class 10'

  return (
    <section className="library-hero">
      <div className="library-hero-content">
        <div className="library-badge">
          <Sparkles size={16} />
          <span>{resourceCount}+ free learning resources</span>
        </div>
        <h1>Your Learning <span>Library</span> Starts Here</h1>
        <p>
          Learn school chapters with the pace and clarity of a coaching classroom. Browse NCERT solutions,
          worksheets, video lessons, quizzes, revision notes, and parent guides from {firstClass} to {lastClass}.
        </p>
        <label className="library-hero-search">
          <Search size={22} />
          <input
            type="search"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Search topics, subjects, worksheets..."
          />
          <button type="button">Search</button>
        </label>
        <div className="library-stat-grid">
          {[
            { label: 'Resources', value: `${resourceCount}+`, icon: BookOpen },
            { label: 'Classes', value: `${classLevels.length}`, icon: GraduationCap },
            { label: 'Videos', value: `${videoCount}+`, icon: MonitorPlay },
            { label: 'Downloads', value: `${downloadCount}+`, icon: Download }
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div className="library-stat-card" key={stat.label}>
                <Icon size={24} />
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ClassSelector({ classes, selectedClass, onSelect }) {
  return (
    <section className="library-section class-selector" id="library-classes">
      <div className="section-heading">
        <p>Choose Class</p>
        <h2>Browse by school level</h2>
      </div>
      <div className="class-grid">
        {classes.map((item) => {
          const visual = getClassVisual(item.value)
          const Icon = visual.icon
          return (
            <button
              key={item.value}
              className={`class-card tone-${visual.tone} ${selectedClass === item.value ? 'active' : ''}`}
              type="button"
              onClick={() => onSelect(item.value)}
            >
              <Icon size={32} />
              <strong>{item.label}</strong>
              <span>{item.stage}</span>
              <small>{180 + Number(item.value || 1) * 28} resources</small>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function SubjectPicker({ subject, onSubject }) {
  return (
    <section className="library-section subject-picker">
      <div className="section-heading compact">
        <p>Pick a Subject</p>
        <h2>Focus the library for your current chapter</h2>
      </div>
      <div className="subject-grid">
        <button
          className={subject === 'All Subjects' ? 'active' : ''}
          type="button"
          onClick={() => onSubject('All Subjects')}
        >
          <Filter size={24} />
          <strong>All Subjects</strong>
          <span>Show everything</span>
        </button>
        {subjectCards.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.name}
              className={`tone-${item.tone} ${subject === item.name ? 'active' : ''}`}
              type="button"
              onClick={() => onSubject(item.name)}
            >
              <Icon size={24} />
              <strong>{item.name}</strong>
              <span>{item.name === 'Computer Science' ? 'Computer' : item.name}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function ResourceFilters({ query, subject, category, onQuery, onSubject, onCategory }) {
  return (
    <div className="resource-filters">
      <label className="resource-search">
        <Search size={19} />
        <input
          type="search"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search chapters, topics, worksheets..."
        />
      </label>
      <select value={subject} onChange={(event) => onSubject(event.target.value)}>
        {subjects.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
      <select value={category} onChange={(event) => onCategory(event.target.value)}>
        <option value="All Categories">All Categories</option>
        {categories.map((item) => (
          <option key={item.name} value={item.name}>{item.name}</option>
        ))}
      </select>
    </div>
  )
}

function ResourceCategoryGrid({ selectedCategory, onSelect }) {
  return (
    <div className="category-grid">
      <button
        className={selectedCategory === 'All Categories' ? 'active' : ''}
        type="button"
        onClick={() => onSelect('All Categories')}
      >
        <ClipboardList size={22} />
        <span>All Categories</span>
      </button>
      {categories.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.name}
            className={selectedCategory === item.name ? 'active' : ''}
            type="button"
            onClick={() => onSelect(item.name)}
          >
            <Icon size={22} />
            <span>{item.name}</span>
          </button>
        )
      })}
    </div>
  )
}

function TrendingResources({ activeTab, resources: tabResources, onTab, onOpen }) {
  return (
    <section className="trending-section">
      <div className="trending-heading">
        <div>
          <TrendingUp size={30} />
          <h2>Trending Now</h2>
        </div>
        <span>Popular uploads, new notes, and student-favorite practice material.</span>
      </div>
      <div className="library-tabs">
        {tabItems.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => onTab(tab.id)}
            >
              <Icon size={17} />
              {tab.label}
            </button>
          )
        })}
      </div>
      <div className="trending-grid">
        {tabResources.map((resource) => {
          const ResourceIcon = getResourceIcon(resource)
          return (
            <article className="trending-card" key={`trend-${resource.id || resource.title}`}>
              <div className={`trending-visual ${resource.tone || 'blue'}`}>
                <ResourceIcon size={34} />
                <div className="trending-badges">
                  <span>Class {resource.classLevel}</span>
                  {resource.featured && <strong>Featured</strong>}
                </div>
                <button type="button" onClick={() => onOpen(resource)}>
                  {resource.category === 'Video Lessons' ? <Play size={16} /> : <Eye size={16} />}
                  {resource.category === 'Video Lessons' ? 'Watch Now' : 'View Now'}
                </button>
              </div>
              <div className="trending-body">
                <span>{resource.category}</span>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <div>
                  <small><Download size={14} /> {resource.downloads || 0}</small>
                  <small><Eye size={14} /> {resource.views || 0}</small>
                  <small><Star size={14} /> 4.{Math.min(9, Math.max(6, Number(resource.classLevel || 7)))}</small>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function ResourceHighlights({ popularResources, recentResources, onOpen }) {
  return (
    <div className="resource-highlights">
      <section>
        <h3>Popular Resources</h3>
        {popularResources.map((resource) => (
          <button key={`popular-${resource.id || resource.title}`} type="button" onClick={() => onOpen(resource)}>
            <span>{resource.title}</span>
            <small>{resource.views || 0} views</small>
          </button>
        ))}
      </section>
      <section>
        <h3>Recently Added</h3>
        {recentResources.map((resource) => (
          <button key={`recent-${resource.id || resource.title}`} type="button" onClick={() => onOpen(resource)}>
            <span>{resource.title}</span>
            <small>{resource.category}</small>
          </button>
        ))}
      </section>
    </div>
  )
}

function ResourceCard({ resource, onOpen }) {
  const Icon = getResourceIcon(resource)

  return (
    <article className="resource-card">
      <div className={`resource-thumb ${resource.tone}`}>
        <Icon size={30} />
        {resource.featured && <span>Featured</span>}
      </div>
      <div className="resource-body">
        <div className="resource-topline">
          <span>Class {resource.classLevel}</span>
          <span>{resource.access || 'Free'}</span>
          {resource.featured && <strong>Featured</strong>}
        </div>
        <h3>{resource.title}</h3>
        <p>{resource.description}</p>
        <div className="resource-meta">
          <span>{resource.subject}</span>
          <span>{resource.category}</span>
          <span>{resource.meta}</span>
          <span>{resource.views || 0} views</span>
          <span>{resource.downloads || 0} downloads</span>
        </div>
        <button type="button" onClick={onOpen}>Open Resource</button>
      </div>
    </article>
  )
}

function QuizBanner({ onOpen }) {
  return (
    <section className="library-section quiz-banner-section">
      <div className="quiz-banner">
        <div>
          <h2>Ready to test your knowledge?</h2>
          <p>Try a quick topic practice, revise the weak area, and come back stronger for the next class.</p>
        </div>
        <div>
          <button type="button" onClick={onOpen}><Play size={18} /> Start a Quiz</button>
          <button type="button" onClick={onOpen}>View Practice Topics</button>
        </div>
      </div>
    </section>
  )
}

function ResourceDetailsModal({ resource, onClose }) {
  async function openFile() {
    if (!resource.fileUrl) {
      onClose()
      return
    }

    if (resource.id) {
      try {
        await fetch(`${API_BASE}/resources/${resource.id}/download`, { method: 'POST' })
      } catch (err) {
        // Counter updates are nice-to-have; the file should still open.
      }
    }

    window.open(resource.fileUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="library-modal-backdrop">
      <article className="library-resource-modal">
        <header>
          <div>
            <span>Class {resource.classLevel} · {resource.subject}</span>
            <h2>{resource.title}</h2>
          </div>
          <button type="button" onClick={onClose}>Close</button>
        </header>
        <div className={`resource-thumb ${resource.tone}`}>
          <BookOpen size={38} />
        </div>
        <p>{resource.description}</p>
        <div className="library-resource-facts">
          <span>{resource.category}</span>
          <span>{resource.meta}</span>
          <span>{resource.access || 'Free'} · No login required</span>
          <span>{resource.views || 0} views</span>
          <span>{resource.downloads || 0} downloads</span>
          {resource.featured && <span>Featured</span>}
        </div>
        <footer>
          <button
            type="button"
            onClick={openFile}
          >
            {resource.fileUrl ? 'Open Resource' : 'Close Preview'}
          </button>
        </footer>
      </article>
    </div>
  )
}

function PracticeFlow() {
  const steps = [
    ['Understand the concept', 'Start with clear notes or a short lesson before attempting questions.'],
    ['Practice with worksheets', 'Solve topic-wise exercises and check mistakes immediately.'],
    ['Test with quizzes', 'Use quick quizzes to measure recall and exam readiness.'],
    ['Revise with notes', 'Return to key formulas, definitions, and examples before school tests.']
  ]

  return (
    <section className="library-section practice-flow" id="library-practice">
      <div className="section-heading">
        <p>Study Flow</p>
        <h2>A coaching-style path for every chapter</h2>
      </div>
      <div className="flow-grid">
        {steps.map(([title, text], index) => (
          <article key={title}>
            <span>{index + 1}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function QuizPreview({ onOpen }) {
  return (
    <section className="library-section quiz-preview">
      <div className="section-heading">
        <p>Quick Practice</p>
        <h2>Topic tests students can start with</h2>
      </div>
      <div className="quiz-grid">
        {quizTopics.map((topic) => (
          <button key={topic} type="button" onClick={() => onOpen(topic)}>
            <Brain size={21} />
            <span>{topic}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

function ParentResources() {
  return (
    <section className="library-section parent-resources" id="library-parents">
      <div className="section-heading">
        <p>Parent Support</p>
        <h2>Calm guidance for study at home</h2>
      </div>
      <div className="parent-grid">
        {parentGuides.map((guide) => (
          <article key={guide}>
            <GraduationCap size={24} />
            <h3>{guide}</h3>
            <p>Simple routines and checkpoints that help students revise steadily without last-minute stress.</p>
            <button type="button">Read Guide</button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Library
