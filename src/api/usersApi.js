import axiosClient from './axiosClient'

export const usersApi = {
  // Liste tous les utilisateurs
  getAll: () =>
    axiosClient.get('/api/users').then((r) => r.data),

  // Récupère un utilisateur par son id
  getById: (id) =>
    axiosClient.get(`/api/users/${id}`).then((r) => r.data),

  // Filtre les utilisateurs par rôle (endpoint dédié backend)
  getByRole: (role) =>
    axiosClient.get(`/api/users/role/${role}`).then((r) => r.data),

  // Crée un nouvel utilisateur
  create: (data) =>
    axiosClient.post('/api/users', data).then((r) => r.data),

  // Met à jour un utilisateur existant
  update: (id, data) =>
    axiosClient.put(`/api/users/${id}`, data).then((r) => r.data),

  // Supprime un utilisateur
  delete: (id) =>
    axiosClient.delete(`/api/users/${id}`),

  // Active ou désactive un utilisateur
  toggleStatus: (id, enabled) =>
    axiosClient
      .patch(`/api/users/${id}/toggle-status`, null, { params: { enabled } })
      .then((r) => r.data),
}
