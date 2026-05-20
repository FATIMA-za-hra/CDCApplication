import { useState, useEffect, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { Calendar } from 'primereact/calendar'
import { Dropdown } from 'primereact/dropdown'
import { Toast } from 'primereact/toast'
import { Tag } from 'primereact/tag'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import api from '../services/api'

const virementApi = {
  getAll:   (statut) => api.get('/virements', { params: statut ? { statut } : {} }),
  create:   (data)   => api.post('/virements', data),
  executer: (id)     => api.patch(`/virements/${id}/executer`),
  annuler:  (id)     => api.patch(`/virements/${id}/annuler`),
}

const adherentApi = { getAll: () => api.get('/adherents') }

const STATUTS = [
  { label: 'En attente', value: 'EN_ATTENTE', severity: 'warning'  },
  { label: 'Exécuté',    value: 'EXECUTE',    severity: 'success'  },
  { label: 'Annulé',     value: 'ANNULE',     severity: 'secondary'},
]

const EMPTY = {
  adherentId: null, beneficiaire: '', montant: null,
  referenceVirement: '', dateVirement: new Date(),
  ribBeneficiaire: '', aideId: null
}

export default function VirementPage() {
  const [virements, setVirements]   = useState([])
  const [adherents, setAdherents]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [filtreStatut, setFiltreStatut] = useState(null)
  const [search, setSearch]         = useState('')
  const [dialog, setDialog]         = useState(false)
  const [detailDialog, setDetailDialog] = useState(false)
  const [selectedVirement, setSelectedVirement] = useState(null)
  const [form, setForm]             = useState(EMPTY)
  const [saving, setSaving]         = useState(false)
  // Pour le confirm inline — évite le double dialog
  const [confirmState, setConfirmState] = useState(null) // { type, virement }
  const toast = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const [v, adh] = await Promise.all([virementApi.getAll(), adherentApi.getAll()])
      setVirements(v.data || [])
      setAdherents(adh.data || [])
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erreur',
        detail: 'Chargement impossible', life: 3000 })
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  // ── Aides de l'adhérent sélectionné (VALIDÉES seulement) ──
  const adherentSelectionne = adherents.find(a => a.id === form.adherentId)
  const aidesAdherent = (selectedVirement
    ? [] // en lecture seule dans le détail
    : []
  ) // chargées dynamiquement ci-dessous

  const [aidesAdherentList, setAidesAdherentList] = useState([])

  // Quand l'adhérent change → charger ses aides validées
  useEffect(() => {
    if (!form.adherentId) { setAidesAdherentList([]); return }
    api.get('/aides', { params: { adherentId: form.adherentId } })
      .then(r => setAidesAdherentList((r.data || []).filter(a => a.etat === 'VALIDEE')))
      .catch(() => setAidesAdherentList([]))
  }, [form.adherentId])

  const creer = async () => {
    if (!form.adherentId || !form.montant) {
      toast.current?.show({ severity: 'warn', summary: 'Attention',
        detail: 'Bénéficiaire et montant obligatoires', life: 3000 }); return
    }
    setSaving(true)
    try {
      await virementApi.create({
        ...form,
        dateVirement: form.dateVirement?.toISOString().split('T')[0]
      })
      toast.current?.show({ severity: 'success', summary: 'Virement créé', life: 3000 })
      setDialog(false); setForm(EMPTY); load()
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erreur',
        detail: e.response?.data?.message || 'Erreur', life: 4000 })
    } finally { setSaving(false) }
  }

  // ── Confirm inline (évite le double dialog de PrimeReact) ──
  const demanderConfirm = (type, v) => setConfirmState({ type, virement: v })

  const executerConfirme = async () => {
    const v = confirmState.virement
    setConfirmState(null)
    try {
      await virementApi.executer(v.id)
      load()
      toast.current?.show({ severity: 'success', summary: 'Virement exécuté', life: 3000 })
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erreur',
        detail: e.response?.data?.message || 'Erreur', life: 4000 })
    }
  }

  const annulerConfirme = async () => {
    const v = confirmState.virement
    setConfirmState(null)
    try {
      await virementApi.annuler(v.id)
      load()
      toast.current?.show({ severity: 'success', summary: 'Virement annulé', life: 3000 })
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erreur',
        detail: e.response?.data?.message || 'Erreur', life: 4000 })
    }
  }

  const filtered = virements.filter(v => {
    const s = !filtreStatut || v.statut === filtreStatut
    const q = !search.trim() || [v.beneficiaire, v.aideNumero, v.adherentNom, v.referenceVirement]
      .some(x => x?.toLowerCase().includes(search.toLowerCase()))
    return s && q
  })

  const stats = {
    enAttente: virements.filter(v => v.statut === 'EN_ATTENTE')
      .reduce((s, v) => s + Number(v.montant || 0), 0),
    execute: virements.filter(v => v.statut === 'EXECUTE')
      .reduce((s, v) => s + Number(v.montant || 0), 0),
  }

  const statutTpl  = v => { const s = STATUTS.find(x => x.value === v.statut)
    return <Tag value={s?.label || v.statut} severity={s?.severity || 'info'} /> }
  const montantTpl = v => (
    <span style={{ fontWeight: 700, color: '#1a73e8' }}>
      {Number(v.montant || 0).toLocaleString('fr-MA')} MAD
    </span>
  )

  // Actions : Voir détail + Exécuter + Annuler
  const actionsTpl = v => (
    <div className="flex gap-1">
      <Button icon="pi pi-eye" size="small" outlined
        tooltip="Détails" tooltipOptions={{ position: 'top' }}
        onClick={() => { setSelectedVirement(v); setDetailDialog(true) }} />
      {v.statut === 'EN_ATTENTE' && (
        <>
          <Button icon="pi pi-check" size="small" outlined severity="success"
            tooltip="Exécuter" tooltipOptions={{ position: 'top' }}
            onClick={() => demanderConfirm('executer', v)} />
          <Button icon="pi pi-times" size="small" outlined severity="danger"
            tooltip="Annuler" tooltipOptions={{ position: 'top' }}
            onClick={() => demanderConfirm('annuler', v)} />
        </>
      )}
    </div>
  )

  return (
    <div>
      <Toast ref={toast} />

      {/* ── CONFIRM INLINE — évite le double dialog PrimeReact ── */}
      {confirmState && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1200,
          background: 'rgba(0,0,0,0.45)', display: 'flex',
          alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 10, padding: '28px 32px',
            width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <i className={`pi ${confirmState.type === 'executer' ? 'pi-check-circle' : 'pi-exclamation-triangle'}`}
                style={{ fontSize: 24, color: confirmState.type === 'executer' ? '#16a34a' : '#dc2626' }}></i>
              <span style={{ fontWeight: 700, fontSize: 16 }}>
                {confirmState.type === 'executer' ? 'Exécuter le virement' : 'Annuler le virement'}
              </span>
            </div>
            <div style={{ color: '#64748b', marginBottom: 24, fontSize: 14 }}>
              {confirmState.type === 'executer'
                ? `Exécuter le virement de ${Number(confirmState.virement.montant).toLocaleString('fr-MA')} MAD à ${confirmState.virement.beneficiaire} ?`
                : `Annuler ce virement de ${Number(confirmState.virement.montant).toLocaleString('fr-MA')} MAD ?`
              }
            </div>
            <div className="flex justify-content-end gap-2">
              <Button label="Non" outlined onClick={() => setConfirmState(null)} />
              <Button
                label={confirmState.type === 'executer' ? 'Exécuter' : 'Annuler le virement'}
                severity={confirmState.type === 'executer' ? 'success' : 'danger'}
                onClick={confirmState.type === 'executer' ? executerConfirme : annulerConfirme}
              />
            </div>
          </div>
        </div>
      )}

      <div className="cdc-page-header">
        <div><h1>Virements</h1><p>Suivi et exécution des virements</p></div>
        <Button icon="pi pi-plus" label="Nouveau Virement"
          onClick={() => { setForm(EMPTY); setAidesAdherentList([]); setDialog(true) }} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total',           value: virements.length,                                     color: '#1a73e8' },
          { label: 'En attente',      value: virements.filter(v=>v.statut==='EN_ATTENTE').length,  color: '#ea580c' },
          { label: 'Exécutés',        value: virements.filter(v=>v.statut==='EXECUTE').length,     color: '#16a34a' },
          { label: 'Montant exécuté', value: `${stats.execute.toLocaleString('fr-MA')} MAD`,      color: '#7c3aed', small: true },
          { label: 'En attente MAD',  value: `${stats.enAttente.toLocaleString('fr-MA')} MAD`,    color: '#ea580c', small: true },
        ].map(s => (
          <div key={s.label} className="cdc-card"
            style={{ padding: '14px 16px', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: s.small ? 13 : 22, fontWeight: 700, color: s.color }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        {STATUTS.map(s => (
          <Button key={s.value} label={s.label} size="small"
            outlined={filtreStatut !== s.value} severity={s.severity}
            onClick={() => setFiltreStatut(filtreStatut === s.value ? null : s.value)} />
        ))}
        {filtreStatut && (
          <Button icon="pi pi-times" size="small" text onClick={() => setFiltreStatut(null)} />
        )}
        <IconField iconPosition="left" style={{ marginLeft: 'auto' }}>
          <InputIcon className="pi pi-search" />
          <InputText value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..." />
        </IconField>
      </div>

      {/* Tableau — colonnes essentielles uniquement */}
      <div className="cdc-card">
        <DataTable value={filtered} loading={loading} emptyMessage="Aucun virement."
          paginator rows={10} rowsPerPageOptions={[10, 25]}>
          <Column field="beneficiaire" header="Bénéficiaire" sortable style={{ fontWeight: 600 }} />
          <Column header="Montant"     body={montantTpl}     style={{ width: 140 }} />
          <Column field="dateVirement" header="Date"
            body={v => v.dateVirement
              ? new Date(v.dateVirement).toLocaleDateString('fr-FR') : '—'}
            style={{ width: 110 }} />
          <Column field="aideNumero"   header="Aide liée"
            body={v => v.aideNumero
              ? <Tag value={v.aideNumero} severity="info" style={{ fontSize: 10 }} /> : '—'}
            style={{ width: 110 }} />
          <Column header="Statut"      body={statutTpl}      style={{ width: 110 }} />
          <Column header="Actions"     body={actionsTpl}     style={{ width: 120 }} />
        </DataTable>
      </div>

      {/* ── DIALOG DÉTAIL ── */}
      <Dialog visible={detailDialog} onHide={() => setDetailDialog(false)}
        header="Détails du virement" style={{ width: 520 }} modal
        footer={<Button label="Fermer" outlined onClick={() => setDetailDialog(false)} />}>
        {selectedVirement && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { label: 'Bénéficiaire',    value: selectedVirement.beneficiaire },
              { label: 'Adhérent',        value: selectedVirement.adherentNom },
              { label: 'Montant',         value: `${Number(selectedVirement.montant||0).toLocaleString('fr-MA')} MAD` },
              { label: 'RIB',             value: selectedVirement.ribBeneficiaire || '—' },
              { label: 'Référence',       value: selectedVirement.referenceVirement || '—' },
              { label: 'Date prévue',     value: selectedVirement.dateVirement
                ? new Date(selectedVirement.dateVirement).toLocaleDateString('fr-FR') : '—' },
              { label: 'Aide liée',       value: selectedVirement.aideNumero || '—' },
              { label: 'Statut',          value: selectedVirement.statut },
              { label: 'Exécuté par',     value: selectedVirement.executePar || '—' },
              { label: "Date d'exécution", value: selectedVirement.dateExecution
                ? new Date(selectedVirement.dateExecution).toLocaleDateString('fr-FR') : '—' },
            ].map((row, i) => (
              <div key={row.label} style={{
                display: 'flex', padding: '10px 0',
                borderBottom: '1px solid #f1f5f9',
                background: i % 2 === 0 ? 'white' : '#fafafa'
              }}>
                <div style={{ width: 150, color: '#94a3b8', fontSize: 13, flexShrink: 0 }}>
                  {row.label}
                </div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </Dialog>

      {/* ── DIALOG CRÉATION ── */}
      <Dialog visible={dialog} onHide={() => setDialog(false)}
        header="Nouveau virement" style={{ width: 540 }} modal
        footer={
          <div>
            <Button icon="pi pi-times" label="Annuler" outlined
              onClick={() => setDialog(false)} className="mr-2" />
            <Button icon="pi pi-send" label="Créer" loading={saving} onClick={creer} />
          </div>
        }>
        <div className="flex flex-column gap-3 pt-3">

          {/* Bénéficiaire — seulement Nom Prénom */}
          <div className="field">
            <label className="font-semibold">Bénéficiaire *</label>
            <Dropdown
              value={form.adherentId}
              options={adherents.map(a => ({
                label: `${a.prenom} ${a.nom}`,  // Nom Prénom uniquement
                value: a.id
              }))}
              onChange={e => {
                const adh = adherents.find(a => a.id === e.value)
                setForm({
                  ...form,
                  adherentId: e.value,
                  beneficiaire: adh ? `${adh.prenom} ${adh.nom}` : '',
                  ribBeneficiaire: adh?.rib || '',
                  aideId: null  // reset aide quand on change d'adhérent
                })
              }}
              filter showClear filterPlaceholder="Rechercher un adhérent..."
              placeholder="Sélectionner un adhérent..."
              className="w-full"
            />
          </div>

          {/* RIB auto-rempli + Montant */}
          <div className="formgrid grid">
            <div className="field col">
              <label className="font-semibold">RIB</label>
              <InputText value={form.ribBeneficiaire}
                onChange={e => setForm({...form, ribBeneficiaire: e.target.value})}
                placeholder="Auto-rempli depuis le profil"
                className="w-full" />
            </div>
            <div className="field col">
              <label className="font-semibold">Montant (MAD) *</label>
              <InputNumber value={form.montant}
                onValueChange={e => setForm({...form, montant: e.value})}
                mode="decimal" minFractionDigits={2} className="w-full" />
            </div>
          </div>

          {/* Référence + Date */}
          <div className="formgrid grid">
            <div className="field col">
              <label className="font-semibold">Référence</label>
              <InputText value={form.referenceVirement}
                onChange={e => setForm({...form, referenceVirement: e.target.value})}
                className="w-full" />
            </div>
            <div className="field col">
              <label className="font-semibold">Date prévue</label>
              <Calendar value={form.dateVirement}
                onChange={e => setForm({...form, dateVirement: e.value})}
                dateFormat="dd/mm/yy" showIcon className="w-full" />
            </div>
          </div>

          {/* Aide liée — seulement les aides de CET adhérent */}
          <div className="field">
            <label className="font-semibold">Aide sociale liée</label>
            {!form.adherentId ? (
              <div style={{ color: '#94a3b8', fontSize: 13, padding: '8px 12px',
                background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                Sélectionnez d'abord un adhérent pour voir ses aides validées
              </div>
            ) : aidesAdherentList.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: 13, padding: '8px 12px',
                background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                Aucune aide validée pour cet adhérent
              </div>
            ) : (
              <Dropdown
                value={form.aideId}
                options={aidesAdherentList.map(a => ({
                  label: `${a.numeroDemande} — ${a.typeAide?.nom || '—'} — ${Number(a.montantAccorde || 0).toLocaleString('fr-MA')} MAD`,
                  value: a.id
                }))}
                onChange={e => setForm({...form, aideId: e.value})}
                placeholder="Associer à une aide (optionnel)"
                showClear className="w-full"
              />
            )}
            <small style={{ color: '#94a3b8' }}>
              Optionnel — lie ce virement à la demande d'aide pour le suivi.
            </small>
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 8, padding: 12, fontSize: 13, color: '#15803d' }}>
            <i className="pi pi-info-circle mr-2"></i>
            Créé à l'état <strong>En attente</strong> — cliquez ✓ pour exécuter.
          </div>
        </div>
      </Dialog>
    </div>
  )
}