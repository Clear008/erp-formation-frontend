export const FACTURE_STATUS = {
    EMISE:                 { label: 'Émise',                color: 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20' },
    ENVOYEE:               { label: 'Envoyée',              color: 'bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20' },
    PARTIELLEMENT_PAYEE:   { label: 'Partiellement payée',  color: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20' },
    PAYEE:                 { label: 'Payée',                color: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' },
    EN_RETARD:             { label: 'En retard',            color: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20' },
};

export const FACTURE_STATUS_OPTIONS = [
    { value: '',                     label: 'Tous les statuts' },
    { value: 'EMISE',                label: 'Émise' },
    { value: 'ENVOYEE',             label: 'Envoyée' },
    { value: 'PARTIELLEMENT_PAYEE', label: 'Partiellement payée' },
    { value: 'PAYEE',               label: 'Payée' },
    { value: 'EN_RETARD',           label: 'En retard' },
];

export const CHEQUE_STATUS = {
    RECU:      { label: 'Reçu',     color: 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20' },
    DEPOSE:    { label: 'Déposé',   color: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20' },
    ENCAISSE:  { label: 'Encaissé', color: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' },
    IMPAYE:    { label: 'Impayé',   color: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20' },
    REPRESENTE: { label: 'Représenté', color: 'bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20' },
};

export const CHEQUE_STATUS_OPTIONS = [
    { value: '',          label: 'Tous' },
    { value: 'RECU',     label: 'Reçu' },
    { value: 'DEPOSE',   label: 'Déposé' },
    { value: 'ENCAISSE', label: 'Encaissé' },
    { value: 'IMPAYE',   label: 'Impayé' },
    { value: 'REPRESENTE', label: 'Représenté' },
];

export const MODE_PAIEMENT_OPTIONS = [
    { value: 'VIREMENT', label: 'Virement' },
    { value: 'CHEQUE',   label: 'Chèque' },
    { value: 'ESPECES',  label: 'Espèces' },
    { value: 'CB',       label: 'Carte bancaire' },
];
