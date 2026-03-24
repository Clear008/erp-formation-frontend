// src/pages/factures/FactureDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getFacture, changeFactureStatus, getEncaissements, addEncaissement } from '../../api/factureApi';
import { FACTURE_STATUS, FACTURE_STATUS_OPTIONS } from '../../utils/financeConstants';
import { MODE_PAIEMENT_OPTIONS } from '../../utils/financeConstants';

function StatusBadge({ statut }) {
    const config = FACTURE_STATUS[statut] || { label: statut, color: 'bg-gray-700 text-gray-300' };
    return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
}

function formatDH(val) {
    if (!val && val !== 0) return '—';
    return Number(val).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' DH';
}

export default function FactureDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [facture, setFacture] = useState(null);
    const [encaissements, setEncaissements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('infos');
    const [showPayModal, setShowPayModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);

    useEffect(() => { loadData(); }, [id]);

    const loadData = async () => {
        try {
            const [fRes, eRes] = await Promise.all([
                getFacture(id),
                getEncaissements(id),
            ]);
            setFacture(fRes.data);
            setEncaissements(eRes.data);
        } catch {
            toast.error('Facture introuvable');
            navigate('/factures');
        } finally {
            setLoading(false);
        }
    };

    const handleAddEncaissement = async (data) => {
        try {
            // Convertir les types
            const payload = {
                ...data,
                montant: Number(data.montant),
                chequeId: data.chequeId ? Number(data.chequeId) : null,
            };
            // Si chèque, ajouter le nouveau chèque inline
            if (data.modePaiement === 'CHEQUE' && data.chequeNumero) {
                payload.nouveauCheque = {
                    numero: data.chequeNumero,
                    banque: data.chequeBanque || null,
                    emetteur: data.chequeEmetteur || null,
                    montant: Number(data.montant),
                    dateReception: data.dateEncaissement,
                };
                delete payload.chequeId;
            }
            delete payload.chequeNumero;
            delete payload.chequeBanque;
            delete payload.chequeEmetteur;

            await addEncaissement(id, payload);
            toast.success('Encaissement enregistré');
            setShowPayModal(false);
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur');
        }
    };

    const handleChangeStatus = async (statut) => {
        try {
            await changeFactureStatus(id, { statut });
            toast.success('Statut mis à jour');
            setShowStatusModal(false);
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur');
        }
    };

    if (loading) {
        return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin" /></div>;
    }
    if (!facture) return null;

    const tabs = [
        { key: 'infos', label: 'Détails' },
        { key: 'encaissements', label: `Encaissements (${encaissements.length})` },
    ];

    const isPaid = facture.statut === 'PAYEE';

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <button onClick={() => navigate('/factures')} className="text-sm text-gray-400 hover:text-indigo-400 transition-colors mb-1 inline-flex items-center gap-1">← Retour aux factures</button>
                    <h1 className="text-2xl font-bold text-white">Facture {facture.numero}</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <StatusBadge statut={facture.statut} />
                        <span className="text-sm text-gray-400">{facture.clientRaisonSociale}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowStatusModal(true)} className="px-3 py-2 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                        Changer statut
                    </button>
                    {!isPaid && (
                        <button onClick={() => setShowPayModal(true)} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                            + Encaisser
                        </button>
                    )}
                </div>
            </div>

            {/* Montants cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Montant HT', value: formatDH(facture.montantHt), color: 'text-white' },
                    { label: `TVA (${facture.tva}%)`, value: formatDH(facture.montantTtc - facture.montantHt), color: 'text-gray-300' },
                    { label: 'Montant TTC', value: formatDH(facture.montantTtc), color: 'text-white' },
                    { label: 'Reste à payer', value: formatDH(facture.resteAPayer), color: facture.resteAPayer > 0 ? 'text-amber-400' : 'text-emerald-400' },
                ].map((c) => (
                    <div key={c.label} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">{c.label}</p>
                        <p className={`text-lg font-bold mt-1 ${c.color}`}>{c.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-700 mb-6">
                <nav className="flex gap-6">
                    {tabs.map((tab) => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === tab.key ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-300'
                                }`}>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab: Infos */}
            {activeTab === 'infos' && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {[
                            ['N° Facture', facture.numero],
                            ['Action', facture.actionReference + ' — ' + facture.actionTitre],
                            ['Client', facture.clientRaisonSociale],
                            ['Date facture', facture.dateFacture],
                            ['Date échéance', facture.dateEcheance],
                            ['Montant HT', formatDH(facture.montantHt)],
                            ['TVA', facture.tva + ' %'],
                            ['Montant TTC', formatDH(facture.montantTtc)],
                            ['Total encaissé', formatDH(facture.totalEncaisse)],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
                                <dd className="mt-1 text-sm text-white">{value || '—'}</dd>
                            </div>
                        ))}
                    </div>
                    {facture.notes && (
                        <div className="mt-6 pt-5 border-t border-gray-700">
                            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Notes</dt>
                            <dd className="text-sm text-gray-300">{facture.notes}</dd>
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Encaissements */}
            {activeTab === 'encaissements' && (
                <div>
                    {encaissements.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <div className="text-4xl mb-3">💰</div>
                            Aucun encaissement enregistré
                        </div>
                    ) : (
                        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b border-gray-700">
                                    {['Date', 'Montant', 'Mode', 'Référence', 'Chèque', 'Notes'].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/50">
                                {encaissements.map((e) => (
                                    <tr key={e.id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="px-4 py-3 text-sm text-white">{e.dateEncaissement}</td>
                                        <td className="px-4 py-3 text-sm text-emerald-400 font-medium">{formatDH(e.montant)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-300">{e.modePaiementLabel}</td>
                                        <td className="px-4 py-3 text-sm text-gray-300">{e.referencePaiement || '—'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-300">{e.chequeNumero || '—'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-400 max-w-[200px] truncate">{e.notes || '—'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Modal: Encaisser */}
            {showPayModal && (
                <EncaissementModal
                    resteAPayer={facture.resteAPayer}
                    onSubmit={handleAddEncaissement}
                    onClose={() => setShowPayModal(false)}
                />
            )}

            {/* Modal: Changer statut */}
            {showStatusModal && (
                <StatusModal
                    current={facture.statut}
                    onSubmit={handleChangeStatus}
                    onClose={() => setShowStatusModal(false)}
                />
            )}
        </div>
    );
}

// ==================== ENCAISSEMENT MODAL ====================

function EncaissementModal({ resteAPayer, onSubmit, onClose }) {
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            montant: resteAPayer,
            dateEncaissement: new Date().toISOString().split('T')[0],
            modePaiement: 'VIREMENT',
        },
    });
    const mode = watch('modePaiement');
    const inputClass = "w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Enregistrer un encaissement</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
                    <div className="flex items-start gap-2 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-sm text-indigo-300">
                        <span>ℹ️</span>
                        <span>Reste à payer : <strong>{Number(resteAPayer).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH</strong></span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Montant (DH) <span className="text-red-400">*</span></label>
                            <input type="number" step="0.01" {...register('montant', { required: 'Obligatoire', min: { value: 0.01, message: 'Min 0.01' } })} className={inputClass} />
                            {errors.montant && <p className="text-xs text-red-400 mt-1">{errors.montant.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Date <span className="text-red-400">*</span></label>
                            <input type="date" {...register('dateEncaissement', { required: 'Obligatoire' })} className={inputClass} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Mode de paiement <span className="text-red-400">*</span></label>
                        <select {...register('modePaiement')} className={inputClass}>
                            {MODE_PAIEMENT_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Chèque fields */}
                    {mode === 'CHEQUE' && (
                        <div className="space-y-3 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Informations du chèque</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">N° chèque <span className="text-red-400">*</span></label>
                                    <input {...register('chequeNumero', { required: mode === 'CHEQUE' ? 'Obligatoire' : false })} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Banque</label>
                                    <input {...register('chequeBanque')} className={inputClass} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Émetteur</label>
                                <input {...register('chequeEmetteur')} className={inputClass} />
                            </div>
                        </div>
                    )}

                    {mode !== 'CHEQUE' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Référence paiement</label>
                            <input {...register('referencePaiement')} className={inputClass} placeholder="N° virement, etc." />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                        <textarea {...register('notes')} rows={2} className={inputClass} />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Annuler</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                            {isSubmitting ? 'En cours...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ==================== STATUS MODAL ====================

function StatusModal({ current, onSubmit, onClose }) {
    const [selected, setSelected] = useState('');
    const options = FACTURE_STATUS_OPTIONS.filter((o) => o.value && o.value !== current);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-sm w-full mx-4">
                <div className="flex items-center justify-between p-5 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Changer le statut</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <div className="p-5 space-y-4">
                    <p className="text-sm text-gray-400">Statut actuel : <span className="text-white font-medium">{FACTURE_STATUS[current]?.label}</span></p>
                    <select
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                        className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="">— Choisir —</option>
                        {options.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                    <div className="flex justify-end gap-3 pt-3 border-t border-gray-700">
                        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Annuler</button>
                        <button
                            onClick={() => selected && onSubmit(selected)}
                            disabled={!selected}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-40"
                        >
                            Confirmer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}