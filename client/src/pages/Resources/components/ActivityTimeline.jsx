function ActivityTimeline({ activity }) {
  return (
    <section className="activity-timeline">
      <h2>Recent Activity</h2>
      {activity.length === 0 ? (
        <p>No activity recorded yet.</p>
      ) : (
        activity.map((item) => (
          <article key={item.id}>
            <strong>{item.action}</strong>
            <span>{item.actor_name || 'System'} · {item.resource_title || 'Resource system'}</span>
            <small>{new Date(item.created_at).toLocaleString()}</small>
          </article>
        ))
      )}
    </section>
  )
}

export default ActivityTimeline
