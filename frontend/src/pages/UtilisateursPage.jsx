import { useState, useEffect, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { Calendar } from 'primereact/calendar'
import { Dropdown } from 'primereact/dropdown'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { ToggleButton } from 'primereact/togglebutton'
import { Tag } from 'primereact/tag'
import { utilisateurApi, roleApi } from '../services/api'

const EMPTY = { nom: '', prenom: '', email: '', actif: true, dateExpiration: null, roleIds: [] }

export default function UtilisateursPage() {
  const [utilisateurs, setUtilisateurs] = useState([])
  const [roles, setRoles]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [dialogVisible, setDialog]      = useState(false)
  const [form, setForm]                 = useState(EMPTY)
  const [editId, setEditId]             = useState(null)
  const [saving, setSaving]             = useState(false)
  const [notifying, setNotifying]       = useState(null)
  const [searchValue, setSearchValue]   = useState('')
  const toast = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const [u, r] = await Promise.all([utilisateurApi.getAll(), roleApi.getAll()])
      setUtilisateurs(u.data)
      setRoles(r.data)
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Chargement impossible', life: 3000 })
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  /* Filtrage client */
  const filtered = utilisateurs.filter(u => {
    if (!searchValue.trim()) return true
    const q = searchValue.toLowerCase()
    return (
      u.nom?.toLowerCase().includes(q) ||
      u.prenom?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    )
  })

  const openNew  = () => { setForm(EMPTY); setEditId(null); setDialog(true) }
  const openEdit = row => {
    setForm({
      nom: row.nom, prenom: row.prenom, email: row.email,
      actif: row.actif,
      dateExpiration: row.dateExpiration ? new Date(row.dateExpiration) : null,
      roleIds: row.roles?.map(r => r.id) || []
    })
    setEditId(row.id); setDialog(true)
  }

  const save = async () => {
    if (!form.nom || !form.prenom || !form.email) {
      toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Nom, Prénom et Email obligatoires', life: 3000 })
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, dateExpiration: form.dateExpiration ? form.dateExpiration.toISOString() : null }
      if (editId) {
        await utilisateurApi.update(editId, payload)
        toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Utilisateur modifié', life: 3000 })
      } else {
        await utilisateurApi.create(payload)
        toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Utilisateur créé', life: 3000 })
      }
      setDialog(false); load()
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: e.response?.data?.message || 'Erreur', life: 4000 })
    } finally { setSaving(false) }
  }

  const confirmDelete = row => {
    confirmDialog({
      message: `Supprimer "${row.prenom} ${row.nom}" ?`,
      header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer', rejectLabel: 'Annuler', acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await utilisateurApi.delete(row.id)
          toast.current?.show({ severity: 'success', summary: 'Supprimé', detail: 'Utilisateur supprimé', life: 3000 })
          load()
        } catch (e) {
          toast.current?.show({ severity: 'error', summary: 'Erreur', detail: e.response?.data?.message || 'Erreur', life: 4000 })
        }
      }
    })
  }

  const notifier = async row => {
    setNotifying(row.id)
    try {
      await utilisateurApi.notifier(row.id)
      toast.current?.show({ severity: 'success', summary: 'Email envoyé', detail: `Notification envoyée à ${row.email}`, life: 4000 })
      load()
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: e.response?.data?.message || 'Erreur', life: 4000 })
    } finally { setNotifying(null) }
  }

  /* Templates */
  const utilisateurTpl = row => (
    <div className="flex align-items-center gap-2">
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        background: '#1a73e8', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, flexShrink: 0
      }}>
        {row.prenom?.[0]}{row.nom?.[0]}
      </div>
      <div>
        <div className="font-semibold">{row.prenom} {row.nom}</div>
        <div className="text-sm text-color-secondary">{row.email}</div>
      </div>
    </div>
  )

  const actifTpl = row => (
    <span className={`status-badge ${row.actif ? 'actif' : 'inactif'}`}>
      {row.actif ? 'Actif' : 'Inactif'}
    </span>
  )

  const rolesTpl = row => (
    <div className="flex flex-wrap gap-1">
      {row.roles?.length > 0
        ? row.roles.map(r => <Tag key={r.id} value={r.nom} severity="info" style={{ fontSize: 11 }} />)
        : <span className="text-color-secondary">—</span>}
    </div>
  )

  const dateTpl = row => (
    <span>{row.dateExpiration ? new Date(row.dateExpiration).toLocaleDateString('fr-FR') : '—'}</span>
  )

  const actionsTpl = row => (
    <div className="flex gap-2">
      <Button icon="pi pi-envelope" label="Notifier"  size="small" outlined severity="info"
        loading={notifying === row.id} onClick={() => notifier(row)} />
      <Button icon="pi pi-pencil"   label="Modifier"  size="small" outlined onClick={() => openEdit(row)} />
      <Button icon="pi pi-trash"    label="Supprimer" size="small" outlined severity="danger" onClick={() => confirmDelete(row)} />
    </div>
  )

  const rolesNonSelectionnes = roles
    .filter(r => !form.roleIds.includes(r.id))
    .map(r => ({ label: r.nom, value: r.id }))

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="cdc-page-header">
        <div>
          <h1>Utilisateurs</h1>
          <p>Gérez les comptes utilisateurs et leurs rôles</p>
        </div>
        <Button icon="pi pi-user-plus" label="Nouvel Utilisateur" onClick={openNew} />
      </div>

      <div className="cdc-card">
        <DataTable
          value={filtered}
          loading={loading}
          emptyMessage="Aucun utilisateur"
          paginator rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          header={
            <div className="flex justify-content-between align-items-center">
              <span>{utilisateurs.length} utilisateur(s)</span>
              <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  placeholder="Rechercher..."
                />
              </IconField>
            </div>
          }
        >
          <Column header="Utilisateur" body={utilisateurTpl} sortField="nom" sortable />
          <Column header="Statut"      body={actifTpl}                        style={{ width: 110 }} />
          <Column header="Expiration"  body={dateTpl}                         style={{ width: 130 }} />
          <Column header="Actions"     body={actionsTpl}                      style={{ width: 340 }} />
        </DataTable>
      </div>

      {/* DIALOG */}
      <Dialog
        visible={dialogVisible}
        onHide={() => setDialog(false)}
        header={editId ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}
        style={{ width: 520 }}
        modal
        footer={
          <div>
            <Button icon="pi pi-times" label="Annuler" outlined onClick={() => setDialog(false)} className="mr-2" />
            <Button icon="pi pi-check" label={editId ? 'Modifier' : 'Créer'} loading={saving} onClick={save} />
          </div>
        }
      >
        <div className="flex flex-column gap-3 pt-3">

          <div className="formgrid grid">
            <div className="field col">
              <label className="font-semibold">Nom *</label>
              <InputText value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
                placeholder="Nom de famille" className="w-full" />
            </div>
            <div className="field col">
              <label className="font-semibold">Prénom *</label>
              <InputText value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })}
                placeholder="Prénom" className="w-full" />
            </div>
          </div>

          <div className="field">
            <label className="font-semibold">Email *</label>
            <InputText value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="exemple@domaine.com" type="email" className="w-full" />
          </div>

          <div className="formgrid grid">
            <div className="field col">
              <label className="font-semibold">Date d'expiration</label>
              <Calendar value={form.dateExpiration} onChange={e => setForm({ ...form, dateExpiration: e.value })}
                placeholder="JJ/MM/AAAA" dateFormat="dd/mm/yy" showIcon className="w-full"
                minDate={new Date()} />
            </div>
            <div className="field col">
              <label className="font-semibold">Statut</label>
              <ToggleButton checked={form.actif} onChange={e => setForm({ ...form, actif: e.value })}
                onLabel="Actif" offLabel="Inactif"
                onIcon="pi pi-check" offIcon="pi pi-times"
                className="w-full" />
            </div>
          </div>

          <div className="field">
            <label className="font-semibold">Ajouter un rôle</label>
            <Dropdown
              value={null}
              options={rolesNonSelectionnes}
              onChange={e => {
                if (e.value) setForm(prev => ({ ...prev, roleIds: [...prev.roleIds, e.value] }))
              }}
              placeholder="Sélectionner un rôle..."
              className="w-full"
              emptyMessage="Tous les rôles sont sélectionnés"
            />
            {form.roleIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {roles.filter(r => form.roleIds.includes(r.id)).map(r => (
                  <Tag key={r.id} value={r.nom} severity="info" style={{ cursor: 'pointer' }}
                    onClick={() => setForm(prev => ({ ...prev, roleIds: prev.roleIds.filter(id => id !== r.id) }))}
                  />
                ))}
              </div>
            )}
            <small className="text-color-secondary">Cliquez sur un rôle pour le retirer</small>
          </div>

        </div>
      </Dialog>
    </div>
  )
}