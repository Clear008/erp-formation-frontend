import { createContext, useContext, useEffect, useState } from 'react'
import { authApi } from '../api/authApi'
import { storage } from '../utils/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(storage.getToken())
  const [loading, setLoading] = useState(true) // true pendant la vérification initiale

  // ─── Au montage : si un token existe, on recharge le profil utilisateur ──
  useEffect(() => {
    const init = async () => {
      const savedToken = storage.getToken()
      if (savedToken) {
        try {
          const me = await authApi.me()
          setUser(me)
          setToken(savedToken)
        } catch {
          // Token invalide ou expiré
          storage.removeToken()
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  // ─── Login : stocke le token et récupère le profil complet ──────────────
  const login = async (credentials) => {
    const data = await authApi.login(credentials)
    storage.setToken(data.token)
    setToken(data.token)
    // Récupère le profil complet via /me
    const me = await authApi.me()
    setUser(me)
    return me
  }

  // ─── Logout : nettoie tout ───────────────────────────────────────────────
  const logout = () => {
    storage.removeToken()
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook custom pour consommer le contexte
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
