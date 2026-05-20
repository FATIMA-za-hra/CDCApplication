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
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Tag } from 'primereact/tag'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import api from '../services/api'

// ── Il existe UNE SEULE caisse dans le système ──
const caisseApi = {
  get:              ()    => api.get('/caisse'),           // GET /caisse → retourne la première caisse ou null
  ouvrir:           (id)  => api.patch(`/caisse/${id}/ouvrir`),
  fermer:           (id)  => api.patch(`/caisse/${id}/fermer`),
  getOperations:    (id, d, f) => api.get(`/caisse/${id}/operations`,
                      { params: { debut: d, fin: f } }),
  creerOperation:   (data) => api.post('/caisse/operations', data),
  supprimerOperation: (id) => api.delete(`/caisse/operations/${id}`),
}

const aideApi = { getAll: () => api.get('/aides') }

const CATEGORIES_ENTREE = [
  { label: 'Cotisation adhésion',  value: 'COTISATION'    },
  { label: 'Don / Subvention',     value: 'DON'           },
  { label: 'Remboursement',        value: 'REMBOURSEMENT' },
  { label: 'Autre entrée',         value: 'AUTRE_ENTREE'  },
]

const CATEGORIES_SORTIE = [
  { label: 'Virement aide sociale', value: 'VIREMENT_AIDE' },
  { label: 'Frais administratifs',  value: 'FRAIS_ADMIN'   },
  { label: 'Achat matériel',        value: 'ACHAT'         },
  { label: 'Autre dépense',         value: 'AUTRE_SORTIE'  },
]

const EMPTY_OP = {
  type: 'ENTREE', montant: null, date: new Date(),
  categorie: '', justificatif: '', aideId: null
}

