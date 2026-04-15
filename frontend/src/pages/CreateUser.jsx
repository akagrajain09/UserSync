import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, Eye, EyeOff } from 'lucide-react'
import { usersAPI } from '../api/users.api'
import toast from 'react-hot-toast'

export default function CreateUser() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'user', status: 'active' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    setErrors(p => ({ ...p, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())             e.name     = 'Name is required'
    if (!form.email)                   e.email    = 'Email is required'
    if (!form.password)                e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await usersAPI.create(form)
      toast.success(`${form.name} has been created!`)
      navigate('/users')
    } catch (err) {
      const msgs = err.response?.data?.errors
      if (msgs) {
        const mapped = {}
        msgs.forEach(m => { mapped[m.path] = m.msg })
        setErrors(mapped)
      } else {
        toast.error(err.response?.data?.message || 'Failed to create user')
      }
    } finally { setLoading(false) }
  }

  const genPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#!'
    const pw = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    setForm(p => ({ ...p, password: pw }))
    setErrors(p => ({ ...p, password: '' }))
    setShowPw(true)
  }

  const Field = ({ id, label, hint, children, error }) => (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      {hint && <span className="form-hint">{hint}</span>}
      {children}
      {error && <span className="form-error">{error}</span>}
    </div>
  )

  return (
    <div style={{ animation: 'slideIn 0.3s var(--ease)', maxWidth: 640 }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/users')} style={{ marginBottom: 20 }}>
        <ArrowLeft size={15} /> Back to users
      </button>

      <div className="page-header">
        <div className="page-header-left">
          <h2>Create New User</h2>
          <p>Add a new user account to the system</p>
        </div>
      </div>

      <div className="card">
        {/* Header strip */}
        <div style={{ height: 6, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: '10px 10px 0 0' }} />

        <form onSubmit={handleSubmit} style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Field id="name" label="Full Name" error={errors.name}>
              <input id="name" className={`form-input${errors.name ? ' error' : ''}`} placeholder="John Doe" value={form.name} onChange={set('name')} />
            </Field>
            <Field id="email" label="Email Address" error={errors.email}>
              <input id="email" type="email" className={`form-input${errors.email ? ' error' : ''}`} placeholder="john@example.com" value={form.email} onChange={set('email')} />
            </Field>
          </div>

          <Field id="password" label="Password" hint="Min. 6 characters" error={errors.password}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  id="password"
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
              <button type="button" className="btn btn-outline btn-sm" onClick={genPassword} style={{ whiteSpace: 'nowrap' }}>
                Generate
              </button>
            </div>
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Field id="role" label="Role">
              <select id="role" className="form-select" value={form.role} onChange={set('role')}>
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
            <Field id="status" label="Status">
              <select id="status" className="form-select" value={form.status} onChange={set('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
          </div>

          <div className="divider" />

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/users')}>Cancel</button>
            <button type="submit" id="create-user-submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner" /> : <><UserPlus size={16} /> Create User</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
