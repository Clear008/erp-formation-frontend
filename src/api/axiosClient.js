import axios from 'axios'
import { storage } from '../utils/storage'

// Instance Axios centralisée — tous les appels API passent ici
const axiosClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request Interceptor ────────────────────────────────────────────────────
// Injecte automatiquement le token Bearer dans chaque requête
axiosClient.interceptors.request.use(
  (config) => {
    const token = storage.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor ───────────────────────────────────────────────────
// Si le backend renvoie 401/403 → logout + redirect vers /login
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      storage.removeToken()
      // On recharge la page pour que AuthContext réinitialise l'état
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosClient
