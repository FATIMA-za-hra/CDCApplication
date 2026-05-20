import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import api from '../services/api'

export default function LoginPage() {
  const [email, setEmail]     = useState('')
  const [mdp, setMdp]         = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const navigate              = useNavigate()

  const handleLogin = async (e) => {
    e?.preventDefault()
    if (!email.trim() || !mdp.trim()) { setError('Email et mot de passe requis.'); return }
    setLoading(true); setError('')
    try {
      const res = await api.post('/auth/login', { email: email.trim(), password: mdp })
      const d   = res.data
      localStorage.setItem('cdc_token',      d.token)
      localStorage.setItem('cdc_email',      d.email)
      localStorage.setItem('cdc_nom',        d.nom)
      localStorage.setItem('cdc_prenom',     d.prenom)
      localStorage.setItem('cdc_roles',      JSON.stringify(d.roles))
      localStorage.setItem('cdc_privileges', JSON.stringify(d.privileges))
      localStorage.setItem('cdc_isAdmin',    String(d.isAdmin))
      navigate('/', { replace: true })
    } catch (e) {
      setError(e.response?.data?.message || 'Email ou mot de passe incorrect.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#f1f5f9'  /* gris très clair, neutre */
    }}>
      {/* Panneau gauche — branding */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        padding: '60px 40px'
      }}>
        <img
          src="/logo-aos.jpg"
          alt="AOS Social"
          style={{ width: 100, height: 100, objectFit: 'contain', borderRadius: 16, marginBottom: 28 }}
          onError={e => {
            if (!e.target.src.includes('.png')) e.target.src = '/logo-aos.png'
            else e.target.style.display = 'none'
          }}
        />
        <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', letterSpacing: -0.5 }}>
          AOS Social
        </div>
        <div style={{ fontSize: 14, color: '#64748b', marginTop: 10, textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>
          Association des Œuvres Sociales
        </div>

        {/* Décoratif */}
        <div style={{ marginTop: 60, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { icon: 'pi-users',    label: 'Gestion des adhérents' },
            { icon: 'pi-heart',    label: "Aide sociale" },
            { icon: 'pi-wallet',   label: 'Gestion de la caisse' },
          ].map(item => (
            <div key={item.icon} style={{ display: 'flex', alignItems: 'center', gap: 12,
              color: '#94a3b8', fontSize: 13 }}>
              <i className={`pi ${item.icon}`}></i>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div style={{
        width: 440,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px',
        background: '#f8fafc'
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Connexion</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
              Entrez vos identifiants pour accéder à l'espace de gestion
            </div>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
              padding: '10px 14px', marginBottom: 20, color: '#dc2626', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <i className="pi pi-exclamation-circle"></i> {error}
            </div>
          )}

          <div className="field" style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13,
              color: '#374151', marginBottom: 6 }}>Adresse email</label>
            <InputText
              value={email} onChange={e => setEmail(e.target.value)}
              type="email" placeholder="exemple@domaine.com"
              className="w-full" autoFocus
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div className="field" style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13,
              color: '#374151', marginBottom: 6 }}>Mot de passe</label>
            <Password
              value={mdp} onChange={e => setMdp(e.target.value)}
              placeholder="••••••••" feedback={false} toggleMask
              className="w-full"
              pt={{ root: { style: { width: '100%' } }, input: { style: { width: '100%' } } }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <Button
            label={loading ? 'Connexion en cours...' : 'Se connecter'}
            icon="pi pi-sign-in"
            loading={loading}
            onClick={handleLogin}
            className="w-full"
            style={{ height: 44, marginBottom: 16 }}
          />

          <div style={{ textAlign: 'center' }}>
            <a href="/mot-de-passe-oublie"
              style={{ fontSize: 12, color: '#1a73e8', textDecoration: 'none' }}>
              Mot de passe oublié ?
            </a>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 24,
          fontSize: 11, color: '#cbd5e1' }}>
          © 2026 AOS Social
        </div>
      </div>
    </div>
  )
}