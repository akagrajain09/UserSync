import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserPlus, UserCircle, LogOut,
  Shield, ChevronRight, Zap,
} from 'lucide-react'
import useAuth from '../hooks/useAuth'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',   roles: ['admin', 'manager', 'user'] },
  { to: '/users',     icon: Users,           label: 'User List',    roles: ['admin', 'manager'] },
  { to: '/users/new', icon: UserPlus,         label: 'Add User',    roles: ['admin'] },
  { to: '/profile',   icon: UserCircle,       label: 'My Profile',  roles: ['admin', 'manager', 'user'] },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isAdmin, isManager } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(user?.role))

  const roleLabel = isAdmin ? 'Administrator' : isManager ? 'Manager' : 'User'
  const roleBadgeColor = isAdmin ? '#7c3aed' : isManager ? '#0d9488' : '#3b82f6'

  const initials = user?.name
    ?.split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

  return (
    <aside style={{
      position: 'fixed', top: 0, left: isOpen ? 0 : 'var(--sidebar-w)', bottom: 0,
      width: 'var(--sidebar-w)', background: 'var(--sidebar-bg)',
      display: 'flex', flexDirection: 'column',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      zIndex: 100, transition: 'left 0.3s var(--ease)',
    }}>
      {/* Brand */}
      <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(13,148,136,0.5)',
          }}>
            <Zap size={20} color="#fff" />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>UserSync</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Management</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 8px 10px' }}>Main Menu</div>
        {visibleItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 10, textDecoration: 'none',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
              background: isActive ? 'rgba(13,148,136,0.25)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
              fontWeight: isActive ? 600 : 400,
              fontSize: '0.9rem',
              transition: 'all 0.18s var(--ease)',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={18} style={{ flexShrink: 0, color: isActive ? 'var(--primary-light)' : 'rgba(255,255,255,0.4)' }} />
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && <ChevronRight size={14} style={{ color: 'var(--primary-light)', opacity: 0.7 }} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 14px', borderRadius: 12,
          background: 'rgba(255,255,255,0.05)', marginBottom: 8,
        }}>
          <div className="avatar avatar-sm" style={{ background: `linear-gradient(135deg, ${roleBadgeColor}, ${roleBadgeColor}99)` }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <Shield size={10} style={{ color: roleBadgeColor }} />
              <span style={{ color: roleBadgeColor, fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize' }}>{roleLabel}</span>
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-ghost btn-sm w-full" style={{
          color: 'rgba(255,255,255,0.4)', justifyContent: 'center', gap: 8,
          borderRadius: 8,
        }}>
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
