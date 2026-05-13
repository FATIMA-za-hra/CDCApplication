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
import { TabView, TabPanel } from 'primereact/tabview'
import { FileUpload } from 'primereact/fileupload'
import { Timeline } from 'primereact/timeline'
import { Tag } from 'primereact/tag'
import { adherentApi, categorieApi, adhesionApi } from '../services/api'
import { usePhotoUrl, Avatar } from '../components/usePhoto.jsx'

const STATUTS = [
  { label: 'Actif',          value: 'ACTIF' },
  { label: 'Suspendu',       value: 'SUSPENDU' },
  { label: 'Radié',          value: 'RADIE' },
  { label: 'Démissionnaire', value: 'DEMISSIONNAIRE' },
  { label: 'Décédé',         value: 'DECEDE' },
]
const SITUATIONS = [
  { label: 'Célibataire', value: 'celibataire' },
  { label: 'Marié(e)',    value: 'marie'        },
  { label: 'Divorcé(e)', value: 'divorce'       },
  { label: 'Veuf/Veuve', value: 'veuf'          },
]
const SEXES        = [{ label: 'Masculin', value: 'M' }, { label: 'Féminin', value: 'F' }]
const TYPES_PIECES = ['CIN', 'Certificat de travail', 'Photo', 'Acte de naissance', 'Autre']

const EMPTY = {
  nom: '', prenom: '', cin: '', matricule: '', dateNaissance: null,
  situationFamiliale: '', service: '', telephone: '', adresse: '',
  email: '', dateAdhesion: null, statut: 'ACTIF',
  categorieId: null, nombreEnfants: 0, observations: ''
}

const HIST_ICONS = {
  CREATION:          { icon: 'pi pi-plus-circle', color: '#16a34a' },
  MODIFICATION:      { icon: 'pi pi-pencil',       color: '#2563eb' },
  CHANGEMENT_STATUT: { icon: 'pi pi-sync',          color: '#ea580c' },
  AJOUT_PIECE:       { icon: 'pi pi-paperclip',     color: '#7c3aed' },
  SUPPRESSION_PIECE: { icon: 'pi pi-trash',          color: '#dc2626' },
}

