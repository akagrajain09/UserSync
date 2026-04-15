import { useNavigate } from 'react-router-dom'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import Badge from './Badge'
import useAuth from '../hooks/useAuth'
import { format } from 'date-fns'

export default function UserTable({ users, onDelete, loading }) {
  const navigate  = useNavigate()
  const { isAdmin, isManager } = useAuth()

  if (loading) {
    return (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {['User','Email','Role','Status','Joined','Actions'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                {[...Array(6)].map((_, j) => (
                  <td key={j}><div className="skeleton" style={{ height: 16, width: j === 5 ? 80 : '70%', borderRadius: 4 }} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (!users?.length) {
    return (
      <div className="table-wrap">
        <div className="empty-state">
          <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No users found</p>
          <p style={{ fontSize: '0.8rem' }}>Try adjusting your search or filters</p>
        </div>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="avatar avatar-sm" style={{
                    background: u.role === 'admin'
                      ? 'linear-gradient(135deg,#7c3aed,#5b21b6)'
                      : u.role === 'manager'
                      ? 'linear-gradient(135deg,#0d9488,#0f766e)'
                      : 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
                    fontSize: '0.7rem',
                  }}>
                    {u.name?.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</span>
                </div>
              </td>
              <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{u.email}</td>
              <td><Badge type={u.role}>{u.role}</Badge></td>
              <td><Badge type={u.status}>{u.status}</Badge></td>
              <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}
              </td>
              <td>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    title="View"
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => navigate(`/users/${u._id}`)}
                    style={{ color: 'var(--primary)' }}
                  >
                    <Eye size={15} />
                  </button>
                  {isAdmin && (
                    <button
                      title="Edit"
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => navigate(`/users/${u._id}/edit`)}
                      style={{ color: 'var(--accent)' }}
                    >
                      <Pencil size={15} />
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      title="Deactivate"
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => onDelete(u)}
                      style={{ color: 'var(--danger)' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
