import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, X, Filter } from 'lucide-react'
import UserTable from '../components/UserTable'
import Pagination from '../components/Pagination'
import Modal from '../components/Modal'
import useAuth from '../hooks/useAuth'
import { usersAPI } from '../api/users.api'
import toast from 'react-hot-toast'

export default function UserList() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  const [users, setUsers]       = useState([])
  const [pagination, setPag]    = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [roleFilter, setRole]   = useState('')
  const [statusFilter, setStat] = useState('')
  const [page, setPage]         = useState(1)
  const [deleteTarget, setDel]  = useState(null)
  const [deleting, setDel2]     = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (search)       params.search = search
      if (roleFilter)   params.role   = roleFilter
      if (statusFilter) params.status = statusFilter
      const { data } = await usersAPI.getAll(params)
      setUsers(data.users)
      setPag(data.pagination)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter, statusFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  // Debounce search
  useEffect(() => { setPage(1) }, [search, roleFilter, statusFilter])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDel2(true)
    try {
      await usersAPI.remove(deleteTarget._id)
      toast.success(`${deleteTarget.name} has been deactivated`)
      setDel(null)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate user')
    } finally {
      setDel2(false)
    }
  }

  const clearFilters = () => { setSearch(''); setRole(''); setStat(''); setPage(1) }
  const hasFilters = search || roleFilter || statusFilter

  return (
    <div style={{ animation: 'slideIn 0.3s var(--ease)' }}>
      <div className="page-header">
        <div className="page-header-left">
          <h2>User Management</h2>
          <p>{pagination.total} total users</p>
        </div>
        <div className="page-header-actions">
          {isAdmin && (
            <button className="btn btn-primary" id="add-user-btn" onClick={() => navigate('/users/new')}>
              <Plus size={16} /> Add User
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        {/* Search */}
        <div className="search-wrap" style={{ flex: 1, minWidth: 220 }}>
          <Search size={15} className="search-icon" />
          <input
            id="search-input"
            type="text"
            className="form-input"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ minWidth: 0 }}
          />
        </div>

        {/* Role filter */}
        <select
          id="role-filter"
          className="form-select"
          value={roleFilter}
          onChange={e => setRole(e.target.value)}
          style={{ width: 'auto', minWidth: 130 }}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="user">User</option>
        </select>

        {/* Status filter */}
        <select
          id="status-filter"
          className="form-select"
          value={statusFilter}
          onChange={e => setStat(e.target.value)}
          style={{ width: 'auto', minWidth: 140 }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ color: 'var(--danger)', whiteSpace: 'nowrap' }}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <UserTable users={users} loading={loading} onDelete={setDel} />

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, pagination.total)} of {pagination.total}
          </span>
          <Pagination page={page} pages={pagination.pages} onPageChange={setPage} />
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDel(null)}
        title="Deactivate User"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setDel(null)}>Cancel</button>
            <button className="btn btn-danger" id="confirm-delete-btn" onClick={handleDelete} disabled={deleting}>
              {deleting ? <div className="spinner" /> : 'Deactivate'}
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Are you sure you want to deactivate <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.name}</strong>?
          They will no longer be able to log in.
        </p>
        <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--danger-faint)', borderRadius: 8, borderLeft: '3px solid var(--danger)' }}>
          <p style={{ color: 'var(--danger)', fontSize: '0.813rem', margin: 0 }}>This action can be reversed by an admin at any time.</p>
        </div>
      </Modal>
    </div>
  )
}
