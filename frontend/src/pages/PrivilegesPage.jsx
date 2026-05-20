import { useState, useEffect, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { privilegeApi } from '../services/api'

const BADGE_CLS = { create: 'create', read: 'read', update: 'update', delete: 'delete' }

export default function PrivilegesPage() {
  const [privileges, setPrivileges] = useState([])
  const [loading, setLoading]       = useState(true)
  const [dialogVisible, setDialog]  = useState(false)
  const [editRow, setEditRow]       = useState(null)
  const [modeleNom, setModeleNom]   = useState('')
  const [singleNom, setSingleNom]   = useState('')
  const [singleDesc, setSingleDesc] = useState('')
  const [mode, setMode]             = useState('modele')
  const [saving, setSaving]         = useState(false)
  const [searchValue, setSearchValue] = useState('')
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

  const filteredPrivileges = privileges.filter(p => {
    if (!searchValue.trim()) return true
    const q = searchValue.toLowerCase()
    return (
      p.nom?.toLowerCase().includes(q) ||
      p.module?.toLowerCase().includes(q) ||
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
        await privilegeApi.update(editRow.id, { nom: singleNom.trim(), description: singleDesc })
        toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Privilège modifié', life: 3000 })
      } else if (mode === 'modele') {
        if (!modeleNom.trim()) {
          toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Nom du modèle obligatoire', life: 3000 })
          setSaving(false); return
        }
        const res = await privilegeApi.addByModele({
          modele: modeleNom.trim().toUpperCase(),
          actions: ['CREATE', 'READ', 'UPDATE', 'DELETE']
        })
        toast.current?.show({ severity: 'success', summary: 'Succès', detail: `${res.data?.length || 4} privilège(s) créé(s)`, life: 3000 })
      } else {
        if (!singleNom.trim()) {
          toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Nom obligatoire', life: 3000 })
          setSaving(false); return
        }
        await privilegeApi.addSingle({ nom: singleNom.trim().toUpperCase(), description: singleDesc })
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
          toast.current?.show({ severity: 'success', summary: 'Supprimé', life: 3000 })
          load()
        } catch (e) {
          toast.current?.show({ severity: 'error', summary: 'Erreur', detail: e.response?.data?.message || 'Erreur', life: 4000 })
        }
      }
    })
  }

  const nomTpl = row => <code>{row.nom}</code>

  const moduleTpl = row => (
    <span style={{ textTransform: 'capitalize' }}>{row.module || '—'}</span>
  )

  const actionBadgeTpl = row => {
    const action = row.action?.toLowerCase()
    return <span className={`priv-badge ${BADGE_CLS[action] || 'other'}`}>{action || '—'}</span>
  }

  // Boutons icônes uniquement (sans label)
  const actionsBtnTpl = row => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" size="small" outlined
        tooltip="Modifier" tooltipOptions={{ position: 'top' }}
        onClick={() => openEdit(row)} />
      <Button icon="pi pi-trash" size="small" outlined severity="danger"
        tooltip="Supprimer" tooltipOptions={{ position: 'top' }}
        onClick={() => confirmDelete(row)} />
    </div>
  )

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="cdc-page-header">
        <div>
          <h1>Privilèges</h1>
          <p>Définissez les privilèges par modèle métier (format : MODELE_ACTION)</p>
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
          <Column field="nom"         header="Nom complet"  body={nomTpl}         sortable />
          <Column field="module"      header="Modèle"       body={moduleTpl}      sortable style={{ width: 160 }} />
          <Column field="action"      header="Action"       body={actionBadgeTpl}          style={{ width: 120 }} />
          <Column field="description" header="Description" />
          <Column header="Actions"                          body={actionsBtnTpl}           style={{ width: 100 }} />
        </DataTable>
      </div>

      {/* DIALOG */}
      {dialogVisible && (
        <div className="p-dialog-mask p-component-overlay"
          style={{ position:'fixed', inset:0, zIndex:1100,
            background:'rgba(0,0,0,0.4)', display:'flex',
            alignItems:'center', justifyContent:'center' }}
          onClick={e => { if(e.target===e.currentTarget) setDialog(false) }}>
          <div style={{ background:'white', borderRadius:8, width:480,
            boxShadow:'0 20px 60px rgba(0,0,0,0.3)', overflow:'hidden' }}>
            {/* Header */}
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #e2e8f0',
              display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontWeight:700, fontSize:16 }}>
                {editRow ? 'Modifier le privilège' : 'Ajouter des privilèges'}
              </span>
              <Button icon="pi pi-times" rounded text severity="secondary"
                onClick={() => setDialog(false)} />
            </div>

            {/* Body */}
            <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:16 }}>
              {/* Choix mode - seulement en ajout */}
              {!editRow && (
                <div className="flex gap-2">
                  <Button label="Par Modèle" icon="pi pi-folder" size="small"
                    severity={mode === 'modele' ? undefined : 'secondary'}
                    outlined={mode !== 'modele'}
                    onClick={() => setMode('modele')} className="flex-1" />
                  <Button label="Individuel" icon="pi pi-key" size="small"
                    severity={mode === 'single' ? undefined : 'secondary'}
                    outlined={mode !== 'single'}
                    onClick={() => setMode('single')} className="flex-1" />
                </div>
              )}

              {/* Mode modèle */}
              {!editRow && mode === 'modele' && (
                <div className="flex flex-column gap-1">
                  <label className="font-semibold">Nom du modèle *</label>
                  <InputText
                    value={modeleNom}
                    onChange={e => setModeleNom(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                    placeholder="Ex : FOURNISSEUR, CLIENT, PRODUIT..."
                    className="w-full" autoFocus
                  />
                  <small className="text-color-secondary">
                    Génère : {modeleNom || 'MODELE'}_CREATE, _READ, _UPDATE, _DELETE
                  </small>
                </div>
              )}

              {/* Mode individuel ou modification */}
              {(editRow || mode === 'single') && (
                <>
                  <div className="flex flex-column gap-1">
                    <label className="font-semibold">
                      Nom du privilège * <small className="font-normal text-color-secondary">(MODELE_ACTION)</small>
                    </label>
                    <InputText
                      value={singleNom}
                      onChange={e => setSingleNom(e.target.value.toUpperCase())}
                      placeholder="Ex : RAPPORT_EXPORT"
                      className="w-full" autoFocus
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

            {/* Footer */}
            <div style={{ padding:'12px 20px', borderTop:'1px solid #e2e8f0',
              display:'flex', justifyContent:'flex-end', gap:8 }}>
              <Button icon="pi pi-times" label="Annuler" outlined
                onClick={() => setDialog(false)} className="mr-2" />
              <Button icon="pi pi-check" label={editRow ? 'Modifier' : 'Créer'}
                loading={saving} onClick={save} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}