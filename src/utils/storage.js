// Clé utilisée pour stocker le JWT dans le localStorage
const TOKEN_KEY = 'erp_token'

export const storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
}
