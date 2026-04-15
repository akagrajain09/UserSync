import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Zap, Lock, Mail, ArrowRight } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState({})

  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || '/dashboard'

  const validate = () => {
    const e = {}
    if (!email)    e.email    = 'Email is required'
    if (!password) e.password = 'Password is required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      toast.error(msg)
      if (msg.toLowerCase().includes('password')) setErrors({ password: msg })
      else setErrors({ email: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f3460 100%)',
      fontFamily: "'Outfit', sans-serif",
    }}>
      {/* Left panel — branding */}
      <div style={{
        flex: 1,display:'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '60px 48px',
        
      }} className="login-left">
        <div style={{ maxWidth: 440, textAlign: 'center', animation: 'slideIn 0.5s var(--ease)' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: '0 auto 28px',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 40px rgba(13,148,136,0.5)',
          }}>
            <Zap size={36} color="#fff" />
          </div>
          <h1 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: 16, letterSpacing: '-0.04em' }}>
            UserSync
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.05rem', lineHeight: 1.7 }}>
            A powerful role-based user management platform. Manage teams, control permissions, and keep everything in sync.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['RBAC', 'JWT Auth', 'Audit Logs', 'Admin Tools'].map(tag => (
              <span key={tag} style={{
                background: 'rgba(13,148,136,0.2)', color: 'var(--primary-light)',
                border: '1px solid rgba(13,148,136,0.3)',
                borderRadius: 99, padding: '5px 14px', fontSize: '0.78rem', fontWeight: 600,
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{
          width: '100%', maxWidth: 440,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24, padding: '48px 40px',
          animation: 'slideUp 0.4s var(--ease)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #0d9488, #0f766e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(13,148,136,0.5)',
            }}>
              <Zap size={22} color="#fff" />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>UserSync</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', letterSpacing: '0.08em' }}>USER MANAGEMENT</div>
            </div>
          </div>

          <h2 style={{ color: '#fff', marginBottom: 8, fontSize: '1.6rem' }}>Sign in</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 32, fontSize: '0.9rem' }}>
            Enter your credentials to access your account
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Email */}
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                <input
                  id="email"
                  type="email"
                  className={`form-input${errors.email ? ' error' : ''}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
                  autoComplete="email"
                  style={{ paddingLeft: 42, background: 'rgba(255,255,255,0.07)', borderColor: errors.email ? 'var(--danger)' : 'rgba(255,255,255,0.12)', color: '#fff' }}
                />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  className={`form-input${errors.password ? ' error' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
                  autoComplete="current-password"
                  style={{ paddingLeft: 42, paddingRight: 44, background: 'rgba(255,255,255,0.07)', borderColor: errors.password ? 'var(--danger)' : 'rgba(255,255,255,0.12)', color: '#fff' }}
                />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 0,
                }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ justifyContent: 'center', marginTop: 8, borderRadius: 12, fontSize: '0.95rem' }}
            >
              {loading ? <div className="spinner" /> : <>Sign in <ArrowRight size={17} /></>}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{
            marginTop: 32, padding: '16px', borderRadius: 12,
            background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.2)',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Demo Credentials</p>
            {[
              { role: 'Admin',   email: 'admin@example.com',   pw: 'Admin@123' },
              { role: 'Manager', email: 'manager@example.com', pw: 'Manager@123' },
              { role: 'User',    email: 'alice@example.com',   pw: 'User@1234' },
            ].map(c => (
              <button key={c.role} type="button" onClick={() => { setEmail(c.email); setPassword(c.pw) }} style={{
                display: 'block', width: '100%', textAlign: 'left', background: 'none',
                border: 'none', cursor: 'pointer', padding: '4px 0', fontFamily: 'inherit',
              }}>
                <span style={{ color: 'var(--primary-light)', fontWeight: 600, fontSize: '0.8rem' }}>{c.role}: </span>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem' }}>{c.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .login-left { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
