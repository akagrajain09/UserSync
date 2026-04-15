import api from './axios'

export const authAPI = {
  login:   (credentials)   => api.post('/auth/login', credentials),
  refresh: (refreshToken)  => api.post('/auth/refresh', { refreshToken }),
  logout:  (refreshToken)  => api.post('/auth/logout', { refreshToken }),
  getMe:   ()              => api.get('/auth/me'),
}
