// src/pages/factures/components/EncaissementModal.jsx
import { useForm } from 'react-hook-form';
import { MODE_PAIEMENT_OPTIONS } from '../../../utils/financeConstants';

export default function EncaissementModal({ facture, resteAPayer, onSubmit, onClose }) {
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            montant: resteAPayer,
            dateEncaissement: new Date().toISOString().split('T')[0],
            modePaiement: 'VIREMENT',
            referencePaiement: '',
            notes: '',
            chequeNumero: '',
            chequeBanque: '',
            chequeEmetteur: '',
            chequeDateReception: new Date().toISOString().split('T')[0],
        },
    });

    const modePaiement = watch('modePaiement');
    const isCheque = modePaiement === 'CHEQUE';

    const inputClass = "w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none";

    const doSubmit = (data) => {
        const payload = {
            montant: Number(data.montant),
            dateEncaissement: data.dateEncaissement,
            modePaiement: data.modePaiement,
            referencePaiement: data.referencePaiement || null,
            notes: data.notes || null,
        };

        if (data.modePaiement === 'CHEQUE') {
            payload.chequeNumero = data.chequeNumero;
            payload.chequeBanque = data.chequeBanque || null;
            payload.chequeEmetteur = data.chequeEmetteur || null;
            payload.chequeDateReception = data.chequeDateReception || data.dateEncaissement;
        }

        onSubmit(payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-700">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Enregistrer un encaissement</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Facture {facture.numero}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>

                <form onSubmit={handleSubmit(doSubmit)} className="p-5 space-y-4">
                    {/* Info reste à payer */}
                    <div className="flex items-start gap-2 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-sm text-indigo-300">
                        <span>ℹ️</span>
                        <span>
              Reste à payer : <strong>{Number(resteAPayer).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH</strong>
            </span>
                    </div>

                    {/* Montant + Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Montant (DH) <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={resteAPayer}
                                {...register('montant', {
                                    required: 'Obligatoire',
                                    min: { value: 0.01, message: 'Min 0.01' },
                                    max: { value: resteAPayer, message: `Max ${resteAPayer} DH` },
                                })}
                                className={inputClass}
                            />
                            {errors.montant && <p className="text-xs text-red-400 mt-1">{errors.montant.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Date <span className="text-red-400">*</span>
                            </label>
                            <input type="date" {...register('dateEncaissement', { required: 'Obligatoire' })} className={inputClass} />
                        </div>
                    </div>

                    {/* Mode de paiement */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Mode de paiement <span className="text-red-400">*</span>
                        </label>
                        <select {...register('modePaiement')} className={inputClass}>
                            {MODE_PAIEMENT_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Champs chèque (affichage conditionnel) */}
                    {isCheque && (
                        <div className="space-y-3 p-4 bg-gray-900/60 border border-gray-700 rounded-xl">
                            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                                🏦 Informations du chèque
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">
                                        N° chèque <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        {...register('chequeNumero', { required: isCheque ? 'N° chèque obligatoire' : false })}
                                        className={inputClass}
                                        placeholder="0012345"
                                    />
                                    {errors.chequeNumero && <p className="text-xs text-red-400 mt-1">{errors.chequeNumero.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Banque</label>
                                    <input {...register('chequeBanque')} className={inputClass} placeholder="Ex: Attijariwafa" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Émetteur</label>
                                    <input {...register('chequeEmetteur')} className={inputClass} placeholder="Nom de l'émetteur" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Date réception</label>
                                    <input type="date" {...register('chequeDateReception')} className={inputClass} />
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-500">
                                Le chèque sera créé automatiquement avec le statut « Reçu ».
                            </p>
                        </div>
                    )}

                    {/* Référence (si pas chèque) */}
                    {!isCheque && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Référence paiement</label>
                            <input {...register('referencePaiement')} className={inputClass} placeholder="N° virement, reçu..." />
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                        <textarea {...register('notes')} rows={2} className={inputClass} placeholder="Observations..." />
                    </div>

                    {/* Boutons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                            Annuler
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                            {isSubmitting ? 'En cours...' : '💰 Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}