// src/pages/cheques/components/ChequeStepReception.jsx

export default function ChequeStepReception({ data, onChange, factures }) {
    const set = (field, value) => onChange({ ...data, [field]: value });

    const inputClass = "w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none";
    const labelClass = "block text-sm font-medium text-gray-300 mb-1";

    return (
        <div className="space-y-5">
            {/* Numéro + Banque */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>N° chèque <span className="text-red-400">*</span></label>
                    <input
                        value={data.numero || ''}
                        onChange={(e) => set('numero', e.target.value)}
                        className={inputClass}
                        placeholder="Ex: 0012345"
                    />
                </div>
                <div>
                    <label className={labelClass}>Banque</label>
                    <input
                        value={data.banque || ''}
                        onChange={(e) => set('banque', e.target.value)}
                        className={inputClass}
                        placeholder="Ex: Attijariwafa Bank"
                    />
                </div>
            </div>

            {/* Émetteur */}
            <div>
                <label className={labelClass}>Émetteur</label>
                <input
                    value={data.emetteur || ''}
                    onChange={(e) => set('emetteur', e.target.value)}
                    className={inputClass}
                    placeholder="Nom de l'émetteur du chèque"
                />
            </div>

            {/* Montant + Date */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Montant (DH) <span className="text-red-400">*</span></label>
                    <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={data.montant || ''}
                        onChange={(e) => set('montant', e.target.value)}
                        className={inputClass}
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label className={labelClass}>Date de réception <span className="text-red-400">*</span></label>
                    <input
                        type="date"
                        value={data.dateReception || ''}
                        onChange={(e) => set('dateReception', e.target.value)}
                        className={inputClass}
                    />
                </div>
            </div>

            {/* Facture liée */}
            <div>
                <label className={labelClass}>
                    Facture liée <span className="text-gray-500 font-normal">(optionnel)</span>
                </label>
                <select
                    value={data.factureId || ''}
                    onChange={(e) => set('factureId', e.target.value || null)}
                    className={inputClass}
                >
                    <option value="">— Aucune facture —</option>
                    {factures.map((f) => (
                        <option key={f.id} value={f.id}>
                            {f.numero} — {f.clientRaisonSociale} — {Number(f.montantTtc || f.resteAPayer || 0).toLocaleString('fr-FR')} DH
                        </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                    Si une facture est sélectionnée, un encaissement sera créé automatiquement.
                </p>
            </div>

            {/* Notes */}
            <div>
                <label className={labelClass}>Notes</label>
                <textarea
                    value={data.notes || ''}
                    onChange={(e) => set('notes', e.target.value)}
                    rows={3}
                    className={inputClass}
                    placeholder="Observations, références..."
                />
            </div>
        </div>
    );
}