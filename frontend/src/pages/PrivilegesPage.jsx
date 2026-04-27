import { useState, useEffect, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { privilegeApi } from '../services/api'

const BADGE_CLS = { create: 'create', read: 'read', update: 'update', delete: 'delete' }

export default function PrivilegesPage() {
  const [privileges, setPrivileges]           = useState([])
  const [loading, setLoading]                 = useState(true)
  const [dialogVisible, setDialog]            = useState(false)
  const [editRow, setEditRow]                 = useState(null)
  const [modeleNom, setModeleNom]             = useState('')
  const [singleNom, setSingleNom]             = useState('')
  const [singleDesc, setSingleDesc]           = useState('')
  const [mode, setMode]                       = useState('modele')
  const [saving, setSaving]                   = useState(false)
  const [searchValue, setSearchValue]         = useState('')
  const toast = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await privilegeApi.getAll()
      setPrivileges(res.data)
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Chargement impossible', life: 3000 })
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  /* Filtrage côté client simple */
  const filteredPrivileges = privileges.filter(p => {
    if (!searchValue.trim()) return true
    const q = searchValue.toLowerCase()
    return (
      p.nom?.toLowerCase().includes(q) ||
      p.modele?.toLowerCase().includes(q) ||
      p.action?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    )
  })

  const openAdd = () => {
    setEditRow(null); setMode('modele')
    setModeleNom(''); setSingleNom(''); setSingleDesc('')
    setDialog(true)
  }

  const openEdit = row => {
    setEditRow(row); setMode('single')
    setSingleNom(row.nom); setSingleDesc(row.description || '')
    setDialog(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      if (editRow) {
        if (!singleNom.trim()) {
          toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Nom obligatoire', life: 3000 })
          setSaving(false); return
        }
        await privilegeApi.update(editRow.id, { nom: singleNom.toLowerCase().trim(), description: singleDesc })
        toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Privilège modifié', life: 3000 })
      } else if (mode === 'modele') {
        if (!modeleNom.trim()) {
          toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Nom du modèle obligatoire', life: 3000 })
          setSaving(false); return
        }
        const res = await privilegeApi.addByModele({
          modele: modeleNom.toLowerCase().trim(),
          actions: ['create', 'read', 'update', 'delete']
        })
        toast.current?.show({ severity: 'success', summary: 'Succès', detail: `${res.data.length} privilège(s) créé(s)`, life: 3000 })
      } else {
        if (!singleNom.trim()) {
          toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Nom obligatoire', life: 3000 })
          setSaving(false); return
        }
        await privilegeApi.addSingle({ nom: singleNom.toLowerCase().trim(), description: singleDesc })
        toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Privilège créé', life: 3000 })
      }
      setDialog(false); load()
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: e.response?.data?.message || 'Erreur', life: 4000 })
    } finally { setSaving(false) }
  }

  const confirmDelete = row => {
    confirmDialog({
      message: `Supprimer le privilège "${row.nom}" ?`,
      header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer', rejectLabel: 'Annuler', acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await privilegeApi.delete(row.id)
          toast.current?.show({ severity: 'success', summary: 'Supprimé', detail: 'Privilège supprimé', life: 3000 })
          load()
        } catch (e) {
          toast.current?.show({ severity: 'error', summary: 'Erreur', detail: e.response?.data?.message || 'Erreur', life: 4000 })
        }
      }
    })
  }

  const nomTpl        = row => <code>{row.nom}</code>
  const modeleTpl     = row => <span style={{ textTransform: 'capitalize' }}>{row.modele}</span>
  const actionBadgeTpl = row => (
    <span className={`priv-badge ${BADGE_CLS[row.action] || 'other'}`}>{row.action || '—'}</span>
  )
  const actionsBtnTpl = row => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" label="Modifier"  size="small" outlined onClick={() => openEdit(row)} />
      <Button icon="pi pi-trash"  label="Supprimer" size="small" outlined severity="danger" onClick={() => confirmDelete(row)} />
    </div>
  )

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="cdc-page-header">
        <div>
          <h1>Privilèges</h1>
          <p>Définissez les privilèges par modèle métier (format : modele_action)</p>
        </div>
        <Button icon="pi pi-plus" label="Ajouter des Privilèges" onClick={openAdd} />
      </div>

      <div className="cdc-card">
        <DataTable
          value={filteredPrivileges}
          loading={loading}
          emptyMessage="Aucun privilège."
          paginator rows={15}
          rowsPerPageOptions={[10, 15, 30]}
          header={
            <div className="flex justify-content-between align-items-center">
              <span>{privileges.length} privilège(s)</span>
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
          <Column field="nom"         header="Nom complet"  body={nomTpl}        sortable />
          <Column field="modele"      header="Modèle"       body={modeleTpl}     sortable style={{ width: 160 }} />
          <Column field="action"      header="Action"       body={actionBadgeTpl}         style={{ width: 120 }} />
          <Column field="description" header="Description" />
          <Column header="Actions"                          body={actionsBtnTpl}          style={{ width: 230 }} />
        </DataTable>
      </div>

      {/* DIALOG */}
      <Dialog
        visible={dialogVisible}
        onHide={() => setDialog(false)}
        header={editRow ? 'Modifier le privilège' : 'Ajouter des privilèges'}
        style={{ width: 460 }}
        modal
        footer={
          <div>
            <Button icon="pi pi-times" label="Annuler" outlined onClick={() => setDialog(false)} className="mr-2" />
            <Button icon="pi pi-check" label={editRow ? 'Modifier' : 'Créer'} loading={saving} onClick={save} />
          </div>
        }
      >
        <div className="flex flex-column gap-3 pt-3">

          {/* Choix mode - seulement en ajout */}
          {!editRow && (
            <div className="flex gap-2">
              <Button label="Par Modèle" icon="pi pi-folder" size="small"
                severity={mode === 'modele' ? undefined : 'secondary'}
                outlined={mode !== 'modele'}
                onClick={() => setMode('modele')} />
              <Button label="Individuel" icon="pi pi-key" size="small"
                severity={mode === 'single' ? undefined : 'secondary'}
                outlined={mode !== 'single'}
                onClick={() => setMode('single')} />
            </div>
          )}

          {/* Mode modèle : juste le nom */}
          {!editRow && mode === 'modele' && (
            <div className="flex flex-column gap-1">
              <label className="font-semibold">Nom du modèle *</label>
              <InputText
                value={modeleNom}
                onChange={e => setModeleNom(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                placeholder="Ex : fournisseur, client, produit..."
                className="w-full"
                autoFocus
              />
              <small className="text-color-secondary">
                Génère : {modeleNom || 'modele'}_create, _read, _update, _delete
              </small>
            </div>
          )}

          {/* Mode individuel ou modification */}
          {(editRow || mode === 'single') && (
            <>
              <div className="flex flex-column gap-1">
                <label className="font-semibold">
                  Nom du privilège * <small className="font-normal text-color-secondary">(modele_action)</small>
                </label>
                <InputText
                  value={singleNom}
                  onChange={e => setSingleNom(e.target.value.toLowerCase())}
                  placeholder="Ex : rapport_export"
                  className="w-full"
                  autoFocus
                />
              </div>
              <div className="flex flex-column gap-1">
                <label className="font-semibold">Description</label>
                <InputText
                  value={singleDesc}
                  onChange={e => setSingleDesc(e.target.value)}
                  placeholder="Description du privilège..."
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
      </Dialog>
    </div>
  )
}