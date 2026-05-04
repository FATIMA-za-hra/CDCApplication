import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Injecter le token JWT dans chaque requête
api.interceptors.request.use(config => {
  const token = localStorage.getItem('cdc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Si 401 -> rediriger vers login
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Helpers pour lire les infos stockées
export const authUtils = {
  getToken:      () => localStorage.getItem('cdc_token'),
  getNom:        () => localStorage.getItem('cdc_nom'),
  getPrenom:     () => localStorage.getItem('cdc_prenom'),
  getEmail:      () => localStorage.getItem('cdc_email'),
  getRoles:      () => JSON.parse(localStorage.getItem('cdc_roles') || '[]'),
  getPrivileges: () => JSON.parse(localStorage.getItem('cdc_privileges') || '[]'),
  isAdmin:       () => localStorage.getItem('cdc_isAdmin') === 'true',
  hasRole:       (role) => authUtils.getRoles().includes(role.toUpperCase()),
  hasPrivilege:  (priv) => authUtils.isAdmin() || authUtils.getPrivileges().includes(priv.toUpperCase()),
  logout: () => {
    localStorage.clear()
    window.location.href = '/login'
  }
}

export const authApi = {
  login: (data) => axios.post('/api/auth/login', data)
}

export const utilisateurApi = {
  getAll:        ()      => api.get('/utilisateurs'),
  getById:       (id)    => api.get(`/utilisateurs/${id}`),
  create:        (data)  => api.post('/utilisateurs', data),
  update:        (id, d) => api.put(`/utilisateurs/${id}`, d),
  delete:        (id)    => api.delete(`/utilisateurs/${id}`),
  notifier:      (id)    => api.post(`/utilisateurs/${id}/notifier`),
  configurerMdp: (data)  => api.post('/utilisateurs/configurer-mdp', data),
  validerToken:  (token) => api.get(`/utilisateurs/valider-token?token=${token}`)
}

export const roleApi = {
  getAll:  ()      => api.get('/roles'),
  getById: (id)    => api.get(`/roles/${id}`),
  create:  (data)  => api.post('/roles', data),
  update:  (id, d) => api.put(`/roles/${id}`, d),
  delete:  (id)    => api.delete(`/roles/${id}`)
}

export const privilegeApi = {
  getAll:      ()      => api.get('/privileges'),
  getGrouped:  ()      => api.get('/privileges/grouped'),
  addByModele: (data)  => api.post('/privileges/modele', data),
  addSingle:   (data)  => api.post('/privileges', data),
  update:      (id, d) => api.put(`/privileges/${id}`, d),
  delete:      (id)    => api.delete(`/privileges/${id}`)
}

export default api

export const categorieApi = {
  getAll:    ()      => api.get('/categories-adhesion'),
  getActives:()      => api.get('/categories-adhesion/actives'),
  getById:   (id)    => api.get(`/categories-adhesion/${id}`),
  create:    (data)  => api.post('/categories-adhesion', data),
  update:    (id, d) => api.put(`/categories-adhesion/${id}`, d),
  delete:    (id)    => api.delete(`/categories-adhesion/${id}`)
}

export const adherentApi = {
  getAll:         ()         => api.get('/adherents'),
  getById:        (id)       => api.get(`/adherents/${id}`),
  getByStatut:    (statut)   => api.get(`/adherents/statut/${statut}`),
  create:         (data)     => api.post('/adherents', data),
  update:         (id, d)    => api.put(`/adherents/${id}`, d),
  delete:         (id)       => api.delete(`/adherents/${id}`)
}

export const adhesionApi = {
  getAll:         ()         => api.get('/adhesions'),
  getById:        (id)       => api.get(`/adhesions/${id}`),
  getByAdherent:  (adhId)    => api.get(`/adhesions/adherent/${adhId}`),
  getByAnnee:     (annee)    => api.get(`/adhesions/annee/${annee}`),
  create:         (data)     => api.post('/adhesions', data),
  update:         (id, d)    => api.put(`/adhesions/${id}`, d),
  delete:         (id)       => api.delete(`/adhesions/${id}`)
}