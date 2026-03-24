// src/pages/factures/components/FactureStepParams.jsx
import { MODE_PAIEMENT_OPTIONS } from '../../../utils/financeConstants';

export default function FactureStepParams({ data, onChange }) {
    const set = (field, value) => onChange({ ...data, [field]: value });

    const inputClass = "w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none";
    const labelClass = "block text-sm font-medium text-gray-300 mb-1";

    return (
        <div className="space-y-5">
            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Date d'émission</label>
                    <input
                        type="date"
                        value={data.dateFacture || ''}
                        onChange={(e) => set('dateFacture', e.target.value)}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className={labelClass}>Date d'échéance</label>
                    <input
                        type="date"
                        value={data.dateEcheance || ''}
                        onChange={(e) => set('dateEcheance', e.target.value)}
                        className={inputClass}
                    />
                </div>
            </div>

            {/* Mode paiement + Ref interne */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Mode de paiement attendu</label>
                    <select
                        value={data.modePaiementAttendu || ''}
                        onChange={(e) => set('modePaiementAttendu', e.target.value)}
                        className={inputClass}
                    >
                        <option value="">— Non spécifié —</option>
                        {MODE_PAIEMENT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Référence interne</label>
                    <input
                        value={data.referenceInterne || ''}
                        onChange={(e) => set('referenceInterne', e.target.value)}
                        className={inputClass}
                        placeholder="Ex: BON-2026-045"
                    />
                </div>
            </div>

            {/* Commentaires */}
            <div>
                <label className={labelClass}>Commentaires / Mentions légales</label>
                <textarea
                    value={data.commentaires || ''}
                    onChange={(e) => set('commentaires', e.target.value)}
                    rows={4}
                    className={inputClass}
                    placeholder="Conditions de paiement, mentions particulières..."
                />
            </div>

            {/* Pièces jointes (simulation) */}
            <div>
                <label className={labelClass}>Pièces jointes</label>
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center">
                    <div className="text-3xl mb-2">📎</div>
                    <p className="text-sm text-gray-400">Glissez-déposez vos fichiers ici</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, images — Max 10 Mo par fichier</p>
                    <button
                        type="button"
                        className="mt-3 px-4 py-2 text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 transition-colors"
                    >
                        Parcourir les fichiers
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 italic">
                    Upload disponible prochainement — les pièces jointes seront liées après la sauvegarde.
                </p>
            </div>
        </div>
    );
}