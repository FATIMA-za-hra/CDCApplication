import { useState, useEffect } from 'react'

/**
 * Charge une photo protégée par JWT depuis une URL API.
 * Retourne une blob URL ou null si pas de photo / erreur.
 */
export function usePhotoUrl(photoApiUrl) {
  const [src, setSrc] = useState(null)

  useEffect(() => {
    if (!photoApiUrl) { setSrc(null); return }

    let objectUrl = null
    let cancelled = false

    const load = async () => {
      try {
        const token = localStorage.getItem('cdc_token')
        if (!token) { setSrc(null); return }

        const res = await fetch(photoApiUrl, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (cancelled) return
        if (!res.ok) { setSrc(null); return } // 404 = pas de photo

        const blob = await res.blob()
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setSrc(objectUrl)
      } catch {
        if (!cancelled) setSrc(null)
      }
    }

    load()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [photoApiUrl])

  return src
}

/**
 * Composant Avatar : affiche la photo ou les initiales.
 * size      : taille en px (défaut 36)
 * radius    : border-radius (défaut '50%' pour cercle)
 * fontSize  : taille des initiales
 */
export function Avatar({ photoChemin, prenom, nom, size = 36, radius = '50%', fontSize = 13 }) {
  const src = usePhotoUrl(photoChemin)
  const initials = ((prenom?.[0] || '') + (nom?.[0] || '')).toUpperCase()

  return src ? (
    <img
      src={src}
      alt={`${prenom} ${nom}`}
      style={{ width: size, height: size, borderRadius: radius,
        objectFit: 'cover', flexShrink: 0, display: 'block' }}
    />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: '#374151', color: 'white', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize, fontWeight: 700, userSelect: 'none'
    }}>
      {initials || <i className="pi pi-user" style={{ fontSize: fontSize - 2 }} />}
    </div>
  )
}

/**
 * Composant PhotoDetail : photo carrée avec fallback icône (pour fiches).
 */
export function PhotoDetail({ photoChemin, size = 100, borderRadius = 8 }) {
  const src = usePhotoUrl(photoChemin)

  return src ? (
    <img
      src={src}
      alt=""
      style={{ width: size, height: size, objectFit: 'cover',
        borderRadius, border: '2px solid #e2e8f0', display: 'block' }}
    />
  ) : (
    <div style={{
      width: size, height: size, borderRadius,
      border: '2px solid #e2e8f0', background: '#f1f5f9',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <i className="pi pi-user" style={{ fontSize: size * 0.4, color: '#cbd5e1' }} />
    </div>
  )
}