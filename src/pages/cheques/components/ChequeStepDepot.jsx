// src/pages/cheques/components/ChequeStepDepot.jsx

export default function ChequeStepDepot({ data, onChange }) {
    const set = (field, value) => onChange({ ...data, [field]: value });

    const inputClass = "w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none";

    const dateReception = data.dateReception || '';

    return (
        <div className="space-y-6">
            {/* Info card */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">🏦</span>
                    <div>
                        <p className="text-sm font-medium text-indigo-300">Dépôt du chèque en banque</p>
                        <p className="text-xs text-gray-400 mt-1">
                            Confirmez la date à laquelle le chèque <strong className="text-white">{data.numero || '—'}</strong> a été
                            déposé en banque. Le statut passera de <span className="text-blue-400">Reçu</span> à <span className="text-amber-400">Déposé</span>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Récap chèque */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">N° chèque</span>
                        <p className="text-white font-mono font-medium">{data.numero || '—'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500">Montant</span>
                        <p className="text-white font-bold">
                            {data.montant ? Number(data.montant).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' DH' : '—'}
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-500">Reçu le</span>
                        <p className="text-white">{dateReception || '—'}</p>
                    </div>
                </div>
            </div>

            {/* Date dépôt */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                    Date de dépôt <span className="text-red-400">*</span>
                </label>
                <input
                    type="date"
                    value={data.dateDepot || ''}
                    onChange={(e) => set('dateDepot', e.target.value)}
                    min={dateReception}
                    className={inputClass}
                />
                {dateReception && data.dateDepot && data.dateDepot < dateReception && (
                    <p className="text-xs text-red-400 mt-1">
                        La date de dépôt ne peut pas être antérieure à la date de réception ({dateReception})
                    </p>
                )}
            </div>

            {/* Skip info */}
            <div className="flex items-start gap-2 p-3 bg-gray-900/50 border border-gray-700 rounded-lg text-xs text-gray-400">
                <span>💡</span>
                <span>
          Vous pouvez passer cette étape si vous souhaitez enregistrer le chèque comme « Reçu » uniquement.
          Vous pourrez le déposer plus tard depuis la page de suivi des chèques.
        </span>
            </div>
        </div>
    );
}