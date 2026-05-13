import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog'
import { authUtils } from '../services/api'

const NAV_SECTIONS = [
  {
    label: 'GESTION DES ADHÉRENTS',
    items: [
      { label: 'Adhérents',             icon: 'pi pi-id-card',  to: '/adherents' },
      { label: 'Adhésions',             icon: 'pi pi-calendar', to: '/adhesions' },
      { label: "Catégories d'Adhésion", icon: 'pi pi-tags',     to: '/categories-adhesion' },
    ]
  },
  {
    label: 'AIDE SOCIALE',
    items: [
      { label: "Demandes d'Aide",    icon: 'pi pi-heart',       to: '/aides'          },
      { label: "Types d'Aide",       icon: 'pi pi-list',        to: '/types-aide'     },
      { label: 'Mon Espace Aide',    icon: 'pi pi-user-edit',   to: '/mon-espace-aide'},
    ]
  },
  {
    label: 'GESTION DES ACCÈS',
    items: [
      { label: 'Utilisateurs', icon: 'pi pi-users',  to: '/utilisateurs' },
      { label: 'Rôles',        icon: 'pi pi-shield', to: '/roles'        },
      { label: 'Privilèges',   icon: 'pi pi-key',    to: '/privileges'   },
    ]
  }
]

const TITLES = {
  '/adherents':           'Adhérents',
  '/adhesions':           'Adhésions',
  '/categories-adhesion': "Catégories d'Adhésion",
  '/aides':               "Demandes d'Aide",
  '/types-aide':          "Types d'Aide",
  '/mon-espace-aide':     'Mon Espace Aide',
  '/utilisateurs':        'Utilisateurs',
  '/roles':               'Rôles',
  '/privileges':          'Privilèges',
  '/profil':              'Mon Profil',
}

export default function MainLayout() {
  const [collapsed, setCollapsed]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile]     = useState(window.innerWidth <= 768)
  const { pathname } = useLocation()
  const navigate     = useNavigate()

  const prenom   = authUtils.getPrenom() || ''
  const nom      = authUtils.getNom()    || ''
  const initials = `${prenom[0] || ''}${nom[0] || ''}`.toUpperCase()
  const roles    = authUtils.getRoles()

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const handleLogout = () => {
    confirmDialog({
      message: 'Voulez-vous vous déconnecter ?',
      header: 'Déconnexion', icon: 'pi pi-sign-out',
      acceptLabel: 'Se déconnecter', rejectLabel: 'Annuler', acceptClassName: 'p-button-danger',
      accept: () => { localStorage.clear(); navigate('/login', { replace: true }) }
    })
  }

  const toggleSidebar = () => {
    if (isMobile) setMobileOpen(o => !o)
    else          setCollapsed(c => !c)
  }

  const sidebarClass = [
    'cdc-sidebar',
    !isMobile && collapsed  ? 'collapsed'   : '',
    isMobile  && mobileOpen ? 'mobile-open' : '',
  ].filter(Boolean).join(' ')

  const mainClass = ['cdc-main', !isMobile && collapsed ? 'collapsed' : ''].filter(Boolean).join(' ')

  return (
    <div className="cdc-layout">
      <ConfirmDialog />

      {isMobile && mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={sidebarClass}>
        <div className="cdc-sidebar-logo">
          <div className="cdc-logo-icon">CDC</div>
          <div className="cdc-logo-text">CDC<span>Application</span></div>
        </div>

        <nav className="cdc-sidebar-nav">
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              <div className="cdc-nav-section-label">{section.label}</div>
              {section.items.map(item => (
                <NavLink key={item.to} to={item.to}
                  className={({ isActive }) => `cdc-nav-item${isActive ? ' active' : ''}`}
                  title={!isMobile && collapsed ? item.label : ''}>
                  <i className={item.icon}></i>
                  <span className="cdc-nav-label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ padding: '12px 0', borderTop: '1px solid #1e293b' }}>
          <div className="cdc-nav-item" onClick={handleLogout}
            title={!isMobile && collapsed ? 'Se déconnecter' : ''}
            style={{ borderLeft: 'none', cursor: 'pointer' }}>
            <i className="pi pi-sign-out" style={{ color: '#f87171' }}></i>
            <span className="cdc-nav-label" style={{ color: '#f87171' }}>Se déconnecter</span>
          </div>
        </div>
      </aside>

      <div className={mainClass}>
        <header className="cdc-topbar" style={{ justifyContent: 'space-between' }}>
          <div className="cdc-topbar-left">
            <button className="cdc-toggle-btn" onClick={toggleSidebar}>
              <i className={isMobile && mobileOpen ? 'pi pi-times' : 'pi pi-bars'}></i>
            </button>
            <span className="cdc-page-title">{TITLES[pathname] || 'CDCApplication'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
            onClick={() => navigate('/profil')} title="Mon profil">
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#1a73e8',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
              {initials || <i className="pi pi-user" style={{ fontSize: 13 }}></i>}
            </div>
            <div className="cdc-hide-mobile">
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{prenom} {nom}</div>
              {roles.length > 0 && <div style={{ fontSize: 11, color: '#94a3b8' }}>{roles[0]}</div>}
            </div>
          </div>
        </header>
        <main className="cdc-content"><Outlet /></main>
      </div>
    </div>
  )
}