import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a, #1e293b)',
      fontFamily: "'Outfit', sans-serif", padding: 24, textAlign: 'center',
    }}>
      <div style={{
        fontSize: '8rem', fontWeight: 900, lineHeight: 1,
        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        marginBottom: 16,
      }}>404</div>
      <h2 style={{ color: '#fff', marginBottom: 12, fontSize: '1.5rem' }}>Page Not Found</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 32, maxWidth: 360 }}>
        The page you're looking for doesn't exist or you don't have permission to view it.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
          <ArrowLeft size={16} /> Go Back
        </button>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
          <Home size={16} /> Dashboard
        </button>
      </div>
    </div>
  )
}
