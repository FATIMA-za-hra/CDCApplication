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
  { label:'En attente', value:'EN_ATTENTE' },
  { label:'Payé',       value:'PAYE'       },
  { label:'Exonéré',   value:'EXONERE'    },
  { label:'Annulé',    value:'ANNULE'      },
]
const MODES = [
  { label:'Espèces',  value:'especes'  },
  { label:'Virement', value:'virement' },
  { label:'Chèque',   value:'cheque'   },
]
const EMPTY = {
  adherentId:null, categorieId:null, annee:new Date().getFullYear(),
  datePaiement:null, montant:null, statut:'EN_ATTENTE',
  modePaiement:null, referencePaiement:'',
  estExonere:false, montantExonere:0, motifExoneration:'', observations:''
}

export default function AdhesionsPage() {
  const [adhesions, setAdhesions]     = useState([])
  const [adherents, setAdherents]     = useState([])
  const [categories, setCategories]   = useState([])
  const [nonReg, setNonReg]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [loadingNonReg, setLoadingNonReg] = useState(false)
  const [dialogVisible, setDialog]    = useState(false)
  const [relanceVisible, setRelance]  = useState(false)
  const [listeVisible, setListe]      = useState(false)
  const [form, setForm]               = useState(EMPTY)
  const [editId, setEditId]           = useState(null)
  const [saving, setSaving]           = useState(false)
  const [search, setSearch]           = useState('')
  const [anneeFilter, setAnneeFilter] = useState(new Date().getFullYear())
  const [selectedRelance, setSelectedRelance] = useState([])
  const [anneeRelance, setAnneeRelance] = useState(new Date().getFullYear())
  const [sendingRelance, setSendingRelance] = useState(false)
  const [listeFiltres, setListeFiltres] = useState({ annee:new Date().getFullYear(), categorieId:null, statut:'' })
  const toast = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const [ad, adh, cat] = await Promise.all([adhesionApi.getAll(), adherentApi.getAll(), categorieApi.getActives()])
      setAdhesions(ad.data); setAdherents(adh.data); setCategories(cat.data)
    } catch { toast.current?.show({ severity:'error', summary:'Erreur', detail:'Chargement impossible', life:3000 }) }
    finally { setLoading(false) }
  }

  const loadNonReg = async () => {
    setLoadingNonReg(true)
    try { const res = await adhesionApi.getNonRegularises(anneeRelance); setNonReg(res.data); setSelectedRelance([]) }
    catch { toast.current?.show({ severity:'error', summary:'Erreur', detail:'Chargement impossible', life:3000 }) }
    finally { setLoadingNonReg(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = adhesions.filter(a => {
    const q = search.toLowerCase()
    const ms = !search.trim() ||
      a.adherent?.nom?.toLowerCase().includes(q) ||
      a.adherent?.prenom?.toLowerCase().includes(q) ||
      a.adherent?.numeroAdherent?.toLowerCase().includes(q)
    return ms && (!anneeFilter || a.annee === anneeFilter)
  })

  const anneeOptions = [...new Set(adhesions.map(a => a.annee))].sort((a,b)=>b-a).map(y=>({label:String(y),value:y}))

  const openNew  = () => { setForm(EMPTY); setEditId(null); setDialog(true) }
  const openEdit = row => {
    setForm({ adherentId:row.adherent?.id||null, categorieId:row.categorie?.id||null, annee:row.annee,
      datePaiement:row.datePaiement?new Date(row.datePaiement):null, montant:row.montant,
      statut:row.statut||'EN_ATTENTE', modePaiement:row.modePaiement||null,
      referencePaiement:row.referencePaiement||'', estExonere:row.estExonere||false,
      montantExonere:row.montantExonere||0, motifExoneration:row.motifExoneration||'', observations:row.observations||'' })
    setEditId(row.id); setDialog(true)
  }

  const onAdherentChange = id => {
    const adh = adherents.find(a=>a.id===id)
    const upd = { ...form, adherentId:id }
    if (adh?.categorie?.id) { upd.categorieId=adh.categorie.id; const cat=categories.find(c=>c.id===adh.categorie.id); if(cat) upd.montant=cat.montant }
    setForm(upd)
  }
  const onCategorieChange = id => { const cat=categories.find(c=>c.id===id); setForm({...form,categorieId:id,montant:cat?cat.montant:form.montant}) }

  const save = async () => {
    if (!form.adherentId||!form.categorieId||!form.annee) { toast.current?.show({severity:'warn',summary:'Attention',detail:'Adhérent, catégorie et année obligatoires',life:3000}); return }
    setSaving(true)
    try {
      const payload = {...form, datePaiement:form.datePaiement?form.datePaiement.toISOString().split('T')[0]:null}
      if (editId) { await adhesionApi.update(editId,payload); toast.current?.show({severity:'success',summary:'Succès',detail:'Adhésion modifiée',life:3000}) }
      else { await adhesionApi.create(payload); toast.current?.show({severity:'success',summary:'Succès',detail:'Adhésion créée',life:3000}) }
      setDialog(false); load()
    } catch(e) { toast.current?.show({severity:'error',summary:'Erreur',detail:e.response?.data?.message||'Erreur',life:4000}) }
    finally { setSaving(false) }
  }

  const confirmDelete = row => confirmDialog({
    message:`Supprimer l'adhésion de ${row.adherent?.prenom} ${row.adherent?.nom} (${row.annee}) ?`,
    header:'Confirmation', icon:'pi pi-exclamation-triangle',
    acceptLabel:'Supprimer', rejectLabel:'Annuler', acceptClassName:'p-button-danger',
    accept: async () => { try { await adhesionApi.delete(row.id); toast.current?.show({severity:'success',summary:'Supprimé',life:3000}); load() }
      catch(e) { toast.current?.show({severity:'error',summary:'Erreur',detail:e.response?.data?.message||'Erreur',life:4000}) } }
  })

  const downloadRecu = async row => {
    try {
      const res = await adhesionApi.genererRecu(row.id)
      const url = window.URL.createObjectURL(new Blob([res.data],{type:'application/pdf'}))
      const a = document.createElement('a'); a.href=url; a.download=`recu-${row.adherent?.numeroAdherent}-${row.annee}.pdf`; a.click()
      window.URL.revokeObjectURL(url)
    } catch { toast.current?.show({severity:'error',summary:'Erreur',detail:'Erreur reçu PDF',life:3000}) }
  }

  const downloadListe = async () => {
    try {
      const params = {}
      if (listeFiltres.annee) params.annee = listeFiltres.annee
      if (listeFiltres.categorieId) params.categorieId = listeFiltres.categorieId
      if (listeFiltres.statut) params.statut = listeFiltres.statut
      const res = await adhesionApi.genererListe(params)
      const url = window.URL.createObjectURL(new Blob([res.data],{type:'application/pdf'}))
      const a = document.createElement('a'); a.href=url; a.download=`cotisations-${listeFiltres.annee||'toutes'}.pdf`; a.click()
      window.URL.revokeObjectURL(url)
    } catch { toast.current?.show({severity:'error',summary:'Erreur',detail:'Erreur liste PDF',life:3000}) }
  }

  const envoyerRelances = async () => {
    if (!selectedRelance.length) { toast.current?.show({severity:'warn',summary:'Attention',detail:'Sélectionnez au moins un adhérent',life:3000}); return }
    setSendingRelance(true)
    try {
      const res = await adhesionApi.envoyerRelanceMasse({adherentIds:selectedRelance.map(r=>r.id),annee:anneeRelance})
      toast.current?.show({severity:'success',summary:'Envoyé',detail:`${res.data.envoyes} email(s) sur ${res.data.total}`,life:5000})
      setSelectedRelance([])
    } catch { toast.current?.show({severity:'error',summary:'Erreur',detail:'Erreur envoi relances',life:3000}) }
    finally { setSendingRelance(false) }
  }

  const adherentTpl = row => (
    <div><div className="font-semibold">{row.adherent?.prenom} {row.adherent?.nom}</div>
      <div style={{fontSize:11,color:'#94a3b8'}}>{row.adherent?.numeroAdherent}</div></div>
  )
  const statutTpl = row => <span>{STATUTS.find(s=>s.value===row.statut)?.label||row.statut||'—'}</span>
  const montantTpl = row => (
    <div><div>{Number(row.montant||0).toLocaleString('fr-MA')} MAD</div>
      {row.estExonere&&<div style={{fontSize:11,color:'#64748b'}}>Exon.: {Number(row.montantExonere||0).toLocaleString('fr-MA')} MAD</div>}</div>
  )
  const actionsTpl = row => (
    <div className="flex gap-1">
      {(row.statut==='PAYE'||row.statut==='EXONERE') && (
        <Button icon="pi pi-file-pdf" size="small" outlined severity="secondary"
          tooltip="Reçu PDF" tooltipOptions={{position:'top'}} onClick={()=>downloadRecu(row)} />
      )}
      <Button icon="pi pi-pencil" size="small" outlined tooltip="Modifier" tooltipOptions={{position:'top'}} onClick={()=>openEdit(row)} />
      <Button icon="pi pi-trash"  size="small" outlined severity="danger" tooltip="Supprimer" tooltipOptions={{position:'top'}} onClick={()=>confirmDelete(row)} />
    </div>
  )

  const adherentOptions = adherents.map(a=>({label:`${a.prenom} ${a.nom} (${a.numeroAdherent||'—'})`,value:a.id}))
  const catOptions = categories.map(c=>({label:`${c.libelle} — ${Number(c.montant).toLocaleString('fr-MA')} MAD`,value:c.id}))
  const catFiltreOptions = [{label:'Toutes',value:null},...categories.map(c=>({label:c.libelle,value:c.id}))]

  const totalPaye = filtered.filter(a=>a.statut==='PAYE').reduce((s,a)=>s+Number(a.montant||0),0)

  // Stats liées au filtre actif (même données que le tableau)
  const statsAll = {
    total:    filtered.length,
    payes:    filtered.filter(a=>a.statut==='PAYE').length,
    attente:  filtered.filter(a=>a.statut==='EN_ATTENTE').length,
    exoneres: filtered.filter(a=>a.statut==='EXONERE').length,
    montant:  filtered.filter(a=>a.statut==='PAYE').reduce((s,a)=>s+Number(a.montant||0),0),
  }

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="cdc-page-header">
        <div><h1>Adhésions</h1><p>Gestion des cotisations annuelles</p></div>
        <div className="flex gap-2 flex-wrap">
          <Button icon="pi pi-envelope" label="Relances"    severity="warning"  outlined onClick={()=>{setRelance(true);loadNonReg()}} />
          <Button icon="pi pi-list"     label="Liste PDF"   severity="secondary" outlined onClick={()=>setListe(true)} />
          <Button icon="pi pi-plus"     label="Nouvelle Adhésion" onClick={openNew} />
        </div>
      </div>

      {/* Stats globales bien visibles */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:20 }}>
        <div className="cdc-card" style={{ padding:'18px 20px', borderTop:'3px solid #1a73e8' }}>
          <div style={{ fontSize:28, fontWeight:700, color:'#1a73e8' }}>{statsAll.total}</div>
          <div style={{ fontSize:12, color:'#64748b', marginTop:3 }}>Total {anneeFilter ? anneeFilter : ''}</div>
        </div>
        <div className="cdc-card" style={{ padding:'18px 20px', borderTop:'3px solid #16a34a' }}>
          <div style={{ fontSize:28, fontWeight:700, color:'#16a34a' }}>{statsAll.payes}</div>
          <div style={{ fontSize:12, color:'#64748b', marginTop:3 }}>Payées</div>
        </div>
        <div className="cdc-card" style={{ padding:'18px 20px', borderTop:'3px solid #ea580c' }}>
          <div style={{ fontSize:28, fontWeight:700, color:'#ea580c' }}>{statsAll.attente}</div>
          <div style={{ fontSize:12, color:'#64748b', marginTop:3 }}>En attente</div>
        </div>
        <div className="cdc-card" style={{ padding:'18px 20px', borderTop:'3px solid #7c3aed' }}>
          <div style={{ fontSize:28, fontWeight:700, color:'#7c3aed' }}>{statsAll.exoneres}</div>
          <div style={{ fontSize:12, color:'#64748b', marginTop:3 }}>Exonérées</div>
        </div>
        <div className="cdc-card" style={{ padding:'18px 20px', borderTop:'3px solid #0f766e', gridColumn:'span 1' }}>
          <div style={{ fontSize:16, fontWeight:700, color:'#0f766e' }}>{statsAll.montant.toLocaleString('fr-MA')} MAD</div>
          <div style={{ fontSize:12, color:'#64748b', marginTop:3 }}>Montant perçu</div>
        </div>
      </div>

      <div className="cdc-card">
        <DataTable value={filtered} loading={loading} emptyMessage="Aucune adhésion."
          paginator rows={10} rowsPerPageOptions={[10,25,50]}
          header={
            <div className="flex justify-content-between align-items-center gap-2 flex-wrap">
              <span>{filtered.length} adhésion(s)</span>
              <div className="flex gap-2 align-items-center flex-wrap">
                <Dropdown value={anneeFilter} options={anneeOptions} onChange={e=>setAnneeFilter(e.value)}
                  placeholder="Toutes les années" showClear style={{fontSize:13,minWidth:160}} />
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-search" />
                  <InputText value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher adhérent..." />
                </IconField>
              </div>
            </div>
          }
        >
          <Column header="Adhérent"         body={adherentTpl}     sortField="adherent.nom" style={{minWidth:180}} />
          <Column field="annee"             header="Année"         sortable style={{width:80}} />
          <Column field="categorie.libelle" header="Catégorie"     style={{color:'#64748b'}} />
          <Column header="Montant"          body={montantTpl}      style={{width:150}} />
          <Column field="datePaiement"      header="Date paiement"
            body={r=>r.datePaiement?new Date(r.datePaiement).toLocaleDateString('fr-FR'):'—'} style={{width:120}} />
          <Column field="modePaiement"      header="Mode"          style={{width:90,color:'#64748b'}} />
          <Column header="Statut"           body={statutTpl}       style={{width:110}} />
          <Column header="Actions"          body={actionsTpl}      style={{width:130}} />
        </DataTable>
      </div>

      {/* ── DIALOG FORMULAIRE ── */}
      <Dialog visible={dialogVisible} onHide={()=>setDialog(false)}
        header={editId?"Modifier l'adhésion":'Nouvelle adhésion'} style={{width:600}} modal
        footer={<div>
          <Button icon="pi pi-times" label="Annuler" outlined onClick={()=>setDialog(false)} className="mr-2" />
          <Button icon="pi pi-check" label={editId?'Modifier':'Créer'} loading={saving} onClick={save} />
        </div>}
      >
        <div className="flex flex-column gap-3 pt-3">
          <div className="field"><label className="font-semibold">Adhérent *</label>
            <Dropdown value={form.adherentId} options={adherentOptions} onChange={e=>onAdherentChange(e.value)}
              placeholder="Sélectionner..." className="w-full" filter filterPlaceholder="Rechercher..." disabled={!!editId} /></div>
          <div className="formgrid grid">
            <div className="field col"><label className="font-semibold">Catégorie *</label>
              <Dropdown value={form.categorieId} options={catOptions} onChange={e=>onCategorieChange(e.value)} className="w-full" /></div>
            <div className="field col"><label className="font-semibold">Année *</label>
              <InputNumber value={form.annee} onValueChange={e=>setForm({...form,annee:e.value})} min={2000} max={2099} className="w-full" useGrouping={false} /></div>
          </div>
          <div className="formgrid grid">
            <div className="field col"><label className="font-semibold">Montant (MAD)</label>
              <InputNumber value={form.montant} onValueChange={e=>setForm({...form,montant:e.value})} mode="decimal" minFractionDigits={2} className="w-full" /></div>
            <div className="field col"><label className="font-semibold">Statut</label>
              <Dropdown value={form.statut} options={STATUTS} onChange={e=>setForm({...form,statut:e.value})} className="w-full" /></div>
          </div>
          <div className="formgrid grid">
            <div className="field col"><label className="font-semibold">Date de paiement</label>
              <Calendar value={form.datePaiement} onChange={e=>setForm({...form,datePaiement:e.value})} dateFormat="dd/mm/yy" showIcon className="w-full" /></div>
            <div className="field col"><label className="font-semibold">Mode de paiement</label>
              <Dropdown value={form.modePaiement} options={MODES} onChange={e=>setForm({...form,modePaiement:e.value})} placeholder="Mode..." className="w-full" showClear /></div>
          </div>
          <div className="field"><label className="font-semibold">Référence</label>
            <InputText value={form.referencePaiement} onChange={e=>setForm({...form,referencePaiement:e.target.value})} className="w-full" /></div>
          <div className="field">
            <ToggleButton checked={form.estExonere} onChange={e=>setForm({...form,estExonere:e.value})}
              onLabel="Exonéré" offLabel="Non exonéré" onIcon="pi pi-check" offIcon="pi pi-times" className="w-full" /></div>
          {form.estExonere && (
            <div className="formgrid grid">
              <div className="field col"><label className="font-semibold">Montant exonéré</label>
                <InputNumber value={form.montantExonere} onValueChange={e=>setForm({...form,montantExonere:e.value})} mode="decimal" minFractionDigits={2} className="w-full" /></div>
              <div className="field col"><label className="font-semibold">Motif</label>
                <InputText value={form.motifExoneration} onChange={e=>setForm({...form,motifExoneration:e.target.value})} className="w-full" /></div>
            </div>
          )}
          <div className="field"><label className="font-semibold">Observations</label>
            <InputTextarea value={form.observations} onChange={e=>setForm({...form,observations:e.target.value})} rows={2} className="w-full" autoResize /></div>
        </div>
      </Dialog>

      {/* ── DIALOG LISTE PDF ── */}
      <Dialog visible={listeVisible} onHide={()=>setListe(false)}
        header="Éditer une liste de cotisations" style={{width:460}} modal
        footer={<div>
          <Button icon="pi pi-times" label="Fermer" outlined onClick={()=>setListe(false)} className="mr-2" />
          <Button icon="pi pi-file-pdf" label="Générer le PDF" severity="secondary" onClick={downloadListe} />
        </div>}
      >
        <div className="flex flex-column gap-3 pt-3">
          <div className="field"><label className="font-semibold">Année</label>
            <InputNumber value={listeFiltres.annee} onValueChange={e=>setListeFiltres({...listeFiltres,annee:e.value})} min={2000} max={2099} className="w-full" useGrouping={false} /></div>
          <div className="field"><label className="font-semibold">Catégorie</label>
            <Dropdown value={listeFiltres.categorieId} options={catFiltreOptions} onChange={e=>setListeFiltres({...listeFiltres,categorieId:e.value})} className="w-full" /></div>
          <div className="field"><label className="font-semibold">Statut</label>
            <Dropdown value={listeFiltres.statut} options={[{label:'Tous',value:''},...STATUTS]} onChange={e=>setListeFiltres({...listeFiltres,statut:e.value})} className="w-full" /></div>
          <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, padding:12, fontSize:13, color:'#64748b' }}>
            <i className="pi pi-info-circle mr-2"></i>
            Bande verte = payé · Bande rouge = en attente · Totaux en bas
          </div>
        </div>
      </Dialog>

      {/* ── DIALOG RELANCES ── */}
      <Dialog visible={relanceVisible} onHide={()=>setRelance(false)}
        header="Relances — Adhérents non régularisés" style={{width:800}} modal
        footer={
          <div className="flex justify-content-between align-items-center">
            <span style={{fontSize:13,color:'#64748b'}}>{selectedRelance.length} sélectionné(s)</span>
            <div>
              <Button icon="pi pi-times" label="Fermer" outlined onClick={()=>setRelance(false)} className="mr-2" />
              <Button icon="pi pi-envelope" label={`Envoyer${selectedRelance.length>0?' ('+selectedRelance.length+')':''}`}
                severity="warning" loading={sendingRelance} disabled={!selectedRelance.length} onClick={envoyerRelances} />
            </div>
          </div>
        }
      >
        <div className="flex flex-column gap-3 pt-2">
          <div className="flex gap-3 align-items-end flex-wrap">
            <div>
              <label className="font-semibold" style={{fontSize:13,display:'block',marginBottom:6}}>Année de référence</label>
              <InputNumber value={anneeRelance} onValueChange={e=>setAnneeRelance(e.value)} min={2000} max={2099} useGrouping={false} />
            </div>
            <Button icon="pi pi-refresh" label="Actualiser" outlined onClick={loadNonReg} loading={loadingNonReg} />
            {nonReg.length > 0 && (
              <Button icon="pi pi-check-square" label="Tout sélectionner" text onClick={()=>setSelectedRelance(nonReg)} />
            )}
          </div>

          {/* Stats non régularisés */}
          {nonReg.length > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              <div style={{ background:'#fef9f0', border:'1px solid #fcd34d', borderRadius:8, padding:'12px 16px' }}>
                <div style={{ fontSize:22, fontWeight:700, color:'#b45309' }}>{nonReg.length}</div>
                <div style={{ fontSize:12, color:'#92400e' }}>Non régularisés</div>
              </div>
              <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:8, padding:'12px 16px' }}>
                <div style={{ fontSize:22, fontWeight:700, color:'#dc2626' }}>{nonReg.filter(r=>r.statut==='NON_ENREGISTRE').length}</div>
                <div style={{ fontSize:12, color:'#991b1b' }}>Non enregistrés</div>
              </div>
              <div style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:8, padding:'12px 16px' }}>
                <div style={{ fontSize:22, fontWeight:700, color:'#ea580c' }}>{nonReg.filter(r=>r.statut==='EN_ATTENTE').length}</div>
                <div style={{ fontSize:12, color:'#9a3412' }}>En attente</div>
              </div>
            </div>
          )}

          {nonReg.length === 0 && !loadingNonReg ? (
            <div style={{ textAlign:'center', padding:'30px 0', color:'#16a34a' }}>
              <i className="pi pi-check-circle" style={{ fontSize:32, display:'block', marginBottom:8 }}></i>
              <div className="font-semibold">Tous les adhérents actifs sont régularisés pour {anneeRelance} !</div>
            </div>
          ) : (
            <DataTable value={nonReg} loading={loadingNonReg}
              selection={selectedRelance} onSelectionChange={e=>setSelectedRelance(e.value)}
              emptyMessage="Aucun adhérent non régularisé." style={{fontSize:13}}
            >
              <Column selectionMode="multiple" style={{width:40}} />
              <Column field="numeroAdherent" header="N°" style={{width:90}} />
              <Column header="Adhérent" body={r=><div><div className="font-semibold">{r.prenom} {r.nom}</div><div style={{fontSize:11,color:'#94a3b8'}}>{r.service}</div></div>} />
              <Column field="categorie" header="Catégorie" />
              <Column field="montantDu" header="Montant dû"
                body={r=>r.montantDu?<span className="font-semibold">{Number(r.montantDu).toLocaleString('fr-MA')} MAD</span>:'—'} />
              <Column field="statut" header="Situation"
                body={r=><span style={{color:r.statut==='NON_ENREGISTRE'?'#dc2626':'#ea580c',fontWeight:600}}>
                  {r.statut==='NON_ENREGISTRE'?'Non enregistré':'En attente'}
                </span>} />
              <Column field="email" header="Email" style={{color:'#64748b'}} />
            </DataTable>
          )}
        </div>
      </Dialog>
    </div>
  )
}