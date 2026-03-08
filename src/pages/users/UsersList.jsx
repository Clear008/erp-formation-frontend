import { useEffect, useState, useCallback } from 'react'
import { usersApi } from '../../api/usersApi'
import { ROLES, ROLE_COLORS, ROLE_LABELS } from '../../utils/roles'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import UserForm from './UserForm'
import toast from 'react-hot-toast'

// Filtre "Tous" + tous les rôles
const FILTERS = [
  { label: 'Tous', value: 'ALL' },
  ...Object.keys(ROLES).map((r) => ({ label: ROLE_LABELS[r], value: r })),
]

export default function UsersList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [editUser, setEditUser] = useState(null) // null = création, objet = modification
  const [deletingId, setDeletingId] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  // ─── Chargement des utilisateurs ─────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data =
        filter === 'ALL'
          ? await usersApi.getAll()
          : await usersApi.getByRole(filter)
      setUsers(data)
    } catch {
      toast.error('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // ─── Activer / Désactiver ─────────────────────────────────────────────────
  const handleToggle = async (user) => {
    setTogglingId(user.id)
    try {
      await usersApi.toggleStatus(user.id, !user.enabled)
      toast.success(`Utilisateur ${user.enabled ? 'désactivé' : 'activé'}`)
      loadUsers()
    } catch {
      toast.error('Impossible de modifier le statut')
    } finally {
      setTogglingId(null)
    }
  }

  // ─── Suppression ──────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Confirmer la suppression de cet utilisateur ?')) return
    setDeletingId(id)
    try {
      await usersApi.delete(id)
      toast.success('Utilisateur supprimé')
      loadUsers()
    } catch {
      toast.error('Impossible de supprimer cet utilisateur')
    } finally {
      setDeletingId(null)
    }
  }

  // ─── Ouvrir modal ─────────────────────────────────────────────────────────
  const openCreate = () => { setEditUser(null); setModalOpen(true) }
  const openEdit = (user) => { setEditUser(user); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditUser(null) }

  const onFormSuccess = () => {
    closeModal()
    loadUsers()
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Utilisateurs</h2>
          <p className="text-text-secondary text-sm mt-0.5">
            {users.length} utilisateur{users.length !== 1 ? 's' : ''}
            {filter !== 'ALL' ? ` (${ROLE_LABELS[filter]})` : ''}
          </p>
        </div>
        <Button onClick={openCreate}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvel utilisateur
        </Button>
      </div>

      {/* Filtres par rôle */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === value
                ? 'bg-brand-600 text-white'
                : 'bg-surface-muted text-text-secondary hover:text-text-primary border border-surface-border'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-text-muted">
            <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border">
                  {['ID', 'Utilisateur', 'Email', 'Rôle', 'Statut', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[10px] font-semibold text-text-muted uppercase tracking-widest px-4 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-text-muted">
                      #{user.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-brand-600/20 border border-brand-600/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-brand-400">
                            {user.username?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-text-primary">
                          {user.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`badge border ${ROLE_COLORS[user.role]}`}>
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge border ${
                          user.enabled
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}
                      >
                        {user.enabled ? '● Actif' : '● Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {/* Modifier */}
                        <button
                          onClick={() => openEdit(user)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-brand-400 hover:bg-brand-500/10 transition-all"
                          title="Modifier"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        {/* Toggle statut */}
                        <button
                          onClick={() => handleToggle(user)}
                          disabled={togglingId === user.id}
                          className={`p-1.5 rounded-lg transition-all ${
                            user.enabled
                              ? 'text-text-muted hover:text-amber-400 hover:bg-amber-500/10'
                              : 'text-text-muted hover:text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                          title={user.enabled ? 'Désactiver' : 'Activer'}
                        >
                          {togglingId === user.id ? (
                            <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin block" />
                          ) : user.enabled ? (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>

                        {/* Supprimer */}
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={deletingId === user.id}
                          className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Supprimer"
                        >
                          {deletingId === user.id ? (
                            <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin block" />
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Créer / Modifier */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editUser ? `Modifier — ${editUser.username}` : 'Nouvel utilisateur'}
      >
        <UserForm
          user={editUser}
          onSuccess={onFormSuccess}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  )
}
