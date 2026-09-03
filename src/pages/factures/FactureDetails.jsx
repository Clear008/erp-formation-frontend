// src/pages/factures/FactureDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import FactureEncaissementsTab from './components/FactureEncaissementsTab';
import { getFacture, changeFactureStatus, getEncaissements } from '../../api/factureApi';
import { FACTURE_STATUS } from '../../utils/financeConstants';
import DocumentsTab from '../documents/components/DocumentsTab';
import { useAuth } from '../../auth/AuthContext';


function StatusBadge({ statut }) {
    const config = FACTURE_STATUS[statut] || { label: statut, color: 'bg-gray-700 text-gray-300' };
    return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
}

function formatDH(val) {
    if (!val && val !== 0) return '—';
    return Number(val).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' DH';
}

const MANUAL_STATUS_TRANSITIONS = {
    BROUILLON: [{ value: 'EMISE', label: 'Émise' }],
    EMISE: [{ value: 'ENVOYEE', label: 'Envoyée' }],
};

export default function FactureDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const hasStatusPermission = ['DA', 'DG', 'ADMIN'].includes(user?.role);
    const [facture, setFacture] = useState(null);
    const [encaissements, setEncaissements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('infos');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [openEncaissementModal, setOpenEncaissementModal] = useState(false);

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
        { key: 'documents', label: 'Documents' },
    ];

    const isPaid = facture.statut === 'PAYEE';
    const canEncaisser = !isPaid && facture.statut !== 'BROUILLON';
    const manualStatusOptions = MANUAL_STATUS_TRANSITIONS[facture.statut] || [];
    const canChangeStatus = hasStatusPermission && manualStatusOptions.length > 0;

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
                    {facture.statut === 'BROUILLON' && (
                        <button
                            onClick={() => navigate(`/factures/${facture.id}/modifier`)}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            ✏️ Modifier
                        </button>
                    )}
                    {canChangeStatus && (
                        <button onClick={() => setShowStatusModal(true)} className="px-3 py-2 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                            Changer statut
                        </button>
                    )}
                    {canEncaisser && activeTab !== 'encaissements' && (
                        <button
                            onClick={() => {
                                setActiveTab('encaissements');
                                setOpenEncaissementModal(true);
                            }}
                            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            + Encaisser
                        </button>
                    )}
                </div>
            </div>

            {/* Montants cards */}
            {activeTab !== 'encaissements' && (
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
            )}

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
                <FactureEncaissementsTab
                    facture={facture}
                    onFactureUpdated={loadData}
                    autoOpenModal={openEncaissementModal}
                    onModalOpened={() => setOpenEncaissementModal(false)}
                />
            )}

            {/* Tab: Documents */}
            {activeTab === 'documents' && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <DocumentsTab entityType="FACTURE" entityId={facture.id} />
                </div>
            )}


            {/* Modal: Changer statut */}
            {showStatusModal && (
                <StatusModal
                    current={facture.statut}
                    options={manualStatusOptions}
                    onSubmit={handleChangeStatus}
                    onClose={() => setShowStatusModal(false)}
                />
            )}
        </div>
    );
}


// ==================== STATUS MODAL ====================

function StatusModal({ current, options, onSubmit, onClose }) {
    const [selected, setSelected] = useState('');

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
