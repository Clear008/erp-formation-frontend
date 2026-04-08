// src/pages/cheques/components/ChequeStepEncaissement.jsx

function formatDH(val) {
    if (!val && val !== 0) return '—';
    return Number(val).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' DH';
}

export default function ChequeStepEncaissement({ data, onChange, factures, onSubmit, submitting }) {
    const set = (field, value) => onChange({ ...data, [field]: value });

    const inputClass = "w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none";

    const facture = factures.find((f) => String(f.id) === String(data.factureId));
    const hasDepot = !!data.dateDepot;

    return (
        <div className="space-y-6">
            {/* Info card */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                        <p className="text-sm font-medium text-emerald-300">Confirmation d'encaissement</p>
                        <p className="text-xs text-gray-400 mt-1">
                            Confirmez la date d'encaissement effectif du chèque.
                            {!hasDepot && (
                                <span className="text-amber-400 ml-1">
                  Note : vous n'avez pas renseigné de date de dépôt — le chèque sera enregistré comme « Reçu ».
                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Récapitulatif complet */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-700 bg-gray-800/50">
                    <h3 className="text-sm font-semibold text-gray-300">Récapitulatif du chèque</h3>
                </div>
                <div className="p-5">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {[
                            ['N° chèque', data.numero],
                            ['Banque', data.banque],
                            ['Émetteur', data.emetteur],
                            ['Montant', formatDH(data.montant)],
                            ['Reçu le', data.dateReception],
                            ['Déposé le', data.dateDepot || '— (non déposé)'],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <span className="text-gray-500">{label}</span>
                                <p className="text-white mt-0.5">{value || '—'}</p>
                            </div>
                        ))}
                    </div>

                    {facture && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <span className="text-gray-500 text-sm">Facture liée</span>
                            <p className="text-indigo-400 font-mono text-sm mt-0.5">{facture.numero}</p>
                            <p className="text-gray-300 text-xs">{facture.clientRaisonSociale}</p>
                        </div>
                    )}

                    {data.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <span className="text-gray-500 text-sm">Notes</span>
                            <p className="text-gray-300 text-sm mt-0.5">{data.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Date encaissement */}
            {hasDepot && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Date d'encaissement
                    </label>
                    <input
                        type="date"
                        value={data.dateEncaissement || ''}
                        onChange={(e) => set('dateEncaissement', e.target.value)}
                        min={data.dateDepot || data.dateReception || ''}
                        className={inputClass}
                    />
                    {data.dateDepot && data.dateEncaissement && data.dateEncaissement < data.dateDepot && (
                        <p className="text-xs text-red-400 mt-1">
                            La date d'encaissement ne peut pas être antérieure à la date de dépôt ({data.dateDepot})
                        </p>
                    )}
                </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                    type="button"
                    disabled={submitting}
                    onClick={() => onSubmit('RECU')}
                    className="px-5 py-2.5 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                    💾 Enregistrer (Reçu)
                </button>

                {hasDepot && (
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={() => onSubmit('DEPOSE')}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
                    >
                        🏦 Enregistrer et déposer
                    </button>
                )}

                {hasDepot && data.dateEncaissement && (
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={() => onSubmit('ENCAISSE')}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                        ✅ Enregistrer et marquer encaissé
                    </button>
                )}
            </div>
        </div>
    );
}