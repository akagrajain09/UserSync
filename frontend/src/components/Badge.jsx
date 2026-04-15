export default function Badge({ type, children }) {
  const classMap = {
    admin:    'badge badge-admin',
    manager:  'badge badge-manager',
    user:     'badge badge-user',
    active:   'badge badge-active',
    inactive: 'badge badge-inactive',
  }
  return (
    <span className={classMap[type] || 'badge'}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', opacity: 0.7 }} />
      {children || type}
    </span>
  )
}
