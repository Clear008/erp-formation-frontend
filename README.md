# Cabinet Formation ERP — Frontend

Interface React (Vite + TailwindCSS) pour tester et visualiser le module backend Spring Boot (auth JWT + gestion utilisateurs).

---

## 🚀 Installation

### 1. Prérequis
- Node.js ≥ 18
- Backend Spring Boot lancé sur `http://localhost:8080`

### 2. Créer le projet et installer les dépendances

```bash
# Option A : copier ce dossier et installer
cd cabinet-formation-erp
npm install

# Option B : créer from scratch avec Vite
npm create vite@latest cabinet-formation-erp -- --template react
cd cabinet-formation-erp
npm install react-router-dom axios react-hook-form react-hot-toast
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. Lancer le projet

```bash
npm run dev
# Ouvre http://localhost:3000
```

---

## 🔐 Comptes de test

| Utilisateur   | Mot de passe      | Rôle        | Accès               |
|---------------|-------------------|-------------|---------------------|
| `admin`       | `admin123`        | ADMIN       | Tout (CRUD users)   |
| `directeur`   | `dg123`           | DG          | Dashboard + Profil  |
| `adjoint`     | `da123`           | DA          | Dashboard + Profil  |
| `assistante`  | `assistante123`   | ASSISTANTE  | Dashboard + Profil  |

---

## 📁 Structure du projet

```
src/
├── api/
│   ├── axiosClient.js    # Instance Axios + interceptors (token + 401 redirect)
│   ├── authApi.js        # login(), me()
│   └── usersApi.js       # CRUD + toggle-status + getByRole
├── auth/
│   ├── AuthContext.jsx   # login, logout, user, token, isAuthenticated
│   ├── ProtectedRoute.jsx  # Redirige vers /login si non connecté
│   └── RoleGuard.jsx     # Bloque selon le rôle
├── layouts/
│   ├── AppLayout.jsx     # Sidebar + Navbar + Outlet
│   └── AuthLayout.jsx    # Page centrée pour Login
├── pages/
│   ├── Login.jsx         # Authentification avec react-hook-form
│   ├── Dashboard.jsx     # Vue d'accueil avec cartes
│   ├── Profile.jsx       # Consomme GET /api/auth/me
│   └── users/
│       ├── UsersList.jsx # Table + filtres + actions CRUD
│       └── UserForm.jsx  # Modal de création/modification
├── components/
│   ├── Navbar.jsx
│   ├── Sidebar.jsx       # Nav RBAC (menu Utilisateurs caché si non-ADMIN)
│   └── ui/
│       ├── Button.jsx
│       ├── Input.jsx
│       └── Modal.jsx
├── utils/
│   ├── storage.js        # localStorage (token)
│   └── roles.js          # ROLES, ROLE_LABELS, ROLE_COLORS
├── App.jsx               # Routing complet
├── main.jsx              # Entrée React + providers
└── index.css             # TailwindCSS + design tokens
```

---

## 🧪 Tester les fonctionnalités

### Authentification
1. Aller sur `http://localhost:3000/login`
2. Se connecter avec `admin / admin123`
3. Le token JWT est stocké dans `localStorage` (clé `erp_token`)
4. Tester avec un mauvais mot de passe → message d'erreur

### RBAC (contrôle d'accès)
- Connecté en tant qu'**ADMIN** : menu "Utilisateurs" visible + accessible
- Connecté en tant que **DG/DA/ASSISTANTE** : menu caché + route `/users` redirige vers `/dashboard`

### Gestion Utilisateurs (ADMIN)
- **Lister** : tableau complet avec pagination visuelle
- **Filtrer** par rôle : boutons ADMIN / DG / DA / ASSISTANTE
- **Créer** : bouton "+ Nouvel utilisateur" → modal avec formulaire validé
- **Modifier** : icône crayon → modal pré-rempli (mot de passe optionnel)
- **Activer/Désactiver** : icône toggle → PATCH `/api/users/{id}/toggle-status`
- **Supprimer** : icône poubelle → confirmation + DELETE `/api/users/{id}`

### Protection automatique
- Si token expiré : toute requête → interceptor → supprime token + redirect `/login`
- Au refresh : token en localStorage → `GET /api/auth/me` → recharge session

---

## 🔧 Configuration

Pour changer l'URL du backend, modifier `src/api/axiosClient.js` :

```js
const axiosClient = axios.create({
  baseURL: 'http://localhost:8080', // ← modifier ici
})
```

---

## 🎨 Stack technique

| Outil              | Usage                            |
|--------------------|----------------------------------|
| Vite               | Build tool rapide                |
| React 18           | UI                               |
| react-router-dom 6 | Routing + routes protégées       |
| Axios              | Client HTTP + interceptors       |
| react-hook-form    | Validation des formulaires       |
| react-hot-toast    | Notifications                    |
| TailwindCSS 3      | Styling (dark theme custom)      |
| Sora (Google Font) | Typographie                      |
