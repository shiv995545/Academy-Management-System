import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  GraduationCap,
  Layers,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  X,
  UserRound,
  UsersRound
} from 'lucide-react'
import Contact from './pages/Contact'
import CoursesPage, { COURSE_CATEGORY_OPTIONS, getCourseCategory } from './pages/Courses'
import Home from './pages/Home'
import Library from './pages/Library'
import Login from './pages/Login'
import ResourceManagement from './pages/Resources'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

const blankForms = {
  teacher: { name: '', email: '', password: '' },
  student: { name: '', email: '', phone: '', guardianName: '', address: '' },
  course: {
    title: '',
    category: 'Foundation',
    subject: '',
    classLevel: '',
    description: '',
    fee: '',
    duration: '',
    details: '',
    imageUrl: '',
    classCount: '',
    startDate: '',
    teacherName: '',
    batchTiming: '',
    availableSeats: '',
    tags: '',
    syllabus: '',
    isUpcoming: false,
    isFeatured: true
  },
  classLevel: { value: '', label: '', stage: '', sortOrder: '', isActive: true },
  batch: { name: '', courseId: '', teacherId: '', schedule: '' },
  enrollment: { studentId: '', batchId: '', status: 'active' }
}

const blankAuthForms = {
  login: { email: '', password: '' },
  register: { name: '', email: '', password: '' },
  forgot: { email: '' },
  reset: { token: '', password: '' }
}

function readSession() {
  try {
    return {
      token: localStorage.getItem('cms_token') || '',
      refreshToken: localStorage.getItem('cms_refresh_token') || '',
      user: JSON.parse(localStorage.getItem('cms_user') || 'null')
    }
  } catch (err) {
    return { token: '', refreshToken: '', user: null }
  }
}

