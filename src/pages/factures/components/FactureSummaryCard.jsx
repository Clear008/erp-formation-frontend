// src/pages/factures/components/FactureSummaryCard.jsx

function formatDH(val) {
    if (!val && val !== 0) return '0,00 DH';
    return Number(val).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' DH';
}

export default function FactureSummaryCard({ wizardData, clients, actions }) {
    const client = clients.find((c) => String(c.id) === String(wizardData.clientId));
    const action = actions.find((a) => String(a.id) === String(wizardData.actionId));

    // Calculer totaux depuis les lignes
    let totalHt = 0;
    let totalTva = 0;
    (wizardData.lignes || []).forEach((l) => {
        const qty = Number(l.quantite) || 1;
        const pu = Number(l.prixUnitaire) || 0;
        const taux = Number(l.tauxTva) || 20;
        const ht = qty * pu;
        const tva = ht * taux / 100;
        totalHt += ht;
        totalTva += tva;
    });
    const totalTtc = totalHt + totalTva;

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 sticky top-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Résumé facture</h3>

            <div className="space-y-3 text-sm">
                {/* Mode */}
                <div>
                    <span className="text-gray-500">Mode</span>
                    <p className="text-white font-medium">
                        {wizardData.mode === 'ACTION' ? 'Action de formation' :
                            wizardData.mode === 'PRESTATION' ? 'Prestation autre' : 'Mixte'}
                    </p>
                </div>

                {/* Client */}
                {client && (
                    <div>
                        <span className="text-gray-500">Client</span>
                        <p className="text-white font-medium">{client.raisonSociale || client.clientRaisonSociale}</p>
                    </div>
                )}

                {/* Action */}
                {action && (
                    <div>
                        <span className="text-gray-500">Action</span>
                        <p className="text-indigo-400 font-mono text-xs">{action.reference}</p>
                        <p className="text-white">{action.titre}</p>
                    </div>
                )}

                {/* Lignes count */}
                {(wizardData.lignes || []).length > 0 && (
                    <div>
                        <span className="text-gray-500">Lignes</span>
                        <p className="text-white">{wizardData.lignes.length} ligne(s)</p>
                    </div>
                )}

                {/* Divider */}
                <div className="border-t border-gray-700 pt-3 mt-3 space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Total HT</span>
                        <span className="text-white font-medium">{formatDH(totalHt)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">TVA</span>
                        <span className="text-gray-300">{formatDH(totalTva)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-700 pt-2">
                        <span className="text-white font-semibold">Total TTC</span>
                        <span className="text-white font-bold text-lg">{formatDH(totalTtc)}</span>
                    </div>
                </div>

                {/* Dates */}
                {wizardData.dateFacture && (
                    <div>
                        <span className="text-gray-500">Date émission</span>
                        <p className="text-white">{wizardData.dateFacture}</p>
                    </div>
                )}
                {wizardData.dateEcheance && (
                    <div>
                        <span className="text-gray-500">Échéance</span>
                        <p className="text-white">{wizardData.dateEcheance}</p>
                    </div>
                )}
            </div>
        </div>
    );
}