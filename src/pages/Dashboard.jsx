import { useAuth } from '../auth/AuthContext'
import { ROLE_COLORS, ROLE_LABELS } from '../utils/roles'

const StatCard = ({ label, value, icon, color = 'brand' }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-10 h-10 rounded-lg bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center flex-shrink-0`}>
      <span className={`text-${color}-400`}>{icon}</span>
    </div>
    <div>
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="text-xl font-semibold text-text-primary mt-0.5">{value}</p>
    </div>
  </div>
)

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-surface-border last:border-0">
    <span className="text-xs text-text-secondary uppercase tracking-wider">{label}</span>
    <span className="text-sm text-text-primary font-medium">{value}</span>
  </div>
)

export default function Dashboard() {
  const { user } = useAuth()

  const now = new Date()
  const greeting =
    now.getHours() < 12 ? 'Bonjour' : now.getHours() < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div className="space-y-6 max-w-5xl">
      {/* En-tête de bienvenue */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">
          {greeting},{' '}
          <span className="text-brand-400">{user?.username}</span> 👋
        </h2>
        <p className="text-text-secondary text-sm mt-1">
          Bienvenue sur votre tableau de bord — {now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Rôle"
          value={ROLE_LABELS[user?.role] || user?.role}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />

        <StatCard
          label="Statut du compte"
          value={user?.enabled ? 'Actif' : 'Inactif'}
          color={user?.enabled ? 'emerald' : 'red'}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          }
        />

        <StatCard
          label="ID utilisateur"
          value={`#${user?.id}`}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
          }
        />
      </div>

      {/* Informations du compte */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Informations du compte</h3>
        <InfoRow label="Nom d'utilisateur" value={user?.username} />
        <InfoRow label="Adresse e-mail" value={user?.email} />
        <InfoRow
          label="Rôle"
          value={
            <span className={`badge border ${ROLE_COLORS[user?.role]}`}>
              {ROLE_LABELS[user?.role] || user?.role}
            </span>
          }
        />
        {user?.createdAt && (
          <InfoRow
            label="Membre depuis"
            value={new Date(user.createdAt).toLocaleDateString('fr-FR')}
          />
        )}
      </div>

      {/* Modules disponibles (placeholder) */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Modules disponibles</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: 'Formations', icon: '📚', available: true },
            { name: 'Stagiaires', icon: '👥', available: false },
            { name: 'Planification', icon: '📅', available: false },
            { name: 'Rapports', icon: '📊', available: false },
          ].map(({ name, icon, available }) => (
            <div
              key={name}
              className={`p-4 rounded-lg border text-center ${
                available
                  ? 'bg-brand-500/5 border-brand-500/20'
                  : 'bg-surface-muted border-surface-border opacity-40'
              }`}
            >
              <span className="text-2xl">{icon}</span>
              <p className="text-xs text-text-secondary mt-2">{name}</p>
              {!available && (
                <p className="text-[10px] text-text-muted mt-0.5">Bientôt</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
