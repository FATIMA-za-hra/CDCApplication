import { useState, useEffect, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { InputTextarea } from 'primereact/inputtextarea'
import { Calendar } from 'primereact/calendar'
import { ToggleButton } from 'primereact/togglebutton'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { categorieApi } from '../services/api'

const EMPTY = {
  libelle: '', montant: null, conditions: '', actif: true,
  dateDebutValidite: null, dateFinValidite: null, description: ''
}

export default function CategoriesAdhesionPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [dialogVisible, setDialog]  = useState(false)
  const [form, setForm]             = useState(EMPTY)
  const [editId, setEditId]         = useState(null)
  const [saving, setSaving]         = useState(false)
  const [search, setSearch]         = useState('')
  const toast = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await categorieApi.getAll()
      setCategories(res.data)
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Chargement impossible', life: 3000 })
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = categories.filter(c => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return c.libelle?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
  })

  const openNew = () => { setForm(EMPTY); setEditId(null); setDialog(true) }
  const openEdit = row => {
    setForm({
      libelle: row.libelle,
      montant: row.montant,
      conditions: row.conditions || '',
      actif: row.actif,
      dateDebutValidite: row.dateDebutValidite ? new Date(row.dateDebutValidite) : null,
      dateFinValidite: row.dateFinValidite ? new Date(row.dateFinValidite) : null,
      description: row.description || ''
    })
    setEditId(row.id); setDialog(true)
  }

  const save = async () => {
    if (!form.libelle || !form.montant) {
      toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Libellé et montant obligatoires', life: 3000 })
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        dateDebutValidite: form.dateDebutValidite ? form.dateDebutValidite.toISOString().split('T')[0] : null,
        dateFinValidite: form.dateFinValidite ? form.dateFinValidite.toISOString().split('T')[0] : null
      }
      if (editId) {
        await categorieApi.update(editId, payload)
        toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Catégorie modifiée', life: 3000 })
      } else {
        await categorieApi.create(payload)
        toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Catégorie créée', life: 3000 })
      }
      setDialog(false); load()
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: e.response?.data?.message || 'Erreur', life: 4000 })
    } finally { setSaving(false) }
  }

  const confirmDelete = row => {
    confirmDialog({
      message: `Supprimer la catégorie "${row.libelle}" ?`,
      header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer', rejectLabel: 'Annuler', acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await categorieApi.delete(row.id)
          toast.current?.show({ severity: 'success', summary: 'Supprimé', life: 3000 })
          load()
        } catch (e) {
          toast.current?.show({ severity: 'error', summary: 'Erreur', detail: e.response?.data?.message || 'Erreur', life: 4000 })
        }
      }
    })
  }

  // Statut : texte simple sans couleur
  const actifTpl = row => <span>{row.actif ? 'Active' : 'Inactive'}</span>

  // Montant : texte simple
  const montantTpl = row => (
    <span>{Number(row.montant).toLocaleString('fr-MA')} MAD</span>
  )

  // Adhérents : texte simple sans couleur
  const adherentsTpl = row => (
    <span>{row.nombreAdherents}</span>
  )

  const actionsTpl = row => (
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
          <h1>Catégories d'Adhésion</h1>
          <p>Paramétrez les catégories et leurs montants de cotisation</p>
        </div>
        <Button icon="pi pi-plus" label="Nouvelle Catégorie" onClick={openNew} />
      </div>

      <div className="cdc-card">
        <DataTable
          value={filtered} loading={loading}
          emptyMessage="Aucune catégorie."
          paginator rows={10}
          header={
            <div className="flex justify-content-between align-items-center">
              <span>{categories.length} catégorie(s)</span>
              <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." />
              </IconField>
            </div>
          }
        >
          <Column field="libelle"         header="Libellé"     sortable style={{ fontWeight: 600 }} />
          <Column header="Montant"        body={montantTpl}    style={{ width: 150 }} />
          <Column field="description"     header="Description" />
          <Column header="Adhérents"      body={adherentsTpl}  style={{ width: 130 }} />
          <Column header="Statut"         body={actifTpl}      style={{ width: 100 }} />
          <Column header="Actions"        body={actionsTpl}    style={{ width: 230 }} />
        </DataTable>
      </div>

      <Dialog
        visible={dialogVisible} onHide={() => setDialog(false)}
        header={editId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        style={{ width: 560 }} modal
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
              <label className="font-semibold">Libellé *</label>
              <InputText value={form.libelle} onChange={e => setForm({ ...form, libelle: e.target.value })}
                placeholder="Ex: Actifs, Retraités..." className="w-full" autoFocus />
            </div>
            <div className="field col">
              <label className="font-semibold">Montant (MAD) *</label>
              <InputNumber value={form.montant} onValueChange={e => setForm({ ...form, montant: e.value })}
                mode="decimal" minFractionDigits={2} maxFractionDigits={2} className="w-full" placeholder="0.00" />
            </div>
          </div>
          <div className="field">
            <label className="font-semibold">Description</label>
            <InputText value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Description courte..." className="w-full" />
          </div>
          <div className="field">
            <label className="font-semibold">Conditions d'appartenance</label>
            <InputTextarea value={form.conditions} onChange={e => setForm({ ...form, conditions: e.target.value })}
              placeholder="Conditions pour appartenir à cette catégorie..."
              rows={2} className="w-full" autoResize />
          </div>
          <div className="formgrid grid">
            <div className="field col">
              <label className="font-semibold">Date début validité</label>
              <Calendar value={form.dateDebutValidite} onChange={e => setForm({ ...form, dateDebutValidite: e.value })}
                dateFormat="dd/mm/yy" showIcon className="w-full" placeholder="JJ/MM/AAAA" />
            </div>
            <div className="field col">
              <label className="font-semibold">Date fin validité</label>
              <Calendar value={form.dateFinValidite} onChange={e => setForm({ ...form, dateFinValidite: e.value })}
                dateFormat="dd/mm/yy" showIcon className="w-full" placeholder="JJ/MM/AAAA" />
            </div>
          </div>
          <div className="field">
            <label className="font-semibold">Statut</label>
            <ToggleButton checked={form.actif} onChange={e => setForm({ ...form, actif: e.value })}
              onLabel="Active" offLabel="Inactive" onIcon="pi pi-check" offIcon="pi pi-times" className="w-full" />
          </div>
        </div>
      </Dialog>
    </div>
  )
}