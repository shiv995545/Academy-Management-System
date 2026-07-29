function StatusBadge({ status }) {
  return <span className={`status-badge ${status || 'active'}`}>{status || 'active'}</span>
}

export default StatusBadge
