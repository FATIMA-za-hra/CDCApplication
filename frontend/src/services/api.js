import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('cdc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

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
  logout: () => { localStorage.clear(); window.location.href = '/login' }
}

export const authApi = {
  login:             (data)  => axios.post('/api/auth/login', data),
  motDePasseOublie:  (email) => axios.post('/api/auth/mot-de-passe-oublie', { email })
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

export const categorieApi = {
  getAll:     ()      => api.get('/categories-adhesion'),
  getActives: ()      => api.get('/categories-adhesion/actives'),
  getById:    (id)    => api.get(`/categories-adhesion/${id}`),
  create:     (data)  => api.post('/categories-adhesion', data),
  update:     (id, d) => api.put(`/categories-adhesion/${id}`, d),
  delete:     (id)    => api.delete(`/categories-adhesion/${id}`)
}

export const adherentApi = {
  getAll:            ()        => api.get('/adherents'),
  getById:           (id)      => api.get(`/adherents/${id}`),
  getByStatut:       (statut)  => api.get(`/adherents/statut/${statut}`),
  create:            (data)    => api.post('/adherents', data),
  update:            (id, d)   => api.put(`/adherents/${id}`, d),
  delete:            (id)      => api.delete(`/adherents/${id}`),
  // Photo
  uploadPhoto:       (id, fd)  => api.post(`/adherents/${id}/photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getPhotoUrl:       (id)      => `/api/adherents/${id}/photo`,
  supprimerPhoto:    (id)      => api.delete(`/adherents/${id}/photo`),
  // Enfants
  getEnfants:        (id)      => api.get(`/adherents/${id}/enfants`),
  sauvegarderEnfants:(id, d)   => api.post(`/adherents/${id}/enfants`, d),
  // Pièces
  getPieces:         (id)      => api.get(`/adherents/${id}/pieces`),
  uploadPiece:       (id, fd)  => api.post(`/adherents/${id}/pieces`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  telechargerPiece:  (pid)     => api.get(`/adherents/pieces/${pid}/telecharger`, { responseType: 'blob' }),
  supprimerPiece:    (pid)     => api.delete(`/adherents/pieces/${pid}`),
  // Historique
  getHistorique:     (id)      => api.get(`/adherents/${id}/historique`),
  // Export PDF
  exportPdf:         (id)      => api.get(`/adherents/${id}/export-pdf`, { responseType: 'blob' })
}

export const adhesionApi = {
  getAll:              ()        => api.get('/adhesions'),
  getById:             (id)      => api.get(`/adhesions/${id}`),
  getByAdherent:       (adhId)   => api.get(`/adhesions/adherent/${adhId}`),
  getByAnnee:          (annee)   => api.get(`/adhesions/annee/${annee}`),
  create:              (data)    => api.post('/adhesions', data),
  update:              (id, d)   => api.put(`/adhesions/${id}`, d),
  delete:              (id)      => api.delete(`/adhesions/${id}`),
  genererRecu:         (id)      => api.get(`/adhesions/${id}/recu`, { responseType: 'blob' }),
  genererListe:        (params)  => api.get('/adhesions/liste-pdf', { params, responseType: 'blob' }),
  getNonRegularises:   (annee)   => api.get('/adhesions/non-regularises', { params: { annee } }),
  envoyerRelance:      (id, a)   => api.post(`/adhesions/relance/${id}`, null, { params: { annee: a } }),
  envoyerRelanceMasse: (data)    => api.post('/adhesions/relance-masse', data)
}

export const profilApi = {
  getProfil:       ()     => api.get('/profil'),
  changerEmail:    (data) => api.put('/profil/email', data),
  changerMdp:      (data) => api.put('/profil/mot-de-passe', data),
  uploadPhoto:     (fd)   => api.post('/profil/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getPhoto:        ()     => api.get('/profil/photo', { responseType: 'blob' })
}

export default api

// ── TYPE AIDE ──
export const typeAideApi = {
  getAll:    ()      => api.get('/types-aide'),
  getActifs: ()      => api.get('/types-aide/actifs'),
  create:    (data)  => api.post('/types-aide', data),
  update:    (id, d) => api.put(`/types-aide/${id}`, d),
  delete:    (id)    => api.delete(`/types-aide/${id}`)
}

// ── AIDE ──
export const aideApi = {
  getAll:               ()         => api.get('/aides'),
  getById:              (id)       => api.get(`/aides/${id}`),
  getByAdherent:        (adhId)    => api.get(`/aides/adherent/${adhId}`),
  // Adhérent connecté : ses propres demandes (adherentId déduit depuis JWT)
  mesDemandes:          ()         => api.get('/aides/mes-demandes'),
  // Déposer : admin fournit adherentId, adhérent laisse adherentId=null
  deposer:              (data)     => api.post('/aides', data),
  annuler:              (id)       => api.patch(`/aides/${id}/annuler`),
  // Étape 1 : Agent de bureau
  decisionAgentBureau:  (id, data) => api.post(`/aides/${id}/decision/agent-bureau`, data),
  // Étape 2 : Président (validation finale)
  decisionPresident:    (id, data) => api.post(`/aides/${id}/decision/president`, data),
  enregistrerVirement:  (id, data) => api.post(`/aides/${id}/virement`, data),
  uploadPiece:          (id, fd)   => api.post(`/aides/${id}/pieces`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getPieces:            (id)       => api.get(`/aides/${id}/pieces`),
  telechargerPiece:     (id, nom)  => api.get(`/aides/${id}/pieces/${nom}/telecharger`, { responseType: 'blob' }),
  supprimerPiece:       (id, nom)  => api.delete(`/aides/${id}/pieces/${nom}`)
}
