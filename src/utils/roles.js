// Définition des rôles et de leurs libellés/couleurs pour l'UI
export const ROLES = {
  ADMIN: 'ADMIN',
  DG: 'DG',
  DA: 'DA',
  ASSISTANTE: 'ASSISTANTE',
}

export const ROLE_LABELS = {
  ADMIN: 'Administrateur',
  DG: 'Directeur Général',
  DA: 'Directeur Adjoint',
  ASSISTANTE: 'Assistante',
}

export const ROLE_COLORS = {
  ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  DG: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
  DA: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  ASSISTANTE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

export const isAdmin = (role) => role === ROLES.ADMIN
