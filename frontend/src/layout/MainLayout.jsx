import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'

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

  return (
    <div className="cdc-layout">
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
      </aside>

      <div className={`cdc-main${collapsed ? ' collapsed' : ''}`}>
        <header className="cdc-topbar">
          <div className="cdc-topbar-left">
            <button className="cdc-toggle-btn" onClick={() => setCollapsed(c => !c)}>
              <i className="pi pi-bars"></i>
            </button>
            <span className="cdc-page-title">{TITLES[pathname] || 'CDCApplication'}</span>
          </div>
        </header>
        <main className="cdc-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}