// Composant photo détail avec JWT
function PhotoDetail({ photoChemin, size = 100 }) {
  const src = usePhotoUrl(photoChemin)
  if (src) return (
    <img src={src} alt="Photo adhérent"
      style={{ width: size, height: size, objectFit: 'cover',
        borderRadius: 8, border: '2px solid #e2e8f0', display: 'block' }} />
  )
  return (
    <div style={{ width: size, height: size, borderRadius: 8,
      border: '2px solid #e2e8f0', background: '#f1f5f9',
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <i className="pi pi-user" style={{ fontSize: 38, color: '#cbd5e1' }}></i>
    </div>
  )
}

export default function AdherentsPage() {
  const [adherents, setAdherents]       = useState([])
  const [categories, setCategories]     = useState([])
  const [loading, setLoading]           = useState(true)
  const [dialogVisible, setDialog]      = useState(false)
  const [detailVisible, setDetail]      = useState(false)
  const [selected, setSelected]         = useState(null)
  const [form, setForm]                 = useState(EMPTY)
  const [editId, setEditId]             = useState(null)
  const [saving, setSaving]             = useState(false)
  const [search, setSearch]             = useState('')
  const [statutFilter, setStatutFilter] = useState(null)
  const [detailTab, setDetailTab]       = useState(0)
  const [enfants, setEnfants]           = useState([])
  const [pieces, setPieces]             = useState([])
  const [typePieceUpload, setTypePieceUpload] = useState('CIN')
  const [uploadLoading, setUploadLoading]     = useState(false)
  const [historique, setHistorique]     = useState([])
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoFile, setPhotoFile]       = useState(null)
  const [adhesionsAdherent, setAdhesionsAdherent] = useState([])
  const toast = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const [a, c] = await Promise.all([adherentApi.getAll(), categorieApi.getActives()])
      setAdherents(a.data); setCategories(c.data)
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Chargement impossible', life: 3000 })
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = adherents.filter(a => {
    const q = search.toLowerCase()
    const ms = !search.trim() ||
      a.nom?.toLowerCase().includes(q) || a.prenom?.toLowerCase().includes(q) ||
      a.cin?.toLowerCase().includes(q)  || a.matricule?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q)|| a.numeroAdherent?.toLowerCase().includes(q)
    return ms && (!statutFilter || a.statut === statutFilter)
  })

  const openNew = () => {
    setForm(EMPTY); setEditId(null); setEnfants([])
    setPhotoPreview(null); setPhotoFile(null); setDialog(true)
  }

  const openEdit = async row => {
    setForm({
      nom: row.nom, prenom: row.prenom, cin: row.cin || '',
      matricule: row.matricule || '',
      dateNaissance: row.dateNaissance ? new Date(row.dateNaissance) : null,
      situationFamiliale: row.situationFamiliale || '',
      service: row.service || '', telephone: row.telephone || '',
      adresse: row.adresse || '', email: row.email || '',
      dateAdhesion: row.dateAdhesion ? new Date(row.dateAdhesion) : null,
      statut: row.statut || 'ACTIF', categorieId: row.categorie?.id || null,
      nombreEnfants: row.nombreEnfants || 0, observations: row.observations || ''
    })
    setEditId(row.id)
    setPhotoPreview(null); setPhotoFile(null)
    try {
      const res = await adherentApi.getEnfants(row.id)
      setEnfants(res.data.map(e => ({
        nom: e.nom, prenom: e.prenom,
        dateNaissance: e.dateNaissance ? new Date(e.dateNaissance) : null,
        sexe: e.sexe || ''
      })))
    } catch { setEnfants([]) }
    setDialog(true)
  }

  const openDetail = async row => {
    setSelected(row); setDetailTab(0); setDetail(true)
    try {
      const [e, p, h, adh] = await Promise.all([
        adherentApi.getEnfants(row.id),
        adherentApi.getPieces(row.id),
        adherentApi.getHistorique(row.id),
        adhesionApi.getByAdherent(row.id)
      ])
      setEnfants(e.data); setPieces(p.data)
      setHistorique(h.data); setAdhesionsAdherent(adh.data)
    } catch (err) {
      console.error('Erreur chargement detail:', err)
    }
  }

  const onNombreEnfantsChange = n => {
    const nb = n || 0
    setForm(prev => ({ ...prev, nombreEnfants: nb }))
    setEnfants(prev => {
      const arr = [...prev]
      while (arr.length < nb) arr.push({ nom: '', prenom: '', dateNaissance: null, sexe: '' })
      return arr.slice(0, nb)
    })
  }

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
      let savedId = editId
      if (editId) {
        await adherentApi.update(editId, payload)
        toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Adhérent modifié', life: 3000 })
      } else {
        const res = await adherentApi.create(payload)
        savedId = res.data.id
        toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Adhérent créé — compte utilisateur généré', life: 4000 })
      }
      if (photoFile && savedId) {
        const fd = new FormData(); fd.append('file', photoFile)
        await adherentApi.uploadPhoto(savedId, fd)
      }
      if (savedId && enfants.length > 0) {
        const ep = enfants.filter(e => e.nom?.trim()).map(e => ({
          nom: e.nom, prenom: e.prenom, sexe: e.sexe,
          dateNaissance: e.dateNaissance ? e.dateNaissance.toISOString().split('T')[0] : null
        }))
        await adherentApi.sauvegarderEnfants(savedId, ep)
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

  const exporterPdf = async row => {
    try {
      const res = await adherentApi.exportPdf(row.id)
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a'); a.href = url
      a.download = `fiche-${row.numeroAdherent}.pdf`; a.click()
      window.URL.revokeObjectURL(url)
    } catch { toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur PDF', life: 3000 }) }
  }

  const handleUploadPiece = async event => {
    const file = event.files[0]
    if (!selected) return
    setUploadLoading(true)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('typePiece', typePieceUpload)
      await adherentApi.uploadPiece(selected.id, fd)
      toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Pièce ajoutée', life: 3000 })
      const res = await adherentApi.getPieces(selected.id); setPieces(res.data)
    } catch { toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur upload', life: 3000 }) }
    finally { setUploadLoading(false) }
  }

  const supprimerPiece = async pid => {
    try {
      await adherentApi.supprimerPiece(pid)
      setPieces(prev => prev.filter(p => p.id !== pid))
    } catch { toast.current?.show({ severity: 'error', summary: 'Erreur', life: 3000 }) }
  }

  const consulterPiece = async piece => {
    try {
      const res = await adherentApi.telechargerPiece(piece.id)
      const url = window.URL.createObjectURL(new Blob([res.data], { type: piece.typeContenu || 'application/pdf' }))
      window.open(url, '_blank')
    } catch { toast.current?.show({ severity: 'error', summary: 'Erreur', life: 3000 }) }
  }

  const telechargerPiece = async piece => {
    try {
      const res = await adherentApi.telechargerPiece(piece.id)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a'); a.href = url; a.download = piece.nom; a.click()
      window.URL.revokeObjectURL(url)
    } catch { toast.current?.show({ severity: 'error', summary: 'Erreur', life: 3000 }) }
  }

  const derniereAdhesion = adhesionsAdherent
    .filter(a => a.statut === 'PAYE' || a.statut === 'EXONERE')
    .sort((a, b) => b.annee - a.annee)[0]

  const imprimerCarte = async () => {
    if (!selected) return
    const annee = derniereAdhesion?.annee || new Date().getFullYear()

    // Charger la photo en blob pour l'impression
    let photoDataUrl = null
    if (selected.photoChemin) {
      try {
        const token = localStorage.getItem('cdc_token')
        const res = await fetch(selected.photoChemin, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) {
          const blob = await res.blob()
          photoDataUrl = await new Promise(resolve => {
            const reader = new FileReader()
            reader.onload = e => resolve(e.target.result)
            reader.readAsDataURL(blob)
          })
        }
      } catch {}
    }

    const photoHtml = photoDataUrl
      ? `<img src="${photoDataUrl}" style="width:100%;height:100%;object-fit:cover" />`
      : `<span>${(selected.prenom?.[0]||'')+(selected.nom?.[0]||'')}</span>`

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  @page { size: 85.6mm 54mm; margin: 0; }
  body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
  .carte {
    width: 85.6mm; height: 54mm; background: #1a1a2e;
    color: white; padding: 5mm; box-sizing: border-box;
    display: flex; flex-direction: column; justify-content: space-between;
    position: relative; overflow: hidden;
  }
  .carte::before { content:''; position:absolute; width:38mm; height:38mm;
    border-radius:50%; background:rgba(255,255,255,.04); top:-12mm; right:-10mm; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; }
  .org { font-size:6.5pt; font-weight:bold; letter-spacing:1.5px; text-transform:uppercase; color:#ccc; }
  .type { font-size:5pt; color:#888; margin-top:0.5mm; }
  .num  { font-size:7pt; font-weight:bold; color:#ddd; }
  .body { display:flex; gap:3mm; align-items:center; }
  .avatar { width:13mm; height:13mm; border-radius:50%; border:0.5mm solid #555;
    overflow:hidden; flex-shrink:0; display:flex; align-items:center;
    justify-content:center; background:#333; font-size:11pt; font-weight:bold; color:#ccc; }
  .nom { font-size:9.5pt; font-weight:bold; }
  .detail { font-size:6pt; color:#aaa; margin-top:1mm; line-height:1.6; }
  .footer { display:flex; justify-content:flex-end; }
  .annee { font-size:18pt; font-weight:bold; letter-spacing:3px; }
</style></head><body>
<div class="carte">
  <div class="header">
    <div><div class="org">CDCApplication</div><div class="type">Carte d Adherent</div></div>
    <div class="num">${selected.numeroAdherent||'---'}</div>
  </div>
  <div class="body">
    <div class="avatar">${photoHtml}</div>
    <div>
      <div class="nom">${selected.prenom} ${selected.nom}</div>
      <div class="detail">CIN : ${selected.cin||'---'}<br>Matricule : ${selected.matricule||'---'}<br>Service : ${selected.service||'---'}</div>
    </div>
  </div>
  <div class="footer"><div class="annee">${annee}</div></div>
</div>
</body></html>`

    const win = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
    setTimeout(() => win.print(), 600)
  }

  const formatTaille = b => {
    if (!b) return '—'
    if (b < 1024) return b + ' o'
    if (b < 1024*1024) return (b/1024).toFixed(1) + ' Ko'
    return (b/(1024*1024)).toFixed(1) + ' Mo'
  }

  /* ── Templates tableau ── */
  const adherentTpl = row => (
    <div className="flex align-items-center gap-2" style={{ cursor: 'pointer' }} onClick={() => openDetail(row)}>
      <Avatar photoChemin={row.photoChemin} prenom={row.prenom} nom={row.nom} size={36} />
      <div>
        <div className="font-semibold">{row.prenom} {row.nom}</div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>{row.numeroAdherent} • {row.cin || '—'}</div>
      </div>
    </div>
  )

  const categorieTpl = row => <span>{row.categorie?.libelle || '—'}</span>
  const statutTpl    = row => <span>{STATUTS.find(s => s.value === row.statut)?.label || row.statut || '—'}</span>

  const actionsTpl = row => (
    <div className="flex gap-1">
      <Button icon="pi pi-eye"      size="small" outlined severity="info"
        tooltip="Voir" tooltipOptions={{ position: 'top' }} onClick={() => openDetail(row)} />
      <Button icon="pi pi-file-pdf" size="small" outlined severity="secondary"
        tooltip="Export PDF" tooltipOptions={{ position: 'top' }} onClick={() => exporterPdf(row)} />
      <Button icon="pi pi-pencil"   size="small" outlined
        tooltip="Modifier" tooltipOptions={{ position: 'top' }} onClick={() => openEdit(row)} />
      <Button icon="pi pi-trash"    size="small" outlined severity="danger"
        tooltip="Supprimer" tooltipOptions={{ position: 'top' }} onClick={() => confirmDelete(row)} />
    </div>
  )

  const catOptions = categories.map(c => ({
    label: `${c.libelle} — ${Number(c.montant).toLocaleString('fr-MA')} MAD`, value: c.id
  }))

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="cdc-page-header">
        <div><h1>Adhérents</h1><p>Gestion des fiches adhérents</p></div>
        <Button icon="pi pi-user-plus" label="Nouvel Adhérent" onClick={openNew} />
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12, marginBottom:20 }}>
        {[
          { label:'Total',     value:adherents.length,                                     statut:null,       color:'#1a73e8' },
          { label:'Actifs',    value:adherents.filter(a=>a.statut==='ACTIF').length,        statut:'ACTIF',    color:'#16a34a' },
          { label:'Suspendus', value:adherents.filter(a=>a.statut==='SUSPENDU').length,     statut:'SUSPENDU', color:'#ea580c' },
          { label:'Radiés',    value:adherents.filter(a=>a.statut==='RADIE').length,        statut:'RADIE',    color:'#dc2626' },
        ].map(s => (
          <div key={s.label} className="cdc-card"
            style={{ padding:'16px 20px', cursor:'pointer', borderTop:`3px solid ${s.color}` }}
            onClick={() => setStatutFilter(s.statut)}>
            <div style={{ fontSize:26, fontWeight:700, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="cdc-card">
        <DataTable value={filtered} loading={loading} emptyMessage="Aucun adhérent."
          paginator rows={10} rowsPerPageOptions={[10,25,50]}
          header={
            <div className="flex justify-content-between align-items-center gap-2 flex-wrap">
              <div className="flex align-items-center gap-2">
                <span>{filtered.length} / {adherents.length} adhérent(s)</span>
                {statutFilter && (
                  <Button icon="pi pi-times" size="small" text severity="secondary"
                    label={`Filtre: ${STATUTS.find(s=>s.value===statutFilter)?.label}`}
                    onClick={() => setStatutFilter(null)} />
                )}
              </div>
              <div className="flex gap-2 align-items-center flex-wrap">
                <Dropdown value={statutFilter} options={STATUTS} onChange={e=>setStatutFilter(e.value)}
                  placeholder="Tous les statuts" showClear style={{ fontSize:13 }} />
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-search" />
                  <InputText value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." />
                </IconField>
              </div>
            </div>
          }
        >
          <Column header="Adhérent"  body={adherentTpl}  sortField="nom" sortable style={{ minWidth:220 }} />
          <Column field="service"    header="Service"    style={{ color:'#64748b' }} />
          <Column field="telephone"  header="Téléphone"  style={{ width:130 }} />
          <Column header="Catégorie" body={categorieTpl} style={{ width:150 }} />
          <Column header="Statut"    body={statutTpl}    style={{ width:120 }} />
          <Column header="Actions"   body={actionsTpl}   style={{ width:170 }} />
        </DataTable>
      </div>

      {/* ══ DIALOG FORMULAIRE ══ */}
      <Dialog visible={dialogVisible} onHide={() => setDialog(false)}
        header={editId ? "Modifier l'adhérent" : 'Nouvel adhérent'}
        style={{ width: 740 }} modal
        footer={
          <div>
            <Button icon="pi pi-times" label="Annuler" outlined onClick={() => setDialog(false)} className="mr-2" />
            <Button icon="pi pi-check" label={editId ? 'Modifier' : 'Créer'} loading={saving} onClick={save} />
          </div>
        }
      >
        <div className="flex flex-column gap-3 pt-2">
          {/* Photo */}
          <div className="flex align-items-center gap-3">
            <div style={{ width:80, height:80, borderRadius:'50%', overflow:'hidden',
              border:'2px solid #e2e8f0', background:'#f1f5f9',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              {photoPreview
                ? <img src={photoPreview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <i className="pi pi-user" style={{ fontSize:28, color:'#cbd5e1' }}></i>}
            </div>
            <div>
              <div className="font-semibold" style={{ fontSize:13, marginBottom:6 }}>Photo de l'adhérent</div>
              <input type="file" accept="image/*" style={{ display:'none' }} id="photo-adh"
                onChange={e => {
                  const f = e.target.files[0]; if(!f) return
                  setPhotoFile(f)
                  const reader = new FileReader()
                  reader.onload = ev => setPhotoPreview(ev.target.result)
                  reader.readAsDataURL(f)
                }} />
              <Button icon="pi pi-camera" label="Choisir" size="small" outlined
                onClick={() => document.getElementById('photo-adh').click()} type="button" />
              {photoPreview && (
                <Button icon="pi pi-trash" size="small" text severity="danger" style={{ marginLeft:6 }}
                  onClick={() => { setPhotoPreview(null); setPhotoFile(null) }} />
              )}
            </div>
          </div>

          <Divider className="my-1" />
          <div style={{ fontWeight:700, fontSize:13, color:'#374151' }}><i className="pi pi-user mr-2"></i>Identité</div>
          <div className="formgrid grid">
            <div className="field col"><label className="font-semibold">Nom *</label>
              <InputText value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})} className="w-full" /></div>
            <div className="field col"><label className="font-semibold">Prénom *</label>
              <InputText value={form.prenom} onChange={e=>setForm({...form,prenom:e.target.value})} className="w-full" /></div>
          </div>
          <div className="formgrid grid">
            <div className="field col"><label className="font-semibold">CIN</label>
              <InputText value={form.cin} onChange={e=>setForm({...form,cin:e.target.value.toUpperCase()})} className="w-full" /></div>
            <div className="field col"><label className="font-semibold">Matricule</label>
              <InputText value={form.matricule} onChange={e=>setForm({...form,matricule:e.target.value})} className="w-full" /></div>
          </div>
          <div className="formgrid grid">
            <div className="field col"><label className="font-semibold">Date de naissance</label>
              <Calendar value={form.dateNaissance} onChange={e=>setForm({...form,dateNaissance:e.value})}
                dateFormat="dd/mm/yy" showIcon className="w-full" maxDate={new Date()} /></div>
            <div className="field col"><label className="font-semibold">Situation familiale</label>
              <Dropdown value={form.situationFamiliale} options={SITUATIONS}
                onChange={e=>setForm({...form,situationFamiliale:e.value})} placeholder="Sélectionner..." className="w-full" /></div>
          </div>
          <div className="formgrid grid">
            <div className="field col"><label className="font-semibold">Service</label>
              <InputText value={form.service} onChange={e=>setForm({...form,service:e.target.value})} className="w-full" /></div>
            <div className="field col"><label className="font-semibold">Téléphone</label>
              <InputText value={form.telephone} onChange={e=>setForm({...form,telephone:e.target.value})} className="w-full" /></div>
          </div>
          <div className="formgrid grid">
            <div className="field col"><label className="font-semibold">Email</label>
              <InputText value={form.email} onChange={e=>setForm({...form,email:e.target.value})} type="email" className="w-full" /></div>
            <div className="field col"><label className="font-semibold">Adresse</label>
              <InputText value={form.adresse} onChange={e=>setForm({...form,adresse:e.target.value})} className="w-full" /></div>
          </div>

          <Divider className="my-1" />
          <div style={{ fontWeight:700, fontSize:13, color:'#374151' }}><i className="pi pi-id-card mr-2"></i>Adhésion</div>
          <div className="formgrid grid">
            <div className="field col"><label className="font-semibold">Date d'adhésion</label>
              <Calendar value={form.dateAdhesion} onChange={e=>setForm({...form,dateAdhesion:e.value})}
                dateFormat="dd/mm/yy" showIcon className="w-full" /></div>
            <div className="field col"><label className="font-semibold">Statut</label>
              <Dropdown value={form.statut} options={STATUTS}
                onChange={e=>setForm({...form,statut:e.value})} className="w-full" /></div>
          </div>
          <div className="field"><label className="font-semibold">Catégorie</label>
            <Dropdown value={form.categorieId} options={catOptions}
              onChange={e=>setForm({...form,categorieId:e.value})}
              placeholder="Sélectionner une catégorie..." className="w-full" /></div>

          <Divider className="my-1" />
          <div style={{ fontWeight:700, fontSize:13, color:'#374151' }}><i className="pi pi-users mr-2"></i>Enfants</div>
          <div className="field"><label className="font-semibold">Nombre d'enfants</label>
            <InputNumber value={form.nombreEnfants} onValueChange={e=>onNombreEnfantsChange(e.value)} min={0} max={20} className="w-full" /></div>

          {enfants.length > 0 && (
            <div style={{ border:'1px solid #e2e8f0', borderRadius:8, overflow:'hidden' }}>
              <div style={{ background:'#f8fafc', padding:'8px 14px', fontWeight:600, fontSize:13, borderBottom:'1px solid #e2e8f0' }}>Informations des enfants</div>
              <div style={{ padding:12, display:'flex', flexDirection:'column', gap:8 }}>
                {enfants.map((enf,idx) => (
                  <div key={idx} style={{ border:'1px solid #f1f5f9', borderRadius:6, padding:10 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'#64748b', marginBottom:6 }}>Enfant {idx+1}</div>
                    <div className="formgrid grid">
                      <div className="field col"><InputText value={enf.nom} onChange={e=>{const a=[...enfants];a[idx].nom=e.target.value;setEnfants(a)}} placeholder="Nom" className="w-full" style={{ fontSize:13 }} /></div>
                      <div className="field col"><InputText value={enf.prenom} onChange={e=>{const a=[...enfants];a[idx].prenom=e.target.value;setEnfants(a)}} placeholder="Prénom" className="w-full" style={{ fontSize:13 }} /></div>
                      <div className="field col"><Calendar value={enf.dateNaissance} onChange={e=>{const a=[...enfants];a[idx].dateNaissance=e.value;setEnfants(a)}} dateFormat="dd/mm/yy" showIcon className="w-full" maxDate={new Date()} /></div>
                      <div className="field col" style={{ maxWidth:130 }}><Dropdown value={enf.sexe} options={SEXES} onChange={e=>{const a=[...enfants];a[idx].sexe=e.value;setEnfants(a)}} placeholder="Sexe" className="w-full" /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="field"><label className="font-semibold">Observations</label>
            <InputTextarea value={form.observations} onChange={e=>setForm({...form,observations:e.target.value})} rows={2} className="w-full" autoResize /></div>

          {!editId && (
            <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, padding:12, fontSize:13, color:'#15803d' }}>
              <i className="pi pi-info-circle mr-2"></i>
              Un compte utilisateur sera automatiquement créé.
            </div>
          )}
        </div>
      </Dialog>

      {/* ══ DIALOG FICHE DÉTAIL ══ */}
      <Dialog visible={detailVisible} onHide={() => setDetail(false)}
        header={selected ? `${selected.prenom} ${selected.nom} — ${selected.numeroAdherent}` : ''}
        style={{ width:820 }} modal maximizable
        footer={
          <div className="flex justify-content-between align-items-center">
            <div className="flex gap-2">
              <Button icon="pi pi-file-pdf" label="Export PDF"     severity="secondary" outlined onClick={() => selected && exporterPdf(selected)} />
              <Button icon="pi pi-id-card"  label="Imprimer Carte" severity="secondary" outlined onClick={imprimerCarte} />
            </div>
            <div className="flex gap-2">
              <Button icon="pi pi-pencil" label="Modifier" outlined onClick={() => { setDetail(false); openEdit(selected) }} />
              <Button icon="pi pi-times"  label="Fermer"            onClick={() => setDetail(false)} />
            </div>
          </div>
        }
      >
        {selected && (
          <TabView activeIndex={detailTab} onTabChange={e => setDetailTab(e.index)}>

            {/* ── Informations ── */}
            <TabPanel header="Informations" leftIcon="pi pi-user mr-2">
              <div className="flex gap-4">
                <div style={{ flexShrink:0 }}>
                  <PhotoDetail photoChemin={selected.photoChemin} size={100} />
                  <div style={{ textAlign:'center', marginTop:6, fontSize:11, color:'#94a3b8' }}>{selected.numeroAdherent}</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px 24px' }}>
                    {[
                      { label:'Statut',              value: STATUTS.find(s=>s.value===selected.statut)?.label || selected.statut },
                      { label:'Nom complet',          value: `${selected.prenom} ${selected.nom}` },
                      { label:'CIN',                  value: selected.cin || '—' },
                      { label:'Matricule',             value: selected.matricule || '—' },
                      { label:'Date de naissance',    value: selected.dateNaissance ? new Date(selected.dateNaissance).toLocaleDateString('fr-FR') : '—' },
                      { label:'Situation familiale',  value: selected.situationFamiliale || '—' },
                      { label:"Nombre d'enfants",     value: selected.nombreEnfants ?? '—' },
                      { label:'Service',              value: selected.service || '—' },
                      { label:'Téléphone',            value: selected.telephone || '—' },
                      { label:'Email',                value: selected.email || '—' },
                      { label:'Catégorie',            value: selected.categorie?.libelle || '—' },
                      { label:"Date d'adhésion",      value: selected.dateAdhesion ? new Date(selected.dateAdhesion).toLocaleDateString('fr-FR') : '—' },
                    ].map(item => (
                      <div key={item.label} style={{ padding:'5px 0', borderBottom:'1px solid #f1f5f9' }}>
                        <div style={{ fontSize:11, color:'#94a3b8', marginBottom:2 }}>{item.label}</div>
                        <div style={{ fontSize:13, fontWeight:500 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  {selected.observations && (
                    <div style={{ background:'#f8fafc', borderRadius:6, padding:10, fontSize:13, color:'#64748b', marginTop:10 }}>
                      <strong>Observations :</strong> {selected.observations}
                    </div>
                  )}
                </div>
              </div>
            </TabPanel>

            {/* ── Enfants ── */}
            <TabPanel header={`Enfants (${enfants.length})`} leftIcon="pi pi-users mr-2">
              {enfants.length === 0 ? (
                <div style={{ textAlign:'center', padding:'30px 0', color:'#94a3b8' }}>
                  <i className="pi pi-users" style={{ fontSize:32, display:'block', marginBottom:8 }}></i>
                  Aucun enfant enregistré
                </div>
              ) : (
                <DataTable value={enfants} style={{ fontSize:13 }}>
                  <Column field="prenom" header="Prénom" />
                  <Column field="nom"    header="Nom" />
                  <Column field="dateNaissance" header="Date de naissance"
                    body={r => r.dateNaissance ? new Date(r.dateNaissance).toLocaleDateString('fr-FR') : '—'} />
                  <Column field="age"  header="Âge"  style={{ width:70 }} />
                  <Column field="sexe" header="Sexe" style={{ width:100 }}
                    body={r => r.sexe==='M'?'Masculin':r.sexe==='F'?'Féminin':'—'} />
                </DataTable>
              )}
            </TabPanel>

            {/* ── Pièces ── */}
            <TabPanel header={`Pièces (${pieces.length})`} leftIcon="pi pi-paperclip mr-2">
              <div className="flex flex-column gap-3">
                <div className="flex gap-2 align-items-end flex-wrap">
                  <div>
                    <label style={{ fontSize:12, fontWeight:600, display:'block', marginBottom:4 }}>Type</label>
                    <Dropdown value={typePieceUpload}
                      options={TYPES_PIECES.map(t=>({label:t,value:t}))}
                      onChange={e=>setTypePieceUpload(e.value)} style={{ fontSize:13 }} />
                  </div>
                  <FileUpload mode="basic" name="file" accept="image/*,application/pdf"
                    maxFileSize={5000000} customUpload uploadHandler={handleUploadPiece}
                    auto chooseLabel="Ajouter une pièce" disabled={uploadLoading} />
                </div>
                {pieces.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'20px 0', color:'#94a3b8', fontSize:13 }}>Aucune pièce justificative</div>
                ) : (
                  <DataTable value={pieces} style={{ fontSize:13 }}>
                    <Column field="typePiece"    header="Type"   style={{ width:130 }} />
                    <Column field="nom"          header="Fichier" />
                    <Column field="tailleOctets" header="Taille" style={{ width:90 }} body={r=>formatTaille(r.tailleOctets)} />
                    <Column header="Date" style={{ width:110 }}
                      body={r => r.dateAjout ? new Date(r.dateAjout).toLocaleDateString('fr-FR') : '—'} />
                    <Column header="" style={{ width:120 }}
                      body={r => (
                        <div className="flex gap-1">
                          <Button icon="pi pi-eye"      size="small" outlined severity="info"
                            tooltip="Consulter" tooltipOptions={{ position:'top' }}
                            onClick={() => consulterPiece(r)} />
                          <Button icon="pi pi-download" size="small" outlined
                            tooltip="Télécharger" tooltipOptions={{ position:'top' }}
                            onClick={() => telechargerPiece(r)} />
                          <Button icon="pi pi-trash"    size="small" outlined severity="danger"
                            tooltip="Supprimer" tooltipOptions={{ position:'top' }}
                            onClick={() => confirmDialog({
                              message:`Supprimer "${r.nom}" ?`,
                              header:'Confirmation', icon:'pi pi-exclamation-triangle',
                              acceptLabel:'Supprimer', rejectLabel:'Annuler', acceptClassName:'p-button-danger',
                              accept:()=>supprimerPiece(r.id)
                            })} />
                        </div>
                      )} />
                  </DataTable>
                )}
              </div>
            </TabPanel>

            {/* ── Historique ── */}
            <TabPanel header={`Historique (${historique.length})`} leftIcon="pi pi-history mr-2">
              {historique.length === 0 ? (
                <div style={{ textAlign:'center', padding:'30px 0', color:'#94a3b8' }}>
                  <i className="pi pi-history" style={{ fontSize:32, display:'block', marginBottom:8 }}></i>
                  Aucune modification enregistrée
                </div>
              ) : (
                <div style={{ maxHeight:400, overflowY:'auto' }}>
                  <Timeline value={historique}
                    marker={item => {
                      const conf = HIST_ICONS[item.action] || { icon:'pi pi-circle', color:'#94a3b8' }
                      return (
                        <span style={{ width:28, height:28, borderRadius:'50%',
                          background:conf.color+'18', border:'2px solid '+conf.color,
                          display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <i className={conf.icon} style={{ fontSize:11, color:conf.color }}></i>
                        </span>
                      )
                    }}
                    opposite={item => (
                      <small style={{ color:'#94a3b8', fontSize:10 }}>
                        {item.dateModification ? new Date(item.dateModification).toLocaleString('fr-FR') : ''}
                        <br />{item.modifiePar}
                      </small>
                    )}
                    content={item => (
                      <div style={{ background:'#f8fafc', borderRadius:6, padding:'7px 11px', marginBottom:8 }}>
                        <div className="flex gap-2 align-items-center" style={{ marginBottom:4 }}>
                          <Tag value={item.action} severity="secondary" style={{ fontSize:10 }} />
                          {item.champModifie && <span style={{ color:'#64748b', fontSize:12 }}>{item.champModifie}</span>}
                        </div>
                        {(item.ancienneValeur || item.nouvelleValeur) && (
                          <div style={{ fontSize:12, color:'#64748b' }}>
                            {item.ancienneValeur && <span style={{ color:'#dc2626' }}>— {item.ancienneValeur} </span>}
                            {item.nouvelleValeur && <span style={{ color:'#16a34a' }}>→ {item.nouvelleValeur}</span>}
                          </div>
                        )}
                      </div>
                    )}
                  />
                </div>
              )}
            </TabPanel>

            {/* ── Carte PVC ── */}
            <TabPanel header="Carte Adhérent" leftIcon="pi pi-id-card mr-2">
              <div className="flex flex-column align-items-center gap-4">
                <div style={{ fontSize:12, color:'#94a3b8' }}>Format 85.6 × 54 mm</div>

                {/* Aperçu recto */}
                <div style={{ width:323, height:204, background:'#1a1a2e',
                  borderRadius:12, color:'white', padding:20, boxSizing:'border-box',
                  display:'flex', flexDirection:'column', justifyContent:'space-between',
                  boxShadow:'0 8px 30px rgba(0,0,0,.35)', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', width:140, height:140, borderRadius:'50%',
                    background:'rgba(255,255,255,.04)', top:-45, right:-35 }}></div>
                  <div className="flex justify-content-between align-items-start">
                    <div>
                      <div style={{ fontWeight:700, fontSize:13, letterSpacing:2, color:'#ccc', textTransform:'uppercase' }}>CDCApplication</div>
                      <div style={{ fontSize:10, color:'#666', marginTop:2 }}>Carte d'Adhérent</div>
                    </div>
                    <div style={{ fontWeight:600, fontSize:12, color:'#aaa' }}>{selected.numeroAdherent}</div>
                  </div>
                  <div className="flex gap-3 align-items-center">
                    <div style={{ width:52, height:52, borderRadius:'50%', overflow:'hidden',
                      border:'1.5px solid #444', flexShrink:0, background:'#2a2a2a',
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <PhotoDetail photoChemin={selected.photoChemin} size={52} />
                    </div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15 }}>{selected.prenom} {selected.nom}</div>
                      <div style={{ fontSize:11, color:'#777', marginTop:4, lineHeight:1.7 }}>
                        CIN : {selected.cin || '—'}<br />
                        Matricule : {selected.matricule || '—'}<br />
                        Service : {selected.service || '—'}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-content-end">
                    <div style={{ fontSize:22, fontWeight:700, color:'#fff', letterSpacing:4 }}>
                      {derniereAdhesion?.annee || new Date().getFullYear()}
                    </div>
                  </div>
                </div>

                <Button icon="pi pi-print" label="Imprimer la Carte" onClick={imprimerCarte} />
              </div>
            </TabPanel>

          </TabView>
        )}
      </Dialog>
    </div>
  )
}