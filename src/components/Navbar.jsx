import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Button from './ui/Button'

export default function Navbar({ title }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-14 border-b border-surface-border bg-surface-card/50 backdrop-blur-sm flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-sm font-semibold text-text-primary">{title}</h1>

      <div className="flex items-center gap-4">
        <span className="text-xs text-text-secondary hidden sm:block">
          Connecté en tant que{' '}
          <span className="text-text-primary font-medium">{user?.username}</span>
        </span>

        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Déconnexion
        </Button>
      </div>
    </header>
  )
}
