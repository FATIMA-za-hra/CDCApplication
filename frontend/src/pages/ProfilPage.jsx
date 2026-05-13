import { useState, useEffect, useRef } from 'react'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { TabView, TabPanel } from 'primereact/tabview'
import { Divider } from 'primereact/divider'
import { useNavigate } from 'react-router-dom'
import api, { authUtils } from '../services/api'

export default function ProfilPage() {
  const [profil, setProfil]           = useState(null)
  const [loading, setLoading]         = useState(true)
  const [savingEmail, setSavingEmail] = useState(false)
  const [savingMdp, setSavingMdp]     = useState(false)
  const [nouvelEmail, setNouvelEmail] = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [mdpForm, setMdpForm]         = useState({
    ancienMotDePasse: '', nouveauMotDePasse: '', confirmerMotDePasse: ''
  })
  const toast    = useRef(null)
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/profil')
      setProfil(res.data)
      setNouvelEmail(res.data.email)
      if (res.data.photoUrl) setPhotoPreview(res.data.photoUrl + '?t=' + Date.now())
    } catch { toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Chargement impossible', life: 3000 }) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const changerEmail = async () => {
    if (!nouvelEmail.trim()) return
    setSavingEmail(true)
    try {
      await api.put('/profil/email', { nouvelEmail })
      toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Email modifié. Reconnectez-vous.', life: 4000 })
      setTimeout(() => { authUtils.logout() }, 2000)
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: e.response?.data?.message || 'Erreur', life: 4000 })
    } finally { setSavingEmail(false) }
  }

  const changerMotDePasse = async () => {
    if (!mdpForm.ancienMotDePasse || !mdpForm.nouveauMotDePasse || !mdpForm.confirmerMotDePasse) {
      toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Tous les champs sont obligatoires', life: 3000 })
      return
    }
    setSavingMdp(true)
    try {
      await api.put('/profil/mot-de-passe', mdpForm)
      toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Mot de passe modifié. Reconnectez-vous.', life: 4000 })
      setMdpForm({ ancienMotDePasse: '', nouveauMotDePasse: '', confirmerMotDePasse: '' })
      setTimeout(() => { authUtils.logout() }, 2000)
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: e.response?.data?.message || 'Erreur', life: 4000 })
    } finally { setSavingMdp(false) }
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    // Aperçu local
    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)
    // Upload
    setUploadingPhoto(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      await api.post('/profil/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Photo mise à jour', life: 3000 })
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur upload photo', life: 3000 })
    } finally { setUploadingPhoto(false) }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
      <i className="pi pi-spin pi-spinner" style={{ fontSize: 32 }}></i>
    </div>
  )

  return (
    <div>
      <Toast ref={toast} />

      <div className="cdc-page-header">
        <div>
          <h1>Mon Profil</h1>
          <p>Gérez vos informations personnelles et votre mot de passe</p>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Photo + infos résumé */}
        <div className="cdc-card" style={{ padding: 24, marginBottom: 20 }}>
          <div className="flex align-items-center gap-4">
            <div style={{ position: 'relative' }}>
              <div style={{ width: 90, height: 90, borderRadius: '50%', overflow: 'hidden',
                border: '3px solid #e2e8f0', background: '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {photoPreview ? (
                  <img src={photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 32, fontWeight: 700, color: '#1a73e8' }}>
                    {profil?.prenom?.[0]}{profil?.nom?.[0]}
                  </span>
                )}
              </div>
              <label htmlFor="photo-profil" style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 28, height: 28, borderRadius: '50%',
                background: '#1a73e8', color: 'white', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid white'
              }}>
                {uploadingPhoto
                  ? <i className="pi pi-spin pi-spinner" style={{ fontSize: 12 }}></i>
                  : <i className="pi pi-camera" style={{ fontSize: 12 }}></i>
                }
              </label>
              <input id="photo-profil" type="file" accept="image/*"
                style={{ display: 'none' }} onChange={handlePhotoChange} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
                {profil?.prenom} {profil?.nom}
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{profil?.email}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10,
                  background: profil?.actif ? '#dcfce7' : '#fee2e2',
                  color: profil?.actif ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                  {profil?.actif ? 'Compte actif' : 'Compte inactif'}
                </span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10,
                  background: '#dbeafe', color: '#1d4ed8', fontWeight: 600 }}>
                  {profil?.compteConfigure ? 'Mot de passe configuré' : 'En attente configuration'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="cdc-card">
          <TabView>
            {/* Onglet 1 : Informations */}
            <TabPanel header="Informations" leftIcon="pi pi-user mr-2">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
                {[
                  { label: 'Prénom',           value: profil?.prenom },
                  { label: 'Nom',              value: profil?.nom },
                  { label: 'Email',            value: profil?.email },
                  { label: 'Statut',           value: profil?.actif ? 'Actif' : 'Inactif' },
                  { label: 'Mot de passe',     value: profil?.compteConfigure ? 'Configuré' : 'Non configuré' },
                  { label: "Date d'expiration",value: profil?.dateExpiration
                    ? new Date(profil.dateExpiration).toLocaleDateString('fr-FR') : 'Aucune' },
                ].map(item => (
                  <div key={item.label} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>{item.value || '—'}</div>
                  </div>
                ))}
              </div>
            </TabPanel>

            {/* Onglet 2 : Changer l'email */}
            <TabPanel header="Email" leftIcon="pi pi-envelope mr-2">
              <div className="flex flex-column gap-3">
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8,
                  padding: 12, fontSize: 13, color: '#1d4ed8' }}>
                  <i className="pi pi-info-circle mr-2"></i>
                  Après modification de votre email, vous serez déconnecté automatiquement.
                  Reconnectez-vous avec le nouvel email.
                </div>
                <div className="field">
                  <label className="font-semibold">Nouvel email</label>
                  <InputText value={nouvelEmail} onChange={e => setNouvelEmail(e.target.value)}
                    type="email" className="w-full" placeholder="nouveau@email.com" />
                </div>
                <Button label="Modifier l'email" icon="pi pi-check"
                  loading={savingEmail}
                  disabled={nouvelEmail === profil?.email}
                  onClick={changerEmail} />
              </div>
            </TabPanel>

            {/* Onglet 3 : Changer le mot de passe */}
            <TabPanel header="Mot de passe" leftIcon="pi pi-lock mr-2">
              <div className="flex flex-column gap-3">
                <div className="field">
                  <label className="font-semibold">Mot de passe actuel</label>
                  <Password value={mdpForm.ancienMotDePasse}
                    onChange={e => setMdpForm({ ...mdpForm, ancienMotDePasse: e.target.value })}
                    placeholder="••••••••" feedback={false} toggleMask
                    className="w-full" pt={{ root: { style: { width: '100%' } }, input: { style: { width: '100%' } } }} />
                </div>
                <Divider className="my-1" />
                <div className="field">
                  <label className="font-semibold">Nouveau mot de passe</label>
                  <Password value={mdpForm.nouveauMotDePasse}
                    onChange={e => setMdpForm({ ...mdpForm, nouveauMotDePasse: e.target.value })}
                    placeholder="Minimum 8 caractères" toggleMask
                    className="w-full" pt={{ root: { style: { width: '100%' } }, input: { style: { width: '100%' } } }}
                    promptLabel="Entrez un mot de passe" weakLabel="Faible" mediumLabel="Moyen" strongLabel="Fort" />
                </div>
                <div className="field">
                  <label className="font-semibold">Confirmer le nouveau mot de passe</label>
                  <Password value={mdpForm.confirmerMotDePasse}
                    onChange={e => setMdpForm({ ...mdpForm, confirmerMotDePasse: e.target.value })}
                    placeholder="Retapez le nouveau mot de passe" feedback={false} toggleMask
                    className="w-full" pt={{ root: { style: { width: '100%' } }, input: { style: { width: '100%' } } }} />
                </div>
                {mdpForm.nouveauMotDePasse && mdpForm.confirmerMotDePasse &&
                  mdpForm.nouveauMotDePasse !== mdpForm.confirmerMotDePasse && (
                  <small style={{ color: '#dc2626' }}>
                    <i className="pi pi-exclamation-circle mr-1"></i>
                    Les mots de passe ne correspondent pas
                  </small>
                )}
                <Button label="Modifier le mot de passe" icon="pi pi-lock"
                  loading={savingMdp} onClick={changerMotDePasse}
                  disabled={mdpForm.nouveauMotDePasse !== mdpForm.confirmerMotDePasse} />
              </div>
            </TabPanel>
          </TabView>
        </div>
      </div>
    </div>
  )
}