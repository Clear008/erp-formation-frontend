// src/pages/encaissements/ChequesPage.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCheques, createCheque, changeChequeStatus } from '../../api/chequeApi';
import { CHEQUE_STATUS, CHEQUE_STATUS_OPTIONS } from '../../utils/financeConstants.js';

function StatusBadge({ statut }) {
    const config = CHEQUE_STATUS[statut] || { label: statut, color: 'bg-gray-700 text-gray-300' };
    return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
}

function formatDH(val) {
    if (!val && val !== 0) return '—';
    return Number(val).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' DH';
}

export default function ChequesPage() {
    const [cheques, setCheques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [actionCheque, setActionCheque] = useState(null); // chèque en cours de changement de statut

    useEffect(() => { load(); }, [statusFilter]);

    const load = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter) params.statut = statusFilter;
            const { data } = await getCheques(params);
            setCheques(data);
        } catch {
            toast.error('Erreur chargement chèques');
        } finally {
            setLoading(false);
        }
    };

    const handleChangeStatus = async (chequeId, data) => {
        try {
            await changeChequeStatus(chequeId, data);
            toast.success('Statut du chèque mis à jour');
            setActionCheque(null);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur');
        }
    };

    // Stats
    const nbRecu = cheques.filter((c) => c.statut === 'RECU').length;
    const nbDepose = cheques.filter((c) => c.statut === 'DEPOSE').length;
    const nbEncaisse = cheques.filter((c) => c.statut === 'ENCAISSE').length;
    const nbImpaye = cheques.filter((c) => c.statut === 'IMPAYE').length;
    const nbRepresente = cheques.filter((c) => c.statut === 'REPRESENTE').length;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Suivi des chèques</h1>
                    <p className="text-sm text-gray-400 mt-1">{cheques.length} chèque(s)</p>
                </div>

                <Link
                    to="/cheques/nouveau"
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition"
                >
                    + Créer un chèque
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-4 mb-6">
                {[
                    { label: 'Reçus', value: nbRecu, color: 'text-blue-400' },
                    { label: 'Déposés', value: nbDepose, color: 'text-amber-400' },
                    { label: 'Encaissés', value: nbEncaisse, color: 'text-emerald-400' },
                    { label: 'Impayés', value: nbImpaye, color: 'text-red-400' },
                    { label: 'Représentés', value: nbRepresente, color: 'text-purple-400' },
                ].map((c) => (
                    <div key={c.label} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">{c.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="flex gap-3 mb-5">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                    {CHEQUE_STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
                </div>
            ) : cheques.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-5xl mb-4">🏦</div>
                    <p className="text-lg font-medium text-white">Aucun chèque</p>
                    <p className="text-sm text-gray-400 mt-1">Les chèques sont créés lors de l'enregistrement d'encaissements</p>
                </div>
            ) : (
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-700">
                            {['N° Chèque', 'Banque', 'Émetteur', 'Montant', 'Réception', 'Dépôt', 'Encaissement / rejet', 'Statut', 'Actions'].map((h) => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                        {cheques.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-700/30 transition-colors">
                                <td className="px-4 py-3 text-sm font-mono text-indigo-400 font-medium">{c.numero}</td>
                                <td className="px-4 py-3 text-sm text-gray-300">{c.banque || '—'}</td>
                                <td className="px-4 py-3 text-sm text-gray-300">{c.emetteur || '—'}</td>
                                <td className="px-4 py-3 text-sm text-white font-medium">{formatDH(c.montant)}</td>
                                <td className="px-4 py-3 text-sm text-gray-300">{c.dateReception}</td>
                                <td className="px-4 py-3 text-sm text-gray-300">{c.dateDepot || '—'}</td>
                                <td className="px-4 py-3 text-sm text-gray-300">
                                    {c.statut === 'IMPAYE' ? (
                                        <div>
                                            <div className="text-red-400">Rejeté le {c.dateRejet}</div>
                                            <div className="text-xs text-gray-500 mt-0.5" title={c.motifRejet}>{c.motifRejet}</div>
                                        </div>
                                    ) : c.statut === 'REPRESENTE' ? (
                                        <span className="text-purple-400">Représenté le {c.dateRepresentation}</span>
                                    ) : (c.dateEncaissement || '—')}
                                </td>
                                <td className="px-4 py-3"><StatusBadge statut={c.statut} /></td>
                                <td className="px-4 py-3">
                                    {c.statut !== 'ENCAISSE' && (
                                        <button
                                            onClick={() => setActionCheque(c)}
                                            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                                        >
                                            Avancer →
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal changement statut chèque */}
            {actionCheque && (
                <ChequeStatusModal
                    cheque={actionCheque}
                    onSubmit={(data) => handleChangeStatus(actionCheque.id, data)}
                    onClose={() => setActionCheque(null)}
                />
            )}
        </div>
    );
}

// ==================== CHEQUE STATUS MODAL ====================

function ChequeStatusModal({ cheque, onSubmit, onClose }) {
    const isDeposited = ['DEPOSE', 'REPRESENTE'].includes(cheque.statut);
    const isUnpaid = cheque.statut === 'IMPAYE';
    const today = new Date().toISOString().split('T')[0];
    const { register, handleSubmit, watch } = useForm({
        defaultValues: {
            decision: 'ENCAISSE',
            dateDepot: today,
            dateEncaissement: today,
            dateRejet: today,
            dateRepresentation: today,
            motifRejet: '',
        },
    });
    const decision = watch('decision');

    const doSubmit = (data) => {
        if (isUnpaid) {
            onSubmit({ statut: 'REPRESENTE', dateRepresentation: data.dateRepresentation });
            return;
        }
        if (!isDeposited) {
            onSubmit({ statut: 'DEPOSE', dateDepot: data.dateDepot });
            return;
        }
        if (data.decision === 'IMPAYE') {
            onSubmit({ statut: 'IMPAYE', dateRejet: data.dateRejet, motifRejet: data.motifRejet });
        } else {
            onSubmit({ statut: 'ENCAISSE', dateEncaissement: data.dateEncaissement });
        }
    };

    const inputClass = "w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-md w-full mx-4">
                <div className="flex items-center justify-between p-5 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Chèque {cheque.numero}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit(doSubmit)} className="p-5 space-y-4">
                    <p className="text-sm text-gray-400">
                        Statut actuel : <StatusBadge statut={cheque.statut} />
                    </p>

                    {isUnpaid ? (
                        <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
                            <p className="text-sm text-white mb-3">→ Présenter de nouveau le même chèque à la banque</p>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Date de représentation</label>
                            <input
                                type="date"
                                {...register('dateRepresentation', { required: 'La date de représentation est obligatoire' })}
                                className={inputClass}
                            />
                            <p className="text-xs text-gray-500 mt-2">Le numéro du chèque et son premier rejet sont conservés.</p>
                        </div>
                    ) : !isDeposited ? (
                        <div>
                            <p className="text-sm text-white mb-3">→ Passer à : <strong>Déposé</strong></p>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Date de dépôt</label>
                            <input
                                type="date"
                                {...register('dateDepot', { required: 'La date de dépôt est obligatoire' })}
                                className={inputClass}
                            />
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Résultat du chèque</label>
                                <select {...register('decision')} className={inputClass}>
                                    <option value="ENCAISSE">Encaissé</option>
                                    <option value="IMPAYE">Impayé</option>
                                </select>
                            </div>

                            {decision === 'ENCAISSE' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Date d'encaissement</label>
                                    <input
                                        type="date"
                                        {...register('dateEncaissement', { required: decision === 'ENCAISSE' })}
                                        className={inputClass}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Date de rejet</label>
                                        <input
                                            type="date"
                                            {...register('dateRejet', { required: decision === 'IMPAYE' })}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Motif du rejet</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Ex. : provision insuffisante, opposition, signature non conforme..."
                                            {...register('motifRejet', {
                                                required: decision === 'IMPAYE' ? 'Le motif de rejet est obligatoire' : false,
                                                validate: (value) => decision !== 'IMPAYE' || value.trim().length > 0 || 'Le motif de rejet est obligatoire',
                                            })}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div className="flex justify-end gap-3 pt-3 border-t border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Annuler</button>
                        <button
                            type="submit"
                            className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${decision === 'IMPAYE' && isDeposited ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                            {isUnpaid ? 'Marquer comme représenté' : !isDeposited ? 'Marquer comme déposé' : decision === 'IMPAYE' ? 'Déclarer impayé' : 'Marquer comme encaissé'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}