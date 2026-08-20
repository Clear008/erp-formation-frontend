// src/pages/factures/components/FactureStepConfirmation.jsx

function formatDH(val) {
    if (!val && val !== 0) return '0,00 DH';
    return Number(val).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' DH';
}

export default function FactureStepConfirmation({ data, clients, actions, cabinetSettings, onSubmit, submitting }) {
    const client = clients.find((c) => String(c.id) === String(data.clientId));
    const action = actions.find((a) => String(a.id) === String(data.actionId));

    const lignes = data.lignes || [];
    let totalHt = 0, totalTva = 0;
    const computedLignes = lignes.map((l) => {
        const qty = Number(l.quantite) || 1;
        const pu = Number(l.prixUnitaire) || 0;
        const taux = Number(l.tauxTva) || 20;
        const ht = qty * pu;
        const tva = ht * taux / 100;
        totalHt += ht;
        totalTva += tva;
        return { ...l, ht, tva, ttc: ht + tva };
    });
    const totalTtc = totalHt + totalTva;

    return (
        <div className="space-y-6">
            {/* Aperçu facture */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
                {/* Header facture */}
                <div className="p-6 border-b border-gray-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-lg font-bold text-white">FACTURE</h2>
                            <p className="text-xs text-gray-500 mt-1">Numéro généré automatiquement à la création</p>
                            <p className="text-sm text-gray-400 mt-2">
                                Date : <span className="text-white">{data.dateFacture || new Date().toISOString().split('T')[0]}</span>
                            </p>
                            {data.dateEcheance && (
                                <p className="text-sm text-gray-400">
                                    Échéance : <span className="text-white">{data.dateEcheance}</span>
                                </p>
                            )}
                            {data.referenceInterne && (
                                <p className="text-sm text-gray-400">
                                    Réf. : <span className="text-white">{data.referenceInterne}</span>
                                </p>
                            )}
                        </div>
                        {/* Émetteur */}
                        <div className="max-w-sm text-right">
                            {cabinetSettings?.logoUrl && (
                                <img src={cabinetSettings.logoUrl} alt="Logo du cabinet" className="ml-auto mb-2 max-h-12 max-w-32 object-contain" />
                            )}
                            <p className="text-sm font-semibold text-white">
                                {cabinetSettings?.raisonSociale || 'Cabinet Formation'}
                            </p>
                            {cabinetSettings?.adresse ? (
                                <>
                                    <p className="text-xs text-gray-500">{cabinetSettings.adresse}</p>
                                    <p className="text-xs text-gray-500">
                                        {[cabinetSettings.ville, cabinetSettings.codePostal].filter(Boolean).join(', ')}
                                        {cabinetSettings.pays ? ` — ${cabinetSettings.pays}` : ''}
                                    </p>
                                    <p className="text-xs text-gray-500">ICE : {cabinetSettings.ice}</p>
                                    {cabinetSettings.telephone && <p className="text-xs text-gray-500">Tél. : {cabinetSettings.telephone}</p>}
                                    {cabinetSettings.email && <p className="text-xs text-gray-500">{cabinetSettings.email}</p>}
                                </>
                            ) : (
                                <p className="mt-1 text-xs text-amber-400">Paramètres du cabinet non renseignés</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Client */}
                <div className="p-6 border-b border-gray-700 bg-gray-800/30">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Facturé à</p>
                    {client ? (
                        <div>
                            <p className="text-sm font-semibold text-white">{client.raisonSociale}</p>
                            {client.adresse && <p className="text-xs text-gray-400">{client.adresse}</p>}
                            {client.ville && <p className="text-xs text-gray-400">{client.ville}</p>}
                            {client.ice && <p className="text-xs text-gray-400">ICE : {client.ice}</p>}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">Client non sélectionné</p>
                    )}
                    {action && (
                        <p className="text-xs text-indigo-400 mt-2">
                            Action : {action.reference} — {action.titre}
                        </p>
                    )}
                </div>

                {/* Tableau des lignes */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-700">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Description</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Qté</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">P.U. HT</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">TVA</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Total HT</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                        {computedLignes.map((l, i) => (
                            <tr key={i}>
                                <td className="px-6 py-3 text-sm text-white">{l.description || '—'}</td>
                                <td className="px-4 py-3 text-sm text-gray-300 text-right">{l.quantite}</td>
                                <td className="px-4 py-3 text-sm text-gray-300 text-right">{formatDH(l.prixUnitaire)}</td>
                                <td className="px-4 py-3 text-sm text-gray-300 text-right">{l.tauxTva}%</td>
                                <td className="px-4 py-3 text-sm text-white text-right font-medium">{formatDH(l.ht)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Totaux */}
                <div className="p-6 border-t border-gray-700 bg-gray-800/30">
                    <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Total HT</span>
                                <span className="text-white font-medium">{formatDH(totalHt)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">TVA</span>
                                <span className="text-gray-300">{formatDH(totalTva)}</span>
                            </div>
                            <div className="flex justify-between text-lg border-t border-gray-600 pt-2">
                                <span className="text-white font-bold">Total TTC</span>
                                <span className="text-white font-bold">{formatDH(totalTtc)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Commentaires */}
                {data.commentaires && (
                    <div className="p-6 border-t border-gray-700">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Mentions</p>
                        <p className="text-sm text-gray-400 whitespace-pre-wrap">{data.commentaires}</p>
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap justify-end gap-3">
                <button
                    type="button"
                    disabled={submitting}
                    onClick={() => onSubmit('BROUILLON')}
                    className="px-5 py-2.5 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                    💾 Enregistrer brouillon
                </button>
                <button
                    type="button"
                    disabled={submitting}
                    onClick={() => onSubmit('EMETTRE')}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    📄 Émettre
                </button>
                <button
                    type="button"
                    disabled={submitting}
                    onClick={() => onSubmit('EMETTRE_ENVOYER')}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                    📨 Émettre et envoyer
                </button>
            </div>
        </div>
    );
}