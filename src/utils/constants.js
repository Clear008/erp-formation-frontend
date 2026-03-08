export const ACTION_STATUS = {
    EN_QUALIFICATION:       { label: 'Demande en qualification',  color: 'bg-gray-100 text-gray-700',     step: 1 },
    EN_CONCEPTION:          { label: 'En conception',             color: 'bg-blue-100 text-blue-700',     step: 2 },
    VALIDEE_PLANIFIEE:      { label: 'Validée / planifiée',      color: 'bg-indigo-100 text-indigo-700', step: 3 },
    PRETE_A_EXECUTER:       { label: 'Prête à exécuter',         color: 'bg-yellow-100 text-yellow-800', step: 4 },
    EN_COURS:               { label: 'En cours',                 color: 'bg-orange-100 text-orange-700', step: 5 },
    PARTIELLEMENT_REALISEE: { label: 'Partiellement réalisée',   color: 'bg-amber-100 text-amber-700',   step: 5 },
    REALISEE:               { label: 'Réalisée (pédagogique)',   color: 'bg-green-100 text-green-700',   step: 6 },
    CLOTUREE:               { label: 'Clôturée',                 color: 'bg-emerald-100 text-emerald-800', step: 7 },
    ANNULEE:                { label: 'Annulée',                  color: 'bg-red-100 text-red-700',       step: 0 },
};

export const STATUS_TRANSITIONS = {
    EN_QUALIFICATION:       ['EN_CONCEPTION', 'ANNULEE'],
    EN_CONCEPTION:          ['VALIDEE_PLANIFIEE', 'EN_QUALIFICATION', 'ANNULEE'],
    VALIDEE_PLANIFIEE:      ['PRETE_A_EXECUTER', 'EN_CONCEPTION', 'ANNULEE'],
    PRETE_A_EXECUTER:       ['EN_COURS', 'VALIDEE_PLANIFIEE', 'ANNULEE'],
    EN_COURS:               ['PARTIELLEMENT_REALISEE', 'REALISEE', 'ANNULEE'],
    PARTIELLEMENT_REALISEE: ['EN_COURS', 'REALISEE', 'ANNULEE'],
    REALISEE:               ['CLOTUREE', 'ANNULEE'],
    CLOTUREE:               [],
    ANNULEE:                [],
};

export const WORKFLOW_STEPS = [
    { key: 'qualification', label: 'Qualification',  statut: 'EN_QUALIFICATION' },
    { key: 'conception',    label: 'Conception',      statut: 'EN_CONCEPTION' },
    { key: 'validation',    label: 'Validation',      statut: 'VALIDEE_PLANIFIEE' },
    { key: 'preparation',   label: 'Préparation',     statut: 'PRETE_A_EXECUTER' },
    { key: 'realisation',   label: 'Réalisation',     statut: 'EN_COURS' },
    { key: 'cloture',       label: 'Clôture',         statut: 'CLOTUREE' },
];

export const RESTRICTED_ROLES = ['DA', 'DG', 'ADMIN'];

export const ACTION_TYPE_OPTIONS = [
    { value: 'INTRA', label: 'Intra-entreprise' },
    { value: 'INTER', label: 'Inter-entreprise' },
];
