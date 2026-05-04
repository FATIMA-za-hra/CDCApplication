import { useState, useEffect, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { InputTextarea } from 'primereact/inputtextarea'
import { Calendar } from 'primereact/calendar'
import { Dropdown } from 'primereact/dropdown'
import { ToggleButton } from 'primereact/togglebutton'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { adhesionApi, adherentApi, categorieApi } from '../services/api'

const STATUTS = [
  { label: 'En attente', value: 'EN_ATTENTE' },
  { label: 'Payé',       value: 'PAYE' },
  { label: 'Exonéré',   value: 'EXONERE' },
  { label: 'Annulé',    value: 'ANNULE' },
]

const MODES_PAIEMENT = [
  { label: 'Espèces',  value: 'especes' },
  { label: 'Virement', value: 'virement' },
  { label: 'Chèque',   value: 'cheque' },
]

const EMPTY = {
  adherentId: null, categorieId: null,
  annee: new Date().getFullYear(),
  datePaiement: null, montant: null, statut: 'EN_ATTENTE',
  modePaiement: null, referencePaiement: '',
  estExonere: false, montantExonere: 0, motifExoneration: '',
  observations: ''
}

export default function AdhesionsPage() {
  const [adhesions, setAdhesions]   = useState([])
  const [adherents, setAdherents]   = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [dialogVisible, setDialog]  = useState(false)
  const [form, setForm]             = useState(EMPTY)
  const [editId, setEditId]         = useState(null)
  const [saving, setSaving]         = useState(false)
  const [search, setSearch]         = useState('')
  const [anneeFilter, setAnneeFilter] = useState(new Date().getFullYear())
  const toast = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const [ad, adh, cat] = await Promise.all([
        adhesionApi.getAll(),
        adherentApi.getAll(),
        categorieApi.getActives()
      ])
      setAdhesions(ad.data)
      setAdherents(adh.data)
      setCategories(cat.data)
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Chargement impossible', life: 3000 })
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = adhesions.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = !search.trim() ||
      a.adherent?.nom?.toLowerCase().includes(q) ||
      a.adherent?.prenom?.toLowerCase().includes(q) ||
      a.adherent?.numeroAdherent?.toLowerCase().includes(q)
    const matchAnnee = !anneeFilter || a.annee === anneeFilter
    return matchSearch && matchAnnee
  })

  const anneeOptions = [...new Set(adhesions.map(a => a.annee))].sort((a, b) => b - a)
    .map(y => ({ label: String(y), value: y }))

  const openNew  = () => { setForm(EMPTY); setEditId(null); setDialog(true) }
  const openEdit = row => {
    setForm({
      adherentId: row.adherent?.id || null,
      categorieId: row.categorie?.id || null,
      annee: row.annee,
      datePaiement: row.datePaiement ? new Date(row.datePaiement) : null,
      montant: row.montant,
      statut: row.statut || 'EN_ATTENTE',
      modePaiement: row.modePaiement || null,
      referencePaiement: row.referencePaiement || '',
      estExonere: row.estExonere || false,
      montantExonere: row.montantExonere || 0,
      motifExoneration: row.motifExoneration || '',
      observations: row.observations || ''
    })
    setEditId(row.id); setDialog(true)
  }

  const onAdherentChange = adherentId => {
    const adherent = adherents.find(a => a.id === adherentId)
    const newForm = { ...form, adherentId }
    if (adherent?.categorie?.id) {
      newForm.categorieId = adherent.categorie.id
      const cat = categories.find(c => c.id === adherent.categorie.id)
      if (cat) newForm.montant = cat.montant
    }
    setForm(newForm)
  }

  const onCategorieChange = categorieId => {
    const cat = categories.find(c => c.id === categorieId)
    setForm({ ...form, categorieId, montant: cat ? cat.montant : form.montant })
  }

  const save = async () => {
    if (!form.adherentId || !form.categorieId || !form.annee) {
      toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Adhérent, catégorie et année obligatoires', life: 3000 })
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        datePaiement: form.datePaiement ? form.datePaiement.toISOString().split('T')[0] : null
      }
      if (editId) {
        await adhesionApi.update(editId, payload)
        toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Adhésion modifiée', life: 3000 })
      } else {
        await adhesionApi.create(payload)
        toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Adhésion créée', life: 3000 })
      }
      setDialog(false); load()
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: e.response?.data?.message || 'Erreur', life: 4000 })
    } finally { setSaving(false) }
  }

  const confirmDelete = row => {
    confirmDialog({
      message: `Supprimer l'adhésion de ${row.adherent?.prenom} ${row.adherent?.nom} (${row.annee}) ?`,
      header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer', rejectLabel: 'Annuler', acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await adhesionApi.delete(row.id)
          toast.current?.show({ severity: 'success', summary: 'Supprimé', life: 3000 })
          load()
        } catch (e) {
          toast.current?.show({ severity: 'error', summary: 'Erreur', detail: e.response?.data?.message || 'Erreur', life: 4000 })
        }
      }
    })
  }

  /* ── Templates ── */
  const adherentTpl = row => (
    <div>
      <div className="font-semibold">{row.adherent?.prenom} {row.adherent?.nom}</div>
      <div style={{ fontSize: 11, color: '#94a3b8' }}>{row.adherent?.numeroAdherent}</div>
    </div>
  )

  // Statut : texte simple sans couleur
  const statutTpl = row => (
    <span>{STATUTS.find(s => s.value === row.statut)?.label || row.statut || '—'}</span>
  )

  const montantTpl = row => (
    <div>
      <div>{Number(row.montant).toLocaleString('fr-MA')} MAD</div>
      {row.estExonere && (
        <div style={{ fontSize: 11, color: '#64748b' }}>
          Exon.: {Number(row.montantExonere).toLocaleString('fr-MA')} MAD
        </div>
      )}
    </div>
  )

  const actionsTpl = row => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" label="Modifier"  size="small" outlined onClick={() => openEdit(row)} />
      <Button icon="pi pi-trash"  label="Supprimer" size="small" outlined severity="danger" onClick={() => confirmDelete(row)} />
    </div>
  )

  const adherentOptions = adherents.map(a => ({
    label: `${a.prenom} ${a.nom} (${a.numeroAdherent})`,
    value: a.id
  }))

  const catOptions = categories.map(c => ({
    label: `${c.libelle} — ${Number(c.montant).toLocaleString('fr-MA')} MAD`,
    value: c.id
  }))

  const totalPaye   = filtered.filter(a => a.statut === 'PAYE').reduce((s, a) => s + Number(a.montant || 0), 0)
  const totalAttente = filtered.filter(a => a.statut === 'EN_ATTENTE').length

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="cdc-page-header">
        <div>
          <h1>Adhésions</h1>
          <p>Gestion des cotisations annuelles des adhérents</p>
        </div>
        <Button icon="pi pi-plus" label="Nouvelle Adhésion" onClick={openNew} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total',        value: filtered.length,                                              color: '#1a73e8' },
          { label: 'Payées',       value: filtered.filter(a => a.statut === 'PAYE').length,              color: '#16a34a' },
          { label: 'En attente',   value: totalAttente,                                                  color: '#ea580c' },
          { label: 'Montant perçu', value: `${totalPaye.toLocaleString('fr-MA')} MAD`, small: true, color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} className="cdc-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: s.small ? 16 : 26, fontWeight: 700, color: s.color || '#0f172a' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="cdc-card">
        <DataTable
          value={filtered} loading={loading}
          emptyMessage="Aucune adhésion."
          paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
          header={
            <div className="flex justify-content-between align-items-center gap-2 flex-wrap">
              <span>{filtered.length} adhésion(s)</span>
              <div className="flex gap-2 align-items-center flex-wrap">
                <Dropdown value={anneeFilter} options={anneeOptions}
                  onChange={e => setAnneeFilter(e.value)}
                  placeholder="Toutes les années" showClear style={{ fontSize: 13, minWidth: 160 }} />
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-search" />
                  <InputText value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher adhérent..." />
                </IconField>
              </div>
            </div>
          }
        >
          <Column header="Adhérent"       body={adherentTpl}              sortField="adherent.nom" style={{ minWidth: 180 }} />
          <Column field="annee"           header="Année"                  sortable style={{ width: 90 }} />
          <Column field="categorie.libelle" header="Catégorie"            style={{ color: '#64748b' }} />
          <Column header="Montant"        body={montantTpl}               style={{ width: 160 }} />
          <Column field="datePaiement"    header="Date paiement"
            body={row => row.datePaiement ? new Date(row.datePaiement).toLocaleDateString('fr-FR') : '—'}
            style={{ width: 130 }} />
          <Column field="modePaiement"    header="Mode"                   style={{ width: 100, color: '#64748b' }} />
          <Column header="Statut"         body={statutTpl}                style={{ width: 110 }} />
          <Column header="Actions"        body={actionsTpl}               style={{ width: 230 }} />
        </DataTable>
      </div>

      {/* DIALOG */}
      <Dialog visible={dialogVisible} onHide={() => setDialog(false)}
        header={editId ? "Modifier l'adhésion" : 'Nouvelle adhésion'}
        style={{ width: 600 }} modal
        footer={
          <div>
            <Button icon="pi pi-times" label="Annuler" outlined onClick={() => setDialog(false)} className="mr-2" />
            <Button icon="pi pi-check" label={editId ? 'Modifier' : 'Créer'} loading={saving} onClick={save} />
          </div>
        }
      >
        <div className="flex flex-column gap-3 pt-3">
          <div className="field">
            <label className="font-semibold">Adhérent *</label>
            <Dropdown value={form.adherentId} options={adherentOptions}
              onChange={e => onAdherentChange(e.value)}
              placeholder="Sélectionner un adhérent..." className="w-full"
              filter filterPlaceholder="Rechercher..." emptyMessage="Aucun adhérent"
              disabled={!!editId} />
          </div>
          <div className="formgrid grid">
            <div className="field col">
              <label className="font-semibold">Catégorie *</label>
              <Dropdown value={form.categorieId} options={catOptions}
                onChange={e => onCategorieChange(e.value)}
                placeholder="Catégorie..." className="w-full" />
            </div>
            <div className="field col">
              <label className="font-semibold">Année *</label>
              <InputNumber value={form.annee} onValueChange={e => setForm({ ...form, annee: e.value })}
                min={2000} max={2099} className="w-full" useGrouping={false} />
            </div>
          </div>
          <div className="formgrid grid">
            <div className="field col">
              <label className="font-semibold">Montant (MAD)</label>
              <InputNumber value={form.montant} onValueChange={e => setForm({ ...form, montant: e.value })}
                mode="decimal" minFractionDigits={2} className="w-full" />
            </div>
            <div className="field col">
              <label className="font-semibold">Statut</label>
              <Dropdown value={form.statut} options={STATUTS}
                onChange={e => setForm({ ...form, statut: e.value })} className="w-full" />
            </div>
          </div>
          <div className="formgrid grid">
            <div className="field col">
              <label className="font-semibold">Date de paiement</label>
              <Calendar value={form.datePaiement} onChange={e => setForm({ ...form, datePaiement: e.value })}
                dateFormat="dd/mm/yy" showIcon className="w-full" />
            </div>
            <div className="field col">
              <label className="font-semibold">Mode de paiement</label>
              <Dropdown value={form.modePaiement} options={MODES_PAIEMENT}
                onChange={e => setForm({ ...form, modePaiement: e.value })}
                placeholder="Mode..." className="w-full" showClear />
            </div>
          </div>
          <div className="field">
            <label className="font-semibold">Référence paiement</label>
            <InputText value={form.referencePaiement}
              onChange={e => setForm({ ...form, referencePaiement: e.target.value })}
              placeholder="N° chèque, virement..." className="w-full" />
          </div>
          <div className="field">
            <ToggleButton checked={form.estExonere}
              onChange={e => setForm({ ...form, estExonere: e.value })}
              onLabel="Exonéré" offLabel="Non exonéré"
              onIcon="pi pi-check" offIcon="pi pi-times" className="w-full" />
          </div>
          {form.estExonere && (
            <div className="formgrid grid">
              <div className="field col">
                <label className="font-semibold">Montant exonéré (MAD)</label>
                <InputNumber value={form.montantExonere}
                  onValueChange={e => setForm({ ...form, montantExonere: e.value })}
                  mode="decimal" minFractionDigits={2} className="w-full" />
              </div>
              <div className="field col">
                <label className="font-semibold">Motif d'exonération</label>
                <InputText value={form.motifExoneration}
                  onChange={e => setForm({ ...form, motifExoneration: e.target.value })}
                  placeholder="Motif..." className="w-full" />
              </div>
            </div>
          )}
          <div className="field">
            <label className="font-semibold">Observations</label>
            <InputTextarea value={form.observations}
              onChange={e => setForm({ ...form, observations: e.target.value })}
              rows={2} className="w-full" autoResize placeholder="Observations..." />
          </div>
        </div>
      </Dialog>
    </div>
  )
}