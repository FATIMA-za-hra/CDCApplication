import { Routes, Route, Navigate } from 'react-router-dom'
import { PrimeReactProvider } from 'primereact/api'
import PrivateRoute from './components/PrivateRoute'
import MainLayout from './layout/MainLayout'
import LoginPage from './pages/LoginPage'
import MotDePasseOubliePage from './pages/MotDePasseOubliePage'
import ConfigurerMotDePasse from './pages/ConfigurerMotDePasse'
import UtilisateursPage from './pages/UtilisateursPage'
import RolesPage from './pages/RolesPage'
import PrivilegesPage from './pages/PrivilegesPage'
import AdherentsPage from './pages/AdherentsPage'
import AdhesionsPage from './pages/AdhesionsPage'
import CategoriesAdhesionPage from './pages/CategoriesAdhesionPage'
import ProfilPage from './pages/ProfilPage'
import AidePage from './pages/AidePage'
import TypeAidePage from './pages/TypeAidePage'
import MonEspaceAidePage from './pages/MonEspaceAidePage'

export default function App() {
  return (
    <PrimeReactProvider>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login"                      element={<LoginPage />} />
        <Route path="/mot-de-passe-oublie"        element={<MotDePasseOubliePage />} />
        <Route path="/configurer-mot-de-passe"    element={<ConfigurerMotDePasse />} />
        <Route path="/reinitialiser-mot-de-passe" element={<ConfigurerMotDePasse />} />

        {/* Routes protégées */}
        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="/"                     element={<Navigate to="/adherents" replace />} />
          {/* Adhérents & Adhésions */}
          <Route path="/adherents"            element={<AdherentsPage />} />
          <Route path="/adhesions"            element={<AdhesionsPage />} />
          <Route path="/categories-adhesion"  element={<CategoriesAdhesionPage />} />
          {/* Aide sociale — admin/agent */}
          <Route path="/aides"                element={<AidePage />} />
          <Route path="/types-aide"           element={<TypeAidePage />} />
          {/* Aide sociale — espace adhérent (self-service) */}
          <Route path="/mon-espace-aide"      element={<MonEspaceAidePage />} />
          {/* Accès */}
          <Route path="/utilisateurs"         element={<UtilisateursPage />} />
          <Route path="/roles"                element={<RolesPage />} />
          <Route path="/privileges"           element={<PrivilegesPage />} />
          <Route path="/profil"               element={<ProfilPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </PrimeReactProvider>
  )
}