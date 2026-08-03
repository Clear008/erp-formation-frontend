// src/pages/paiements-prestataires/PaiementPrestataireCreatePage.jsx
import { useState, useEffect } from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { createPaiement } from '../../api/paiementPrestataireApi';
import { getPrestataires } from '../../api/prestataireApi';
import { MODE_PAIEMENT_OPTIONS } from '../../utils/financeConstants';

function formatDH(val) {
    if (!val && val !== 0) return '0,00 DH';
    return Number(val).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' DH';
}

export default function PaiementPrestataireCreatePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const initialPrestataireId =
        searchParams.get('prestataireId') || '';
    const initialSessionId = searchParams.get('sessionId') || '';
    const initialMontantHt = searchParams.get('montantHt') || '';
    const initialObjet = searchParams.get('objet') || '';

    const [prestataires, setPrestataires] = useState([]);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm({
        defaultValues: {
            prestataireId: initialPrestataireId,
            objet: initialObjet,
            sessionId: initialSessionId,
            description: '',
            montantHt: initialMontantHt,
            tauxTva: '20',
            datePrevue: '',
            modePaiement: '',
            notes: '',
        },
    });

    useEffect(() => {
        getPrestataires({ statut: 'ACTIF' }).then(({ data }) => setPrestataires(data)).catch(() => {});
    }, []);

    const montantHt = Number(watch('montantHt')) || 0;
    const tauxTva = Number(watch('tauxTva')) || 0;
    const montantTva = montantHt * tauxTva / 100;
    const montantTtc = montantHt + montantTva;

    const onSubmit = async (data) => {
        try {
            const payload = {
                prestataireId: Number(data.prestataireId),
                sessionId: initialSessionId ? Number(initialSessionId) : null,
                objet: data.objet,
                description: data.description || null,
                montantHt: Number(data.montantHt),
                tauxTva: Number(data.tauxTva),
                datePrevue: data.datePrevue || null,
                modePaiement: data.modePaiement || null,
                notes: data.notes || null,
            };
            const res = await createPaiement(payload);
            toast.success(`Paiement ${res.data.reference} créé (brouillon)`);
            navigate(`/paiements-prestataires/${res.data.id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur');
        }
    };

    const inputClass = "w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none";
    const labelClass = "block text-sm font-medium text-gray-300 mb-1";

    return (
        <div>
            <button onClick={() => navigate('/paiements-prestataires')} className="text-sm text-gray-400 hover:text-indigo-400 mb-4 inline-flex items-center gap-1">← Retour</button>
            <h1 className="text-2xl font-bold text-white mb-6">Nouveau paiement prestataire</h1>

            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-5">
                        {initialSessionId && (
                            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                                <p className="text-sm font-medium text-emerald-300">Paiement préparé depuis la session #{initialSessionId}</p>
                                <p className="text-xs text-emerald-400/70 mt-1">Le prestataire et le montant ont été préremplis depuis la session réalisée.</p>
                            </div>
                        )}

                        {/* Prestataire */}
                        <div>
                            <label className={labelClass}>Prestataire <span className="text-red-400">*</span></label>
                            <select {...register('prestataireId', { required: 'Obligatoire' })} className={inputClass}>
                                <option value="">— Sélectionner un prestataire —</option>
                                {prestataires.map((p) => (
                                    <option key={p.id} value={p.id}>{p.code} — {p.displayName} ({p.categorieLabel})</option>
                                ))}
                            </select>
                            {errors.prestataireId && <p className="text-xs text-red-400 mt-1">{errors.prestataireId.message}</p>}
                        </div>

                        {/* Objet */}
                        <div>
                            <label className={labelClass}>Objet du paiement <span className="text-red-400">*</span></label>
                            <input {...register('objet', { required: 'Obligatoire' })} className={inputClass} placeholder="Ex: Honoraires formation Mars 2026" />
                            {errors.objet && <p className="text-xs text-red-400 mt-1">{errors.objet.message}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className={labelClass}>Description</label>
                            <textarea {...register('description')} rows={2} className={inputClass} placeholder="Détails..." />
                        </div>

                        {/* Montants */}
                        <div>
                            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">Montants</h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>Montant HT (DH) <span className="text-red-400">*</span></label>
                                    <input type="number" step="0.01" min="0.01"
                                           {...register('montantHt', { required: 'Obligatoire', min: { value: 0.01, message: 'Min 0.01' } })}
                                           className={inputClass} placeholder="0.00" />
                                    {errors.montantHt && <p className="text-xs text-red-400 mt-1">{errors.montantHt.message}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Taux TVA (%)</label>
                                    <select {...register('tauxTva')} className={inputClass}>
                                        <option value="0">0%</option>
                                        <option value="7">7%</option>
                                        <option value="10">10%</option>
                                        <option value="14">14%</option>
                                        <option value="20">20%</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Date prévue</label>
                                    <input type="date" {...register('datePrevue')} className={inputClass} />
                                </div>
                            </div>
                        </div>

                        {/* Mode de paiement */}
                        <div>
                            <label className={labelClass}>Mode de paiement prévu</label>
                            <select {...register('modePaiement')} className={inputClass}>
                                <option value="">— Non défini —</option>
                                {MODE_PAIEMENT_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className={labelClass}>Notes</label>
                            <textarea {...register('notes')} rows={2} className={inputClass} placeholder="Observations..." />
                        </div>

                        {/* Boutons */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                            <button type="button" onClick={() => navigate('/paiements-prestataires')} className="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Annuler</button>
                            <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                                {isSubmitting ? 'En cours...' : '💾 Créer le brouillon'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Summary card */}
                <div className="col-span-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 sticky top-6">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Résumé</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Montant HT</span>
                                <span className="text-white font-medium">{formatDH(montantHt)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">TVA ({tauxTva}%)</span>
                                <span className="text-gray-300">{formatDH(montantTva)}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-700 pt-3">
                                <span className="text-white font-semibold">Total TTC</span>
                                <span className="text-white font-bold text-lg">{formatDH(montantTtc)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}