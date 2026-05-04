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
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { Divider } from 'primereact/divider'
import { adherentApi, categorieApi } from '../services/api'

const STATUTS = [
  { label: 'Actif',          value: 'ACTIF' },
  { label: 'Suspendu',       value: 'SUSPENDU' },
  { label: 'Radié',          value: 'RADIE' },
  { label: 'Démissionnaire', value: 'DEMISSIONNAIRE' },
  { label: 'Décédé',         value: 'DECEDE' },
]

const SITUATIONS = [
  { label: 'Célibataire', value: 'celibataire' },
  { label: 'Marié(e)',    value: 'marie' },
  { label: 'Divorcé(e)', value: 'divorce' },
  { label: 'Veuf/Veuve', value: 'veuf' },
]

const EMPTY = {
  nom: '', prenom: '', cin: '', matricule: '', dateNaissance: null,
  situationFamiliale: '', service: '', telephone: '', adresse: '',
  email: '', dateAdhesion: null, statut: 'ACTIF',
  categorieId: null, nombreEnfants: 0, observations: ''
}

export default function AdherentsPage() {
  const [adherents, setAdherents]   = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [dialogVisible, setDialog]  = useState(false)
  const [detailVisible, setDetail]  = useState(false)
  const [selectedAdherent, setSelected] = useState(null)
  const [form, setForm]             = useState(EMPTY)
  const [editId, setEditId]         = useState(null)
  const [saving, setSaving]         = useState(false)
  const [search, setSearch]         = useState('')
  const [statutFilter, setStatutFilter] = useState(null)
  const toast = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const [a, c] = await Promise.all([adherentApi.getAll(), categorieApi.getActives()])
      setAdherents(a.data)
      setCategories(c.data)
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Chargement impossible', life: 3000 })
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = adherents.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = !search.trim() ||
      a.nom?.toLowerCase().includes(q) ||
      a.prenom?.toLowerCase().includes(q) ||
      a.cin?.toLowerCase().includes(q) ||
      a.matricule?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.numeroAdherent?.toLowerCase().includes(q)
    const matchStatut = !statutFilter || a.statut === statutFilter
    return matchSearch && matchStatut
  })

  const openNew  = () => { setForm(EMPTY); setEditId(null); setDialog(true) }
  const openEdit = row => {
    setForm({
      nom: row.nom, prenom: row.prenom, cin: row.cin || '',
      matricule: row.matricule || '',
      dateNaissance: row.dateNaissance ? new Date(row.dateNaissance) : null,
      situationFamiliale: row.situationFamiliale || '',
      service: row.service || '', telephone: row.telephone || '',
      adresse: row.adresse || '', email: row.email || '',
      dateAdhesion: row.dateAdhesion ? new Date(row.dateAdhesion) : null,
      statut: row.statut || 'ACTIF',
      categorieId: row.categorie?.id || null,
      nombreEnfants: row.nombreEnfants || 0,
      observations: row.observations || ''
    })
    setEditId(row.id); setDialog(true)
  }
  const openDetail = row => { setSelected(row); setDetail(true) }

  const save = async () => {
    if (!form.nom || !form.prenom) {
      toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Nom et Prénom obligatoires', life: 3000 })
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        dateNaissance: form.dateNaissance ? form.dateNaissance.toISOString().split('T')[0] : null,
        dateAdhesion:  form.dateAdhesion  ? form.dateAdhesion.toISOString().split('T')[0]  : null,
      }
      if (editId) {
        await adherentApi.update(editId, payload)
        toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Adhérent modifié', life: 3000 })
      } else {
        await adherentApi.create(payload)
        toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Adhérent créé — compte utilisateur généré automatiquement', life: 4000 })
      }
      setDialog(false); load()
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: e.response?.data?.message || 'Erreur', life: 4000 })
    } finally { setSaving(false) }
  }

  const confirmDelete = row => {
    confirmDialog({
      message: `Supprimer l'adhérent "${row.prenom} ${row.nom}" (${row.numeroAdherent}) ?`,
      header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer', rejectLabel: 'Annuler', acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await adherentApi.delete(row.id)
          toast.current?.show({ severity: 'success', summary: 'Supprimé', life: 3000 })
          load()
        } catch (e) {
          toast.current?.show({ severity: 'error', summary: 'Erreur', detail: e.response?.data?.message || 'Erreur', life: 4000 })
        }
      }
    })
  }

  /* ── Templates tableau ── */
  const adherentTpl = row => (
    <div className="flex align-items-center gap-2" style={{ cursor: 'pointer' }} onClick={() => openDetail(row)}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%', background: '#1a73e8',
        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, flexShrink: 0
      }}>
        {row.prenom?.[0]}{row.nom?.[0]}
      </div>
      <div>
        <div className="font-semibold">{row.prenom} {row.nom}</div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>{row.numeroAdherent} • {row.cin || '—'}</div>
      </div>
    </div>
  )

  // Catégorie : texte simple
  const categorieTpl = row => (
    <span>{row.categorie?.libelle || '—'}</span>
  )

  // Statut : texte simple
  const statutTpl = row => (
    <span>{STATUTS.find(s => s.value === row.statut)?.label || row.statut || '—'}</span>
  )

  const actionsTpl = row => (
    <div className="flex gap-2">
      <Button icon="pi pi-eye"    size="small" outlined severity="info"    onClick={() => openDetail(row)} />
      <Button icon="pi pi-pencil" label="Modifier"  size="small" outlined  onClick={() => openEdit(row)} />
      <Button icon="pi pi-trash"  label="Supprimer" size="small" outlined severity="danger" onClick={() => confirmDelete(row)} />
    </div>
  )

  const catOptions = categories.map(c => ({
    label: `${c.libelle} — ${Number(c.montant).toLocaleString('fr-MA')} MAD`,
    value: c.id
  }))

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="cdc-page-header">
        <div>
          <h1>Adhérents</h1>
          <p>Gestion des fiches adhérents — le compte utilisateur est créé automatiquement</p>
        </div>
        <Button icon="pi pi-user-plus" label="Nouvel Adhérent" onClick={openNew} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total',     value: adherents.length,                                      statut: null,      color: '#1a73e8' },
          { label: 'Actifs',    value: adherents.filter(a => a.statut === 'ACTIF').length,     statut: 'ACTIF',   color: '#16a34a' },
          { label: 'Suspendus', value: adherents.filter(a => a.statut === 'SUSPENDU').length,  statut: 'SUSPENDU', color: '#ea580c' },
          { label: 'Radiés',    value: adherents.filter(a => a.statut === 'RADIE').length,     statut: 'RADIE',   color: '#dc2626' },
        ].map(s => (
          <div key={s.label} className="cdc-card"
            style={{ padding: '16px 20px', cursor: 'pointer' }}
            onClick={() => setStatutFilter(s.statut)}>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color || '#0f172a' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="cdc-card">
        <DataTable
          value={filtered} loading={loading}
          emptyMessage="Aucun adhérent."
          paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
          header={
            <div className="flex justify-content-between align-items-center gap-2">
              <div className="flex align-items-center gap-2">
                <span>{filtered.length} / {adherents.length} adhérent(s)</span>
                {statutFilter && (
                  <Button icon="pi pi-times" size="small" text
                    label={`Filtre: ${STATUTS.find(s => s.value === statutFilter)?.label}`}
                    severity="secondary" onClick={() => setStatutFilter(null)} />
                )}
              </div>
              <div className="flex gap-2 align-items-center">
                <Dropdown value={statutFilter} options={STATUTS}
                  onChange={e => setStatutFilter(e.value)}
                  placeholder="Tous les statuts" showClear style={{ fontSize: 13 }} />
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-search" />
                  <InputText value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." />
                </IconField>
              </div>
            </div>
          }
        >
          <Column header="Adhérent"   body={adherentTpl}  sortField="nom" sortable style={{ minWidth: 220 }} />
          <Column field="service"     header="Service"    style={{ color: '#64748b' }} />
          <Column field="telephone"   header="Téléphone"  style={{ width: 130 }} />
          <Column header="Catégorie"  body={categorieTpl} style={{ width: 140 }} />
          <Column header="Statut"     body={statutTpl}    style={{ width: 120 }} />
          <Column header="Actions"    body={actionsTpl}   style={{ width: 260 }} />
        </DataTable>
      </div>

      {/* DIALOG FORMULAIRE */}
      <Dialog visible={dialogVisible} onHide={() => setDialog(false)}
        header={editId ? "Modifier l'adhérent" : 'Nouvel adhérent'}
        style={{ width: 700 }} modal
        footer={
          <div>
            <Button icon="pi pi-times" label="Annuler" outlined onClick={() => setDialog(false)} className="mr-2" />
            <Button icon="pi pi-check" label={editId ? 'Modifier' : 'Créer'} loading={saving} onClick={save} />
          </div>
        }
      >
        <div className="flex flex-column gap-3 pt-2">
          <div style={{ fontWeight: 700, color: '#1a73e8', fontSize: 13 }}>
            <i className="pi pi-user mr-2"></i>Identité
          </div>
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
          <div className="formgrid grid">
            <div className="field col">
              <label className="font-semibold">CIN</label>
              <InputText value={form.cin} onChange={e => setForm({ ...form, cin: e.target.value.toUpperCase() })}
                placeholder="Ex: AB123456" className="w-full" />
            </div>
            <div className="field col">
              <label className="font-semibold">Matricule</label>
              <InputText value={form.matricule} onChange={e => setForm({ ...form, matricule: e.target.value })}
                placeholder="Matricule" className="w-full" />
            </div>
          </div>
          <div className="formgrid grid">
            <div className="field col">
              <label className="font-semibold">Date de naissance</label>
              <Calendar value={form.dateNaissance} onChange={e => setForm({ ...form, dateNaissance: e.value })}
                dateFormat="dd/mm/yy" showIcon className="w-full" maxDate={new Date()} />
            </div>
            <div className="field col">
              <label className="font-semibold">Situation familiale</label>
              <Dropdown value={form.situationFamiliale} options={SITUATIONS}
                onChange={e => setForm({ ...form, situationFamiliale: e.value })}
                placeholder="Sélectionner..." className="w-full" />
            </div>
          </div>
          <div className="formgrid grid">
            <div className="field col">
              <label className="font-semibold">Nombre d'enfants</label>
              <InputNumber value={form.nombreEnfants}
                onValueChange={e => setForm({ ...form, nombreEnfants: e.value })}
                min={0} max={20} className="w-full" />
            </div>
            <div className="field col">
              <label className="font-semibold">Service / Direction</label>
              <InputText value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}
                placeholder="Direction..." className="w-full" />
            </div>
          </div>

          <Divider className="my-1" />
          <div style={{ fontWeight: 700, color: '#1a73e8', fontSize: 13 }}>
            <i className="pi pi-phone mr-2"></i>Contact
          </div>
          <div className="formgrid grid">
            <div className="field col">
              <label className="font-semibold">Téléphone</label>
              <InputText value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })}
                placeholder="0612345678" className="w-full" />
            </div>
            <div className="field col">
              <label className="font-semibold">Email</label>
              <InputText value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="email@domaine.com" type="email" className="w-full" />
            </div>
          </div>
          <div className="field">
            <label className="font-semibold">Adresse</label>
            <InputText value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })}
              placeholder="Adresse complète" className="w-full" />
          </div>

          <Divider className="my-1" />
          <div style={{ fontWeight: 700, color: '#1a73e8', fontSize: 13 }}>
            <i className="pi pi-id-card mr-2"></i>Adhésion
          </div>
          <div className="formgrid grid">
            <div className="field col">
              <label className="font-semibold">Date d'adhésion</label>
              <Calendar value={form.dateAdhesion} onChange={e => setForm({ ...form, dateAdhesion: e.value })}
                dateFormat="dd/mm/yy" showIcon className="w-full" />
            </div>
            <div className="field col">
              <label className="font-semibold">Statut</label>
              <Dropdown value={form.statut} options={STATUTS}
                onChange={e => setForm({ ...form, statut: e.value })} className="w-full" />
            </div>
          </div>
          <div className="field">
            <label className="font-semibold">Catégorie d'adhésion</label>
            <Dropdown value={form.categorieId} options={catOptions}
              onChange={e => setForm({ ...form, categorieId: e.value })}
              placeholder="Sélectionner une catégorie..." className="w-full"
              emptyMessage="Aucune catégorie active" />
          </div>
          <div className="field">
            <label className="font-semibold">Observations</label>
            <InputTextarea value={form.observations}
              onChange={e => setForm({ ...form, observations: e.target.value })}
              placeholder="Observations..." rows={2} className="w-full" autoResize />
          </div>

          {!editId && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12, fontSize: 13, color: '#15803d' }}>
              <i className="pi pi-info-circle mr-2"></i>
              Un compte utilisateur sera automatiquement créé et un email envoyé pour configurer le mot de passe.
            </div>
          )}
        </div>
      </Dialog>

      {/* DIALOG DETAIL */}
      <Dialog visible={detailVisible} onHide={() => setDetail(false)}
        header={selectedAdherent ? `Fiche : ${selectedAdherent.prenom} ${selectedAdherent.nom}` : ''}
        style={{ width: 620 }} modal
        footer={
          <div className="flex justify-content-between">
            <Button icon="pi pi-pencil" label="Modifier" outlined
              onClick={() => { setDetail(false); openEdit(selectedAdherent) }} />
            <Button icon="pi pi-times" label="Fermer" onClick={() => setDetail(false)} />
          </div>
        }
      >
        {selectedAdherent && (
          <div className="flex flex-column gap-3">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
              {[
                { label: 'N° Adhérent',       value: selectedAdherent.numeroAdherent },
                { label: 'Statut',             value: STATUTS.find(s => s.value === selectedAdherent.statut)?.label || selectedAdherent.statut },
                { label: 'Nom complet',        value: `${selectedAdherent.prenom} ${selectedAdherent.nom}` },
                { label: 'CIN',                value: selectedAdherent.cin || '—' },
                { label: 'Matricule',          value: selectedAdherent.matricule || '—' },
                { label: 'Date de naissance',  value: selectedAdherent.dateNaissance ? new Date(selectedAdherent.dateNaissance).toLocaleDateString('fr-FR') : '—' },
                { label: 'Situation familiale',value: selectedAdherent.situationFamiliale || '—' },
                { label: "Nombre d'enfants",   value: selectedAdherent.nombreEnfants ?? '—' },
                { label: 'Service',            value: selectedAdherent.service || '—' },
                { label: 'Téléphone',          value: selectedAdherent.telephone || '—' },
                { label: 'Email',              value: selectedAdherent.email || '—' },
                { label: 'Catégorie',          value: selectedAdherent.categorie?.libelle || '—' },
                { label: "Date d'adhésion",    value: selectedAdherent.dateAdhesion ? new Date(selectedAdherent.dateAdhesion).toLocaleDateString('fr-FR') : '—' },
                { label: 'Compte utilisateur', value: selectedAdherent.compteUtilisateurCree ? 'Créé' : 'Non créé' },
              ].map(item => (
                <div key={item.label} style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b' }}>{item.value}</div>
                </div>
              ))}
            </div>
            {selectedAdherent.observations && (
              <div style={{ background: '#f8fafc', borderRadius: 6, padding: 12, fontSize: 13, color: '#64748b' }}>
                <strong>Observations :</strong> {selectedAdherent.observations}
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  )
}