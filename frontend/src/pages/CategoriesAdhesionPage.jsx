import { useState, useEffect, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { InputTextarea } from 'primereact/inputtextarea'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Tag } from 'primereact/tag'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { categorieApi } from '../services/api'

const EMPTY = { libelle: '', montant: null, conditions: '', periodesValidite: '', actif: true }

export default function CategoriesAdhesionPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [dialog, setDialog]         = useState(false)
  const [editId, setEditId]         = useState(null)
  const [form, setForm]             = useState(EMPTY)
  const [saving, setSaving]         = useState(false)
  const [search, setSearch]         = useState('')
  const toast = useRef(null)

  const load = async () => {
    setLoading(true)
    try { const r = await categorieApi.getAll(); setCategories(r.data) }
    catch { toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Chargement impossible', life: 3000 }) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setForm(EMPTY); setEditId(null); setDialog(true) }
  const openEdit = row => {
    setForm({ libelle: row.libelle || '', montant: row.montant || null,
      conditions: row.conditions || '', periodesValidite: row.periodesValidite || '',
      actif: row.actif !== false })
    setEditId(row.id); setDialog(true)
  }

  const save = async () => {
    if (!form.libelle?.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Libellé obligatoire', life: 3000 }); return
    }
    setSaving(true)
    try {
      if (editId) await categorieApi.update(editId, form)
      else        await categorieApi.create(form)
      toast.current?.show({ severity: 'success', summary: 'Succès',
        detail: editId ? 'Catégorie modifiée' : 'Catégorie créée', life: 3000 })
      setDialog(false); load()
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erreur',
        detail: e.response?.data?.message || 'Erreur', life: 4000 })
    } finally { setSaving(false) }
  }

  const toggleActif = row => confirmDialog({
    message: `${row.actif ? 'Désactiver' : 'Réactiver'} la catégorie "${row.libelle}" ?`,
    header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
    acceptLabel: row.actif ? 'Désactiver' : 'Réactiver', rejectLabel: 'Annuler',
    acceptClassName: row.actif ? 'p-button-warning' : 'p-button-success',
    accept: async () => {
      try {
        await categorieApi.update(row.id, { ...row, actif: !row.actif })
        toast.current?.show({ severity: 'success', summary: 'Modifié', life: 3000 })
        load()
      } catch (e) {
        toast.current?.show({ severity: 'error', summary: 'Erreur',
          detail: e.response?.data?.message || 'Erreur', life: 4000 })
      }
    }
  })

  const supprimer = row => confirmDialog({
    message: `Supprimer la catégorie "${row.libelle}" ?`,
    header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Supprimer', rejectLabel: 'Annuler', acceptClassName: 'p-button-danger',
    accept: async () => {
      try {
        await categorieApi.delete(row.id)
        toast.current?.show({ severity: 'success', summary: 'Supprimée', life: 3000 })
        load()
      } catch (e) {
        toast.current?.show({ severity: 'error', summary: 'Erreur',
          detail: e.response?.data?.message || 'Impossible de supprimer', life: 4000 })
      }
    }
  })

  const filtered = categories.filter(c =>
    !search.trim() ||
    c.libelle?.toLowerCase().includes(search.toLowerCase()) ||
    c.conditions?.toLowerCase().includes(search.toLowerCase())
  )

  const statutTpl = row => (
    <Tag value={row.actif !== false ? 'Active' : 'Inactive'}
      severity={row.actif !== false ? 'success' : 'secondary'} />
  )

  const montantTpl = row => row.montant != null
    ? <span style={{ fontWeight: 600 }}>{Number(row.montant).toLocaleString('fr-MA')} MAD</span>
    : <span style={{ color: '#94a3b8' }}>—</span>

  const actionsTpl = row => (
    <div className="flex gap-1">
      <Button icon="pi pi-pencil" size="small" outlined
        tooltip="Modifier" tooltipOptions={{ position: 'top' }}
        onClick={() => openEdit(row)} />
      <Button
        icon={row.actif !== false ? 'pi pi-ban' : 'pi pi-check'}
        size="small" outlined
        severity={row.actif !== false ? 'warning' : 'success'}
        tooltip={row.actif !== false ? 'Désactiver' : 'Réactiver'}
        tooltipOptions={{ position: 'top' }}
        onClick={() => toggleActif(row)} />
      <Button icon="pi pi-trash" size="small" outlined severity="danger"
        tooltip="Supprimer" tooltipOptions={{ position: 'top' }}
        onClick={() => supprimer(row)} />
    </div>
  )

  return (
    <div>
      <Toast ref={toast} /><ConfirmDialog />

      <div className="cdc-page-header">
        <div><h1>Catégories d'Adhésion</h1><p>Gérez les catégories et leurs montants</p></div>
        <Button icon="pi pi-plus" label="Nouvelle Catégorie" onClick={openNew} />
      </div>

      <div className="cdc-card">
        <DataTable value={filtered} loading={loading} emptyMessage="Aucune catégorie."
          paginator rows={15} rowsPerPageOptions={[10, 15, 30]}
          header={
            <div className="flex justify-content-between align-items-center">
              <span>{categories.length} catégorie(s)</span>
              <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher..." />
              </IconField>
            </div>
          }>
          {/* Pas de colonne "Adhérents" */}
          <Column field="libelle"          header="Libellé"     sortable style={{ fontWeight: 600 }} />
          <Column header="Montant"         body={montantTpl}    style={{ width: 140 }} />
          <Column field="conditions"       header="Conditions"  style={{ color: '#64748b', fontSize: 12 }} />
          <Column field="periodesValidite" header="Périodes"    style={{ color: '#64748b', fontSize: 12, width: 130 }} />
          <Column header="Statut"          body={statutTpl}     style={{ width: 100 }} />
          <Column header="Actions"         body={actionsTpl}    style={{ width: 120 }} />
        </DataTable>
      </div>

      <Dialog visible={dialog} onHide={() => setDialog(false)}
        header={editId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        style={{ width: 500 }} modal
        footer={
          <div>
            <Button icon="pi pi-times" label="Annuler" outlined onClick={() => setDialog(false)} className="mr-2" />
            <Button icon="pi pi-check" label={editId ? 'Modifier' : 'Créer'} loading={saving} onClick={save} />
          </div>
        }>
        <div className="flex flex-column gap-3 pt-3">
          <div className="field">
            <label className="font-semibold">Libellé *</label>
            <InputText value={form.libelle} onChange={e => setForm({...form, libelle: e.target.value})}
              className="w-full" placeholder="Ex: Actif - Échelle 11" autoFocus />
          </div>
          <div className="field">
            <label className="font-semibold">Montant (MAD)</label>
            <InputNumber value={form.montant} onValueChange={e => setForm({...form, montant: e.value})}
              mode="decimal" minFractionDigits={2} className="w-full" />
          </div>
          <div className="field">
            <label className="font-semibold">Conditions d'éligibilité</label>
            <InputTextarea value={form.conditions}
              onChange={e => setForm({...form, conditions: e.target.value})}
              rows={2} className="w-full" autoResize />
          </div>
          <div className="field">
            <label className="font-semibold">Périodes de validité</label>
            <InputText value={form.periodesValidite}
              onChange={e => setForm({...form, periodesValidite: e.target.value})}
              className="w-full" placeholder="Ex: Annuelle" />
          </div>
        </div>
      </Dialog>
    </div>
  )
}