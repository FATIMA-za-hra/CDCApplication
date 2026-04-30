import { useState } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog'

const NAV = [
  { label: 'Utilisateurs', icon: 'pi pi-users',  to: '/utilisateurs' },
  { label: 'Rôles',        icon: 'pi pi-shield', to: '/roles'        },
  { label: 'Privilèges',   icon: 'pi pi-key',    to: '/privileges'   },
]

const TITLES = {
  '/utilisateurs': 'Gestion des Utilisateurs',
  '/roles':        'Gestion des Rôles',
  '/privileges':   'Gestion des Privilèges',
}

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const username = localStorage.getItem('cdc_username') || 'Admin'

  const handleLogout = () => {
    confirmDialog({
      message: 'Voulez-vous vous déconnecter ?',
      header: 'Déconnexion',
      icon: 'pi pi-sign-out',
      acceptLabel: 'Se déconnecter',
      rejectLabel: 'Annuler',
      acceptClassName: 'p-button-danger',
      accept: () => {
        localStorage.removeItem('cdc_token')
        localStorage.removeItem('cdc_username')
        navigate('/login', { replace: true })
      }
    })
  }

  return (
    <div className="cdc-layout">
      <ConfirmDialog />

      {/* SIDEBAR */}
      <aside className={`cdc-sidebar${collapsed ? ' collapsed' : ''}`}>
        <div className="cdc-sidebar-logo">
          <div className="cdc-logo-icon">CDC</div>
          {!collapsed && <div className="cdc-logo-text">CDC<span>Application</span></div>}
        </div>

        <nav className="cdc-sidebar-nav">
          <div className="cdc-nav-section-label">GESTION DES ACCÈS</div>
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `cdc-nav-item${isActive ? ' active' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <i className={item.icon}></i>
              {!collapsed && <span className="cdc-nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Déconnexion en bas sidebar */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid #1e293b' }}>
          <div
            className="cdc-nav-item"
            onClick={handleLogout}
            title={collapsed ? 'Se déconnecter' : ''}
            style={{ borderRadius: 6, cursor: 'pointer', borderLeft: 'none' }}
          >
            <i className="pi pi-sign-out" style={{ color: '#f87171' }}></i>
            {!collapsed && (
              <span className="cdc-nav-label" style={{ color: '#f87171' }}>
                Se déconnecter
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className={`cdc-main${collapsed ? ' collapsed' : ''}`}>
        <header className="cdc-topbar" style={{ justifyContent: 'space-between' }}>

          {/* Gauche : toggle + titre */}
          <div className="cdc-topbar-left">
            <button className="cdc-toggle-btn" onClick={() => setCollapsed(c => !c)}>
              <i className="pi pi-bars"></i>
            </button>
            <span className="cdc-page-title">{TITLES[pathname] || 'CDCApplication'}</span>
          </div>

          {/* Droite : avatar + nom admin */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: '#1a73e8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0
            }}>
              <i className="pi pi-user" style={{ fontSize: 14 }}></i>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
              {username}
            </span>
          </div>

        </header>

        <main className="cdc-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}