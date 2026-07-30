// src/utils/paiementPrestataireConstants.js

export const PAIEMENT_STATUT = {
    BROUILLON:  { label: 'Brouillon',  color: 'bg-gray-500/10 text-gray-400 ring-1 ring-gray-500/20' },
    A_VALIDER:  { label: 'À valider',  color: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20' },
    VALIDE:     { label: 'Validé',     color: 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20' },
    REJETE:     { label: 'Rejeté',     color: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20' },
    PAYE:       { label: 'Payé',       color: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' },
    ANNULE:     { label: 'Annulé',     color: 'bg-gray-500/10 text-gray-500 ring-1 ring-gray-600/20' },
};

export const PAIEMENT_STATUT_OPTIONS = [
    { value: '', label: 'Tous les statuts' },
    { value: 'BROUILLON', label: 'Brouillon' },
    { value: 'A_VALIDER', label: 'À valider' },
    { value: 'VALIDE', label: 'Validé' },
    { value: 'REJETE', label: 'Rejeté' },
    { value: 'PAYE', label: 'Payé' },
    { value: 'ANNULE', label: 'Annulé' },
];