function App() {
  const saved = readSession()
  const [token, setToken] = useState(saved.token)
  const [refreshToken, setRefreshToken] = useState(saved.refreshToken)
  const [user, setUser] = useState(saved.user)
  const [sessionChecked, setSessionChecked] = useState(!saved.token)
  const [authMode, setAuthMode] = useState('login')
  const [publicView, setPublicView] = useState('home')
  const [loginRole, setLoginRole] = useState('student')
  const [authForms, setAuthForms] = useState(blankAuthForms)
  const [activeView, setActiveView] = useState('overview')
  const [forms, setForms] = useState(blankForms)
  const [editingCourseId, setEditingCourseId] = useState(null)
  const [editingClassLevelId, setEditingClassLevelId] = useState(null)
  const [data, setData] = useState({
    teachers: [],
    students: [],
    courses: [],
    batches: [],
    enrollments: [],
    classLevels: [],
    applications: [],
    auditLogs: []
  })
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const isAdmin = user?.role === 'admin'
  const isStudent = user?.role === 'student'

  const navigation = useMemo(() => {
    const items = [{ id: 'overview', label: 'Overview', icon: Layers }]

    if (isStudent) return items

    items.push(
      { id: 'resources', label: 'Resources', icon: BookOpen },
      { id: 'students', label: 'Students', icon: GraduationCap },
      { id: 'batches', label: 'Batches', icon: CalendarDays },
      { id: 'enrollments', label: 'Enrollments', icon: BookOpen }
    )

    if (isAdmin) {
      items.splice(1, 0, { id: 'teachers', label: 'Teachers', icon: UsersRound })
      items.splice(3, 0, { id: 'courses', label: 'Courses', icon: BookOpen })
      items.splice(4, 0, { id: 'classLevels', label: 'Classes', icon: CheckSquare })
      items.splice(5, 0, { id: 'applications', label: 'Applications', icon: ClipboardList })
      items.push({ id: 'authLogs', label: 'Auth Logs', icon: ShieldCheck })
    } else {
      items.splice(3, 0, { id: 'courses', label: 'Courses', icon: BookOpen })
    }

    return items
  }, [isAdmin, isStudent])

  function clearSession() {
    localStorage.removeItem('cms_token')
    localStorage.removeItem('cms_refresh_token')
    localStorage.removeItem('cms_user')
    setToken('')
    setRefreshToken('')
    setUser(null)
    setPublicView('home')
    setData({
      teachers: [],
      students: [],
      courses: [],
      batches: [],
      enrollments: [],
      classLevels: [],
      applications: [],
      auditLogs: []
    })
    setActiveView('overview')
  }

  function saveSession(body) {
    localStorage.setItem('cms_token', body.token)
    localStorage.setItem('cms_refresh_token', body.refreshToken)
    localStorage.setItem('cms_user', JSON.stringify(body.user))
    setToken(body.token)
    setRefreshToken(body.refreshToken)
    setUser(body.user)
  }

  async function refreshSession(currentRefreshToken = refreshToken) {
    if (!currentRefreshToken) throw new Error('Missing refresh token')

    const response = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: currentRefreshToken })
    })
    const body = await response.json()
    if (!response.ok) throw new Error(body.message || 'Session expired')

    saveSession(body)

    return body.token
  }

  async function request(path, options = {}, retry = true) {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    })

    const text = await response.text()
    const body = text ? JSON.parse(text) : {}

    if (!response.ok) {
      if (response.status === 401 && retry) {
        try {
          const newToken = await refreshSession()
          return request(
            path,
            {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${newToken}`
              }
            },
            false
          )
        } catch (err) {
          clearSession()
        }
      }
      throw new Error(body.message || 'Request failed')
    }

    return body
  }

  async function loadData() {
    if (!token || !sessionChecked) return
    if (isStudent) return

    setLoading(true)
    setError('')

    try {
      const [students, courses, batches, enrollments, classLevels, teachers, applications, auditLogs] = await Promise.all([
        request('/students'),
        request('/courses'),
        request('/batches'),
        request('/enrollments'),
        request('/class-levels'),
        isAdmin ? request('/admin/teachers') : Promise.resolve({ teachers: [] }),
        isAdmin ? request('/course-applications') : Promise.resolve({ applications: [] }),
        isAdmin ? request('/auth/audit-logs') : Promise.resolve({ auditLogs: [] })
      ])

      setData({
        students: students.students || [],
        courses: courses.courses || [],
        batches: batches.batches || [],
        enrollments: enrollments.enrollments || [],
        classLevels: classLevels.classLevels || [],
        teachers: teachers.teachers || [],
        applications: applications.applications || [],
        auditLogs: auditLogs.auditLogs || []
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [token, user?.role, sessionChecked])

  useEffect(() => {
    async function verifyStoredSession() {
      if (!saved.token) return

      try {
        let response = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${saved.token}` }
        })
        let body = await response.json()

        if (response.status === 401 && saved.refreshToken) {
          const newToken = await refreshSession(saved.refreshToken)
          response = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${newToken}` }
          })
          body = await response.json()
        }

        if (!response.ok) throw new Error(body.message || 'Session expired')

        localStorage.setItem('cms_user', JSON.stringify(body.user))
        setUser(body.user)
      } catch (err) {
        clearSession()
        setNotice('Your session expired. Please sign in again.')
      } finally {
        setSessionChecked(true)
      }
    }

    verifyStoredSession()
  }, [])

  function updateAuthForm(section, field, value) {
    setAuthForms((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value
      }
    }))
  }

  async function handleLogin(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')

    try {
      const result = await fetch(`${API_BASE}/auth/${loginRole}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForms.login)
      })

      const body = await result.json()
      if (!result.ok) throw new Error(formatBackendError(body) || 'Login failed')

      saveSession(body)
      setNotice(`Welcome, ${body.user.name}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    try {
      if (refreshToken) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        })
      }
    } finally {
      clearSession()
      setNotice('Logged out successfully.')
    }
  }

  async function handleRegister(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')

    try {
      const result = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForms.register)
      })
      const body = await result.json()
      if (!result.ok) throw new Error(formatBackendError(body))

      saveSession(body)
      setNotice(`Welcome, ${body.user.name}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')

    try {
      const result = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForms.forgot)
      })
      const body = await result.json()
      if (!result.ok) throw new Error(formatBackendError(body))

      if (body.resetToken) {
        updateAuthForm('reset', 'token', body.resetToken)
        setAuthMode('reset')
      }
      setNotice(body.message || 'Password reset request accepted.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')

    try {
      const result = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForms.reset)
      })
      const body = await result.json()
      if (!result.ok) throw new Error(formatBackendError(body))

      setAuthForms(blankAuthForms)
      setAuthMode('login')
      setNotice(body.message || 'Password reset successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function updateForm(section, field, value) {
    setForms((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value
      }
    }))
  }

  async function submitForm(section, path, payload, successMessage) {
    setLoading(true)
    setError('')
    setNotice('')

    try {
      await request(path, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      setForms((current) => ({ ...current, [section]: blankForms[section] }))
      setNotice(successMessage)
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateCourse(payload) {
    if (!editingCourseId) return

    setLoading(true)
    setError('')
    setNotice('')

    try {
      await request(`/courses/${editingCourseId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      setForms((current) => ({ ...current, course: blankForms.course }))
      setEditingCourseId(null)
      setNotice('Course updated successfully')
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateClassLevel(payload) {
    if (!editingClassLevelId) return

    setLoading(true)
    setError('')
    setNotice('')

    try {
      await request(`/class-levels/${editingClassLevelId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      setForms((current) => ({ ...current, classLevel: blankForms.classLevel }))
      setEditingClassLevelId(null)
      setNotice('Class level updated successfully')
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function deleteItem(path, successMessage) {
    setLoading(true)
    setError('')
    setNotice('')

    try {
      await request(path, { method: 'DELETE' })
      setNotice(successMessage)
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateApplicationStatus(id, status) {
    setLoading(true)
    setError('')
    setNotice('')

    try {
      await request(`/course-applications/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
      setNotice('Application status updated successfully')
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function startCourseEdit(course) {
    setEditingCourseId(course.id)
    setForms((current) => ({
      ...current,
      course: {
        title: course.title || '',
        category: getCourseCategory(course),
        subject: course.subject || '',
        classLevel: course.class_level ?? course.classLevel ?? '',
        description: course.description || '',
        fee: course.fee ?? '',
        duration: course.duration || '',
        details: course.details || '',
        imageUrl: course.image_url || course.imageUrl || '',
        classCount: course.class_count ?? course.classCount ?? '',
        startDate: formatDateInput(course.start_date || course.startDate),
        teacherName: course.teacher_name || course.teacherName || '',
        batchTiming: course.batch_timing || course.batchTiming || '',
        availableSeats: course.available_seats ?? course.availableSeats ?? '',
        tags: course.tags || '',
        syllabus: course.syllabus || '',
        isUpcoming: Boolean(course.is_upcoming ?? course.isUpcoming),
        isFeatured: Boolean(course.is_featured ?? course.isFeatured ?? true)
      }
    }))
  }

  function cancelCourseEdit() {
    setEditingCourseId(null)
    setForms((current) => ({ ...current, course: blankForms.course }))
  }

  function startClassLevelEdit(classLevel) {
    setEditingClassLevelId(classLevel.id)
    setForms((current) => ({
      ...current,
      classLevel: {
        value: classLevel.value ?? '',
        label: classLevel.label || '',
        stage: classLevel.stage || '',
        sortOrder: classLevel.sort_order ?? '',
        isActive: Boolean(classLevel.is_active)
      }
    }))
  }

  function cancelClassLevelEdit() {
    setEditingClassLevelId(null)
    setForms((current) => ({ ...current, classLevel: blankForms.classLevel }))
  }

  function showHome() {
    setPublicView('home')
  }

  function showLibrary() {
    setPublicView('library')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function showCourses() {
    setPublicView('courses')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function showContact() {
    setPublicView('contact')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function showSignIn(mode = 'login') {
    setAuthMode(mode)
    setLoginRole('student')
    setError('')
    setNotice('')
    setPublicView('login')
  }

  if (!sessionChecked) {
    return (
      <Login
        checkingSession
        onHome={showHome}
        onLibrary={showLibrary}
        onCourses={showCourses}
        onContact={showContact}
      />
    )
  }

  if (!token || !user) {
    if (publicView === 'home') {
      return (
        <Home
          onLibrary={showLibrary}
          onCourses={showCourses}
          onContact={showContact}
          onSignIn={() => showSignIn('login')}
          onEnroll={() => showSignIn('register')}
        />
      )
    }

    if (publicView === 'library') {
      return (
        <Library
          onHome={showHome}
          onCourses={showCourses}
          onContact={showContact}
          onSignIn={() => showSignIn('login')}
        />
      )
    }

    if (publicView === 'courses') {
      return (
        <CoursesPage
          onHome={showHome}
          onLibrary={showLibrary}
          onContact={showContact}
          onSignIn={() => showSignIn('login')}
          onApply={() => showSignIn('register')}
        />
      )
    }

    if (publicView === 'contact') {
      return (
        <Contact
          onHome={showHome}
          onLibrary={showLibrary}
          onCourses={showCourses}
          onSignIn={() => showSignIn('login')}
          onSchedule={() => showSignIn('register')}
        />
      )
    }

    return (
      <Login
        authMode={authMode}
        forms={authForms}
        loading={loading}
        loginRole={loginRole}
        notice={notice}
        error={error}
        onForgot={handleForgotPassword}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onReset={handleResetPassword}
        onRoleChange={setLoginRole}
        onModeChange={(mode) => {
          setAuthMode(mode)
          setError('')
          setNotice('')
        }}
        onChange={updateAuthForm}
        onHome={showHome}
        onLibrary={showLibrary}
        onCourses={showCourses}
        onContact={showContact}
      />
    )
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark small">
            <GraduationCap size={24} />
          </div>
          <div>
            <strong>CMS</strong>
            <span>{user.role}</span>
          </div>
        </div>

        <nav className="nav-list">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={activeView === item.id ? 'active' : ''}
                onClick={() => setActiveView(item.id)}
                type="button"
              >
                <Icon size={18} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>{viewTitle(activeView)}</h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" onClick={loadData} type="button" title="Refresh data">
              <RefreshCw size={18} />
            </button>
            <div className="user-chip">
              <UserRound size={18} />
              <span>{user.name}</span>
            </div>
            <button className="icon-button danger" onClick={handleLogout} type="button" title="Log out">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {(notice || error) && (
          <div className={`alert ${error ? 'error' : 'success'}`}>{error || notice}</div>
        )}

        {activeView === 'overview' && <Overview data={data} isAdmin={isAdmin} />}
        {activeView === 'resources' && (
          <ResourceManagement apiBase={API_BASE} token={token} user={user} />
        )}
        {activeView === 'teachers' && isAdmin && (
          <Teachers
            teachers={data.teachers}
            form={forms.teacher}
            loading={loading}
            onChange={(field, value) => updateForm('teacher', field, value)}
            onSubmit={(payload) =>
              submitForm('teacher', '/admin/teachers', payload, 'Teacher created successfully')
            }
            onDelete={(id) => deleteItem(`/admin/teachers/${id}`, 'Teacher deleted successfully')}
          />
        )}
        {activeView === 'students' && (
          <Students
            students={data.students}
            form={forms.student}
            isAdmin={isAdmin}
            loading={loading}
            onChange={(field, value) => updateForm('student', field, value)}
            onSubmit={(payload) => submitForm('student', '/students', payload, 'Student added successfully')}
            onDelete={(id) => deleteItem(`/students/${id}`, 'Student deleted successfully')}
          />
        )}
        {activeView === 'courses' && (
          <Courses
            courses={data.courses}
            form={forms.course}
            editingId={editingCourseId}
            isAdmin={isAdmin}
            loading={loading}
            onChange={(field, value) => updateForm('course', field, value)}
            onSubmit={(payload) =>
              editingCourseId
                ? updateCourse(payload)
                : submitForm('course', '/courses', payload, 'Course created successfully')
            }
            onEdit={startCourseEdit}
            onCancelEdit={cancelCourseEdit}
            onDelete={(id) => {
              if (editingCourseId === id) cancelCourseEdit()
              deleteItem(`/courses/${id}`, 'Course deleted successfully')
            }}
          />
        )}
        {activeView === 'classLevels' && isAdmin && (
          <ClassLevels
            classLevels={data.classLevels}
            form={forms.classLevel}
            editingId={editingClassLevelId}
            loading={loading}
            onChange={(field, value) => updateForm('classLevel', field, value)}
            onSubmit={(payload) =>
              editingClassLevelId
                ? updateClassLevel(payload)
                : submitForm('classLevel', '/class-levels', payload, 'Class level created successfully')
            }
            onEdit={startClassLevelEdit}
            onCancelEdit={cancelClassLevelEdit}
            onDelete={(id) => {
              if (editingClassLevelId === id) cancelClassLevelEdit()
              deleteItem(`/class-levels/${id}`, 'Class level deleted successfully')
            }}
          />
        )}
        {activeView === 'applications' && isAdmin && (
          <CourseApplications
            applications={data.applications}
            loading={loading}
            onStatus={updateApplicationStatus}
            onDelete={(id) => deleteItem(`/course-applications/${id}`, 'Application deleted successfully')}
          />
        )}
        {activeView === 'batches' && (
          <Batches
            batches={data.batches}
            courses={data.courses}
            teachers={data.teachers}
            form={forms.batch}
            isAdmin={isAdmin}
            loading={loading}
            onChange={(field, value) => updateForm('batch', field, value)}
            onSubmit={(payload) => submitForm('batch', '/batches', payload, 'Batch created successfully')}
            onDelete={(id) => deleteItem(`/batches/${id}`, 'Batch deleted successfully')}
          />
        )}
        {activeView === 'enrollments' && (
          <Enrollments
            enrollments={data.enrollments}
            students={data.students}
            batches={data.batches}
            form={forms.enrollment}
            isAdmin={isAdmin}
            loading={loading}
            onChange={(field, value) => updateForm('enrollment', field, value)}
            onSubmit={(payload) =>
              submitForm('enrollment', '/enrollments', payload, 'Student enrolled successfully')
            }
            onDelete={(id) => deleteItem(`/enrollments/${id}`, 'Enrollment deleted successfully')}
          />
        )}
        {activeView === 'authLogs' && isAdmin && <AuthLogs auditLogs={data.auditLogs} />}
      </section>
    </main>
  )
}

function viewTitle(view) {
  const titles = {
    overview: 'Overview',
    resources: 'Resource Management',
    teachers: 'Teacher Management',
    students: 'Student Records',
    courses: 'Course Catalog',
    classLevels: 'Class Levels',
    applications: 'Course Applications',
    batches: 'Batch Planning',
    enrollments: 'Enrollments',
    authLogs: 'Auth Logs'
  }

  return titles[view] || 'Dashboard'
}

function Overview({ data, isAdmin }) {
  const cards = [
    { label: 'Students', value: data.students.length, icon: GraduationCap },
    { label: 'Courses', value: data.courses.length, icon: BookOpen },
    { label: 'Batches', value: data.batches.length, icon: CalendarDays },
    { label: 'Enrollments', value: data.enrollments.length, icon: Layers }
  ]

  if (isAdmin) {
    cards.unshift({ label: 'Teachers', value: data.teachers.length, icon: UsersRound })
    cards.push({ label: 'Applications', value: data.applications.length, icon: ClipboardList })
  }

  return (
    <section className="overview-grid">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <article className="metric-card" key={card.label}>
            <Icon size={22} />
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        )
      })}
    </section>
  )
}

function AuthLogs({ auditLogs }) {
  return (
    <section className="section-layout single">
      <div className="table-panel">
        <DataTable
          columns={['Action', 'Email', 'Result', 'IP', 'When']}
          rows={auditLogs.map((log) => [
            log.action,
            log.email || '-',
            log.success ? 'Success' : 'Failed',
            log.ip_address || '-',
            formatDateTime(log.created_at)
          ])}
          emptyText="No auth logs yet."
        />
      </div>
    </section>
  )
}

function CourseApplications({ applications, loading, onStatus, onDelete }) {
  return (
    <section className="section-layout single">
      <div className="table-panel">
        <DataTable
          columns={['Course', 'Applicant', 'Contact', 'Message', 'Status', 'When', '']}
          rows={applications.map((application) => [
            application.current_course_title || application.course_title || '-',
            application.name,
            `${application.email} · ${application.phone}`,
            application.message || '-',
            <select
              key={`status-${application.id}`}
              value={application.status}
              disabled={loading}
              onChange={(event) => onStatus(application.id, event.target.value)}
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="enrolled">Enrolled</option>
              <option value="closed">Closed</option>
            </select>,
            formatDateTime(application.created_at),
            <DeleteButton key={application.id} onClick={() => onDelete(application.id)} />
          ])}
          emptyText="No course applications yet."
        />
      </div>
    </section>
  )
}

function Teachers({ teachers, form, loading, onChange, onSubmit, onDelete }) {
  return (
    <SectionLayout
      form={
        <EntityForm
          title="Add teacher"
          loading={loading}
          onSubmit={() => onSubmit(form)}
          fields={[
            { label: 'Name', value: form.name, onChange: (value) => onChange('name', value), required: true },
            {
              label: 'Email',
              type: 'email',
              value: form.email,
              onChange: (value) => onChange('email', value),
              required: true
            },
            {
              label: 'Password',
              type: 'password',
              value: form.password,
              onChange: (value) => onChange('password', value),
              required: true
            }
          ]}
        />
      }
      list={
        <DataTable
          columns={['Name', 'Email', 'Joined', '']}
          rows={teachers.map((teacher) => [
            teacher.name,
            teacher.email,
            formatDate(teacher.created_at),
            <DeleteButton key={teacher.id} onClick={() => onDelete(teacher.id)} />
          ])}
          emptyText="No teachers yet."
        />
      }
    />
  )
}

function Students({ students, form, isAdmin, loading, onChange, onSubmit, onDelete }) {
  return (
    <SectionLayout
      form={
        <EntityForm
          title="Add student"
          loading={loading}
          onSubmit={() => onSubmit(form)}
          fields={[
            { label: 'Name', value: form.name, onChange: (value) => onChange('name', value), required: true },
            { label: 'Email', type: 'email', value: form.email, onChange: (value) => onChange('email', value) },
            { label: 'Phone', value: form.phone, onChange: (value) => onChange('phone', value) },
            {
              label: 'Guardian',
              value: form.guardianName,
              onChange: (value) => onChange('guardianName', value)
            },
            { label: 'Address', value: form.address, onChange: (value) => onChange('address', value) }
          ]}
        />
      }
      list={
        <DataTable
          columns={['Name', 'Contact', 'Guardian', 'Address', isAdmin ? '' : null].filter(Boolean)}
          rows={students.map((student) =>
            [
              student.name,
              student.email || student.phone || '-',
              student.guardian_name || '-',
              student.address || '-',
              isAdmin ? <DeleteButton key={student.id} onClick={() => onDelete(student.id)} /> : null
            ].filter(Boolean)
          )}
          emptyText="No students yet."
        />
      }
    />
  )
}

function Courses({ courses, form, editingId, isAdmin, loading, onChange, onSubmit, onEdit, onCancelEdit, onDelete }) {
  return (
    <SectionLayout
      form={
        isAdmin ? (
          <EntityForm
            title={editingId ? 'Edit course' : 'Add course'}
            loading={loading}
            submitLabel={editingId ? 'Update' : 'Add'}
            secondaryAction={
              editingId
                ? {
                    label: 'Cancel',
                    onClick: onCancelEdit
                  }
                : null
            }
            onSubmit={() =>
              onSubmit({
                ...form,
                fee: Number(form.fee || 0),
                classLevel: form.classLevel ? Number(form.classLevel) : null,
                classCount: form.classCount ? Number(form.classCount) : null,
                availableSeats: form.availableSeats ? Number(form.availableSeats) : null
              })
            }
            fields={[
              {
                label: 'Title',
                value: form.title,
                onChange: (value) => onChange('title', value),
                required: true
              },
              {
                label: 'Category',
                type: 'select',
                value: form.category,
                onChange: (value) => onChange('category', value),
                required: true,
                options: COURSE_CATEGORY_OPTIONS
              },
              {
                label: 'Subject',
                value: form.subject,
                onChange: (value) => onChange('subject', value)
              },
              {
                label: 'Class Level',
                type: 'number',
                value: form.classLevel,
                onChange: (value) => onChange('classLevel', value)
              },
              {
                label: 'Fee',
                type: 'number',
                value: form.fee,
                onChange: (value) => onChange('fee', value)
              },
              {
                label: 'Duration',
                value: form.duration,
                onChange: (value) => onChange('duration', value)
              },
              {
                label: 'Description',
                type: 'textarea',
                value: form.description,
                onChange: (value) => onChange('description', value)
              },
              {
                label: 'Course Details',
                type: 'textarea',
                value: form.details,
                onChange: (value) => onChange('details', value)
              },
              {
                label: 'Card Image URL',
                value: form.imageUrl,
                onChange: (value) => onChange('imageUrl', value)
              },
              {
                label: 'Number of Classes',
                type: 'number',
                value: form.classCount,
                onChange: (value) => onChange('classCount', value)
              },
              {
                label: 'Start Date',
                type: 'date',
                value: form.startDate,
                onChange: (value) => onChange('startDate', value)
              },
              {
                label: 'Faculty Name',
                value: form.teacherName,
                onChange: (value) => onChange('teacherName', value)
              },
              {
                label: 'Batch Timing',
                value: form.batchTiming,
                onChange: (value) => onChange('batchTiming', value)
              },
              {
                label: 'Available Seats',
                type: 'number',
                value: form.availableSeats,
                onChange: (value) => onChange('availableSeats', value)
              },
              {
                label: 'Course Tags',
                value: form.tags,
                onChange: (value) => onChange('tags', value)
              },
              {
                label: 'Syllabus / Modules',
                type: 'textarea',
                value: form.syllabus,
                onChange: (value) => onChange('syllabus', value)
              },
              {
                label: 'Show in Upcoming Courses',
                type: 'checkbox',
                value: form.isUpcoming,
                onChange: (value) => onChange('isUpcoming', value)
              },
              {
                label: 'Show as Featured Course',
                type: 'checkbox',
                value: form.isFeatured,
                onChange: (value) => onChange('isFeatured', value)
              }
            ]}
          />
        ) : null
      }
      list={
        <DataTable
          columns={['Title', 'Category', 'Class', 'Duration', 'Fee', 'Seats', 'Upcoming', isAdmin ? '' : null].filter(Boolean)}
          rows={courses.map((course) =>
            [
              course.title,
              getCourseCategory(course),
              course.class_level || course.classLevel || '-',
              course.duration || '-',
              money(course.fee),
              course.available_seats ?? course.availableSeats ?? '-',
              course.is_upcoming || course.isUpcoming ? 'Yes' : 'No',
              isAdmin ? (
                <div className="row-actions" key={course.id}>
                  <EditButton onClick={() => onEdit(course)} />
                  <DeleteButton onClick={() => onDelete(course.id)} />
                </div>
              ) : null
            ].filter(Boolean)
          )}
          emptyText="No courses yet."
        />
      }
    />
  )
}

function ClassLevels({ classLevels, form, editingId, loading, onChange, onSubmit, onEdit, onCancelEdit, onDelete }) {
  return (
    <SectionLayout
      form={
        <EntityForm
          title={editingId ? 'Edit class level' : 'Add class level'}
          loading={loading}
          submitLabel={editingId ? 'Update' : 'Add'}
          secondaryAction={
            editingId
              ? {
                  label: 'Cancel',
                  onClick: onCancelEdit
                }
              : null
          }
          onSubmit={() =>
            onSubmit({
              ...form,
              value: Number(form.value),
              sortOrder: form.sortOrder ? Number(form.sortOrder) : Number(form.value)
            })
          }
          fields={[
            {
              label: 'Class Number',
              type: 'number',
              value: form.value,
              onChange: (value) => onChange('value', value),
              required: true
            },
            {
              label: 'Display Label',
              value: form.label,
              onChange: (value) => onChange('label', value),
              required: true
            },
            {
              label: 'Stage',
              value: form.stage,
              onChange: (value) => onChange('stage', value)
            },
            {
              label: 'Sort Order',
              type: 'number',
              value: form.sortOrder,
              onChange: (value) => onChange('sortOrder', value)
            },
            {
              label: 'Visible on Public Library',
              type: 'checkbox',
              value: form.isActive,
              onChange: (value) => onChange('isActive', value)
            }
          ]}
        />
      }
      list={
        <DataTable
          columns={['Label', 'Number', 'Stage', 'Visible', 'Sort', '']}
          rows={classLevels.map((classLevel) => [
            classLevel.label,
            classLevel.value,
            classLevel.stage || '-',
            classLevel.is_active ? 'Yes' : 'No',
            classLevel.sort_order ?? '-',
            <div className="row-actions" key={classLevel.id}>
              <EditButton onClick={() => onEdit(classLevel)} />
              <DeleteButton onClick={() => onDelete(classLevel.id)} />
            </div>
          ])}
          emptyText="No class levels yet."
        />
      }
    />
  )
}

function Batches({ batches, courses, teachers, form, isAdmin, loading, onChange, onSubmit, onDelete }) {
  return (
    <SectionLayout
      form={
        isAdmin ? (
          <EntityForm
            title="Add batch"
            loading={loading}
            onSubmit={() =>
              onSubmit({
                ...form,
                courseId: form.courseId ? Number(form.courseId) : null,
                teacherId: form.teacherId ? Number(form.teacherId) : null
              })
            }
            fields={[
              { label: 'Name', value: form.name, onChange: (value) => onChange('name', value), required: true },
              {
                label: 'Course',
                type: 'select',
                value: form.courseId,
                onChange: (value) => onChange('courseId', value),
                options: courses.map((course) => ({ value: course.id, label: course.title }))
              },
              {
                label: 'Teacher',
                type: 'select',
                value: form.teacherId,
                onChange: (value) => onChange('teacherId', value),
                options: teachers.map((teacher) => ({ value: teacher.id, label: teacher.name }))
              },
              {
                label: 'Schedule',
                value: form.schedule,
                onChange: (value) => onChange('schedule', value)
              }
            ]}
          />
        ) : null
      }
      list={
        <DataTable
          columns={['Batch', 'Course', 'Teacher', 'Schedule', isAdmin ? '' : null].filter(Boolean)}
          rows={batches.map((batch) =>
            [
              batch.name,
              batch.course_title || '-',
              batch.teacher_name || '-',
              batch.schedule || '-',
              isAdmin ? <DeleteButton key={batch.id} onClick={() => onDelete(batch.id)} /> : null
            ].filter(Boolean)
          )}
          emptyText="No batches yet."
        />
      }
    />
  )
}

function Enrollments({
  enrollments,
  students,
  batches,
  form,
  isAdmin,
  loading,
  onChange,
  onSubmit,
  onDelete
}) {
  return (
    <SectionLayout
      form={
        <EntityForm
          title="Enroll student"
          loading={loading}
          onSubmit={() =>
            onSubmit({
              ...form,
              studentId: Number(form.studentId),
              batchId: Number(form.batchId)
            })
          }
          fields={[
            {
              label: 'Student',
              type: 'select',
              value: form.studentId,
              onChange: (value) => onChange('studentId', value),
              required: true,
              options: students.map((student) => ({ value: student.id, label: student.name }))
            },
            {
              label: 'Batch',
              type: 'select',
              value: form.batchId,
              onChange: (value) => onChange('batchId', value),
              required: true,
              options: batches.map((batch) => ({ value: batch.id, label: batch.name }))
            },
            {
              label: 'Status',
              type: 'select',
              value: form.status,
              onChange: (value) => onChange('status', value),
              options: [
                { value: 'active', label: 'Active' },
                { value: 'paused', label: 'Paused' },
                { value: 'completed', label: 'Completed' }
              ]
            }
          ]}
        />
      }
      list={
        <DataTable
          columns={['Student', 'Batch', 'Course', 'Status', isAdmin ? '' : null].filter(Boolean)}
          rows={enrollments.map((enrollment) =>
            [
              enrollment.student_name,
              enrollment.batch_name,
              enrollment.course_title || '-',
              enrollment.status,
              isAdmin ? <DeleteButton key={enrollment.id} onClick={() => onDelete(enrollment.id)} /> : null
            ].filter(Boolean)
          )}
          emptyText="No enrollments yet."
        />
      }
    />
  )
}

function SectionLayout({ form, list }) {
  return (
    <section className={form ? 'section-layout' : 'section-layout single'}>
      {form}
      <div className="table-panel">{list}</div>
    </section>
  )
}

function EntityForm({ title, fields, loading, onSubmit, submitLabel = 'Add', secondaryAction }) {
  function submit(event) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="entity-form" onSubmit={submit}>
      <h2>{title}</h2>
      {fields.map((field) => (
        <label key={field.label}>
          {field.label}
          {field.type === 'select' ? (
            <select
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              required={field.required}
            >
              <option value="">Select</option>
              {(field.options || []).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : field.type === 'textarea' ? (
            <textarea
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              required={field.required}
              rows={4}
            />
          ) : field.type === 'checkbox' ? (
            <span className="checkbox-row">
              <input
                type="checkbox"
                checked={Boolean(field.value)}
                onChange={(event) => field.onChange(event.target.checked)}
              />
              <small>{field.value ? 'Enabled' : 'Disabled'}</small>
            </span>
          ) : (
            <input
              type={field.type || 'text'}
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              required={field.required}
            />
          )}
        </label>
      ))}
      <div className="entity-form-actions">
        <button className="primary-action compact" type="submit" disabled={loading}>
          <Plus size={18} />
          {submitLabel}
        </button>
        {secondaryAction && (
          <button className="secondary-action compact" type="button" onClick={secondaryAction.onClick}>
            <X size={18} />
            {secondaryAction.label}
          </button>
        )}
      </div>
    </form>
  )
}

function DataTable({ columns, rows, emptyText }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty-cell">
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function DeleteButton({ onClick }) {
  return (
    <button className="icon-button danger" onClick={onClick} type="button" title="Delete">
      <Trash2 size={17} />
    </button>
  )
}

function EditButton({ onClick }) {
  return (
    <button className="icon-button" onClick={onClick} type="button" title="Edit">
      <Pencil size={17} />
    </button>
  )
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(value)
  )
}

function formatDateInput(value) {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

function formatDateTime(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

function formatBackendError(body) {
  if (!body?.details) return body?.message || ''

  const detailText = Object.values(body.details).flat().filter(Boolean).join(', ')
  return detailText ? `${body.message}: ${detailText}` : body.message
}

function money(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value || 0))
}

export default App
