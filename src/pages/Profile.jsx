import { useEffect, useState } from 'react'
import { authApi } from '../api/authApi'
import { ROLE_COLORS, ROLE_LABELS } from '../utils/roles'
import toast from 'react-hot-toast'

const Field = ({ label, value }) => (
  <div>
    <p className="label">{label}</p>
    <p className="text-sm text-text-primary bg-surface-muted border border-surface-border rounded-lg px-3 py-2.5">
      {value || '—'}
    </p>
  </div>
)

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authApi.me()
        setProfile(data)
      } catch {
        toast.error('Impossible de charger le profil')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="max-w-2xl space-y-6">
      {/* Avatar + nom */}
      <div className="card p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-bold text-brand-400">
            {profile.username?.[0]?.toUpperCase()}
          </span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">{profile.username}</h2>
          <p className="text-text-secondary text-sm">{profile.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`badge border ${ROLE_COLORS[profile.role]}`}>
              {ROLE_LABELS[profile.role] || profile.role}
            </span>
            <span
              className={`badge border ${
                profile.enabled
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}
            >
              {profile.enabled ? '● Actif' : '● Inactif'}
            </span>
          </div>
        </div>
      </div>

      {/* Détails */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-5">Informations du profil</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="ID" value={`#${profile.id}`} />
          <Field label="Nom d'utilisateur" value={profile.username} />
          <Field label="Adresse e-mail" value={profile.email} />
          <Field label="Rôle" value={ROLE_LABELS[profile.role] || profile.role} />
          <Field label="Statut" value={profile.enabled ? 'Actif' : 'Inactif'} />
          <Field
            label="Compte créé le"
            value={
              profile.createdAt
                ? new Date(profile.createdAt).toLocaleString('fr-FR')
                : '—'
            }
          />
        </div>
      </div>

      {/* Info endpoint */}
      <div className="card p-4 border-brand-500/20 bg-brand-500/5">
        <p className="text-xs text-brand-400 font-medium">
          ℹ️ Ces données sont récupérées en temps réel depuis{' '}
          <span className="font-mono">GET /api/auth/me</span>
        </p>
      </div>
    </div>
  )
}
