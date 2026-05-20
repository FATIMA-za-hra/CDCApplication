import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog'
import { authUtils } from '../services/api'

const ALL_NAV = [
  {
    label: 'GESTION DES ADHÉRENTS',
    items: [
      { label: 'Adhérents',             icon: 'pi pi-id-card',  to: '/adherents',          privilege: 'ADHERENT_READ'    },
      { label: 'Adhésions',             icon: 'pi pi-calendar', to: '/adhesions',           privilege: 'ADHESION_READ'    },
      { label: "Catégories d'Adhésion", icon: 'pi pi-tags',     to: '/categories-adhesion', privilege: 'CATEGORIE_READ'   },
    ]
  },
  {
    label: 'AIDE SOCIALE',
    items: [
      { label: "Demandes d'Aide", icon: 'pi pi-heart', to: '/aides',      privilege: 'AIDE_READ'     },
      { label: "Types d'Aide",    icon: 'pi pi-list',  to: '/types-aide', privilege: 'TYPE_AIDE_READ'},
    ]
  },
  {
    label: 'FINANCES',
    items: [
      { label: 'Caisse',      icon: 'pi pi-wallet', to: '/caisse',    privilege: 'CAISSE_READ'  },
      { label: 'Virements',   icon: 'pi pi-send',   to: '/virements', privilege: 'VIREMENT_READ'},
    ]
  },
  {
    label: 'GESTION DES ACCÈS',
    items: [
      { label: 'Utilisateurs', icon: 'pi pi-users',  to: '/utilisateurs', privilege: 'UTILISATEUR_READ'},
      { label: 'Rôles',        icon: 'pi pi-shield', to: '/roles',        privilege: 'ROLE_READ'       },
      { label: 'Privilèges',   icon: 'pi pi-key',    to: '/privileges',   privilege: 'PRIVILEGE_READ'  },
    ]
  }
]

const NAV_ADHERENT = [
  {
    label: 'MON ESPACE',
    items: [
      { label: 'Mes Adhésions',     icon: 'pi pi-calendar', to: '/mes-adhesions'   },
      { label: 'Mes Demandes Aide', icon: 'pi pi-heart',    to: '/mon-espace-aide' },
    ]
  }
]

const TITLES = {
  '/adherents':           'Adhérents',
  '/adhesions':           'Adhésions',
  '/categories-adhesion': "Catégories d'Adhésion",
  '/aides':               "Demandes d'Aide",
  '/types-aide':          "Types d'Aide",
  '/mon-espace-aide':     "Mes Demandes d'Aide",
  '/mes-adhesions':       'Mes Adhésions',
  '/caisse':              'Gestion de la Caisse',
  '/virements':           'Virements & Comptes Bancaires',
  '/utilisateurs':        'Utilisateurs',
  '/roles':               'Rôles',
  '/privileges':          'Privilèges',
  '/profil':              'Mon Profil',
}

const ROLES_ADMIN = ['ADMIN','AGENT_GESTION','AGENT_BUREAU','PRESIDENT',
                     'TRESORIER','DIRECTEUR','AUDITEUR']
