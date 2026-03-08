import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

/**
 * Protège toutes les routes enfant.
 * Redirige vers /login si l'utilisateur n'est pas authentifié.
 * Affiche un loader pendant la vérification initiale.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-text-secondary text-sm">Chargement...</span>
        </div>
      </div>
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
