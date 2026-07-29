import StatusBadge from './StatusBadge'

function ResourceCard({ resource, onEdit, onDelete }) {
  return (
    <article className="manage-resource-card">
      <div>
        <span>{resource.category || 'Uncategorized'}</span>
        <StatusBadge status={resource.status} />
      </div>
      <h3>{resource.title}</h3>
      <p>{resource.description || 'No description added.'}</p>
      <small>{resource.class_level ? `Class ${resource.class_level} · ` : ''}{resource.subject || 'General'} · {resource.resource_type} · {resource.uploader_name || 'You'}</small>
      <footer>
        <button type="button" onClick={() => onEdit(resource)}>Edit</button>
        <button type="button" className="danger" onClick={() => onDelete(resource)}>Delete</button>
      </footer>
    </article>
  )
}

export default ResourceCard
