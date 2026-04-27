import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

export const utilisateurApi = {
  getAll:        ()       => api.get('/utilisateurs'),
  getById:       (id)     => api.get(`/utilisateurs/${id}`),
  create:        (data)   => api.post('/utilisateurs', data),
  update:        (id, d)  => api.put(`/utilisateurs/${id}`, d),
  delete:        (id)     => api.delete(`/utilisateurs/${id}`),
  notifier:      (id)     => api.post(`/utilisateurs/${id}/notifier`),
  configurerMdp: (data)   => api.post('/utilisateurs/configurer-mdp', data),
  validerToken:  (token)  => api.get(`/utilisateurs/valider-token?token=${token}`)
}

export const roleApi = {
  getAll:  ()       => api.get('/roles'),
  getById: (id)     => api.get(`/roles/${id}`),
  create:  (data)   => api.post('/roles', data),
  update:  (id, d)  => api.put(`/roles/${id}`, d),
  delete:  (id)     => api.delete(`/roles/${id}`)
}

export const privilegeApi = {
  getAll:       ()     => api.get('/privileges'),
  getGrouped:   ()     => api.get('/privileges/grouped'),
  addByModele:  (data) => api.post('/privileges/modele', data),
  addSingle:    (data) => api.post('/privileges', data),
  update:       (id, d) => api.put(`/privileges/${id}`, d),
  delete:       (id)   => api.delete(`/privileges/${id}`)
}

export default api