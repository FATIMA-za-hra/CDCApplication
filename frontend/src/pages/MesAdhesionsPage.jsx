import { useState, useEffect, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Tag } from 'primereact/tag'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { Dialog } from 'primereact/dialog'
import { adhesionApi } from '../services/api'

const STATUTS = [
  { label: 'En attente', value: 'EN_ATTENTE', severity: 'warning'  },
  { label: 'Payée',      value: 'PAYE',       severity: 'success'  },
  { label: 'Exonérée',  value: 'EXONERE',    severity: 'info'     },
  { label: 'Annulée',   value: 'ANNULE',     severity: 'secondary'},
]

export default function MesAdhesionsPage() {
  const [adhesions, setAdhesions] = useState([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [dialog, setDialog]       = useState(false)
  const toast = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await adhesionApi.getMesAdhesions()
      setAdhesions(res.data)
    } catch (e) {
      const msg = e.response?.data?.message || ''
      if (msg.includes('adherent') || msg.includes('compte')) {
        // Compte non lié à un adhérent
        setAdhesions([])
      } else {
        toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Chargement impossible', life: 3000 })
      }
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const downloadRecu = async row => {
    try {
      const res = await adhesionApi.genererRecu(row.id)
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `recu-${row.annee}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur reçu PDF', life: 3000 })
    }
  }

  const etatTpl = row => {
    const s = STATUTS.find(x => x.value === row.statut)
    return <Tag value={s?.label || row.statut} severity={s?.severity || 'info'} />
  }

  const actionsTpl = row => (
    <div className="flex gap-1">
      <Button icon="pi pi-eye" size="small" outlined severity="info"
        tooltip="Détails" onClick={() => { setSelected(row); setDialog(true) }} />
      {(row.statut === 'PAYE' || row.statut === 'EXONERE') && (
        <Button icon="pi pi-file-pdf" size="small" outlined severity="secondary"
          tooltip="Télécharger reçu" onClick={() => downloadRecu(row)} />
      )}
    </div>
  )

  // Stats
  const anneeEnCours = new Date().getFullYear()
  const adhesionCourante = adhesions.find(a =>
    a.annee === anneeEnCours && (a.statut === 'PAYE' || a.statut === 'EXONERE'))
  const totalPaye = adhesions
    .filter(a => a.statut === 'PAYE')
    .reduce((s, a) => s + Number(a.montant || 0), 0)

  return (
    <div>
      <Toast ref={toast} />

      <div className="cdc-page-header">
        <div>
          <h1>Mes Adhésions</h1>
          <p>Historique de vos cotisations annuelles</p>
        </div>
      </div>

      {/* Statut cotisation en cours */}
      <div style={{ marginBottom: 20 }}>
        {adhesionCourante ? (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 10, padding: '16px 20px', display: 'flex',
            alignItems: 'center', gap: 14 }}>
            <i className="pi pi-check-circle" style={{ fontSize: 28, color: '#16a34a' }}></i>
            <div>
              <div style={{ fontWeight: 700, color: '#15803d', fontSize: 15 }}>
                Cotisation {anneeEnCours} régularisée
              </div>
              <div style={{ fontSize: 13, color: '#16a34a', marginTop: 2 }}>
                Montant : {Number(adhesionCourante.montant || 0).toLocaleString('fr-MA')} MAD
                {adhesionCourante.datePaiement && ` — Payée le ${new Date(adhesionCourante.datePaiement).toLocaleDateString('fr-FR')}`}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: '#fef9f0', border: '1px solid #fed7aa',
            borderRadius: 10, padding: '16px 20px', display: 'flex',
            alignItems: 'center', gap: 14 }}>
            <i className="pi pi-exclamation-triangle" style={{ fontSize: 28, color: '#ea580c' }}></i>
            <div>
              <div style={{ fontWeight: 700, color: '#9a3412', fontSize: 15 }}>
                Cotisation {anneeEnCours} non régularisée
              </div>
              <div style={{ fontSize: 13, color: '#ea580c', marginTop: 2 }}>
                Contactez l'administration pour régulariser votre situation.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
        gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total cotisations', value: adhesions.length,                                color: '#1a73e8' },
          { label: 'Payées',            value: adhesions.filter(a=>a.statut==='PAYE').length,   color: '#16a34a' },
          { label: 'En attente',        value: adhesions.filter(a=>a.statut==='EN_ATTENTE').length, color: '#ea580c' },
          { label: 'Total payé',        value: `${totalPaye.toLocaleString('fr-MA')} MAD`,     color: '#7c3aed', small: true },
        ].map(s => (
          <div key={s.label} className="cdc-card"
            style={{ padding: '14px 18px', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: s.small ? 14 : 24, fontWeight: 700, color: s.color, lineHeight: 1.3 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="cdc-card">
        <DataTable value={adhesions} loading={loading}
          emptyMessage="Aucune adhésion trouvée."
          paginator rows={10} sortField="annee" sortOrder={-1}>
          <Column field="annee"         header="Année"   sortable style={{ width: 90, fontWeight: 700 }} />
          <Column field="categorie.libelle" header="Catégorie" />
          <Column field="montant" header="Montant"
            body={r => `${Number(r.montant||0).toLocaleString('fr-MA')} MAD`}
            style={{ width: 140 }} />
          <Column field="datePaiement" header="Date paiement"
            body={r => r.datePaiement ? new Date(r.datePaiement).toLocaleDateString('fr-FR') : '—'}
            style={{ width: 130 }} />
          <Column field="modePaiement" header="Mode"     style={{ width: 100, color: '#64748b' }} />
          <Column header="Statut"      body={etatTpl}    style={{ width: 110 }} />
          <Column header="Actions"     body={actionsTpl} style={{ width: 110 }} />
        </DataTable>
      </div>

      {/* Dialog détail */}
      <Dialog visible={dialog} onHide={() => setDialog(false)}
        header={`Adhésion ${selected?.annee}`} style={{ width: 460 }} modal>
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { label: 'Année',          value: selected.annee },
              { label: 'Catégorie',      value: selected.categorie?.libelle || '—' },
              { label: 'Montant',        value: `${Number(selected.montant||0).toLocaleString('fr-MA')} MAD` },
              { label: 'Statut',         value: <Tag value={STATUTS.find(s=>s.value===selected.statut)?.label||selected.statut} severity={STATUTS.find(s=>s.value===selected.statut)?.severity} /> },
              { label: 'Date paiement',  value: selected.datePaiement ? new Date(selected.datePaiement).toLocaleDateString('fr-FR') : '—' },
              { label: 'Mode paiement',  value: selected.modePaiement || '—' },
              { label: 'Référence',      value: selected.referencePaiement || '—' },
              { label: 'Observations',   value: selected.observations || '—' },
            ].map(item => (
              <div key={item.label} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{item.value}</span>
              </div>
            ))}
            {(selected.statut === 'PAYE' || selected.statut === 'EXONERE') && (
              <div style={{ marginTop: 16 }}>
                <Button icon="pi pi-file-pdf" label="Télécharger le reçu"
                  severity="secondary" className="w-full" onClick={() => downloadRecu(selected)} />
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  )
}