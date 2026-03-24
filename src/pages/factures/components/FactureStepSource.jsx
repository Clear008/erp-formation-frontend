// src/pages/factures/components/FactureStepSource.jsx

const MODES = [
    { value: 'ACTION',     label: 'Action de formation', desc: 'Facturer à partir d\'une action réalisée', icon: '🎓' },
    { value: 'PRESTATION', label: 'Prestation autre',     desc: 'Prestation libre hors formation',          icon: '📋' },
    { value: 'MIXTE',      label: 'Facture mixte',        desc: 'Combiner formations et prestations',      icon: '📦' },
];

export default function FactureStepSource({ data, onChange, clients, actions }) {
    const set = (field, value) => onChange({ ...data, [field]: value });

    const inputClass = "w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none";

    // Filtrer actions par client sélectionné
    const filteredActions = data.clientId
        ? actions.filter((a) => String(a.clientId) === String(data.clientId) || a.clientRaisonSociale)
        : actions;

    return (
        <div className="space-y-6">
            {/* Mode de facturation */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Mode de facturation</label>
                <div className="grid grid-cols-3 gap-3">
                    {MODES.map((m) => (
                        <button
                            key={m.value}
                            type="button"
                            onClick={() => set('mode', m.value)}
                            className={`p-4 rounded-xl border text-left transition-all ${
                                data.mode === m.value
                                    ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                                    : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                            }`}
                        >
                            <div className="text-2xl mb-2">{m.icon}</div>
                            <p className={`text-sm font-medium ${data.mode === m.value ? 'text-indigo-400' : 'text-white'}`}>
                                {m.label}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{m.desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Client */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                    Client <span className="text-red-400">*</span>
                </label>
                <select
                    value={data.clientId || ''}
                    onChange={(e) => set('clientId', e.target.value)}
                    className={inputClass}
                >
                    <option value="">— Sélectionner un client —</option>
                    {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.raisonSociale || c.code} — {c.ville || ''}
                        </option>
                    ))}
                </select>
            </div>

            {/* Actions facturables (si mode ACTION ou MIXTE) */}
            {(data.mode === 'ACTION' || data.mode === 'MIXTE') && data.clientId && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Action de formation</label>
                    {filteredActions.length === 0 ? (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-300">
                            ⚠️ Aucune action facturable pour ce client. L'action doit être au statut « Réalisée » ou « Clôturée ».
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredActions.map((a) => (
                                <button
                                    key={a.id}
                                    type="button"
                                    onClick={() => set('actionId', a.id)}
                                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                                        String(data.actionId) === String(a.id)
                                            ? 'border-indigo-500 bg-indigo-500/10'
                                            : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="font-mono text-indigo-400 text-xs">{a.reference}</span>
                                            <p className="text-sm text-white mt-0.5">{a.titre}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {a.nbSessionsRealisees} session(s) réalisée(s)
                                                {a.dejaFacturee && <span className="text-amber-400 ml-2">⚠ Déjà facturée</span>}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-white font-medium">
                                                {a.montantCalcule ? `${Number(a.montantCalcule).toLocaleString('fr-FR')} DH` : '—'}
                                            </p>
                                            <p className="text-xs text-gray-500">calculé</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}