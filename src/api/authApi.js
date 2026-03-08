import axiosClient from './axiosClient'

export const authApi = {
  /**
   * Authentifie l'utilisateur et retourne le token JWT + infos de base
   */
  login: (credentials) =>
    axiosClient.post('/api/auth/login', credentials).then((r) => r.data),

  /**
   * Récupère le profil complet de l'utilisateur connecté
   */
  me: () =>
    axiosClient.get('/api/auth/me').then((r) => r.data),
}
