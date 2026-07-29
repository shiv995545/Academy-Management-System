import CategorySelector from './CategorySelector'
import FileUploader from './FileUploader'
import TagInput from './TagInput'

function UploadModal({
  categories,
  form,
  file,
  tagDraft,
  uploading,
  saving,
  onClose,
  onFile,
  onUpload,
  onSubmit,
  onField,
  onTags,
  onTagDraft
}) {
  return (
    <div className="resource-modal-backdrop">
      <form className="resource-modal" onSubmit={onSubmit}>
        <header>
          <h2>{form.id ? 'Edit Resource' : 'Create Resource'}</h2>
          <button type="button" onClick={onClose}>×</button>
        </header>
        <label>
          Title
          <input value={form.title} onChange={(event) => onField('title', event.target.value)} required />
        </label>
        <label>
          Description
          <textarea value={form.description} onChange={(event) => onField('description', event.target.value)} />
        </label>
        <div className="modal-grid">
          <label>
            Subject
            <input value={form.subject} onChange={(event) => onField('subject', event.target.value)} />
          </label>
          <label>
            Class
            <select value={form.classLevel} onChange={(event) => onField('classLevel', event.target.value)}>
              <option value="">General</option>
              {Array.from({ length: 10 }, (_, index) => index + 1).map((classLevel) => (
                <option key={classLevel} value={classLevel}>Class {classLevel}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="modal-grid">
          <label>
            Category
            <CategorySelector categories={categories} value={form.category} onChange={(value) => onField('category', value)} />
          </label>
          <label>
            Resource Type
            <select value={form.resourceType} onChange={(event) => onField('resourceType', event.target.value)}>
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
              <option value="link">Link</option>
              <option value="doc">Document</option>
              <option value="image">Image</option>
              <option value="quiz">Quiz</option>
              <option value="note">Note</option>
            </select>
          </label>
        </div>
        <div className="modal-grid">
          <label>
            Visibility
            <select value={form.visibility} onChange={(event) => onField('visibility', event.target.value)}>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </label>
          <span className="modal-help">Public active resources appear in the student Library.</span>
        </div>
        <label>
          File or link URL
          <input value={form.fileUrl} onChange={(event) => onField('fileUrl', event.target.value)} placeholder="Upload a file or paste a link" />
        </label>
        <FileUploader file={file} uploading={uploading} onFile={onFile} onUpload={onUpload} />
        <label>
          Thumbnail URL
          <input value={form.thumbnailUrl} onChange={(event) => onField('thumbnailUrl', event.target.value)} />
        </label>
        <TagInput tags={form.tags} value={tagDraft} onValue={onTagDraft} onChange={onTags} />
        <footer>
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Resource'}</button>
        </footer>
      </form>
    </div>
  )
}

export default UploadModal
