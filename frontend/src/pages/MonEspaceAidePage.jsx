import { useState, useEffect, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputNumber } from 'primereact/inputnumber'
import { InputTextarea } from 'primereact/inputtextarea'
import { Dropdown } from 'primereact/dropdown'
import { FileUpload } from 'primereact/fileupload'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Tag } from 'primereact/tag'
import { TabView, TabPanel } from 'primereact/tabview'
import { Divider } from 'primereact/divider'
import { aideApi, typeAideApi } from '../services/api'

const ETATS = [
  { label: 'Déposée',  value: 'DEPOSEE',  severity: 'info'     },
  { label: 'En étude', value: 'EN_ETUDE', severity: 'warning'  },
  { label: 'Validée',  value: 'VALIDEE',  severity: 'success'  },
  { label: 'Rejetée',  value: 'REJETEE',  severity: 'danger'   },
  { label: 'Annulée',  value: 'ANNULEE',  severity: 'secondary'},
]

const EMPTY = { typeAideId: null, montantDemande: null }

export default function MonEspaceAidePage() {
  const [demandes, setDemandes]         = useState([])
  const [typesAide, setTypesAide]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [dialogNew, setDialogNew]       = useState(false)
  const [dialogDetail, setDialogDetail] = useState(false)
  const [selected, setSelected]         = useState(null)
  const [form, setForm]                 = useState(EMPTY)
  const [saving, setSaving]             = useState(false)
  const [pieces, setPieces]             = useState([])
  const [detailTab, setDetailTab]       = useState(0)
  const [erreurCompte, setErreurCompte] = useState(null)
  const toast = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const [d, t] = await Promise.all([
        aideApi.mesDemandes(), typeAideApi.getActifs()
      ])
      setDemandes(d.data); setTypesAide(t.data)
      setErreurCompte(null)
    } catch (e) {
      const msg = e.response?.data?.message || ''
      if (msg.includes('adherent')) setErreurCompte(msg)
      else toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Chargement impossible', life: 3000 })
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openDetail = async row => {
    setSelected(row); setDetailTab(0); setDialogDetail(true)
    try { const res = await aideApi.getPieces(row.id); setPieces(res.data) }
    catch { setPieces([]) }
  }

  const deposer = async () => {
    if (!form.typeAideId || !form.montantDemande) {
      toast.current?.show({ severity: 'warn', summary: 'Attention',
        detail: 'Type et montant sont obligatoires', life: 3000 }); return
    }
    setSaving(true)
    try {
      // adherentId = null → le service le déduit depuis le JWT
      await aideApi.deposer({ ...form, adherentId: null })
      toast.current?.show({ severity: 'success', summary: 'Demande déposée !',
        detail: 'Votre demande est en cours de traitement par nos services.', life: 5000 })
      setDialogNew(false); setForm(EMPTY); load()
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erreur',
        detail: e.response?.data?.message || 'Erreur lors du dépôt', life: 4000 })
    } finally { setSaving(false) }
  }

  const annuler = async row => {
    confirmDialog({
      message: `Annuler votre demande ${row.numeroDemande} ?`,
      header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, annuler', rejectLabel: 'Non', acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await aideApi.annuler(row.id)
          toast.current?.show({ severity: 'success', summary: 'Demande annulée', life: 3000 })
          if (selected?.id === row.id) setDialogDetail(false)
          load()
        } catch (e) {
          toast.current?.show({ severity: 'error', summary: 'Erreur',
            detail: e.response?.data?.message || 'Erreur', life: 4000 })
        }
      }
    })
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
      window.open(window.URL.createObjectURL(new Blob([res.data])), '_blank')
    } catch { toast.current?.show({ severity: 'error', summary: 'Erreur', life: 3000 }) }
  }

  const supprimerPiece = async nom => {
    try {
      await aideApi.supprimerPiece(selected.id, nom)
      const res = await aideApi.getPieces(selected.id); setPieces(res.data)
    } catch { toast.current?.show({ severity: 'error', summary: 'Erreur', life: 3000 }) }
  }

  const stats = {
    total:   demandes.length,
    encours: demandes.filter(d => d.etat === 'DEPOSEE' || d.etat === 'EN_ETUDE').length,
    valides: demandes.filter(d => d.etat === 'VALIDEE').length,
    rejetes: demandes.filter(d => d.etat === 'REJETEE').length,
  }

  const etatTpl = row => {
    const e = ETATS.find(x => x.value === row.etat)
    return <Tag value={e?.label || row.etat} severity={e?.severity || 'info'} />
  }

  const typeOptions = typesAide.map(t => ({
    label: `${t.nom}${t.montantMax ? ' (max: ' + Number(t.montantMax).toLocaleString('fr-MA') + ' MAD)' : ''}`,
    value: t.id
  }))

  const wfBureau    = selected?.workflows?.find(w => w.etape === 'AGENT_BUREAU')
  const wfPresident = selected?.workflows?.find(w => w.etape === 'PRESIDENT')

  // Si le compte n'est pas lié à un adhérent
  if (erreurCompte) return (
    <div>
      <div className="cdc-page-header">
        <div><h1>Mes Demandes d'Aide</h1></div>
      </div>
      <div className="cdc-card" style={{ padding: 40, textAlign: 'center' }}>
        <i className="pi pi-exclamation-circle" style={{ fontSize: 48, color: '#ea580c', display: 'block', marginBottom: 16 }}></i>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
          Compte non lié à un profil adhérent
        </div>
        <div style={{ fontSize: 14, color: '#64748b' }}>
          Votre compte utilisateur n'est pas associé à un profil adhérent.<br />
          Contactez l'administration pour régulariser votre situation.
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <Toast ref={toast} /><ConfirmDialog />

      <div className="cdc-page-header">
        <div>
          <h1>Mes Demandes d'Aide</h1>
          <p>Déposez et suivez vos demandes d'aide sociale</p>
        </div>
        <Button icon="pi pi-plus" label="Nouvelle Demande"
          onClick={() => { setForm(EMPTY); setDialogNew(true) }} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total',    value: stats.total,   color: '#1a73e8' },
          { label: 'En cours', value: stats.encours, color: '#ea580c' },
          { label: 'Validées', value: stats.valides, color: '#16a34a' },
          { label: 'Rejetées', value: stats.rejetes, color: '#dc2626' },
        ].map(s => (
          <div key={s.label} className="cdc-card"
            style={{ padding: '16px 20px', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tableau */}
      <div className="cdc-card">
        <DataTable value={demandes} loading={loading} emptyMessage="Vous n'avez aucune demande d'aide."
          paginator rows={10}>
          <Column field="numeroDemande"  header="N° Demande" style={{ fontWeight: 600, width: 130 }} />
          <Column field="typeAide.nom"   header="Type d'aide" />
          <Column field="montantDemande" header="Montant demandé"
            body={r => `${Number(r.montantDemande||0).toLocaleString('fr-MA')} MAD`}
            style={{ width: 160 }} />
          <Column field="montantAccorde" header="Montant accordé"
            body={r => r.montantAccorde
              ? <span style={{ color: '#16a34a', fontWeight: 600 }}>{Number(r.montantAccorde).toLocaleString('fr-MA')} MAD</span>
              : <span style={{ color: '#94a3b8' }}>—</span>}
            style={{ width: 160 }} />
          <Column field="dateDemande"    header="Date"
            body={r => r.dateDemande ? new Date(r.dateDemande).toLocaleDateString('fr-FR') : '—'}
            style={{ width: 110 }} />
          <Column header="État"          body={etatTpl} style={{ width: 100 }} />
          <Column header="Actions" style={{ width: 110 }}
            body={row => (
              <div className="flex gap-1">
                <Button icon="pi pi-eye" size="small" outlined severity="info"
                  tooltip="Suivre" onClick={() => openDetail(row)} />
                {row.etat === 'DEPOSEE' && (
                  <Button icon="pi pi-times-circle" size="small" outlined severity="danger"
                    tooltip="Annuler" onClick={() => annuler(row)} />
                )}
              </div>
            )} />
        </DataTable>
      </div>

      {/* ══ DIALOG NOUVELLE DEMANDE ══ */}
      <Dialog visible={dialogNew} onHide={() => setDialogNew(false)}
        header="Déposer une demande d'aide" style={{ width: 560 }} modal
        footer={
          <div>
            <Button icon="pi pi-times" label="Annuler" outlined onClick={() => setDialogNew(false)} className="mr-2" />
            <Button icon="pi pi-send" label="Soumettre ma demande" loading={saving} onClick={deposer} />
          </div>
        }>
        <div className="flex flex-column gap-3 pt-3">
          <div className="field">
            <label className="font-semibold">Type d'aide *</label>
            <Dropdown value={form.typeAideId} options={typeOptions}
              onChange={e => {
                const t = typesAide.find(x => x.id === e.value)
                setForm({ ...form, typeAideId: e.value,
                  montantDemande: t?.montantMax || form.montantDemande })
              }}
              placeholder="Choisir le type d'aide..." className="w-full" />
          </div>

          {/* Afficher les conditions du type sélectionné */}
          {form.typeAideId && (() => {
            const t = typesAide.find(x => x.id === form.typeAideId)
            return t ? (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0',
                borderRadius: 8, padding: 12 }}>
                {t.montantMax && (
                  <div style={{ fontSize: 13, color: '#374151', marginBottom: t.conditions ? 8 : 0 }}>
                    <strong>Plafond :</strong>{' '}
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>
                      {Number(t.montantMax).toLocaleString('fr-MA')} MAD
                    </span>
                  </div>
                )}
                {t.conditions && (
                  <div style={{ fontSize: 13, color: '#64748b' }}>
                    <strong>Conditions :</strong> {t.conditions}
                  </div>
                )}
                {t.delaiMois && (
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
                    Délai minimum entre deux demandes : {t.delaiMois} mois
                  </div>
                )}
              </div>
            ) : null
          })()}

          <div className="field">
            <label className="font-semibold">Montant demandé (MAD) *</label>
            <InputNumber value={form.montantDemande}
              onValueChange={e => setForm({ ...form, montantDemande: e.value })}
              mode="decimal" minFractionDigits={2} className="w-full"
              max={typesAide.find(t => t.id === form.typeAideId)?.montantMax || undefined} />
          </div>

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: 8, padding: 12, fontSize: 13, color: '#1d4ed8' }}>
            <i className="pi pi-info-circle mr-2"></i>
            Votre demande sera examinée par l'Agent de bureau, puis soumise à la validation du Président.
            Vous pouvez suivre l'avancement depuis cette page.
          </div>
        </div>
      </Dialog>

      {/* ══ DIALOG SUIVI ══ */}
      <Dialog visible={dialogDetail} onHide={() => setDialogDetail(false)}
        header={selected ? `Suivi — ${selected.numeroDemande}` : ''}
        style={{ width: 740 }} modal
        footer={
          <div className="flex justify-content-between">
            <div>
              {selected?.etat === 'DEPOSEE' && (
                <Button icon="pi pi-times" label="Annuler ma demande"
                  severity="danger" outlined onClick={() => annuler(selected)} />
              )}
            </div>
            <Button icon="pi pi-times" label="Fermer" outlined onClick={() => setDialogDetail(false)} />
          </div>
        }>

        {selected && (
          <TabView activeIndex={detailTab} onTabChange={e => setDetailTab(e.index)}>

            {/* Suivi */}
            <TabPanel header="Suivi" leftIcon="pi pi-eye mr-2">
              {/* Progression */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20 }}>
                {[
                  { step: 1, label: 'Déposée',     done: true },
                  { step: 2, label: 'Agent bureau', done: ['EN_ETUDE','VALIDEE','REJETEE'].includes(selected.etat) },
                  { step: 3, label: 'Président',    done: ['VALIDEE','REJETEE'].includes(selected.etat) },
                ].map((s, i) => (
                  <div key={s.step} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: s.done ? '#16a34a' : '#f1f5f9',
                        border: `2px solid ${s.done ? '#16a34a' : '#cbd5e1'}`,
                        color: s.done ? 'white' : '#94a3b8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 14
                      }}>
                        {s.done ? <i className="pi pi-check" style={{ fontSize: 14 }}></i> : s.step}
                      </div>
                      <div style={{ fontSize: 11, color: s.done ? '#16a34a' : '#94a3b8', marginTop: 6, whiteSpace: 'nowrap' }}>{s.label}</div>
                    </div>
                    {i < 2 && <div style={{ flex: 1, height: 2, background: s.done ? '#16a34a' : '#e2e8f0', margin: '0 4px', marginBottom: 18 }}></div>}
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Tag value={ETATS.find(e => e.value === selected.etat)?.label || selected.etat}
                  severity={ETATS.find(e => e.value === selected.etat)?.severity} style={{ fontSize: 14, padding: '6px 16px' }} />
              </div>

              <Divider />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
                {[
                  { label: 'N° Demande',     value: selected.numeroDemande },
                  { label: "Type d'aide",    value: selected.typeAide?.nom },
                  { label: 'Montant demandé',value: `${Number(selected.montantDemande||0).toLocaleString('fr-MA')} MAD` },
                  { label: 'Montant accordé',value: selected.montantAccorde
                    ? <span style={{ color:'#16a34a', fontWeight:700 }}>{Number(selected.montantAccorde).toLocaleString('fr-MA')} MAD</span>
                    : <span style={{ color:'#94a3b8' }}>En attente</span> },
                  { label: 'Date de dépôt',  value: selected.dateDemande ? new Date(selected.dateDemande).toLocaleDateString('fr-FR') : '—' },
                  { label: 'Date de décision',value: selected.dateTraitement ? new Date(selected.dateTraitement).toLocaleDateString('fr-FR') : <span style={{ color:'#94a3b8' }}>En cours</span> },
                ].map(item => (
                  <div key={item.label} style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, background: '#f8fafc', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Votre motif</div>
                <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>{selected.motif}</div>
              </div>

              {/* Message résultat selon état */}
              {selected.etat === 'VALIDEE' && (
                <div style={{ marginTop: 14, background: '#f0fdf4', border: '1px solid #bbf7d0',
                  borderRadius: 8, padding: 14, color: '#15803d' }}>
                  <i className="pi pi-check-circle mr-2"></i>
                  <strong>Félicitations !</strong> Votre demande a été validée.
                  Le montant de <strong>{Number(selected.montantAccorde||0).toLocaleString('fr-MA')} MAD</strong> vous sera versé prochainement.
                </div>
              )}
              {selected.etat === 'REJETEE' && (
                <div style={{ marginTop: 14, background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: 8, padding: 14, color: '#dc2626' }}>
                  <i className="pi pi-times-circle mr-2"></i>
                  <strong>Demande rejetée.</strong> Consultez l'onglet "Workflow" pour connaître le motif.
                </div>
              )}
            </TabPanel>

            {/* Workflow */}
            <TabPanel header="Workflow" leftIcon="pi pi-sitemap mr-2">
              <div className="flex flex-column gap-3">
                {selected.workflows?.map(wf => (
                  <div key={wf.id} style={{
                    border: '1px solid #e2e8f0', borderRadius: 10, padding: 16,
                    borderLeft: `4px solid ${
                      wf.decision === 'APPROUVE' ? '#16a34a' :
                      wf.decision === 'REJETE'   ? '#dc2626' : '#94a3b8'}`
                  }}>
                    <div className="flex justify-content-between align-items-start">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                          {wf.etape === 'AGENT_BUREAU' ? '① Agent de bureau' : '② Président'}
                        </div>
                        {wf.decision === 'EN_ATTENTE' ? (
                          <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
                            En attente de traitement
                          </div>
                        ) : (
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            {wf.dateDecision && new Date(wf.dateDecision).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                        {wf.montantPropose && wf.decision === 'APPROUVE' && (
                          <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginTop: 4 }}>
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
                        <i className="pi pi-comment mr-2" style={{ color: '#94a3b8' }}></i>
                        {wf.commentaire}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabPanel>

            {/* Pièces jointes */}
            <TabPanel header={`Pièces (${pieces.length})`} leftIcon="pi pi-paperclip mr-2">
              <div className="flex flex-column gap-3">
                {(selected.etat === 'DEPOSEE' || selected.etat === 'EN_ETUDE') && (
                  <FileUpload mode="basic" name="file" maxFileSize={5000000}
                    customUpload uploadHandler={uploadPiece} auto
                    chooseLabel="Joindre un document" />
                )}
                {pieces.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: 13 }}>
                    Aucun document joint
                  </div>
                ) : (
                  <div className="flex flex-column gap-2">
                    {pieces.map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', padding: '10px 14px',
                        background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <div className="flex align-items-center gap-2">
                          <i className="pi pi-file" style={{ color: '#64748b', fontSize: 16 }}></i>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{p.nom}</div>
                            {p.taille && <div style={{ fontSize: 11, color: '#94a3b8' }}>{Math.round(p.taille / 1024)} Ko</div>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button icon="pi pi-eye" size="small" outlined severity="info"
                            tooltip="Consulter" onClick={() => consulterPiece(p.nom)} />
                          {(selected.etat === 'DEPOSEE' || selected.etat === 'EN_ETUDE') && (
                            <Button icon="pi pi-trash" size="small" outlined severity="danger"
                              tooltip="Supprimer"
                              onClick={() => confirmDialog({
                                message: `Supprimer "${p.nom}" ?`,
                                header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
                                acceptLabel: 'Supprimer', rejectLabel: 'Annuler', acceptClassName: 'p-button-danger',
                                accept: () => supprimerPiece(p.nom)
                              })} />
                          )}
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
    </div>
  )
}