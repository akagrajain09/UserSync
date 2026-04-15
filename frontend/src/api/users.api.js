import api from './axios'

export const usersAPI = {
  getAll:   (params)      => api.get('/users', { params }),
  getOne:   (id)          => api.get(`/users/${id}`),
  create:   (data)        => api.post('/users', data),
  update:   (id, data)    => api.put(`/users/${id}`, data),
  remove:   (id)          => api.delete(`/users/${id}`),
  getMe:    ()            => api.get('/users/me'),
  updateMe: (data)        => api.put('/users/me', data),
  getStats: ()            => api.get('/users/stats'),
}
