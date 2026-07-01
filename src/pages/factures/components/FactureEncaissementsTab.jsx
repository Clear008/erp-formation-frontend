// src/pages/factures/components/FactureEncaissementsTab.jsx
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getEncaissements, createEncaissement, deleteEncaissement, getFactureFinance } from '../../../api/encaissementApi';
import { CHEQUE_STATUS } from '../../../utils/financeConstants';
import EncaissementModal from './EncaissementModal';

function formatDH(val) {
    if (!val && val !== 0) return '0,00 DH';
    return Number(val).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' DH';
}

export default function FactureEncaissementsTab({ facture, onFactureUpdated, autoOpenModal, onModalOpened }) {
    const [encaissements, setEncaissements] = useState([]);
    const [finance, setFinance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const load = useCallback(async () => {
        try {
            const [encRes, finRes] = await Promise.all([
                getEncaissements(facture.id),
                getFactureFinance(facture.id),
            ]);
            setEncaissements(encRes.data);
            setFinance(finRes.data);
        } catch {
            toast.error('Erreur chargement encaissements');
        } finally {
            setLoading(false);
        }
    }, [facture.id]);

    useEffect(() => { load(); }, [load]);

    // Ouvre automatiquement le modal si demandé par le parent
    useEffect(() => {
        if (autoOpenModal) {
            setShowModal(true);
            if (onModalOpened) onModalOpened();
        }
    }, [autoOpenModal, onModalOpened]);

    const handleCreate = async (payload) => {
        try {
            await createEncaissement(facture.id, payload);
            toast.success('Encaissement enregistré — statut facture mis à jour');
            setShowModal(false);
            await load();
            if (onFactureUpdated) onFactureUpdated();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur');
        }
    };

    const handleDelete = async (encId) => {
        if (!window.confirm('Supprimer cet encaissement ? Le statut de la facture sera recalculé.')) return;
        try {
            await deleteEncaissement(encId);
            toast.success('Encaissement supprimé — statut recalculé');
            await load();
            if (onFactureUpdated) onFactureUpdated();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    const isPaid = finance?.statut === 'PAYEE';
    const resteAPayer = Number(finance?.resteAPayer || 0);

    return (
        <div className="space-y-6">
            {/* Finance summary cards */}
            {finance && (
                <div className="grid grid-cols-4 gap-3">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Montant TTC</p>
                        <p className="text-lg font-bold text-white mt-1">{formatDH(finance.montantTtc)}</p>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Total encaissé</p>
                        <p className="text-lg font-bold text-emerald-400 mt-1">{formatDH(finance.totalEncaisse)}</p>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Reste à payer</p>
                        <p className={`text-lg font-bold mt-1 ${resteAPayer > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {formatDH(finance.resteAPayer)}
                        </p>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Statut</p>
                        <p className="text-lg font-bold text-white mt-1">{finance.statutLabel}</p>
                    </div>
                </div>
            )}

            {/* Header + button */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                    Encaissements ({encaissements.length})
                </h3>
                {!isPaid && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        + Encaisser
                    </button>
                )}
                {isPaid && (
                    <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full ring-1 ring-emerald-500/20">
                        ✓ Facture entièrement payée
                    </span>
                )}
            </div>

            {/* Table */}
            {encaissements.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <div className="text-3xl mb-2">💰</div>
                    <p>Aucun encaissement enregistré</p>
                </div>
            ) : (
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-700">
                            {['Date', 'Montant', 'Mode', 'Référence', 'Chèque', 'Statut chèque', 'Notes', ''].map((h) => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                        {encaissements.map((enc) => {
                            const chequeStyle = enc.chequeStatut ? (CHEQUE_STATUS[enc.chequeStatut] || {}) : {};
                            return (
                                <tr key={enc.id} className="hover:bg-gray-700/30 transition-colors">
                                    <td className="px-4 py-3 text-sm text-white">{enc.dateEncaissement}</td>
                                    <td className="px-4 py-3 text-sm text-emerald-400 font-medium">{formatDH(enc.montant)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-300">{enc.modePaiementLabel}</td>
                                    <td className="px-4 py-3 text-sm text-gray-300">{enc.referencePaiement || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-300">
                                        {enc.chequeNumero ? (
                                            <span className="font-mono text-xs">{enc.chequeNumero}</span>
                                        ) : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {enc.chequeStatut ? (
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${chequeStyle.color || 'bg-gray-700 text-gray-300'}`}>
                                                    {enc.chequeStatutLabel}
                                                </span>
                                        ) : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-400 max-w-[150px] truncate">{enc.notes || '—'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => handleDelete(enc.id)}
                                            className="text-red-400 hover:text-red-300 text-xs transition-colors"
                                            title="Supprimer"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <EncaissementModal
                    facture={facture}
                    resteAPayer={resteAPayer}
                    onSubmit={handleCreate}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}