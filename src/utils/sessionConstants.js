// src/utils/sessionConstants.js

export const SESSION_STATUS = {
    PREVUE:   { label: 'Prévue',   color: 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20' },
    REALISEE: { label: 'Réalisée', color: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' },
    ANNULEE:  { label: 'Annulée',  color: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20' },
};

export const SESSION_STATUS_OPTIONS = [
    { value: 'PREVUE',   label: 'Prévue' },
    { value: 'REALISEE', label: 'Réalisée' },
    { value: 'ANNULEE',  label: 'Annulée' },
];