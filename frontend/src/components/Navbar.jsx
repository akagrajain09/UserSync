import { useLocation } from 'react-router-dom'
import { Menu, Bell } from 'lucide-react'
import useAuth from '../hooks/useAuth'

const ROUTE_TITLES = {
  '/dashboard':  { title: 'Dashboard',    sub: 'Welcome back' },
  '/users':      { title: 'User List',    sub: 'Manage all users' },
  '/users/new':  { title: 'Add User',     sub: 'Create a new account' },
  '/profile':    { title: 'My Profile',   sub: 'View & edit your profile' },
}

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth()
  const { pathname } = useLocation()

  const match = Object.keys(ROUTE_TITLES)
    .sort((a, b) => b.length - a.length)
    .find(k => pathname.startsWith(k))

  const info = match ? ROUTE_TITLES[match] : { title: 'UserSync', sub: '' }

  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <header style={{
      height: 68, background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 32px', gap: 16,
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="btn btn-ghost btn-icon"
        style={{ display: 'none' }}
        id="mobile-menu-btn"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{info.title}</h3>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{info.sub}</p>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }} className="hide-mobile">
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{timeStr}</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{dateStr}</span>
        </div>

        <div style={{ width: 1, height: 28, background: 'var(--border)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign:'right' }} className="hide-mobile">
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
          <div className="avatar avatar-sm" style={{
            background: user?.role === 'admin'
              ? 'linear-gradient(135deg,#7c3aed,#5b21b6)'
              : user?.role === 'manager'
              ? 'linear-gradient(135deg,#0d9488,#0f766e)'
              : 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
            fontSize: '0.8rem',
          }}>
            {user?.name?.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  )
}
