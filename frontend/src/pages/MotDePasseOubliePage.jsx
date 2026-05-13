import { useState } from 'react'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function MotDePasseOubliePage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')
  const navigate = useNavigate()

  const submit = async () => {
    if (!email.trim()) { setError('Email obligatoire.'); return }
    setLoading(true); setError('')
    try {
      await axios.post('/api/auth/mot-de-passe-oublie', { email })
      setSuccess(true)
    } catch (e) {
      setError(e.response?.data?.message || 'Une erreur est survenue.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%)', padding: 20
    }}>
      <div style={{ background: 'white', borderRadius: 14, padding: '44px 40px',
        width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, background: '#1a73e8', borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', fontWeight: 800, color: 'white', fontSize: 18 }}>CDC</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>Mot de passe oublié</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
            Saisissez votre email pour recevoir un lien de réinitialisation
          </div>
        </div>

        {success ? (
          <div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8,
              padding: 16, textAlign: 'center', color: '#15803d', marginBottom: 20 }}>
              <i className="pi pi-check-circle" style={{ fontSize: 32, display: 'block', marginBottom: 8 }}></i>
              <div className="font-semibold">Email envoyé !</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>
                Vérifiez votre boîte mail. Le lien est valable 2 heures.
              </div>
            </div>
            <Button label="Retour à la connexion" icon="pi pi-arrow-left"
              className="w-full" outlined onClick={() => navigate('/login')} />
          </div>
        ) : (
          <div className="flex flex-column gap-3">
            {error && <Message severity="error" text={error} style={{ width: '100%' }} />}
            <div className="flex flex-column gap-1">
              <label className="font-semibold" style={{ fontSize: 13 }}>Email</label>
              <InputText value={email} onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com" type="email" className="w-full"
                onKeyDown={e => e.key === 'Enter' && submit()} autoFocus />
            </div>
            <Button label="Envoyer le lien" icon="pi pi-envelope"
              loading={loading} onClick={submit} className="w-full mt-1" style={{ height: 44 }} />
            <Button label="Retour à la connexion" icon="pi pi-arrow-left"
              text className="w-full" onClick={() => navigate('/login')} />
          </div>
        )}
      </div>
    </div>
  )
}