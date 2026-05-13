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
import { FileUpload } from 'primereact/fileupload'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { Tag } from 'primereact/tag'
import { TabView, TabPanel } from 'primereact/tabview'
import { Divider } from 'primereact/divider'
import { aideApi, adherentApi, typeAideApi } from '../services/api'

// États selon le diagramme de séquences
const ETATS = [
  { label: 'Déposée',   value: 'DEPOSEE',   severity: 'info'     },
  { label: 'En étude',  value: 'EN_ETUDE',  severity: 'warning'  },
  { label: 'Validée',   value: 'VALIDEE',   severity: 'success'  },
  { label: 'Rejetée',   value: 'REJETEE',   severity: 'danger'   },
  { label: 'Annulée',   value: 'ANNULEE',   severity: 'secondary'},
]

const EMPTY_FORM     = { adherentId: null, typeAideId: null, montantDemande: null, motif: '' }
const EMPTY_DECISION = { decision: '', commentaire: '', montantAccorde: null }
const EMPTY_VIREMENT = { beneficiaire: '', montant: null, motif: '', referenceVirement: '', dateVirement: null, ribBeneficiaire: '' }

export default function AidePage() {
  const [aides, setAides]               = useState([])
  const [adherents, setAdherents]       = useState([])
  const [typesAide, setTypesAide]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [etatFilter, setEtatFilter]     = useState(null)
  const [dialogNew, setDialogNew]       = useState(false)
  const [dialogDetail, setDialogDetail] = useState(false)
  const [selected, setSelected]         = useState(null)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [saving, setSaving]             = useState(false)
  const [decisionForm, setDecisionForm] = useState(EMPTY_DECISION)
  const [virementForm, setVirementForm] = useState(EMPTY_VIREMENT)
  const [dialogDecision, setDialogDecision] = useState(false)
  const [dialogVirement, setDialogVirement] = useState(false)
  const [etapeDecision, setEtapeDecision]   = useState(null)
  const [pieces, setPieces]             = useState([])
  const [detailTab, setDetailTab]       = useState(0)
  const toast = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const [a, adh, t] = await Promise.all([
        aideApi.getAll(), adherentApi.getAll(), typeAideApi.getActifs()
      ])
      setAides(a.data); setAdherents(adh.data); setTypesAide(t.data)
    } catch { toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Chargement impossible', life: 3000 }) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openDetail = async row => {
    setSelected(row); setDetailTab(0); setDialogDetail(true)
    try { const res = await aideApi.getPieces(row.id); setPieces(res.data) }
    catch { setPieces([]) }
  }

  const refreshSelected = async () => {
    if (!selected) return
    try {
      const res = await aideApi.getById(selected.id)
      setSelected(res.data)
    } catch {}
    load()
  }

  const filtered = aides.filter(a => {
    const q = search.toLowerCase()
    const ms = !search.trim() ||
      a.numeroDemande?.toLowerCase().includes(q) ||
      a.adherent?.nom?.toLowerCase().includes(q) ||
      a.adherent?.prenom?.toLowerCase().includes(q) ||
      a.adherent?.numeroAdherent?.toLowerCase().includes(q) ||
      a.typeAide?.nom?.toLowerCase().includes(q)
    return ms && (!etatFilter || a.etat === etatFilter)
  })

  const deposer = async () => {
    if (!form.adherentId || !form.typeAideId || !form.montantDemande || !form.motif?.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Tous les champs sont obligatoires', life: 3000 }); return
    }
    setSaving(true)
    try {
      await aideApi.deposer(form)
      toast.current?.show({ severity: 'success', summary: 'Demande déposée', detail: 'État : Déposée — en attente de l\'agent de bureau', life: 5000 })
      setDialogNew(false); setForm(EMPTY_FORM); load()
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: e.response?.data?.message || 'Erreur', life: 4000 })
    } finally { setSaving(false) }
  }

  const annuler = async row => {
    confirmDialog({
      message: `Annuler la demande ${row.numeroDemande} ?`,
      header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, annuler', rejectLabel: 'Non', acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await aideApi.annuler(row.id)
          toast.current?.show({ severity: 'success', summary: 'Annulée', life: 3000 })
          if (selected?.id === row.id) setDialogDetail(false)
          load()
        } catch (e) {
          toast.current?.show({ severity: 'error', summary: 'Erreur', detail: e.response?.data?.message || 'Erreur', life: 4000 })
        }
      }
    })
  }

  const ouvrirDecision = etape => {
    setEtapeDecision(etape); setDecisionForm(EMPTY_DECISION); setDialogDecision(true)
  }

  const soumettreDecision = async () => {
    if (!decisionForm.decision) {
      toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Choisissez une décision', life: 3000 }); return
    }
    setSaving(true)
    try {
      const fn = etapeDecision === 'AGENT_BUREAU' ? aideApi.decisionAgentBureau : aideApi.decisionPresident
      const res = await fn(selected.id, decisionForm)
      setSelected(res.data)
      const label = decisionForm.decision === 'APPROUVE' ? 'Approuvée' : 'Rejetée'
      toast.current?.show({ severity: 'success', summary: `Décision : ${label}`, life: 3000 })
      setDialogDecision(false); load()
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: e.response?.data?.message || 'Erreur', life: 4000 })
    } finally { setSaving(false) }
  }

  const soumettreVirement = async () => {
    if (!virementForm.beneficiaire || !virementForm.montant) {
      toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Bénéficiaire et montant obligatoires', life: 3000 }); return
    }
    setSaving(true)
    try {
      const res = await aideApi.enregistrerVirement(selected.id, {
        ...virementForm,
        dateVirement: virementForm.dateVirement ? virementForm.dateVirement.toISOString().split('T')[0] : null
      })
      setSelected(res.data)
      toast.current?.show({ severity: 'success', summary: 'Virement enregistré', life: 3000 })
      setDialogVirement(false); load()
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: e.response?.data?.message || 'Erreur', life: 4000 })
    } finally { setSaving(false) }
  }

  const uploadPiece = async event => {
    const file = event.files[0]; if (!selected) return
    try {
      const fd = new FormData(); fd.append('file', file)
      await aideApi.uploadPiece(selected.id, fd)
      const res = await aideApi.getPieces(selected.id); setPieces(res.data)
      toast.current?.show({ severity: 'success', summary: 'Pièce ajoutée', life: 3000 })
    } catch { toast.current?.show({ severity: 'error', summary: 'Erreur upload', life: 3000 }) }
  }

  const consulterPiece = async nom => {
    try {
      const res = await aideApi.telechargerPiece(selected.id, nom)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      window.open(url, '_blank')
    } catch { toast.current?.show({ severity: 'error', summary: 'Erreur', life: 3000 }) }
  }

  const supprimerPiece = async nom => {
    try {
      await aideApi.supprimerPiece(selected.id, nom)
      const res = await aideApi.getPieces(selected.id); setPieces(res.data)
    } catch { toast.current?.show({ severity: 'error', summary: 'Erreur', life: 3000 }) }
  }

  // Stats liées au filtre
  const stats = {
    total:     filtered.length,
    deposees:  filtered.filter(a => a.etat === 'DEPOSEE').length,
    enEtude:   filtered.filter(a => a.etat === 'EN_ETUDE').length,
    validees:  filtered.filter(a => a.etat === 'VALIDEE').length,
    rejetees:  filtered.filter(a => a.etat === 'REJETEE').length,
    montant:   filtered.filter(a => a.etat === 'VALIDEE').reduce((s, a) => s + Number(a.montantAccorde || 0), 0),
  }

  const etatTpl = row => {
    const e = ETATS.find(x => x.value === row.etat)
    return <Tag value={e?.label || row.etat} severity={e?.severity || 'info'} />
  }

  const adherentTpl = row => (
    <div>
      <div className="font-semibold">{row.adherent?.prenom} {row.adherent?.nom}</div>
      <div style={{ fontSize: 11, color: '#94a3b8' }}>{row.adherent?.numeroAdherent}</div>
    </div>
  )

  const montantTpl = row => (
    <div>
      <div style={{ fontSize: 13 }}>{Number(row.montantDemande || 0).toLocaleString('fr-MA')} MAD</div>
      {row.montantAccorde && row.montantAccorde !== row.montantDemande && (
        <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>
          ✓ {Number(row.montantAccorde).toLocaleString('fr-MA')} MAD accordé
        </div>
      )}
    </div>
  )

  const actionsTpl = row => (
    <div className="flex gap-1">
      <Button icon="pi pi-eye" size="small" outlined severity="info"
        tooltip="Détails" tooltipOptions={{ position: 'top' }} onClick={() => openDetail(row)} />
      {row.etat === 'DEPOSEE' && (
        <Button icon="pi pi-times-circle" size="small" outlined severity="danger"
          tooltip="Annuler" tooltipOptions={{ position: 'top' }} onClick={() => annuler(row)} />
      )}
    </div>
  )

  const adherentOptions = adherents.map(a => ({
    label: `${a.prenom} ${a.nom} — ${a.numeroAdherent || '—'}`, value: a.id
  }))
  const typeOptions = typesAide.map(t => ({
    label: `${t.nom}${t.montantMax ? ' (max: ' + Number(t.montantMax).toLocaleString('fr-MA') + ' MAD)' : ''}`,
    value: t.id
  }))

  const wfBureau    = selected?.workflows?.find(w => w.etape === 'AGENT_BUREAU')
  const wfPresident = selected?.workflows?.find(w => w.etape === 'PRESIDENT')

  // Couleur de la bande de progression du workflow
  const etapeLabel = etat => {
    if (etat === 'DEPOSEE')   return { step: 1, label: '① En attente Agent de bureau' }
    if (etat === 'EN_ETUDE')  return { step: 2, label: '② En attente validation Président' }
    if (etat === 'VALIDEE')   return { step: 3, label: '✓ Validée définitivement' }
    if (etat === 'REJETEE')   return { step: 3, label: '✗ Rejetée' }
    return { step: 0, label: 'Annulée' }
  }

  const prog = selected ? etapeLabel(selected.etat) : { step: 0 }

  return (
    <div>
      <Toast ref={toast} /><ConfirmDialog />

      <div className="cdc-page-header">
        <div><h1>Demandes d'Aide</h1><p>Gestion et suivi des demandes d'aide sociale</p></div>
        <Button icon="pi pi-plus" label="Nouvelle Demande"
          onClick={() => { setForm(EMPTY_FORM); setDialogNew(true) }} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(125px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total',     value: stats.total,    color: '#1a73e8', statut: null        },
          { label: 'Déposées',  value: stats.deposees, color: '#0891b2', statut: 'DEPOSEE'   },
          { label: 'En étude',  value: stats.enEtude,  color: '#ea580c', statut: 'EN_ETUDE'  },
          { label: 'Validées',  value: stats.validees, color: '#16a34a', statut: 'VALIDEE'   },
          { label: 'Rejetées',  value: stats.rejetees, color: '#dc2626', statut: 'REJETEE'   },
        ].map(s => (
          <div key={s.label} className="cdc-card"
            style={{ padding: '14px 16px', borderTop: `3px solid ${s.color}`, cursor: 'pointer' }}
            onClick={() => setEtatFilter(s.statut)}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
        <div className="cdc-card" style={{ padding: '14px 16px', borderTop: '3px solid #7c3aed' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#7c3aed', lineHeight: 1.3 }}>
            {stats.montant.toLocaleString('fr-MA')} MAD
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Montant accordé</div>
        </div>
      </div>

      {/* Tableau */}
      <div className="cdc-card">
        <DataTable value={filtered} loading={loading} emptyMessage="Aucune demande d'aide."
          paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
          header={
            <div className="flex justify-content-between align-items-center gap-2 flex-wrap">
              <div className="flex align-items-center gap-2">
                <span>{filtered.length} demande(s)</span>
                {etatFilter && (
                  <Button icon="pi pi-times" size="small" text severity="secondary"
                    label={`Filtre: ${ETATS.find(e => e.value === etatFilter)?.label}`}
                    onClick={() => setEtatFilter(null)} />
                )}
              </div>
              <div className="flex gap-2 align-items-center flex-wrap">
                <Dropdown value={etatFilter} options={ETATS} onChange={e => setEtatFilter(e.value)}
                  placeholder="Tous les états" showClear style={{ fontSize: 13 }} />
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-search" />
                  <InputText value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." />
                </IconField>
              </div>
            </div>
          }>
          <Column field="numeroDemande"  header="N° Demande" sortable style={{ width: 130, fontWeight: 600 }} />
          <Column header="Adhérent"      body={adherentTpl}  style={{ minWidth: 180 }} />
          <Column field="typeAide.nom"   header="Type d'aide" style={{ color: '#64748b' }} />
          <Column header="Montant"       body={montantTpl}   style={{ width: 175 }} />
          <Column field="dateDemande"    header="Date"
            body={r => r.dateDemande ? new Date(r.dateDemande).toLocaleDateString('fr-FR') : '—'}
            style={{ width: 110 }} />
          <Column header="État"          body={etatTpl}      style={{ width: 110 }} />
          <Column field="saisiPar"       header="Saisi par"  style={{ width: 140, fontSize: 12, color: '#94a3b8' }} />
          <Column header="Actions"       body={actionsTpl}   style={{ width: 90 }} />
        </DataTable>
      </div>

      {/* ══ DIALOG NOUVELLE DEMANDE ══ */}
      <Dialog visible={dialogNew} onHide={() => setDialogNew(false)}
        header="Déposer une demande d'aide" style={{ width: 600 }} modal
        footer={
          <div>
            <Button icon="pi pi-times" label="Annuler" outlined onClick={() => setDialogNew(false)} className="mr-2" />
            <Button icon="pi pi-send" label="Déposer la demande" loading={saving} onClick={deposer} />
          </div>
        }>
        <div className="flex flex-column gap-3 pt-3">
          <div className="field">
            <label className="font-semibold">Adhérent *</label>
            <Dropdown value={form.adherentId} options={adherentOptions}
              onChange={e => setForm({ ...form, adherentId: e.value })}
              placeholder="Sélectionner un adhérent..." className="w-full"
              filter filterPlaceholder="Rechercher..." />
          </div>
          <div className="field">
            <label className="font-semibold">Type d'aide *</label>
            <Dropdown value={form.typeAideId} options={typeOptions}
              onChange={e => {
                const t = typesAide.find(x => x.id === e.value)
                setForm({ ...form, typeAideId: e.value,
                  montantDemande: t?.montantMax || form.montantDemande })
              }}
              placeholder="Sélectionner le type d'aide..." className="w-full" />
          </div>
          {/* Conditions du type sélectionné */}
          {form.typeAideId && typesAide.find(t => t.id === form.typeAideId)?.conditions && (
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8,
              padding: 12, fontSize: 13, color: '#1d4ed8' }}>
              <i className="pi pi-info-circle mr-2"></i>
              <strong>Conditions :</strong> {typesAide.find(t => t.id === form.typeAideId).conditions}
            </div>
          )}
          <div className="field">
            <label className="font-semibold">Montant demandé (MAD) *</label>
            <InputNumber value={form.montantDemande}
              onValueChange={e => setForm({ ...form, montantDemande: e.value })}
              mode="decimal" minFractionDigits={2} className="w-full" />
            {form.typeAideId && typesAide.find(t => t.id === form.typeAideId)?.montantMax && (
              <small style={{ color: '#64748b', marginTop: 4, display: 'block' }}>
                Plafond autorisé : {Number(typesAide.find(t => t.id === form.typeAideId).montantMax).toLocaleString('fr-MA')} MAD
              </small>
            )}
          </div>
          <div className="field">
            <label className="font-semibold">Motif de la demande *</label>
            <InputTextarea value={form.motif} onChange={e => setForm({ ...form, motif: e.target.value })}
              rows={4} className="w-full" autoResize
              placeholder="Décrivez en détail la situation et le besoin..." />
          </div>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12, fontSize: 13, color: '#15803d' }}>
            <i className="pi pi-info-circle mr-2"></i>
            La demande sera transmise à l'Agent de bureau pour étude puis au Président pour validation finale.
          </div>
        </div>
      </Dialog>

      {/* ══ DIALOG DÉTAIL ══ */}
      <Dialog visible={dialogDetail} onHide={() => setDialogDetail(false)}
        header={selected ? `${selected.numeroDemande} — ${selected.adherent?.prenom} ${selected.adherent?.nom}` : ''}
        style={{ width: 860 }} modal maximizable
        footer={
          <div className="flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="flex gap-2 flex-wrap">
              {/* Étape 1 : Agent de bureau */}
              {selected?.etat === 'DEPOSEE' && wfBureau?.decision === 'EN_ATTENTE' && (
                <Button icon="pi pi-check" label="Décision Agent de bureau"
                  severity="warning" onClick={() => ouvrirDecision('AGENT_BUREAU')} />
              )}
              {/* Étape 2 : Président */}
              {selected?.etat === 'EN_ETUDE' && wfPresident?.decision === 'EN_ATTENTE' && (
                <Button icon="pi pi-verified" label="Validation Président"
                  severity="help" onClick={() => ouvrirDecision('PRESIDENT')} />
              )}
              {/* Virement */}
              {selected?.etat === 'VALIDEE' && !selected?.virement && (
                <Button icon="pi pi-credit-card" label="Enregistrer Virement"
                  severity="success"
                  onClick={() => {
                    setVirementForm({
                      ...EMPTY_VIREMENT,
                      beneficiaire: `${selected.adherent?.prenom} ${selected.adherent?.nom}`,
                      montant: selected.montantAccorde
                    })
                    setDialogVirement(true)
                  }} />
              )}
              {/* Annuler */}
              {selected?.etat === 'DEPOSEE' && (
                <Button icon="pi pi-times" label="Annuler" severity="danger" outlined
                  onClick={() => annuler(selected)} />
              )}
            </div>
            <Button icon="pi pi-times" label="Fermer" outlined onClick={() => setDialogDetail(false)} />
          </div>
        }>

        {selected && (
          <TabView activeIndex={detailTab} onTabChange={e => setDetailTab(e.index)}>

            {/* ── Détails ── */}
            <TabPanel header="Détails" leftIcon="pi pi-file mr-2">
              {/* Barre de progression workflow */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  {[
                    { step: 1, label: 'Déposée',    done: true                        },
                    { step: 2, label: 'Agent bureau',done: ['EN_ETUDE','VALIDEE','REJETEE'].includes(selected.etat) },
                    { step: 3, label: 'Président',   done: ['VALIDEE','REJETEE'].includes(selected.etat) },
                  ].map((s, i) => (
                    <div key={s.step} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', border: '2px solid',
                          borderColor: s.done ? '#16a34a' : '#cbd5e1',
                          background: s.done ? '#16a34a' : 'white',
                          color: s.done ? 'white' : '#94a3b8',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 13
                        }}>
                          {s.done ? <i className="pi pi-check" style={{ fontSize: 12 }}></i> : s.step}
                        </div>
                        <div style={{ fontSize: 11, color: s.done ? '#16a34a' : '#94a3b8', marginTop: 4, whiteSpace: 'nowrap' }}>
                          {s.label}
                        </div>
                      </div>
                      {i < 2 && <div style={{ flex: 1, height: 2, background: s.done ? '#16a34a' : '#e2e8f0', margin: '0 4px', marginBottom: 18 }}></div>}
                    </div>
                  ))}
                </div>
                {/* Étiquette état courant */}
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <Tag value={prog.label}
                    severity={ETATS.find(e => e.value === selected.etat)?.severity || 'info'} />
                </div>
              </div>

              <Divider className="my-2" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
                {[
                  { label: 'N° Demande',      value: selected.numeroDemande },
                  { label: 'Saisi par',        value: selected.saisiPar || '—' },
                  { label: 'Adhérent',         value: `${selected.adherent?.prenom} ${selected.adherent?.nom}` },
                  { label: 'N° Adhérent',      value: selected.adherent?.numeroAdherent || '—' },
                  { label: "Type d'aide",      value: selected.typeAide?.nom },
                  { label: 'Montant demandé',  value: `${Number(selected.montantDemande||0).toLocaleString('fr-MA')} MAD` },
                  { label: 'Montant accordé',  value: selected.montantAccorde ? `${Number(selected.montantAccorde).toLocaleString('fr-MA')} MAD` : '—' },
                  { label: 'Date demande',     value: selected.dateDemande ? new Date(selected.dateDemande).toLocaleDateString('fr-FR') : '—' },
                  { label: 'Date traitement',  value: selected.dateTraitement ? new Date(selected.dateTraitement).toLocaleDateString('fr-FR') : '—' },
                  { label: 'État',             value: <Tag value={ETATS.find(e=>e.value===selected.etat)?.label||selected.etat} severity={ETATS.find(e=>e.value===selected.etat)?.severity} /> },
                ].map(item => (
                  <div key={item.label} style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, background: '#f8fafc', borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Motif</div>
                <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>{selected.motif}</div>
              </div>
            </TabPanel>

            {/* ── Workflow ── */}
            <TabPanel header="Workflow" leftIcon="pi pi-sitemap mr-2">
              <div className="flex flex-column gap-3">
                {selected.workflows?.map(wf => (
                  <div key={wf.id} style={{
                    border: '1px solid #e2e8f0', borderRadius: 10, padding: 18,
                    borderLeft: `4px solid ${
                      wf.decision === 'APPROUVE' ? '#16a34a' :
                      wf.decision === 'REJETE'   ? '#dc2626' : '#94a3b8'}`
                  }}>
                    <div className="flex justify-content-between align-items-start">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                          Étape {wf.ordre} — {wf.etape === 'AGENT_BUREAU' ? 'Agent de bureau' : 'Président'}
                        </div>
                        {wf.validePar && (
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            Traité par : <strong>{wf.validePar}</strong>
                            {wf.dateDecision && <span> — {new Date(wf.dateDecision).toLocaleString('fr-FR')}</span>}
                          </div>
                        )}
                        {!wf.validePar && (
                          <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
                            {wf.ordre === 1 ? 'En attente de l\'agent de bureau'
                              : 'En attente de la validation du Président'}
                          </div>
                        )}
                        {wf.montantPropose && (
                          <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4, fontWeight: 600 }}>
                            Montant proposé : {Number(wf.montantPropose).toLocaleString('fr-MA')} MAD
                          </div>
                        )}
                      </div>
                      <Tag
                        value={wf.decision === 'EN_ATTENTE' ? 'En attente' : wf.decision === 'APPROUVE' ? 'Approuvé' : 'Rejeté'}
                        severity={wf.decision === 'APPROUVE' ? 'success' : wf.decision === 'REJETE' ? 'danger' : 'secondary'} />
                    </div>
                    {wf.commentaire && (
                      <div style={{ marginTop: 10, background: '#f8fafc', borderRadius: 6, padding: '8px 12px',
                        fontSize: 13, color: '#64748b', borderLeft: '3px solid #e2e8f0' }}>
                        <i className="pi pi-comment mr-2" style={{ color: '#94a3b8' }}></i>{wf.commentaire}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabPanel>

            {/* ── Virement ── */}
            <TabPanel header="Virement" leftIcon="pi pi-credit-card mr-2">
              {selected.virement ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
                  {[
                    { label: 'Bénéficiaire',  value: selected.virement.beneficiaire },
                    { label: 'Montant',       value: `${Number(selected.virement.montant||0).toLocaleString('fr-MA')} MAD` },
                    { label: 'Motif',         value: selected.virement.motif || '—' },
                    { label: 'Référence',     value: selected.virement.referenceVirement || '—' },
                    { label: 'RIB',           value: selected.virement.ribBeneficiaire || '—' },
                    { label: 'Date virement', value: selected.virement.dateVirement ? new Date(selected.virement.dateVirement).toLocaleDateString('fr-FR') : '—' },
                  ].map(item => (
                    <div key={item.label} style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  <i className="pi pi-credit-card" style={{ fontSize: 36, display: 'block', marginBottom: 10 }}></i>
                  <div style={{ fontSize: 14 }}>
                    {selected.etat === 'VALIDEE'
                      ? 'Aucun virement enregistré — cliquez sur "Enregistrer Virement" ci-dessous.'
                      : 'Le virement sera disponible après validation définitive par le Président.'}
                  </div>
                </div>
              )}
            </TabPanel>

            {/* ── Pièces jointes ── */}
            <TabPanel header={`Pièces (${pieces.length})`} leftIcon="pi pi-paperclip mr-2">
              <div className="flex flex-column gap-3">
                <FileUpload mode="basic" name="file" maxFileSize={5000000}
                  customUpload uploadHandler={uploadPiece} auto
                  chooseLabel="Ajouter une pièce justificative" />
                {pieces.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: 13 }}>
                    Aucune pièce jointe
                  </div>
                ) : (
                  <div className="flex flex-column gap-2">
                    {pieces.map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <div className="flex align-items-center gap-2">
                          <i className="pi pi-file" style={{ color: '#64748b', fontSize: 16 }}></i>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{p.nom}</div>
                            {p.taille && <div style={{ fontSize: 11, color: '#94a3b8' }}>{Math.round(p.taille / 1024)} Ko</div>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button icon="pi pi-eye"   size="small" outlined severity="info"
                            tooltip="Consulter" onClick={() => consulterPiece(p.nom)} />
                          <Button icon="pi pi-trash" size="small" outlined severity="danger"
                            tooltip="Supprimer"
                            onClick={() => confirmDialog({
                              message: `Supprimer "${p.nom}" ?`, header: 'Confirmation',
                              icon: 'pi pi-exclamation-triangle',
                              acceptLabel: 'Supprimer', rejectLabel: 'Annuler', acceptClassName: 'p-button-danger',
                              accept: () => supprimerPiece(p.nom)
                            })} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabPanel>
          </TabView>
        )}
      </Dialog>

      {/* ══ DIALOG DÉCISION ══ */}
      <Dialog visible={dialogDecision} onHide={() => setDialogDecision(false)}
        header={etapeDecision === 'AGENT_BUREAU' ? '📋 Décision — Agent de bureau' : '🏛️ Validation finale — Président'}
        style={{ width: 500 }} modal
        footer={
          <div>
            <Button icon="pi pi-times" label="Annuler" outlined onClick={() => setDialogDecision(false)} className="mr-2" />
            <Button icon="pi pi-check" label="Confirmer la décision" loading={saving}
              onClick={soumettreDecision}
              severity={decisionForm.decision === 'REJETE' ? 'danger' : 'success'} />
          </div>
        }>
        <div className="flex flex-column gap-3 pt-3">
          {/* Résumé demande */}
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: 14, fontSize: 13 }}>
            <div className="flex justify-content-between mb-2">
              <span style={{ color: '#64748b' }}>Demande</span>
              <strong>{selected?.numeroDemande}</strong>
            </div>
            <div className="flex justify-content-between mb-2">
              <span style={{ color: '#64748b' }}>Adhérent</span>
              <strong>{selected?.adherent?.prenom} {selected?.adherent?.nom}</strong>
            </div>
            <div className="flex justify-content-between mb-2">
              <span style={{ color: '#64748b' }}>Type</span>
              <strong>{selected?.typeAide?.nom}</strong>
            </div>
            <div className="flex justify-content-between">
              <span style={{ color: '#64748b' }}>Montant demandé</span>
              <strong style={{ color: '#1a73e8' }}>{Number(selected?.montantDemande||0).toLocaleString('fr-MA')} MAD</strong>
            </div>
            {etapeDecision === 'PRESIDENT' && wfBureau?.montantPropose && (
              <div className="flex justify-content-between mt-2" style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8 }}>
                <span style={{ color: '#64748b' }}>Proposé par agent</span>
                <strong style={{ color: '#16a34a' }}>{Number(wfBureau.montantPropose).toLocaleString('fr-MA')} MAD</strong>
              </div>
            )}
          </div>

          {/* Choix décision */}
          <div className="field">
            <label className="font-semibold">Décision *</label>
            <div className="flex gap-2 mt-2">
              <Button label="✓ Approuver" severity="success"
                outlined={decisionForm.decision !== 'APPROUVE'}
                className="flex-1" style={{ height: 44 }}
                onClick={() => setDecisionForm({...decisionForm, decision: 'APPROUVE'})} />
              <Button label="✗ Rejeter" severity="danger"
                outlined={decisionForm.decision !== 'REJETE'}
                className="flex-1" style={{ height: 44 }}
                onClick={() => setDecisionForm({...decisionForm, decision: 'REJETE'})} />
            </div>
          </div>

          {/* Montant accordé : agent bureau propose, président peut ajuster */}
          {decisionForm.decision === 'APPROUVE' && (
            <div className="field">
              <label className="font-semibold">
                {etapeDecision === 'AGENT_BUREAU' ? 'Montant proposé (MAD)' : 'Montant accordé final (MAD)'}
              </label>
              <InputNumber value={decisionForm.montantAccorde}
                onValueChange={e => setDecisionForm({...decisionForm, montantAccorde: e.value})}
                mode="decimal" minFractionDigits={2} className="w-full"
                placeholder={`Demandé : ${Number(selected?.montantDemande||0).toLocaleString('fr-MA')} MAD`} />
            </div>
          )}

          {/* Commentaire */}
          <div className="field">
            <label className="font-semibold">
              {decisionForm.decision === 'REJETE' ? 'Motif du rejet *' : 'Commentaire'}
            </label>
            <InputTextarea value={decisionForm.commentaire}
              onChange={e => setDecisionForm({...decisionForm, commentaire: e.target.value})}
              rows={3} className="w-full" autoResize
              placeholder={decisionForm.decision === 'REJETE' ? 'Précisez le motif du rejet...' : 'Observations éventuelles...'} />
          </div>
        </div>
      </Dialog>

      {/* ══ DIALOG VIREMENT ══ */}
      <Dialog visible={dialogVirement} onHide={() => setDialogVirement(false)}
        header="Enregistrer le virement" style={{ width: 540 }} modal
        footer={
          <div>
            <Button icon="pi pi-times" label="Annuler" outlined onClick={() => setDialogVirement(false)} className="mr-2" />
            <Button icon="pi pi-check" label="Enregistrer" loading={saving}
              onClick={soumettreVirement} severity="success" />
          </div>
        }>
        <div className="flex flex-column gap-3 pt-3">
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8,
            padding: 12, fontSize: 13, color: '#15803d' }}>
            Montant accordé : <strong>{Number(selected?.montantAccorde||0).toLocaleString('fr-MA')} MAD</strong>
          </div>
          <div className="formgrid grid">
            <div className="field col">
              <label className="font-semibold">Bénéficiaire *</label>
              <InputText value={virementForm.beneficiaire}
                onChange={e => setVirementForm({...virementForm, beneficiaire: e.target.value})} className="w-full" />
            </div>
            <div className="field col">
              <label className="font-semibold">Montant (MAD) *</label>
              <InputNumber value={virementForm.montant}
                onValueChange={e => setVirementForm({...virementForm, montant: e.value})}
                mode="decimal" minFractionDigits={2} className="w-full" />
            </div>
          </div>
          <div className="field">
            <label className="font-semibold">RIB Bénéficiaire</label>
            <InputText value={virementForm.ribBeneficiaire}
              onChange={e => setVirementForm({...virementForm, ribBeneficiaire: e.target.value})}
              placeholder="024 XXXX XXXXXXXXXX XX" className="w-full" />
          </div>
          <div className="formgrid grid">
            <div className="field col">
              <label className="font-semibold">Référence virement</label>
              <InputText value={virementForm.referenceVirement}
                onChange={e => setVirementForm({...virementForm, referenceVirement: e.target.value})} className="w-full" />
            </div>
            <div className="field col">
              <label className="font-semibold">Date du virement</label>
              <Calendar value={virementForm.dateVirement}
                onChange={e => setVirementForm({...virementForm, dateVirement: e.value})}
                dateFormat="dd/mm/yy" showIcon className="w-full" />
            </div>
          </div>
          <div className="field">
            <label className="font-semibold">Motif</label>
            <InputText value={virementForm.motif}
              onChange={e => setVirementForm({...virementForm, motif: e.target.value})} className="w-full" />
          </div>
        </div>
      </Dialog>
    </div>
  )
}