import { Routes, Route, Navigate } from 'react-router-dom'
import { PrimeReactProvider } from 'primereact/api'
import PrivateRoute from './components/PrivateRoute'
import MainLayout from './layout/MainLayout'
import LoginPage from './pages/LoginPage'
import UtilisateursPage from './pages/UtilisateursPage'
import RolesPage from './pages/RolesPage'
import PrivilegesPage from './pages/PrivilegesPage'
import AdherentsPage from './pages/AdherentsPage'
import AdhesionsPage from './pages/AdhesionsPage'
import CategoriesAdhesionPage from './pages/CategoriesAdhesionPage'
import ConfigurerMotDePasse from './pages/ConfigurerMotDePasse'

export default function App() {
  return (
    <PrimeReactProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/configurer-mot-de-passe" element={<ConfigurerMotDePasse />} />

        <Route element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }>
          <Route path="/"                     element={<Navigate to="/adherents" replace />} />
          <Route path="/adherents"            element={<AdherentsPage />} />
          <Route path="/adhesions"            element={<AdhesionsPage />} />
          <Route path="/categories-adhesion"  element={<CategoriesAdhesionPage />} />
          <Route path="/utilisateurs"         element={<UtilisateursPage />} />
          <Route path="/roles"                element={<RolesPage />} />
          <Route path="/privileges"           element={<PrivilegesPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </PrimeReactProvider>
  )
}