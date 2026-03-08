import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

/**
 * Bloque l'accès à une route si le rôle de l'utilisateur
 * n'est pas dans la liste `allowedRoles`.
 */
export default function RoleGuard({ allowedRoles, children, redirectTo = '/dashboard' }) {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}