export default function CaissePage() {
  const [caisse, setCaisse]         = useState(null)   // ← une seule caisse
  const [operations, setOperations] = useState([])
  const [aides, setAides]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [loadingOps, setLoadingOps] = useState(false)
  const [dialogOp, setDialogOp]     = useState(false)
  const [formOp, setFormOp]         = useState(EMPTY_OP)
  const [saving, setSaving]         = useState(false)
  const [filtreDebut, setFiltreDebut] = useState(null)
  const [filtreFin, setFiltreFin]     = useState(null)
  const [searchOp, setSearchOp]       = useState('')
  const toast = useRef(null)

  // ── Charge la caisse unique ──
  const load = async () => {
    setLoading(true)
    try {
      const [rc, ra] = await Promise.all([caisseApi.get(), aideApi.getAll()])
      // L'API retourne une liste — on prend la première
      const list = Array.isArray(rc.data) ? rc.data : [rc.data]
      const c = list[0] || null
      setCaisse(c)
      setAides((ra.data || []).filter(a => a.etat === 'VALIDEE'))
      if (c) await loadOps(c, null, null)
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erreur',
        detail: 'Chargement impossible', life: 3000 })
    } finally { setLoading(false) }
  }

  const loadOps = async (c, debut, fin) => {
    if (!c) return
    setLoadingOps(true)
    try {
      const d = debut ? debut.toISOString().split('T')[0] : null
      const f = fin   ? fin.toISOString().split('T')[0]   : null
      const r = await caisseApi.getOperations(c.id, d, f)
      setOperations(r.data || [])
    } catch { setOperations([]) }
    finally { setLoadingOps(false) }
  }

  useEffect(() => { load() }, [])

  // ── Ouvrir / Fermer ──
  const toggleCaisse = async () => {
    if (!caisse) return
    try {
      const fn = caisse.statut === 'OUVERTE' ? caisseApi.fermer : caisseApi.ouvrir
      const r  = await fn(caisse.id)
      setCaisse(r.data)
      toast.current?.show({
        severity: 'success',
        summary: r.data.statut === 'OUVERTE' ? 'Caisse ouverte' : 'Caisse fermée',
        life: 3000
      })
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erreur',
        detail: e.response?.data?.message || 'Erreur', life: 4000 })
    }
  }

  // ── Enregistrer une opération ──
  const enregistrerOp = async () => {
    if (!formOp.montant || !formOp.categorie) {
      toast.current?.show({ severity: 'warn', summary: 'Attention',
        detail: 'Montant et catégorie obligatoires', life: 3000 }); return
    }
    setSaving(true)
    try {
      await caisseApi.creerOperation({
        ...formOp,
        caisseId: caisse.id,
        date: formOp.date ? formOp.date.toISOString().split('T')[0] : null
      })
      toast.current?.show({ severity: 'success', summary: 'Opération enregistrée', life: 3000 })
      setDialogOp(false); setFormOp(EMPTY_OP)
      // Rafraîchir solde
      const r = await caisseApi.get()
      const list = Array.isArray(r.data) ? r.data : [r.data]
      setCaisse(list[0] || null)
      await loadOps(caisse, filtreDebut, filtreFin)
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erreur',
        detail: e.response?.data?.message || 'Erreur', life: 4000 })
    } finally { setSaving(false) }
  }

  // ── Supprimer une opération ──
  const supprimerOp = op => confirmDialog({
    message: `Supprimer cette opération de ${Number(op.montant).toLocaleString('fr-MA')} MAD ?`,
    header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Supprimer', rejectLabel: 'Annuler', acceptClassName: 'p-button-danger',
    accept: async () => {
      try {
        await caisseApi.supprimerOperation(op.id)
        const r = await caisseApi.get()
        const list = Array.isArray(r.data) ? r.data : [r.data]
        setCaisse(list[0] || null)
        await loadOps(caisse, filtreDebut, filtreFin)
        toast.current?.show({ severity: 'success', summary: 'Opération supprimée', life: 3000 })
      } catch (e) {
        toast.current?.show({ severity: 'error', summary: 'Erreur',
          detail: e.response?.data?.message || 'Erreur', life: 4000 })
      }
    }
  })

  const filtered = operations.filter(op => {
    if (!searchOp.trim()) return true
    const q = searchOp.toLowerCase()
    return op.categorie?.toLowerCase().includes(q)
      || op.justificatif?.toLowerCase().includes(q)
      || op.effectuePar?.toLowerCase().includes(q)
      || op.aideNumero?.toLowerCase().includes(q)
  })

  const statsFiltrees = {
    entrees: filtered.filter(o => o.type === 'ENTREE')
      .reduce((s, o) => s + Number(o.montant || 0), 0),
    sorties: filtered.filter(o => o.type === 'SORTIE')
      .reduce((s, o) => s + Number(o.montant || 0), 0),
  }

  const typeTpl    = op => (
    <Tag value={op.type === 'ENTREE' ? '↑ Entrée' : '↓ Sortie'}
      severity={op.type === 'ENTREE' ? 'success' : 'danger'} />
  )
  const montantTpl = op => (
    <span style={{ fontWeight: 700, color: op.type === 'ENTREE' ? '#16a34a' : '#dc2626' }}>
      {op.type === 'ENTREE' ? '+' : '-'}{Number(op.montant || 0).toLocaleString('fr-MA')} MAD
    </span>
  )
  const soldeTpl   = op => (
    <span style={{ fontSize: 12, color: '#64748b' }}>
      {Number(op.soldeApres || 0).toLocaleString('fr-MA')} MAD
    </span>
  )
  const actionsTpl = op => (
    <Button icon="pi pi-trash" size="small" outlined severity="danger"
      tooltip="Supprimer" tooltipOptions={{ position: 'top' }}
      onClick={() => supprimerOp(op)} />
  )

  const categoriesOp = formOp.type === 'ENTREE' ? CATEGORIES_ENTREE : CATEGORIES_SORTIE

  const ouvert = caisse?.statut === 'OUVERTE'

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8' }}>
      <i className="pi pi-spin pi-spinner" style={{ fontSize: 36 }}></i>
    </div>
  )

  return (
    <div>
      <Toast ref={toast} /><ConfirmDialog />

      {/* ── EN-TÊTE CAISSE ── */}
      <div className="cdc-page-header">
        <div>
          <h1>Gestion de la Caisse</h1>
          <p>Suivi des entrées et sorties de fonds</p>
        </div>
        {ouvert && (
          <Button icon="pi pi-plus" label="Nouvelle opération"
            onClick={() => { setFormOp(EMPTY_OP); setDialogOp(true) }} />
        )}
      </div>

      {caisse ? (
        <>
          {/* ── CARTE CAISSE ── */}
          <div className="cdc-card" style={{ marginBottom: 20, padding: '20px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: ouvert ? '#dcfce7' : '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <i className="pi pi-wallet"
                    style={{ fontSize: 24, color: ouvert ? '#16a34a' : '#64748b' }}></i>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18, fontWeight: 700 }}>{caisse.nom}</span>
                    <span style={{
                      fontSize: 11, padding: '3px 10px', borderRadius: 10, fontWeight: 600,
                      background: ouvert ? '#dcfce7' : '#f1f5f9',
                      color: ouvert ? '#16a34a' : '#64748b'
                    }}>
                      {ouvert ? '● Ouverte' : '○ Fermée'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                    Responsable : {caisse.responsable || '—'} ·
                    Créée le {caisse.dateCreation
                      ? new Date(caisse.dateCreation).toLocaleDateString('fr-FR') : '—'}
                  </div>
                </div>
              </div>

              <Button
                icon={ouvert ? 'pi pi-lock' : 'pi pi-lock-open'}
                label={ouvert ? 'Fermer la caisse' : 'Ouvrir la caisse'}
                severity={ouvert ? 'secondary' : 'success'}
                outlined onClick={toggleCaisse} />
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
              gap: 12, marginTop: 20 }}>
              {[
                { label: 'Solde actuel',  value: `${Number(caisse.solde||0).toLocaleString('fr-MA')} MAD`,        color: '#1a73e8', big: true },
                { label: 'Total entrées', value: `${Number(caisse.totalEntrees||0).toLocaleString('fr-MA')} MAD`, color: '#16a34a' },
                { label: 'Total sorties', value: `${Number(caisse.totalSorties||0).toLocaleString('fr-MA')} MAD`, color: '#dc2626' },
                { label: 'Opérations',   value: caisse.nbOperations || 0,                                         color: '#64748b' },
              ].map(s => (
                <div key={s.label} style={{ background: '#f8fafc', borderRadius: 8,
                  padding: '12px 16px', borderTop: `3px solid ${s.color}` }}>
                  <div style={{ fontSize: s.big ? 18 : 15, fontWeight: 700, color: s.color }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── JOURNAL ── */}
          <div className="cdc-card">
            <div style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Journal des opérations</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <Calendar value={filtreDebut} onChange={e => setFiltreDebut(e.value)}
                  dateFormat="dd/mm/yy" showIcon placeholder="Du" style={{ width: 140 }} />
                <Calendar value={filtreFin} onChange={e => setFiltreFin(e.value)}
                  dateFormat="dd/mm/yy" showIcon placeholder="Au" style={{ width: 140 }} />
                <Button icon="pi pi-filter" size="small" outlined label="Filtrer"
                  onClick={() => loadOps(caisse, filtreDebut, filtreFin)} />
                {(filtreDebut || filtreFin) && (
                  <Button icon="pi pi-times" size="small" text severity="secondary"
                    onClick={() => {
                      setFiltreDebut(null); setFiltreFin(null)
                      loadOps(caisse, null, null)
                    }} />
                )}
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-search" />
                  <InputText value={searchOp} onChange={e => setSearchOp(e.target.value)}
                    placeholder="Rechercher..." style={{ width: 160 }} />
                </IconField>
              </div>
            </div>

            {(filtreDebut || filtreFin || searchOp) && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ background: '#f0fdf4', borderRadius: 6,
                  padding: '8px 14px', fontSize: 13 }}>
                  <span style={{ color: '#16a34a', fontWeight: 700 }}>
                    +{statsFiltrees.entrees.toLocaleString('fr-MA')} MAD
                  </span>
                  <span style={{ color: '#64748b', marginLeft: 6 }}>entrées</span>
                </div>
                <div style={{ background: '#fef2f2', borderRadius: 6,
                  padding: '8px 14px', fontSize: 13 }}>
                  <span style={{ color: '#dc2626', fontWeight: 700 }}>
                    -{statsFiltrees.sorties.toLocaleString('fr-MA')} MAD
                  </span>
                  <span style={{ color: '#64748b', marginLeft: 6 }}>sorties</span>
                </div>
              </div>
            )}

            <DataTable value={filtered} loading={loadingOps}
              emptyMessage="Aucune opération." paginator rows={15}
              rowsPerPageOptions={[15, 30, 50]}>
              <Column field="date" header="Date"
                body={op => op.date
                  ? new Date(op.date).toLocaleDateString('fr-FR') : '—'}
                style={{ width: 100 }} sortable />
              <Column header="Type"        body={typeTpl}    style={{ width: 100 }} />
              <Column field="categorie"    header="Catégorie" />
              <Column header="Montant"     body={montantTpl} style={{ width: 150 }} />
              <Column header="Solde après" body={soldeTpl}   style={{ width: 130 }} />
              <Column field="justificatif" header="Justificatif"
                body={op => <span style={{ fontSize: 12, color: '#64748b' }}>
                  {op.justificatif || '—'}</span>} />
              <Column field="effectuePar"  header="Effectué par"
                body={op => <span style={{ fontSize: 12 }}>{op.effectuePar || '—'}</span>}
                style={{ width: 130 }} />
              <Column field="aideNumero"   header="Aide liée"
                body={op => op.aideNumero
                  ? <Tag value={op.aideNumero} severity="info" style={{ fontSize: 10 }} />
                  : '—'}
                style={{ width: 110 }} />
              <Column header="" body={actionsTpl} style={{ width: 50 }} />
            </DataTable>
          </div>
        </>
      ) : (
        /* ── Aucune caisse en base ── */
        <div className="cdc-card" style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <i className="pi pi-wallet" style={{ fontSize: 48, display: 'block', marginBottom: 16 }}></i>
          <div style={{ fontSize: 16, marginBottom: 8 }}>Aucune caisse configurée</div>
          <div style={{ fontSize: 13, marginBottom: 24 }}>
            Créez la caisse de l'association pour commencer à enregistrer des opérations.
          </div>
          <Button icon="pi pi-plus" label="Initialiser la caisse"
            onClick={() => {
              api.post('/caisse', { nom: "Caisse de l'Association", responsable: '' })
                .then(() => load())
                .catch(e => toast.current?.show({
                  severity: 'error', summary: 'Erreur',
                  detail: e.response?.data?.message || 'Erreur', life: 4000
                }))
            }} />
        </div>
      )}

      {/* ── DIALOG NOUVELLE OPÉRATION ── */}
      <Dialog visible={dialogOp} onHide={() => setDialogOp(false)}
        header="Nouvelle opération"
        style={{ width: 520 }} modal
        footer={
          <div>
            <Button icon="pi pi-times" label="Annuler" outlined
              onClick={() => setDialogOp(false)} className="mr-2" />
            <Button
              icon={formOp.type === 'ENTREE' ? 'pi pi-arrow-up' : 'pi pi-arrow-down'}
              label="Enregistrer"
              severity={formOp.type === 'ENTREE' ? 'success' : 'danger'}
              loading={saving} onClick={enregistrerOp} />
          </div>
        }>
        <div className="flex flex-column gap-3 pt-3">

          {/* Type entrée / sortie */}
          <div className="flex gap-2">
            <Button label="↑ Entrée" severity="success"
              outlined={formOp.type !== 'ENTREE'} className="flex-1" style={{ height: 44 }}
              onClick={() => setFormOp({ ...formOp, type: 'ENTREE', categorie: '', aideId: null })} />
            <Button label="↓ Sortie" severity="danger"
              outlined={formOp.type !== 'SORTIE'} className="flex-1" style={{ height: 44 }}
              onClick={() => setFormOp({ ...formOp, type: 'SORTIE', categorie: '', aideId: null })} />
          </div>

          <div className="formgrid grid">
            <div className="field col">
              <label className="font-semibold">Montant (MAD) *</label>
              <InputNumber value={formOp.montant}
                onValueChange={e => setFormOp({ ...formOp, montant: e.value })}
                mode="decimal" minFractionDigits={2} min={0.01} className="w-full" />
            </div>
            <div className="field col">
              <label className="font-semibold">Date</label>
              <Calendar value={formOp.date}
                onChange={e => setFormOp({ ...formOp, date: e.value })}
                dateFormat="dd/mm/yy" showIcon className="w-full" />
            </div>
          </div>

          <div className="field">
            <label className="font-semibold">Catégorie *</label>
            <Dropdown value={formOp.categorie} options={categoriesOp}
              onChange={e => setFormOp({ ...formOp, categorie: e.value, aideId: null })}
              placeholder="Choisir une catégorie..." className="w-full" />
          </div>

          {/* Aide liée — seulement pour les sorties VIREMENT_AIDE */}
          {formOp.type === 'SORTIE' && formOp.categorie === 'VIREMENT_AIDE' && (
            <div className="field">
              <label className="font-semibold">Aide sociale liée</label>
              <Dropdown
                value={formOp.aideId}
                options={aides.map(a => ({
                  label: `${a.numeroDemande} — ${a.adherent?.prenom || ''} ${a.adherent?.nom || ''} — ${Number(a.montantAccorde || 0).toLocaleString('fr-MA')} MAD`,
                  value: a.id
                }))}
                onChange={e => setFormOp({ ...formOp, aideId: e.value })}
                placeholder="Sélectionner une aide validée (optionnel)..."
                showClear filter emptyMessage="Aucune aide validée"
                className="w-full" />
            </div>
          )}

          <div className="field">
            <label className="font-semibold">Justificatif / Description</label>
            <InputText value={formOp.justificatif}
              onChange={e => setFormOp({ ...formOp, justificatif: e.target.value })}
              placeholder="Référence ou description de l'opération..."
              className="w-full" />
          </div>

          {/* Aperçu solde prévisionnel */}
          {formOp.montant && caisse && (
            <div style={{
              background: formOp.type === 'ENTREE' ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${formOp.type === 'ENTREE' ? '#bbf7d0' : '#fecaca'}`,
              borderRadius: 8, padding: 12, fontSize: 13
            }}>
              <div style={{ color: '#64748b' }}>
                Solde actuel : <strong>
                  {Number(caisse.solde || 0).toLocaleString('fr-MA')} MAD
                </strong>
              </div>
              <div style={{
                color: formOp.type === 'ENTREE' ? '#16a34a' : '#dc2626',
                fontWeight: 700, fontSize: 15, marginTop: 4
              }}>
                Solde après : {(
                  formOp.type === 'ENTREE'
                    ? Number(caisse.solde || 0) + Number(formOp.montant || 0)
                    : Number(caisse.solde || 0) - Number(formOp.montant || 0)
                ).toLocaleString('fr-MA')} MAD
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  )
}