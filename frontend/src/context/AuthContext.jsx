import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { authAPI } from '../api/auth.api'
import api from '../api/axios'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [loading, setLoading]         = useState(true)
  const refreshTimer                  = useRef(null)

  /* ── Save token to memory + schedule next refresh ── */
  const storeToken = useCallback((token, expiresInMs = 14 * 60 * 1000) => {
    setAccessToken(token)
    // Inject into axios default headers
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    // Auto-refresh 1 min before expiry
    clearTimeout(refreshTimer.current)
    refreshTimer.current = setTimeout(() => silentRefresh(), expiresInMs - 60_000)
  }, [])

  /* ── Silent token refresh ── */
  const silentRefresh = useCallback(async () => {
    const rt = localStorage.getItem('refreshToken')
    if (!rt) { setLoading(false); return }
    try {
      const { data } = await authAPI.refresh(rt)
      storeToken(data.accessToken)
    } catch {
      logout()
    }
  }, [storeToken])

  /* ── On mount: try to restore session ── */
  useEffect(() => {
    const init = async () => {
      const rt = localStorage.getItem('refreshToken')
      if (!rt) { setLoading(false); return }
      try {
        const { data } = await authAPI.refresh(rt)
        storeToken(data.accessToken)
        // Fetch user profile
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
        const profileRes = await authAPI.getMe()
        setUser(profileRes.data.user)
      } catch {
        localStorage.removeItem('refreshToken')
      } finally {
        setLoading(false)
      }
    }
    init()
    return () => clearTimeout(refreshTimer.current)
  }, [storeToken])

  /* ── Login ── */
  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    localStorage.setItem('refreshToken', data.refreshToken)
    storeToken(data.accessToken)
    setUser(data.user)
    return data.user
  }, [storeToken])

  /* ── Logout ── */
  const logout = useCallback(async () => {
    const rt = localStorage.getItem('refreshToken')
    try { if (rt) await authAPI.logout(rt) } catch {}
    localStorage.removeItem('refreshToken')
    clearTimeout(refreshTimer.current)
    setAccessToken(null)
    setUser(null)
    delete api.defaults.headers.common['Authorization']
  }, [])

  /* ── Update local user state ── */
  const updateUser = useCallback((updated) => {
    setUser((prev) => ({ ...prev, ...updated }))
  }, [])

  const value = useMemo(() => ({
    user, accessToken, loading, login, logout, updateUser,
    isAdmin:   user?.role === 'admin',
    isManager: user?.role === 'manager',
    isUser:    user?.role === 'user',
  }), [user, accessToken, loading, login, logout, updateUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
