export default function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg || 'var(--primary-faint)' }}>
        <span style={{ color: color || 'var(--primary)' }}>{icon}</span>
      </div>
      <div className="stat-info">
        <div className="stat-value" style={{ color: color }}>{value ?? '—'}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}
