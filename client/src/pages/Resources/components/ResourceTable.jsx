import StatusBadge from './StatusBadge'

function ResourceTable({ isAdmin, resources, onEdit, onDelete, onStatus }) {
  return (
    <div className="resource-table-wrap">
      <table className="resource-table">
        <thead>
          <tr>
            <th>Resource</th>
            <th>Category</th>
            <th>Uploader</th>
            <th>Status</th>
            <th>Views</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {resources.length === 0 ? (
            <tr>
              <td colSpan="6" className="empty-cell">No resources yet.</td>
            </tr>
          ) : (
            resources.map((resource) => (
              <tr key={resource.id}>
                <td>
                  <strong>{resource.title}</strong>
                  <span>{resource.class_level ? `Class ${resource.class_level} · ` : ''}{resource.subject || 'General'} · {resource.resource_type}</span>
                </td>
                <td>{resource.category || '-'}</td>
                <td>{resource.uploader_name || '-'}</td>
                <td><StatusBadge status={resource.status} /></td>
                <td>{resource.views || 0}</td>
                <td>
                  <div className="table-actions">
                    <button type="button" onClick={() => onEdit(resource)}>Edit</button>
                    {isAdmin && resource.status !== 'active' && (
                      <button type="button" onClick={() => onStatus(resource, 'active')}>Approve</button>
                    )}
                    {isAdmin && resource.status !== 'rejected' && (
                      <button type="button" onClick={() => onStatus(resource, 'rejected')}>Reject</button>
                    )}
                    <button type="button" className="danger" onClick={() => onDelete(resource)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default ResourceTable
