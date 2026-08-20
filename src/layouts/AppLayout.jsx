import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

// Map des titres de page selon la route
const PAGE_TITLES = {
  '/dashboard': 'Tableau de bord',
  '/profile': 'Mon Profil',
  '/users': 'Gestion des utilisateurs',
  '/users/new': 'Nouvel utilisateur',
  '/settings/cabinet': 'Paramètres du cabinet',
}

export default function AppLayout() {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] || 'Cabinet Formation'

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title={title} />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
