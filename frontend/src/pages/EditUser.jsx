import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react'
import { usersAPI } from '../api/users.api'
import useAuth from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function EditUser() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const [form, setForm]       = useState({ name: '', email: '', password: '', role: '', status: '' })
  const [original, setOrig]   = useState(null)
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [showPw, setShowPw]   = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await usersAPI.getOne(id)
        const u = data.user
        setOrig(u)
        setForm({ name: u.name, email: u.email, password: '', role: u.role, status: u.status })
      } catch { toast.error('User not found'); navigate('/users') }
      finally { setLoading(false) }
    }
    load()
  }, [id])

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    setErrors(p => ({ ...p, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email)       e.email = 'Email is required'
    if (form.password && form.password.length < 6) e.password = 'Password must be at least 6 characters'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const payload = { name: form.name, email: form.email, role: form.role, status: form.status }
      if (form.password) payload.password = form.password
      await usersAPI.update(id, payload)
      toast.success('User updated successfully!')
      navigate(`/users/${id}`)
    } catch (err) {
      const msgs = err.response?.data?.errors
      if (msgs) { const mapped = {}; msgs.forEach(m => { mapped[m.path] = m.msg }); setErrors(mapped) }
      else toast.error(err.response?.data?.message || 'Failed to update')
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )

  const Field = ({ id, label, hint, children, error }) => (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      {hint && <span className="form-hint">{hint}</span>}
      {children}
      {error && <span className="form-error">{error}</span>}
    </div>
  )

  // Prevent self-role downgrade
  const isSelf = currentUser?._id === id

  return (
    <div style={{ animation: 'slideIn 0.3s var(--ease)', maxWidth: 640 }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/users/${id}`)} style={{ marginBottom: 20 }}>
        <ArrowLeft size={15} /> Back to user
      </button>

      <div className="page-header">
        <div className="page-header-left">
          <h2>Edit User</h2>
          <p>Editing: <strong>{original?.name}</strong></p>
        </div>
      </div>

      <div className="card">
        <div style={{ height: 6, background: 'linear-gradient(90deg, var(--accent), var(--primary))', borderRadius: '10px 10px 0 0' }} />

        <form onSubmit={handleSubmit} style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Field id="edit-name" label="Full Name" error={errors.name}>
              <input id="edit-name" className={`form-input${errors.name ? ' error' : ''}`} value={form.name} onChange={set('name')} />
            </Field>
            <Field id="edit-email" label="Email Address" error={errors.email}>
              <input id="edit-email" type="email" className={`form-input${errors.email ? ' error' : ''}`} value={form.email} onChange={set('email')} />
            </Field>
          </div>

          <Field id="edit-password" label="New Password" hint="Leave blank to keep current password" error={errors.password}>
            <div style={{ position: 'relative' }}>
              <input
                id="edit-password"
                type={showPw ? 'text' : 'password'}
                className={`form-input${errors.password ? ' error' : ''}`}
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPw(p => !p)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Field id="edit-role" label="Role" hint={isSelf ? 'Cannot change your own role' : ''}>
              <select id="edit-role" className="form-select" value={form.role} onChange={set('role')} disabled={isSelf}>
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
            <Field id="edit-status" label="Status">
              <select id="edit-status" className="form-select" value={form.status} onChange={set('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
          </div>

          <div className="divider" />

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate(`/users/${id}`)}>Cancel</button>
            <button type="submit" id="edit-user-submit" className="btn btn-primary" disabled={saving}>
              {saving ? <div className="spinner" /> : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
