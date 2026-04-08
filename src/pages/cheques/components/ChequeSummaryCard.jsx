// src/pages/cheques/components/ChequeSummaryCard.jsx

const STATUT_STYLES = {
    RECU:     { label: 'Reçu',     color: 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20',     dot: 'bg-blue-400' },
    DEPOSE:   { label: 'Déposé',   color: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',  dot: 'bg-amber-400' },
    ENCAISSE: { label: 'Encaissé', color: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20', dot: 'bg-emerald-400' },
};

function formatDH(val) {
    if (!val && val !== 0) return '—';
    return Number(val).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' DH';
}

export default function ChequeSummaryCard({ data, factures, targetStatut }) {
    const facture = factures.find((f) => String(f.id) === String(data.factureId));
    const statut = STATUT_STYLES[targetStatut] || STATUT_STYLES.RECU;

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 sticky top-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Résumé chèque</h3>

            {/* Workflow visual */}
            <div className="flex items-center justify-between mb-6">
                {Object.entries(STATUT_STYLES).map(([key, s], i) => {
                    const isActive = key === targetStatut;
                    const isPast = Object.keys(STATUT_STYLES).indexOf(key) < Object.keys(STATUT_STYLES).indexOf(targetStatut);
                    return (
                        <div key={key} className="flex items-center flex-1">
                            <div className="flex flex-col items-center">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                    isPast ? 'bg-emerald-500 text-white' :
                                        isActive ? 'bg-indigo-600 text-white ring-2 ring-indigo-500/30' :
                                            'bg-gray-700 text-gray-500'
                                }`}>
                                    {isPast ? '✓' : i + 1}
                                </div>
                                <span className={`text-[10px] mt-1 ${isActive ? 'text-indigo-400 font-semibold' : 'text-gray-500'}`}>
                  {s.label}
                </span>
                            </div>
                            {i < 2 && (
                                <div className={`flex-1 h-0.5 mx-1.5 ${isPast ? 'bg-emerald-500' : 'bg-gray-700'}`} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Détails */}
            <div className="space-y-3 text-sm">
                {data.numero && (
                    <div>
                        <span className="text-gray-500">N° chèque</span>
                        <p className="text-white font-mono font-medium">{data.numero}</p>
                    </div>
                )}

                {data.montant && (
                    <div>
                        <span className="text-gray-500">Montant</span>
                        <p className="text-white font-bold text-lg">{formatDH(data.montant)}</p>
                    </div>
                )}

                {data.banque && (
                    <div>
                        <span className="text-gray-500">Banque</span>
                        <p className="text-white">{data.banque}</p>
                    </div>
                )}

                {data.emetteur && (
                    <div>
                        <span className="text-gray-500">Émetteur</span>
                        <p className="text-white">{data.emetteur}</p>
                    </div>
                )}

                {data.dateReception && (
                    <div>
                        <span className="text-gray-500">Réception</span>
                        <p className="text-white">{data.dateReception}</p>
                    </div>
                )}

                {data.dateDepot && (
                    <div>
                        <span className="text-gray-500">Dépôt</span>
                        <p className="text-white">{data.dateDepot}</p>
                    </div>
                )}

                {data.dateEncaissement && (
                    <div>
                        <span className="text-gray-500">Encaissement</span>
                        <p className="text-white">{data.dateEncaissement}</p>
                    </div>
                )}

                {facture && (
                    <div className="pt-3 border-t border-gray-700">
                        <span className="text-gray-500">Facture liée</span>
                        <p className="text-indigo-400 font-mono text-xs">{facture.numero}</p>
                        <p className="text-gray-300 text-xs">{facture.clientRaisonSociale}</p>
                    </div>
                )}

                {/* Statut cible */}
                <div className="pt-3 border-t border-gray-700">
                    <span className="text-gray-500">Statut final</span>
                    <p className="mt-1">
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statut.color}`}>
              {statut.label}
            </span>
                    </p>
                </div>
            </div>
        </div>
    );
}