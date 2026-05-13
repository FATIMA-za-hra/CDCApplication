import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { authApi } from '../services/api'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const submit = async () => {
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return }
    setLoading(true); setError('')
    try {
      const res = await authApi.login({ email, password })
      const d = res.data
      localStorage.setItem('cdc_token',      d.token)
      localStorage.setItem('cdc_email',      d.email)
      localStorage.setItem('cdc_nom',        d.nom)
      localStorage.setItem('cdc_prenom',     d.prenom)
      localStorage.setItem('cdc_roles',      JSON.stringify(d.roles))
      localStorage.setItem('cdc_privileges', JSON.stringify(d.privileges))
      localStorage.setItem('cdc_isAdmin',    String(d.isAdmin))
      navigate('/adherents', { replace: true })
    } catch (e) {
      setError(e.response?.data?.message || 'Email ou mot de passe incorrect.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%)', padding: 20
    }}>
      <div style={{ background: 'white', borderRadius: 14, padding: '48px 42px',
        width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: '#1a73e8', borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', fontWeight: 800, color: 'white', fontSize: 18 }}>CDC</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>CDCApplication</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Connectez-vous à votre espace</div>
        </div>

        {error && <div style={{ marginBottom: 16 }}>
          <Message severity="error" text={error} style={{ width: '100%' }} />
        </div>}

        <div className="flex flex-column gap-3">
          <div className="flex flex-column gap-1">
            <label className="font-semibold" style={{ fontSize: 13 }}>Email</label>
            <InputText value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="votre@email.com" type="email" className="w-full" autoFocus />
          </div>

          <div className="flex flex-column gap-1">
            <div className="flex justify-content-between align-items-center">
              <label className="font-semibold" style={{ fontSize: 13 }}>Mot de passe</label>
              <Link to="/mot-de-passe-oublie" style={{ fontSize: 12, color: '#1a73e8', textDecoration: 'none' }}>
                Mot de passe oublié ?
              </Link>
            </div>
            <Password value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="••••••••" toggleMask feedback={false}
              className="w-full"
              pt={{ root: { style: { width: '100%' } }, input: { style: { width: '100%' } } }} />
          </div>

          <Button label="Se connecter" icon="pi pi-sign-in"
            loading={loading} onClick={submit}
            className="w-full mt-2" style={{ height: 46 }} />
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#94a3b8' }}>
          Accès réservé aux utilisateurs autorisés
        </div>
      </div>
    </div>
  )
}