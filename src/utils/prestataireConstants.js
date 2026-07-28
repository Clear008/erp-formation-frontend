// src/utils/prestataireConstants.js

export const PRESTATAIRE_STATUT = {
    ACTIF:   { label: 'Actif',   color: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' },
    INACTIF: { label: 'Inactif', color: 'bg-gray-500/10 text-gray-400 ring-1 ring-gray-500/20' },
    BLOQUE:  { label: 'Bloqué',  color: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20' },
};

export const PRESTATAIRE_CATEGORIE = {
    FORMATION:   { label: 'Formation',   color: 'bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20' },
    FOURNISSEUR: { label: 'Fournisseur', color: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20' },
    SERVICE:     { label: 'Service',     color: 'bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20' },
};

export const CATEGORIE_OPTIONS = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'FORMATION', label: 'Formation' },
    { value: 'FOURNISSEUR', label: 'Fournisseur' },
    { value: 'SERVICE', label: 'Service' },
];

export const STATUT_OPTIONS = [
    { value: '', label: 'Tous les statuts' },
    { value: 'ACTIF', label: 'Actif' },
    { value: 'INACTIF', label: 'Inactif' },
    { value: 'BLOQUE', label: 'Bloqué' },
];

export const NATURE_OPTIONS = [
    { value: '', label: 'Toutes les natures' },
    { value: 'PERSONNE_PHYSIQUE', label: 'Personne physique' },
    { value: 'PERSONNE_MORALE', label: 'Personne morale' },
];

export const REGIME_OPTIONS = [
    { value: 'PARTICULIER', label: 'Particulier' },
    { value: 'INDEPENDANT', label: 'Indépendant' },
    { value: 'AUTO_ENTREPRENEUR', label: 'Auto-entrepreneur' },
    { value: 'SOCIETE', label: 'Société' },
    { value: 'ASSOCIATION', label: 'Association' },
    { value: 'AUTRE', label: 'Autre' },
];