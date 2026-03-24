// src/pages/encaissements/ChequesPage.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Suivi des chèques</h1>
                    <p className="text-sm text-gray-400 mt-1">{cheques.length} chèque(s)</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Reçus', value: nbRecu, color: 'text-blue-400' },
                    { label: 'Déposés', value: nbDepose, color: 'text-amber-400' },
                    { label: 'Encaissés', value: nbEncaisse, color: 'text-emerald-400' },
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
                            {['N° Chèque', 'Banque', 'Émetteur', 'Montant', 'Réception', 'Dépôt', 'Encaissement', 'Statut', 'Actions'].map((h) => (
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
                                <td className="px-4 py-3 text-sm text-gray-300">{c.dateEncaissement || '—'}</td>
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
    const nextStatus = cheque.statut === 'RECU' ? 'DEPOSE' : 'ENCAISSE';
    const nextLabel = nextStatus === 'DEPOSE' ? 'Marquer comme déposé' : 'Marquer comme encaissé';
    const dateField = nextStatus === 'DEPOSE' ? 'dateDepot' : 'dateEncaissement';
    const dateLabel = nextStatus === 'DEPOSE' ? 'Date de dépôt' : "Date d'encaissement";

    const { register, handleSubmit } = useForm({
        defaultValues: { [dateField]: new Date().toISOString().split('T')[0] },
    });

    const doSubmit = (data) => {
        onSubmit({ statut: nextStatus, ...data });
    };

    const inputClass = "w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-sm w-full mx-4">
                <div className="flex items-center justify-between p-5 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Chèque {cheque.numero}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit(doSubmit)} className="p-5 space-y-4">
                    <p className="text-sm text-gray-400">
                        Statut actuel : <StatusBadge statut={cheque.statut} />
                    </p>
                    <p className="text-sm text-white">
                        → Passer à : <strong>{nextStatus === 'DEPOSE' ? 'Déposé' : 'Encaissé'}</strong>
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">{dateLabel}</label>
                        <input type="date" {...register(dateField)} className={inputClass} />
                    </div>
                    <div className="flex justify-end gap-3 pt-3 border-t border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Annuler</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                            {nextLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}