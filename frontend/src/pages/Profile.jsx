import { useEffect, useState } from 'react'
import { Eye, EyeOff, Save, User, Mail, Shield, Calendar, Clock } from 'lucide-react'
import Badge from '../components/Badge'
import { usersAPI } from '../api/users.api'
import useAuth from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function Profile() {
  const { user: authUser, updateUser } = useAuth()

  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [form, setForm]         = useState({ name: '', password: '', confirmPw: '' })
  const [errors, setErrors]     = useState({})
  const [showPw, setShowPw]     = useState(false)
  const [showCPw, setShowCPw]   = useState(false)
  const [tab, setTab]           = useState('info') // 'info' | 'security'

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await usersAPI.getMe()
        setProfile(data.user)
        setForm(p => ({ ...p, name: data.user.name }))
      } catch { toast.error('Failed to load profile') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    setErrors(p => ({ ...p, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (tab === 'security') {
      if (!form.password)              e.password  = 'New password is required'
      else if (form.password.length < 6) e.password = 'Minimum 6 characters'
      if (form.password !== form.confirmPw) e.confirmPw = 'Passwords do not match'
    }
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const payload = { name: form.name }
      if (tab === 'security' && form.password) payload.password = form.password
      const { data } = await usersAPI.updateMe(payload)
      setProfile(data.user)
      updateUser({ name: data.user.name })
      setForm(p => ({ ...p, password: '', confirmPw: '' }))
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update')
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )

  const initials = profile?.name?.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()
  const avatarBg = profile?.role === 'admin'
    ? 'linear-gradient(135deg,#7c3aed,#5b21b6)'
    : profile?.role === 'manager'
    ? 'linear-gradient(135deg,#0d9488,#0f766e)'
    : 'linear-gradient(135deg,#3b82f6,#1d4ed8)'

  return (
    <div style={{ animation: 'slideIn 0.3s var(--ease)', maxWidth: 720 }}>
      <div className="page-header">
        <div className="page-header-left">
          <h2>My Profile</h2>
          <p>Manage your personal information and security</p>
        </div>
      </div>

      {/* Profile hero */}
      <div className="card" style={{ marginBottom: 20, overflow: 'hidden' }}>
        <div style={{
          height: 90,
          background: profile?.role === 'admin'
            ? 'linear-gradient(135deg,#5b21b6,#7c3aed)'
            : profile?.role === 'manager'
            ? 'linear-gradient(135deg,#0f766e,#0d9488)'
            : 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
        }} />
        <div style={{ padding: '0 28px 24px', marginTop: -40 }}>
          <div className="avatar avatar-xl" style={{ background: avatarBg, border: '4px solid var(--surface)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', marginBottom: 14 }}>
            {initials}
          </div>
          <h2 style={{ marginBottom: 6 }}>{profile?.name}</h2>
          <p style={{ marginBottom: 12, fontSize: '0.875rem' }}>{profile?.email}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Badge type={profile?.role}>{profile?.role}</Badge>
            <Badge type={profile?.status}>{profile?.status}</Badge>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
            {[
              { icon: Calendar, label: 'Member since', value: profile?.createdAt ? format(new Date(profile.createdAt), 'MMM yyyy') : '—' },
              { icon: Clock,    label: 'Last login',   value: profile?.lastLogin  ? format(new Date(profile.lastLogin), 'MMM d, yyyy') : 'Never' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon size={14} color="var(--text-muted)" />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}: </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="card">
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 24px' }}>
          {[{ key: 'info', label: 'Personal Info', icon: User }, { key: 'security', label: 'Security', icon: Shield }].map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => { setTab(t.key); setErrors({}) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '16px 20px',
                background: 'none', border: 'none', borderBottom: tab === t.key ? '2px solid var(--primary)' : '2px solid transparent',
                color: tab === t.key ? 'var(--primary)' : 'var(--text-muted)',
                fontFamily: 'inherit', fontWeight: tab === t.key ? 700 : 500,
                fontSize: '0.875rem', cursor: 'pointer',
                marginBottom: -1, transition: 'all 0.15s',
              }}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Info tab */}
          {tab === 'info' && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-name">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="profile-name"
                    className={`form-input${errors.name ? ' error' : ''}`}
                    value={form.name}
                    onChange={set('name')}
                    style={{ paddingLeft: 38 }}
                  />
                </div>
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="form-input" value={profile?.email} disabled style={{ paddingLeft: 38, background: 'var(--surface-2)', cursor: 'not-allowed', color: 'var(--text-muted)' }} />
                </div>
                <span className="form-hint">Email cannot be changed here. Contact an admin.</span>
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <input className="form-input" value={profile?.role} disabled style={{ background: 'var(--surface-2)', cursor: 'not-allowed', color: 'var(--text-muted)', textTransform: 'capitalize' }} />
                <span className="form-hint">Role is managed by administrators.</span>
              </div>
            </>
          )}

          {/* Security tab */}
          {tab === 'security' && (
            <>
              <div style={{ padding: '14px 16px', background: 'var(--info-faint)', borderRadius: 10, borderLeft: '3px solid var(--info)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                💡 Only fill these fields if you want to change your password.
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="new-password">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="new-password"
                    type={showPw ? 'text' : 'password'}
                    className={`form-input${errors.password ? ' error' : ''}`}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={set('password')}
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirm-password">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="confirm-password"
                    type={showCPw ? 'text' : 'password'}
                    className={`form-input${errors.confirmPw ? ' error' : ''}`}
                    placeholder="••••••••"
                    value={form.confirmPw}
                    onChange={set('confirmPw')}
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowCPw(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showCPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPw && <span className="form-error">{errors.confirmPw}</span>}
              </div>
            </>
          )}

          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" id="profile-save-btn" className="btn btn-primary" disabled={saving}>
              {saving ? <div className="spinner" /> : <><Save size={15} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
