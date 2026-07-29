function DashboardStats({ stats }) {
  const cards = [
    ['Total Resources', stats?.total || 0],
    ['Active', stats?.active || 0],
    ['Pending', stats?.pending || 0],
    ['Rejected', stats?.rejected || 0],
    ['Views', stats?.views || 0],
    ['Downloads', stats?.downloads || 0]
  ]

  return (
    <section className="resource-stats-grid">
      {cards.map(([label, value]) => (
        <article className="resource-stat-card" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </article>
      ))}
    </section>
  )
}

export default DashboardStats
