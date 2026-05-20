import { useState, useEffect, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Checkbox } from 'primereact/checkbox'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { Divider } from 'primereact/divider'
import { Tag } from 'primereact/tag'
import { roleApi, privilegeApi } from '../services/api'

const BADGE_CLS = { create: 'create', read: 'read', update: 'update', delete: 'delete' }

function PrivilegeTree({ grouped, selectedIds, onChange }) {
  const [openGroups, setOpenGroups] = useState({})

  useEffect(() => {
    const init = {}
    Object.keys(grouped).forEach(k => { init[k] = true })
    setOpenGroups(init)
  }, [grouped])

  const toggleOpen = key => setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }))

  const isAllChecked = modele => {
    const ids = (grouped[modele] || []).map(p => p.id)
    return ids.length > 0 && ids.every(id => selectedIds.includes(id))
  }

  const isPartial = modele => {
    const ids = (grouped[modele] || []).map(p => p.id)
    const sel = ids.filter(id => selectedIds.includes(id))
    return sel.length > 0 && sel.length < ids.length
  }

  const toggleGroupCheck = modele => {
    const ids = (grouped[modele] || []).map(p => p.id)
    if (isAllChecked(modele)) {
      onChange(selectedIds.filter(id => !ids.includes(id)))
    } else {
      onChange([...new Set([...selectedIds, ...ids])])
    }
  }

  const toggleOne = privId => {
    const next = selectedIds.includes(privId)
      ? selectedIds.filter(id => id !== privId)
      : [...selectedIds, privId]
    onChange(next)
  }

  if (Object.keys(grouped).length === 0) {
    return (
      <div className="flex align-items-center justify-content-center p-4 text-color-secondary">
        <i className="pi pi-key mr-2"></i>
        Aucun privilège. Créez d'abord des privilèges.
      </div>
    )
  }

  return (
    <div className="priv-tree">
      {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([modele, privs]) => (
        <div key={modele} className="priv-tree-group">
          <div className="priv-tree-group-header">
            <Checkbox
              checked={isAllChecked(modele)}
              onChange={() => toggleGroupCheck(modele)}
              onClick={e => e.stopPropagation()}
              style={{ opacity: isPartial(modele) ? 0.55 : 1 }}
            />
            <i className="pi pi-folder text-color-secondary" style={{ fontSize: 13 }}
               onClick={() => toggleOpen(modele)} />
            <span className="priv-group-name" onClick={() => toggleOpen(modele)}>{modele}</span>
            <span className="priv-group-count">{privs.length}</span>
            <i className={`pi ${openGroups[modele] ? 'pi-chevron-down' : 'pi-chevron-right'} text-color-secondary`}
               style={{ fontSize: 11 }} onClick={() => toggleOpen(modele)} />
          </div>

          {openGroups[modele] && (
            <div className="priv-tree-children">
              {privs.map(priv => (
                <div key={priv.id} className="priv-tree-item"
                  onClick={() => toggleOne(priv.id)}
                  style={{ cursor: 'pointer' }}>
                  <Checkbox
                    checked={selectedIds.includes(priv.id)}
                    onChange={() => toggleOne(priv.id)}
                    onClick={e => e.stopPropagation()}
                  />
                  <span className={`priv-badge ${BADGE_CLS[priv.action] || 'other'}`}>
                    {priv.action || priv.nom}
                  </span>
                  <span className="priv-nom">{priv.nom}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function RolesPage() {
  const [roles, setRoles]       = useState([])
  const [grouped, setGrouped]   = useState({})
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [search, setSearch]     = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId]     = useState(null)
  const [form, setForm]         = useState({ nom: '', description: '', privilegeIds: [] })
  const toast = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const [r, p] = await Promise.all([roleApi.getAll(), privilegeApi.getGrouped()])
      setRoles(r.data)
      setGrouped(p.data)
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Chargement impossible', life: 3000 })
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filteredRoles = roles.filter(r =>
    !search.trim() ||
    r.nom?.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  )

  const openNew = () => {
    setForm({ nom: '', description: '', privilegeIds: [] })
    setEditId(null)
    setShowForm(true)
    setTimeout(() => document.getElementById('role-nom')?.focus(), 50)
  }

  const openEdit = role => {
    setForm({
      nom: role.nom,
      description: role.description || '',
      privilegeIds: role.privileges?.map(p => p.id) || []
    })
    setEditId(role.id)
    setShowForm(true)
  }

  const cancelForm = () => { setShowForm(false); setEditId(null) }

  const save = async () => {
    if (!form.nom.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Le nom du rôle est obligatoire', life: 3000 })
      return
    }
    setSaving(true)
    try {
      if (editId) {
        await roleApi.update(editId, form)
        toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Rôle modifié', life: 3000 })
      } else {
        await roleApi.create(form)
        toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Rôle enregistré', life: 3000 })
      }
      cancelForm(); load()
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: e.response?.data?.message || 'Erreur', life: 4000 })
    } finally { setSaving(false) }
  }

  const confirmDelete = role => {
    confirmDialog({
      message: `Supprimer le rôle "${role.nom}" ?`,
      header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer', rejectLabel: 'Annuler', acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await roleApi.delete(role.id)
          toast.current?.show({ severity: 'success', summary: 'Supprimé', detail: 'Rôle supprimé', life: 3000 })
          if (editId === role.id) cancelForm()
          load()
        } catch (e) {
          toast.current?.show({ severity: 'error', summary: 'Erreur', detail: e.response?.data?.message || 'Erreur', life: 4000 })
        }
      }
    })
  }

  // Boutons icônes uniquement (sans label)
  const actionsTpl = row => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" size="small" outlined
        tooltip="Modifier" tooltipOptions={{ position: 'top' }}
        onClick={() => openEdit(row)} />
      <Button icon="pi pi-trash" size="small" outlined severity="danger"
        tooltip="Supprimer" tooltipOptions={{ position: 'top' }}
        onClick={() => confirmDelete(row)} />
    </div>
  )

  const totalPrivs = Object.values(grouped).flat().length

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="cdc-page-header">
        <div>
          <h1>Rôles</h1>
          <p>Gérez les rôles et leurs privilèges associés</p>
        </div>
        {!showForm && (
          <Button icon="pi pi-plus" label="Ajouter un Rôle" onClick={openNew} />
        )}
      </div>

      {/* FORMULAIRE INLINE */}
      {showForm && (
        <div className="cdc-card" style={{ marginBottom: 20 }}>
          <div className="flex align-items-center justify-content-between p-3"
               style={{ borderBottom: '1px solid #dee2e6' }}>
            <span className="font-bold text-lg">
              <i className={`pi ${editId ? 'pi-pencil' : 'pi-plus-circle'} mr-2`}
                 style={{ color: '#1a73e8' }}></i>
              {editId ? 'Modifier le rôle' : 'Nouveau rôle'}
            </span>
            <Button icon="pi pi-times" rounded text severity="secondary" onClick={cancelForm} />
          </div>

          <div className="p-4 flex flex-column gap-3">
            <div className="formgrid grid">
              <div className="field col">
                <label className="font-semibold">Nom du rôle *</label>
                <InputText
                  id="role-nom"
                  value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })}
                  placeholder="Ex : ADMIN, GESTIONNAIRE..."
                  className="w-full"
                />
              </div>
              <div className="field col-6">
                <label className="font-semibold">Description</label>
                <InputTextarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Description du rôle..."
                  rows={1} className="w-full" autoResize
                />
              </div>
            </div>

            <div>
              <div className="flex align-items-center justify-content-between mb-2">
                <label className="font-semibold">Privilèges</label>
                <Tag value={`${form.privilegeIds.length} / ${totalPrivs} sélectionné(s)`} severity="info" />
              </div>
              <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                <PrivilegeTree
                  grouped={grouped}
                  selectedIds={form.privilegeIds}
                  onChange={ids => setForm(prev => ({ ...prev, privilegeIds: ids }))}
                />
              </div>
            </div>

            <Divider className="my-1" />

            <div className="flex justify-content-end gap-2">
              <Button icon="pi pi-times" label="Annuler"     outlined onClick={cancelForm} className="mr-2" />
              <Button icon="pi pi-check" label="Enregistrer" loading={saving} onClick={save} />
            </div>
          </div>
        </div>
      )}

      {/* TABLEAU */}
      <div className="cdc-card">
        <DataTable
          value={filteredRoles}
          loading={loading}
          emptyMessage="Aucun rôle."
          header={
            <div className="flex justify-content-between align-items-center">
              <span>{roles.length} rôle(s)</span>
              <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher..." />
              </IconField>
            </div>
          }
        >
          <Column field="nom"         header="Nom"         sortable style={{ fontWeight: 600 }} />
          <Column field="description" header="Description" />
          <Column header="Actions"    body={actionsTpl}    style={{ width: 100 }} />
        </DataTable>
      </div>
    </div>
  )
}