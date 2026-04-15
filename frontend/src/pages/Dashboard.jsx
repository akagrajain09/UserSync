import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, UserCheck, UserX, Shield, Crown, UserCog,
  ArrowRight, Clock, TrendingUp,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'
import useAuth from '../hooks/useAuth'
import { usersAPI } from '../api/users.api'
import { format } from 'date-fns'

export default function Dashboard() {
  const { user, isAdmin, isManager } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats]   = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        if (isAdmin || isManager) {
          const [statsRes, usersRes] = await Promise.all([
            usersAPI.getStats(),
            usersAPI.getAll({ limit: 5, page: 1 }),
          ])
          setStats(statsRes.data)
          setRecent(usersRes.data.users)
        }
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [isAdmin, isManager])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const initials = user?.name?.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()

  return (
    <div style={{ animation: 'slideIn 0.3s var(--ease)' }}>
      {/* Welcome hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
        borderRadius: 20, padding: '32px 36px', marginBottom: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 20,
        boxShadow: '0 8px 32px rgba(15,23,42,0.2)',
      }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', marginBottom: 6 }}>{greeting()},</p>
          <h1 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: 8 }}>{user?.name} 👋</h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <Badge type={user?.role}>{user?.role}</Badge>
            <Badge type={user?.status}>{user?.status}</Badge>
            {user?.lastLogin && (
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Clock size={12} /> Last login: {format(new Date(user.lastLogin), 'MMM d, h:mm a')}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="avatar avatar-xl" style={{
            background: user?.role === 'admin'
              ? 'linear-gradient(135deg,#7c3aed,#5b21b6)'
              : user?.role === 'manager'
              ? 'linear-gradient(135deg,#0d9488,#0f766e)'
              : 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}>
            {initials}
          </div>
        </div>
      </div>

      {/* Stat cards — admin/manager only */}
      {(isAdmin || isManager) && (
        <>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 16, color: 'var(--text-secondary)', fontWeight: 600 }}>
            <TrendingUp size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            Overview
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="stat-card">
                  <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 10 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 32, width: '60%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 13, width: '80%' }} />
                  </div>
                </div>
              ))
            ) : (
              <>
                <StatCard icon={<Users size={24} />}    label="Total Users"    value={stats?.total}    color="#0d9488" bg="#f0fdfa" />
                <StatCard icon={<Crown size={24} />}    label="Admins"         value={stats?.admins}   color="#7c3aed" bg="#f5f3ff" />
                <StatCard icon={<UserCog size={24} />}  label="Managers"       value={stats?.managers} color="#0d9488" bg="#f0fdfa" />
                <StatCard icon={<Shield size={24} />}   label="Regular Users"  value={stats?.users}    color="#3b82f6" bg="#eff6ff" />
                <StatCard icon={<UserCheck size={24} />}label="Active"         value={stats?.active}   color="#10b981" bg="#ecfdf5" />
                <StatCard icon={<UserX size={24} />}    label="Inactive"       value={stats?.inactive} color="#ef4444" bg="#fef2f2" />
              </>
            )}
          </div>

          {/* Recent users table */}
          <div className="card">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>Recent Users</h3>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/users')}>
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--surface-2)' }}>
                  <tr>
                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>User</th>
                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Role</th>
                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(4)].map((_, j) => (
                          <td key={j} style={{ padding: '14px 20px' }}>
                            <div className="skeleton" style={{ height: 14, width: j === 0 ? 140 : 80, borderRadius: 4 }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : recent.map(u => (
                    <tr key={u._id} onClick={() => navigate(`/users/${u._id}`)} style={{ cursor: 'pointer', borderTop: '1px solid var(--border)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-faint)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar avatar-sm" style={{
                            background: u.role === 'admin' ? 'linear-gradient(135deg,#7c3aed,#5b21b6)' : u.role === 'manager' ? 'linear-gradient(135deg,#0d9488,#0f766e)' : 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
                            fontSize: '0.7rem',
                          }}>
                            {u.name?.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}><Badge type={u.role}>{u.role}</Badge></td>
                      <td style={{ padding: '14px 20px' }}><Badge type={u.status}>{u.status}</Badge></td>
                      <td style={{ padding: '14px 20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Regular user dashboard */}
      {user?.role === 'user' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          <div className="card card-padding" style={{ borderLeft: '4px solid var(--primary)', cursor: 'pointer' }} onClick={() => navigate('/profile')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, background: 'var(--primary-faint)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={20} color="var(--primary)" />
              </div>
              <h3 style={{ margin: 0 }}>My Profile</h3>
            </div>
            <p style={{ fontSize: '0.875rem', marginBottom: 16 }}>View and update your personal information and password.</p>
            <button className="btn btn-outline btn-sm">Go to Profile <ArrowRight size={14} /></button>
          </div>

          <div className="card card-padding" style={{ borderLeft: '4px solid var(--accent)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, background: 'var(--accent-faint)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck size={20} color="var(--accent)" />
              </div>
              <h3 style={{ margin: 0 }}>Account Status</h3>
            </div>
            <p style={{ fontSize: '0.875rem', marginBottom: 16 }}>Your account is currently <strong style={{ color: 'var(--success)' }}>active</strong>.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Badge type={user?.role}>{user?.role}</Badge>
              <Badge type={user?.status}>{user?.status}</Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
