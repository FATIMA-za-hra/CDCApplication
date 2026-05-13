import { useState, useEffect, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { InputTextarea } from 'primereact/inputtextarea'
import { ToggleButton } from 'primereact/togglebutton'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Tag } from 'primereact/tag'
import { typeAideApi } from '../services/api'

const EMPTY = { nom: '', montantMax: null, conditions: '', actif: true, delaiMois: null }

export default function TypeAidePage() {
  const [types, setTypes]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [dialog, setDialog]       = useState(false)
  const [form, setForm]           = useState(EMPTY)
  const [editId, setEditId]       = useState(null)
  const [saving, setSaving]       = useState(false)
  const toast = useRef(null)

  const load = async () => {
    setLoading(true)
    try { const res = await typeAideApi.getAll(); setTypes(res.data) }
    catch { toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Chargement impossible', life: 3000 }) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openNew  = () => { setForm(EMPTY); setEditId(null); setDialog(true) }
  const openEdit = row => {
    setForm({ nom: row.nom, montantMax: row.montantMax, conditions: row.conditions || '',
      actif: row.actif, delaiMois: row.delaiMois })
    setEditId(row.id); setDialog(true)
  }

  const save = async () => {
    if (!form.nom?.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Le nom est obligatoire', life: 3000 })
      return
    }
    setSaving(true)
    try {
      if (editId) { await typeAideApi.update(editId, form); toast.current?.show({ severity: 'success', summary: 'Modifié', life: 3000 }) }
      else { await typeAideApi.create(form); toast.current?.show({ severity: 'success', summary: 'Créé', life: 3000 }) }
      setDialog(false); load()
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Erreur', detail: e.response?.data?.message || 'Erreur', life: 4000 })
    } finally { setSaving(false) }
  }

  const confirmDel = row => confirmDialog({
    message: `Désactiver le type "${row.nom}" ?`,
    header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Désactiver', rejectLabel: 'Annuler', acceptClassName: 'p-button-warning',
    accept: async () => {
      try { await typeAideApi.delete(row.id); load(); toast.current?.show({ severity: 'success', summary: 'Désactivé', life: 3000 }) }
      catch { toast.current?.show({ severity: 'error', summary: 'Erreur', life: 3000 }) }
    }
  })

  const statutTpl = row => (
    <Tag value={row.actif ? 'Actif' : 'Inactif'}
      severity={row.actif ? 'success' : 'secondary'} />
  )

  const actionsTpl = row => (
    <div className="flex gap-1">
      <Button icon="pi pi-pencil" size="small" outlined
        tooltip="Modifier" tooltipOptions={{ position: 'top' }} onClick={() => openEdit(row)} />
      {row.actif && (
        <Button icon="pi pi-ban" size="small" outlined severity="warning"
          tooltip="Désactiver" tooltipOptions={{ position: 'top' }} onClick={() => confirmDel(row)} />
      )}
    </div>
  )

  return (
    <div>
      <Toast ref={toast} /><ConfirmDialog />

      <div className="cdc-page-header">
        <div><h1>Types d'Aide</h1><p>Gérer les catégories d'aide sociale</p></div>
        <Button icon="pi pi-plus" label="Nouveau Type" onClick={openNew} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total',   value: types.length,                      color: '#1a73e8' },
          { label: 'Actifs',  value: types.filter(t => t.actif).length, color: '#16a34a' },
          { label: 'Inactifs',value: types.filter(t => !t.actif).length,color: '#94a3b8' },
        ].map(s => (
          <div key={s.label} className="cdc-card"
            style={{ padding: '16px 20px', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="cdc-card">
        <DataTable value={types} loading={loading} emptyMessage="Aucun type d'aide."
          paginator rows={10} rowsPerPageOptions={[10, 25]}>
          <Column field="nom"        header="Nom"              sortable style={{ fontWeight: 600 }} />
          <Column field="montantMax" header="Plafond (MAD)"
            body={r => r.montantMax ? Number(r.montantMax).toLocaleString('fr-MA') + ' MAD' : '—'}
            style={{ width: 160 }} />
          <Column field="delaiMois"  header="Délai (mois)"
            body={r => r.delaiMois ? r.delaiMois + ' mois' : '—'}
            style={{ width: 130 }} />
          <Column field="conditions" header="Conditions"
            body={r => r.conditions
              ? <span style={{ fontSize: 12, color: '#64748b' }}>{r.conditions.substring(0, 60)}{r.conditions.length > 60 ? '...' : ''}</span>
              : '—'} />
          <Column header="Statut"  body={statutTpl}  style={{ width: 100 }} />
          <Column header="Actions" body={actionsTpl} style={{ width: 100 }} />
        </DataTable>
      </div>

      <Dialog visible={dialog} onHide={() => setDialog(false)}
        header={editId ? 'Modifier le type' : "Nouveau type d'aide"}
        style={{ width: 500 }} modal
        footer={
          <div>
            <Button icon="pi pi-times" label="Annuler" outlined onClick={() => setDialog(false)} className="mr-2" />
            <Button icon="pi pi-check" label={editId ? 'Modifier' : 'Créer'} loading={saving} onClick={save} />
          </div>
        }>
        <div className="flex flex-column gap-3 pt-3">
          <div className="field">
            <label className="font-semibold">Nom *</label>
            <InputText value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
              placeholder="Ex: Aide scolarité, Aide médicale..." className="w-full" autoFocus />
          </div>
          <div className="formgrid grid">
            <div className="field col">
              <label className="font-semibold">Plafond maximum (MAD)</label>
              <InputNumber value={form.montantMax} onValueChange={e => setForm({ ...form, montantMax: e.value })}
                mode="decimal" minFractionDigits={2} placeholder="Montant max" className="w-full" />
            </div>
            <div className="field col">
              <label className="font-semibold">Délai entre demandes (mois)</label>
              <InputNumber value={form.delaiMois} onValueChange={e => setForm({ ...form, delaiMois: e.value })}
                min={0} max={120} placeholder="Ex: 12" className="w-full" />
            </div>
          </div>
          <div className="field">
            <label className="font-semibold">Conditions d'éligibilité</label>
            <InputTextarea value={form.conditions} onChange={e => setForm({ ...form, conditions: e.target.value })}
              rows={3} className="w-full" autoResize
              placeholder="Conditions requises pour bénéficier de ce type d'aide..." />
          </div>
          <ToggleButton checked={form.actif} onChange={e => setForm({ ...form, actif: e.value })}
            onLabel="Actif" offLabel="Inactif" onIcon="pi pi-check" offIcon="pi pi-times" className="w-full" />
        </div>
      </Dialog>
    </div>
  )
}