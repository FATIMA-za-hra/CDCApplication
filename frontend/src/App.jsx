import { Routes, Route, Navigate } from 'react-router-dom'
import { PrimeReactProvider } from 'primereact/api'
import MainLayout from './layout/MainLayout'
import UtilisateursPage from './pages/UtilisateursPage'
import RolesPage from './pages/RolesPage'
import PrivilegesPage from './pages/PrivilegesPage'
import ConfigurerMotDePasse from './pages/ConfigurerMotDePasse'

export default function App() {
  return (
    <PrimeReactProvider>
      <Routes>
        <Route path="/configurer-mot-de-passe" element={<ConfigurerMotDePasse />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/utilisateurs" replace />} />
          <Route path="/utilisateurs" element={<UtilisateursPage />} />
          <Route path="/roles"        element={<RolesPage />} />
          <Route path="/privileges"   element={<PrivilegesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/utilisateurs" replace />} />
      </Routes>
    </PrimeReactProvider>
  )
}