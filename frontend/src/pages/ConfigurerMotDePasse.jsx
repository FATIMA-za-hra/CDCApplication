import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Password } from 'primereact/password'
import { utilisateurApi } from '../services/api'

export default function ConfigurerMotDePasse() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [tokenValide, setTokenValide] = useState(null) // null=loading, true=valid, false=invalid
  const [form, setForm] = useState({ motDePasse: '', confirmerMotDePasse: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!token) { setTokenValide(false); return }
    utilisateurApi.validerToken(token)
      .then(res => setTokenValide(res.data.valide))
      .catch(() => setTokenValide(false))
  }, [token])

  const validate = () => {
    const errs = {}
    if (!form.motDePasse) errs.motDePasse = 'Le mot de passe est obligatoire'
    else if (form.motDePasse.length < 8) errs.motDePasse = 'Minimum 8 caractères'
    if (!form.confirmerMotDePasse) errs.confirmerMotDePasse = 'Veuillez confirmer le mot de passe'
    else if (form.motDePasse !== form.confirmerMotDePasse) errs.confirmerMotDePasse = 'Les mots de passe ne correspondent pas'
    return errs
  }

  const submit = async () => {
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setSaving(true)
    setErrorMsg('')
    try {
      await utilisateurApi.configurerMdp({ token, ...form })
      setSuccess(true)
    } catch (e) {
      setErrorMsg(e.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setSaving(false)
    }
  }

  // LOADING
  if (tokenValide === null) {
    return (
      <div className="cdc-auth-page">
        <div className="cdc-auth-card" style={{ textAlign: 'center' }}>
          <i className="pi pi-spin pi-spinner" style={{ fontSize: '40px', color: '#1a73e8', display: 'block', marginBottom: '16px' }}></i>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Vérification du lien...</p>
        </div>
      </div>
    )
  }

  // INVALID TOKEN
  if (!tokenValide) {
    return (
      <div className="cdc-auth-page">
        <div className="cdc-auth-card">
          <div className="cdc-auth-logo">
            <div className="cdc-auth-logo-icon" style={{ background: '#ef4444' }}>
              <i className="pi pi-times" style={{ fontSize: '22px' }}></i>
            </div>
          </div>
          <div className="cdc-auth-title">Lien invalide ou expiré</div>
          <div className="cdc-auth-subtitle">
            Ce lien de configuration n'est plus valide. Il a peut-être expiré (validité 24h) ou a déjà été utilisé.
          </div>
          <div style={{ textAlign: 'center', marginTop: '24px', padding: '16px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <p style={{ fontSize: '13px', color: '#dc2626' }}>
              <i className="pi pi-envelope" style={{ marginRight: '6px' }}></i>
              Contactez votre administrateur pour obtenir un nouveau lien de configuration.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // SUCCESS
  if (success) {
    return (
      <div className="cdc-auth-page">
        <div className="cdc-auth-card">
          <div className="cdc-auth-logo">
            <div className="cdc-auth-logo-icon" style={{ background: '#16a34a' }}>
              <i className="pi pi-check" style={{ fontSize: '24px' }}></i>
            </div>
          </div>
          <div className="cdc-auth-title">Mot de passe configuré !</div>
          <div className="cdc-auth-subtitle">
            Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter à CDCApplication avec votre email et votre nouveau mot de passe.
          </div>
          <div style={{ marginTop: '24px', padding: '16px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="pi pi-shield" style={{ color: '#16a34a', fontSize: '20px' }}></i>
              <div>
                <div style={{ fontWeight: '600', fontSize: '13px', color: '#15803d' }}>Compte sécurisé</div>
                <div style={{ fontSize: '12px', color: '#16a34a' }}>Votre mot de passe a été chiffré et stocké de manière sécurisée.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // FORM
  return (
    <div className="cdc-auth-page">
      <div className="cdc-auth-card">
        <div className="cdc-auth-logo">
          <div className="cdc-auth-logo-icon">CDC</div>
        </div>
        <div className="cdc-auth-title">Configurer votre mot de passe</div>
        <div className="cdc-auth-subtitle">
          Bienvenue sur CDCApplication ! Définissez votre mot de passe pour accéder à votre compte.
        </div>

        {errorMsg && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <i className="pi pi-exclamation-triangle" style={{ color: '#dc2626', flexShrink: 0, marginTop: '1px' }}></i>
            <span style={{ fontSize: '13px', color: '#dc2626' }}>{errorMsg}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>
              Nouveau mot de passe *
            </label>
            <Password
              value={form.motDePasse}
              onChange={e => setForm({ ...form, motDePasse: e.target.value })}
              placeholder="Minimum 8 caractères"
              className="w-full"
              style={{ fontSize: '13px' }}
              inputStyle={{ width: '100%' }}
              toggleMask
              promptLabel="Entrez un mot de passe"
              weakLabel="Faible"
              mediumLabel="Moyen"
              strongLabel="Fort"
              feedback
            />
            {errors.motDePasse && (
              <small style={{ color: '#dc2626', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <i className="pi pi-exclamation-circle"></i>{errors.motDePasse}
              </small>
            )}
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>
              Confirmer le mot de passe *
            </label>
            <Password
              value={form.confirmerMotDePasse}
              onChange={e => setForm({ ...form, confirmerMotDePasse: e.target.value })}
              placeholder="Retapez votre mot de passe"
              className="w-full"
              style={{ fontSize: '13px' }}
              inputStyle={{ width: '100%' }}
              toggleMask
              feedback={false}
            />
            {errors.confirmerMotDePasse && (
              <small style={{ color: '#dc2626', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <i className="pi pi-exclamation-circle"></i>{errors.confirmerMotDePasse}
              </small>
            )}
          </div>

          <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#64748b' }}>
            <div style={{ fontWeight: '600', marginBottom: '6px', color: '#475569' }}>Exigences du mot de passe :</div>
            {[
              { check: form.motDePasse.length >= 8, label: 'Au moins 8 caractères' },
              { check: /[A-Z]/.test(form.motDePasse), label: 'Une lettre majuscule' },
              { check: /[0-9]/.test(form.motDePasse), label: 'Un chiffre' },
            ].map(req => (
              <div key={req.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                <i className={`pi ${req.check ? 'pi-check-circle' : 'pi-circle'}`} style={{ fontSize: '12px', color: req.check ? '#16a34a' : '#cbd5e1' }}></i>
                <span style={{ color: req.check ? '#15803d' : '#94a3b8' }}>{req.label}</span>
              </div>
            ))}
          </div>

          <Button
            label="Confirmer mon mot de passe"
            icon="pi pi-lock"
            loading={saving}
            onClick={submit}
            className="w-full"
            style={{ background: '#1a73e8', border: 'none', height: '44px', fontSize: '14px', fontWeight: '600', marginTop: '4px' }}
          />
        </div>
      </div>
    </div>
  )
}