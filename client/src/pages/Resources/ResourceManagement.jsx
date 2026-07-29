import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Plus, RefreshCw, Search } from 'lucide-react'
import ActivityTimeline from './components/ActivityTimeline'
import CategoryManager from './components/CategoryManager'
import DashboardStats from './components/DashboardStats'
import ResourceCard from './components/ResourceCard'
import ResourceTable from './components/ResourceTable'
import UploadModal from './components/UploadModal'
import './Resources.css'

const blankResource = {
  id: null,
  title: '',
  description: '',
  subject: '',
  classLevel: '',
  category: '',
  tags: [],
  thumbnailUrl: '',
  fileUrl: '',
  originalFileName: '',
  storageKey: '',
  mimeType: '',
  fileSize: null,
  resourceType: 'pdf',
  visibility: 'public'
}

function ResourceManagement({ apiBase, token, user }) {
  const [resources, setResources] = useState([])
  const [categories, setCategories] = useState([])
  const [activity, setActivity] = useState([])
  const [stats, setStats] = useState({})
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(blankResource)
  const [categoryDraft, setCategoryDraft] = useState({ name: '', description: '' })
  const [file, setFile] = useState(null)
  const [tagDraft, setTagDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const isAdmin = user?.role === 'admin'

  const filteredResources = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return resources.filter((resource) => {
      const matchesStatus = !status || resource.status === status
      const matchesQuery =
        !normalized ||
        [resource.title, resource.description, resource.category, resource.subject, resource.uploader_name]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalized)
      return matchesStatus && matchesQuery
    })
  }, [query, resources, status])

  async function api(path, options = {}) {
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers
      }
    })
    const body = await response.json()
    if (!response.ok) throw new Error(formatError(body))
    return body
  }

  async function loadResources() {
    setLoading(true)
    setError('')
    try {
      const [resourceBody, categoryBody, statsBody, activityBody] = await Promise.all([
        api('/resources/manage/all'),
        api('/resources/categories'),
        api('/resources/manage/stats'),
        api('/resources/manage/activity')
      ])
      setResources(resourceBody.resources || [])
      setCategories(categoryBody.categories || [])
      setStats(statsBody.stats || {})
      setActivity(activityBody.activity || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadResources()
  }, [])

  function openCreate() {
    setForm(blankResource)
    setFile(null)
    setTagDraft('')
    setModalOpen(true)
  }

  function openEdit(resource) {
    setForm({
      id: resource.id,
      title: resource.title || '',
      description: resource.description || '',
      subject: resource.subject || '',
      classLevel: resource.class_level || '',
      category: resource.category || '',
      tags: resource.tags || [],
      thumbnailUrl: resource.thumbnail_url || '',
      fileUrl: resource.file_url || '',
      originalFileName: resource.original_file_name || '',
      storageKey: resource.storage_key || '',
      mimeType: resource.mime_type || '',
      fileSize: resource.file_size || null,
      resourceType: resource.resource_type || 'pdf',
      visibility: resource.visibility || 'public'
    })
    setFile(null)
    setTagDraft('')
    setModalOpen(true)
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function uploadFile() {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const contentBase64 = await readFileAsBase64(file)
      const body = await api('/resources/upload', {
        method: 'POST',
        body: JSON.stringify({ fileName: file.name, mimeType: file.type || 'text/plain', contentBase64 })
      })
      setForm((current) => ({
        ...current,
        fileUrl: `${apiBase.replace('/api/v1', '')}${body.file.fileUrl}`,
        originalFileName: body.file.originalFileName,
        storageKey: body.file.storageKey,
        mimeType: body.file.mimeType,
        fileSize: body.file.fileSize
      }))
      setNotice('File uploaded. Save the resource to publish metadata.')
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function saveResource(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const payload = { ...form }
      delete payload.id
      payload.classLevel = payload.classLevel ? Number(payload.classLevel) : null
      const body = await api(form.id ? `/resources/${form.id}` : '/resources', {
        method: form.id ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      })
      setNotice(`${body.resource.title} saved successfully.`)
      setModalOpen(false)
      await loadResources()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteResource(resource) {
    setError('')
    setNotice('')
    try {
      await api(`/resources/${resource.id}`, { method: 'DELETE' })
      setNotice(`${resource.title} deleted.`)
      await loadResources()
    } catch (err) {
      setError(err.message)
    }
  }

  async function updateStatus(resource, nextStatus) {
    setError('')
    setNotice('')
    try {
      await api(`/resources/${resource.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      })
      setNotice(`${resource.title} marked ${nextStatus}.`)
      await loadResources()
    } catch (err) {
      setError(err.message)
    }
  }

  async function createCategory(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    try {
      const body = await api('/resources/categories', {
        method: 'POST',
        body: JSON.stringify(categoryDraft)
      })
      setNotice(`${body.category.name} category created.`)
      setCategoryDraft({ name: '', description: '' })
      await loadResources()
    } catch (err) {
      setError(err.message)
    }
  }

  async function deleteCategory(category) {
    setError('')
    setNotice('')
    try {
      await api(`/resources/categories/${category.id}`, { method: 'DELETE' })
      setNotice(`${category.name} category deleted.`)
      await loadResources()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="resource-management-page">
      <header className="resource-management-header">
        <div>
          <p className="eyebrow">{isAdmin ? 'Admin Resource Center' : 'Teacher Resource Center'}</p>
          <h1>{isAdmin ? 'Resource Management' : 'My Teaching Resources'}</h1>
          <span>{isAdmin ? 'Monitor uploads, moderation, categories, and teacher activity.' : 'Create, upload, and manage your own learning resources.'}</span>
        </div>
        <div className="resource-header-actions">
          <button type="button" onClick={loadResources}>
            <RefreshCw size={18} />
            Refresh
          </button>
          <button type="button" onClick={openCreate}>
            <Plus size={18} />
            New Resource
          </button>
        </div>
      </header>

      {(notice || error) && <div className={`alert ${error ? 'error' : 'success'}`}>{error || notice}</div>}
      <DashboardStats stats={stats} />

      <section className="resource-panel">
        <div className="resource-panel-toolbar">
          <label>
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search resources..." />
          </label>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="resource-loading"><BookOpen size={24} /> Loading resources...</div>
        ) : (
          <>
            <ResourceTable
              isAdmin={isAdmin}
              resources={filteredResources}
              onEdit={openEdit}
              onDelete={deleteResource}
              onStatus={updateStatus}
            />
            <div className="resource-card-list">
              {filteredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} onEdit={openEdit} onDelete={deleteResource} />
              ))}
            </div>
          </>
        )}
      </section>

      <ActivityTimeline activity={activity} />
      {isAdmin && (
        <CategoryManager
          categories={categories}
          draft={categoryDraft}
          onDraft={setCategoryDraft}
          onCreate={createCategory}
          onDelete={deleteCategory}
        />
      )}

      {modalOpen && (
        <UploadModal
          categories={categories}
          form={form}
          file={file}
          tagDraft={tagDraft}
          uploading={uploading}
          saving={saving}
          onClose={() => setModalOpen(false)}
          onFile={setFile}
          onUpload={uploadFile}
          onSubmit={saveResource}
          onField={updateField}
          onTags={(tags) => updateField('tags', tags)}
          onTagDraft={setTagDraft}
        />
      )}
    </section>
  )
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Unable to read file'))
    reader.readAsDataURL(file)
  })
}

function formatError(body) {
  if (!body?.details) return body?.message || 'Request failed'
  const details = Object.values(body.details).flat().filter(Boolean).join(', ')
  return details ? `${body.message}: ${details}` : body.message
}

export default ResourceManagement