const ADHERENT_ROUTES = ['/mon-espace-aide', '/mes-adhesions', '/profil']

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
  const isAdmin  = authUtils.isAdmin()

  // Un adhérent est quelqu'un qui n'est ni admin ni agent
  // On vérifie les rôles stockés — si aucun rôle admin → c'est un adhérent
  const isAdherent = !isAdmin
    && !roles.some(r => ROLES_ADMIN.includes(r.toUpperCase()))

  const buildNav = () => {
    // Adhérent → menu restreint
    if (isAdherent) return NAV_ADHERENT
    // Admin → tout sans filtre
    if (isAdmin) return ALL_NAV
    // Agent avec rôles spécifiques → filtrer par privilege
    const filtered = []
    for (const section of ALL_NAV) {
      const items = section.items.filter(item =>
        authUtils.hasPrivilege(item.privilege)
      )
      if (items.length > 0) filtered.push({ ...section, items })
    }
    return filtered
  }

  const navSections = buildNav()

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Rediriger l'adhérent s'il tente une route admin
  useEffect(() => {
    if (isAdherent) {
      const allowed = ADHERENT_ROUTES.some(r => pathname.startsWith(r))
      if (!allowed) navigate('/mon-espace-aide', { replace: true })
    }
  }, [pathname, isAdherent])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const handleLogout = () => {
    confirmDialog({
      message: 'Voulez-vous vous déconnecter ?',
      header: 'Déconnexion', icon: 'pi pi-sign-out',
      acceptLabel: 'Se déconnecter', rejectLabel: 'Annuler',
      acceptClassName: 'p-button-danger',
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

  const mainClass = [
    'cdc-main',
    !isMobile && collapsed ? 'collapsed' : ''
  ].filter(Boolean).join(' ')

  return (
    <div className="cdc-layout">
      <ConfirmDialog />

      {isMobile && mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* ══ SIDEBAR ══ */}
      <aside className={sidebarClass}
        style={{ display:'flex', flexDirection:'column', height:'100vh' }}>

        {/* Logo */}
        <div className="cdc-sidebar-logo">
          {/* Logo : essaie .jpg puis .png */}
          <img
            src="/logo-aos.jpg"
            alt="AOS"
            style={{ width:40, height:40, objectFit:'contain', flexShrink:0, borderRadius:6 }}
            onError={e => {
              // Essayer .png si .jpg non trouvé
              if (!e.target.src.includes('logo-aos.png')) {
                e.target.src = '/logo-aos.png'
              } else {
                e.target.style.display = 'none'
              }
            }}
          />
          <div className="cdc-logo-text">AOS<span> Social</span></div>
        </div>

        {/* Navigation — scrollable */}
        <nav className="cdc-sidebar-nav"
          style={{ flex:1, overflowY:'auto', overflowX:'hidden', scrollbarWidth:'none', msOverflowStyle:'none' }}>
          {navSections.map(section => (
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

        {/* Déconnexion — toujours visible en bas */}
        <div style={{ borderTop:'1px solid #1e293b', flexShrink:0, padding:'8px 0' }}>
          <div className="cdc-nav-item" onClick={handleLogout}
            title={!isMobile && collapsed ? 'Se déconnecter' : ''}
            style={{ cursor:'pointer' }}>
            <i className="pi pi-sign-out" style={{ color:'#f87171' }}></i>
            <span className="cdc-nav-label" style={{ color:'#f87171' }}>Se déconnecter</span>
          </div>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <div className={mainClass}>
        <header className="cdc-topbar" style={{ justifyContent:'space-between' }}>
          <div className="cdc-topbar-left">
            <button className="cdc-toggle-btn" onClick={toggleSidebar}>
              <i className={isMobile && mobileOpen ? 'pi pi-times' : 'pi pi-bars'}></i>
            </button>
            <span className="cdc-page-title">
              {TITLES[pathname] || 'AOS Social'}
            </span>
          </div>

          {/* Badge utilisateur → Mon Profil */}
          <div style={{ display:'flex', alignItems:'center', gap:8,
            cursor:'pointer', padding:'4px 10px', borderRadius:8 }}
            onClick={() => navigate('/profil')} title="Mon profil">
            <div style={{ width:34, height:34, borderRadius:'50%',
              background:'#1a73e8', color:'white',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:13, fontWeight:700, flexShrink:0 }}>
              {initials || <i className="pi pi-user" style={{ fontSize:13 }}></i>}
            </div>
            <div className="cdc-hide-mobile">
              <div style={{ fontSize:13, fontWeight:600, color:'#0f172a' }}>
                {prenom} {nom}
              </div>
              <div style={{ fontSize:11, color:'#94a3b8' }}>
                {isAdherent ? 'Adhérent' : isAdmin ? 'Administrateur' : (roles[0] || '')}
              </div>
            </div>
          </div>
        </header>

        <main className="cdc-content"><Outlet /></main>
      </div>
    </div>
  )
}