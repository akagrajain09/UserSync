import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Calendar, Clock, User, Mail, Shield, Info } from 'lucide-react'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import useAuth from '../hooks/useAuth'
import { usersAPI } from '../api/users.api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const [user, setUser]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [delModal, setDelModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await usersAPI.getOne(id)
        setUser(data.user)
      } catch {
        toast.error('User not found')
        navigate('/users')
      } finally { setLoading(false) }
    }
    load()
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await usersAPI.remove(id)
      toast.success('User deactivated')
      navigate('/users')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setDeleting(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )

  if (!user) return null

  const initials = user.name?.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()
  const avatarBg = user.role === 'admin'
    ? 'linear-gradient(135deg,#7c3aed,#5b21b6)'
    : user.role === 'manager'
    ? 'linear-gradient(135deg,#0d9488,#0f766e)'
    : 'linear-gradient(135deg,#3b82f6,#1d4ed8)'

  const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="detail-item">
      <div className="detail-key" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <Icon size={11} /> {label}
      </div>
      <div className="detail-val">{value || '—'}</div>
    </div>
  )

  return (
    <div style={{ animation: 'slideIn 0.3s var(--ease)', maxWidth: 800 }}>
      {/* Back */}
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/users')} style={{ marginBottom: 20, gap: 6 }}>
        <ArrowLeft size={15} /> Back to users
      </button>

      {/* Profile card */}
      <div className="card" style={{ overflow: 'hidden', marginBottom: 20 }}>
        {/* Colored header banner */}
        <div style={{
          height: 100,
          background: user.role === 'admin'
            ? 'linear-gradient(135deg, #5b21b6, #7c3aed)'
            : user.role === 'manager'
            ? 'linear-gradient(135deg, #0f766e, #0d9488)'
            : 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
          position: 'relative',
        }} />

        <div style={{ padding: '0 32px 28px', marginTop: -48 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div className="avatar avatar-xl" style={{ background: avatarBg, border: '4px solid var(--surface)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', fontSize: '1.4rem' }}>
              {initials}
            </div>
            {isAdmin && (
              <div style={{ display: 'flex', gap: 10, paddingBottom: 4 }}>
                <button className="btn btn-outline btn-sm" onClick={() => navigate(`/users/${id}/edit`)}>
                  <Pencil size={14} /> Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => setDelModal(true)}>
                  <Trash2 size={14} /> Deactivate
                </button>
              </div>
            )}
          </div>

          <h2 style={{ margin: '0 0 6px' }}>{user.name}</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            <Badge type={user.role}>{user.role}</Badge>
            <Badge type={user.status}>{user.status}</Badge>
          </div>

          <div className="detail-grid">
            <DetailItem icon={Mail}     label="Email"      value={user.email} />
            <DetailItem icon={Shield}   label="Role"       value={<Badge type={user.role}>{user.role}</Badge>} />
            <DetailItem icon={User}     label="Status"     value={<Badge type={user.status}>{user.status}</Badge>} />
            <DetailItem icon={Clock}    label="Last Login" value={user.lastLogin ? format(new Date(user.lastLogin), 'MMM d, yyyy h:mm a') : 'Never'} />
            <DetailItem icon={Calendar} label="Created At" value={user.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : '—'} />
            <DetailItem icon={Calendar} label="Updated At" value={user.updatedAt ? format(new Date(user.updatedAt), 'MMMM d, yyyy') : '—'} />
          </div>
        </div>
      </div>

      {/* Audit card */}
      <div className="card card-padding">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Info size={16} color="var(--primary)" />
          <h3 style={{ margin: 0 }}>Audit Information</h3>
        </div>
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-key">Created By</div>
            <div className="detail-val">
              {user.createdBy
                ? <span>{user.createdBy.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({user.createdBy.email})</span></span>
                : 'System (Seed)'}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-key">Last Updated By</div>
            <div className="detail-val">
              {user.updatedBy
                ? <span>{user.updatedBy.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({user.updatedBy.email})</span></span>
                : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Delete modal */}
      <Modal
        isOpen={delModal}
        onClose={() => setDelModal(false)}
        title="Deactivate User"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setDelModal(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? <div className="spinner" /> : 'Deactivate'}
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Are you sure you want to deactivate <strong>{user.name}</strong>?
        </p>
      </Modal>
    </div>
  )
}
