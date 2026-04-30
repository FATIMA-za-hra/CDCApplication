import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { authApi } from '../services/api'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const submit = async () => {
    if (!username || !password) {
      setError("Veuillez remplir tous les champs.")
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await authApi.login({ username, password })
      localStorage.setItem('cdc_token', res.data.token)
      localStorage.setItem('cdc_username', res.data.username)
      navigate('/utilisateurs', { replace: true })
    } catch (e) {
      setError(e.response?.data?.message || 'Identifiants incorrects.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') submit()
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
      padding: 20
    }}>
      <div style={{
        background: 'white',
        borderRadius: 14,
        padding: '48px 42px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,.3)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            background: '#1a73e8',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            fontWeight: 800, color: 'white', fontSize: 18
          }}>
            CDC
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>CDCApplication</div>
          
        </div>

        {/* Erreur */}
        {error && (
          <div style={{ marginBottom: 16 }}>
            <Message severity="error" text={error} style={{ width: '100%' }} />
          </div>
        )}

        {/* Formulaire */}
        <div className="flex flex-column gap-3">

          <div className="flex flex-column gap-1">
            <label className="font-semibold" style={{ fontSize: 13 }}>Nom d'utilisateur</label>
            <InputText
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="admin"
              className="w-full"
              autoFocus
            />
          </div>

          <div className="flex flex-column gap-1">
            <label className="font-semibold" style={{ fontSize: 13 }}>Mot de passe</label>
            {/* Password avec inputStyle w-full pour que le champ soit à 100% */}
            <Password
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="••••••••"
              toggleMask
              feedback={false}
              className="w-full"
              pt={{
                root: { style: { width: '100%' } },
                input: { style: { width: '100%' } }
              }}
            />
          </div>

          <Button
            label="Se connecter"
            icon="pi pi-sign-in"
            loading={loading}
            onClick={submit}
            className="w-full mt-2"
            style={{ height: 46 }}
          />
        </div>

        
      </div>
    </div>
  )
}