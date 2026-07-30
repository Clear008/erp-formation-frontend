// src/pages/paiements-prestataires/PaiementPrestataireDetailsPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/AuthContext';
import { getPaiement, soumettrePaiement, validerPaiement, rejeterPaiement, payerPaiement, annulerPaiement, getHistorique } from '../../api/paiementPrestataireApi';
import { PAIEMENT_STATUT } from '../../utils/paiementPrestataireConstants';
import { MODE_PAIEMENT_OPTIONS } from '../../utils/financeConstants';
import DocumentsTab from '../documents/components/DocumentsTab';

function StatusBadge({ statut }) {
    const config = PAIEMENT_STATUT[statut] || { label: statut, color: 'bg-gray-700 text-gray-300' };
    return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
}

function formatDH(val) {
    if (!val && val !== 0) return '—';
    return Number(val).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' DH';
}

const WORKFLOW_STEPS = [
    { key: 'BROUILLON', label: 'Brouillon' },
    { key: 'A_VALIDER', label: 'À valider' },
    { key: 'VALIDE', label: 'Validé' },
    { key: 'PAYE', label: 'Payé' },
];

export default function PaiementPrestataireDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [paiement, setPaiement] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('infos');
    const [showPayModal, setShowPayModal] = useState(false);

    const isDA = ['DA', 'DG', 'ADMIN'].includes(user?.role);

    const loadData = async () => {
        try {
            const [pRes, hRes] = await Promise.all([getPaiement(id), getHistorique(id)]);
            setPaiement(pRes.data);
            setHistory(hRes.data);
        } catch { toast.error('Paiement introuvable'); navigate('/paiements-prestataires'); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, [id]);

    // ─── Actions workflow ───
    const handleSoumettre = async () => {
        try { await soumettrePaiement(id); toast.success('Paiement soumis pour validation'); loadData(); }
        catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    };

    const handleValider = async () => {
        try { await validerPaiement(id); toast.success('Paiement validé'); loadData(); }
        catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    };

    const handleRejeter = async () => {
        const motif = prompt('Motif du rejet :');
        if (!motif) return;
        try { await rejeterPaiement(id, { motif }); toast.success('Paiement rejeté'); loadData(); }
        catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    };

    const handlePayer = async (modePaiement, referencePaiement) => {
        try {
            await payerPaiement(id, { modePaiement, referencePaiement, datePaiement: new Date().toISOString().split('T')[0] });
            toast.success('Paiement exécuté !');
            setShowPayModal(false);
            loadData();
        } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    };

    const handleAnnuler = async () => {
        const motif = prompt("Motif d'annulation :");
        if (!motif) return;
        try { await annulerPaiement(id, { motif }); toast.success('Paiement annulé'); loadData(); }
        catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    };

    if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin" /></div>;
    if (!paiement) return null;

    const currentStep = WORKFLOW_STEPS.findIndex((s) => s.key === paiement.statut);
    const isFinal = ['PAYE', 'ANNULE', 'REJETE'].includes(paiement.statut);

    const TABS = [
        { key: 'infos', label: 'Détails' },
        { key: 'historique', label: `Historique (${history.length})` },
        { key: 'documents', label: 'Justificatifs' },
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <button onClick={() => navigate('/paiements-prestataires')} className="text-sm text-gray-400 hover:text-indigo-400 mb-1 inline-flex items-center gap-1">← Retour</button>
                    <h1 className="text-2xl font-bold text-white">Paiement {paiement.reference}</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <StatusBadge statut={paiement.statut} />
                        <span className="text-sm text-gray-400">{paiement.prestataireDisplayName}</span>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {paiement.statut === 'BROUILLON' && (
                        <>
                            <button onClick={() => navigate(`/paiements-prestataires/${id}`)} className="px-3 py-2 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">✏️ Modifier</button>
                            <button onClick={handleSoumettre} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">📤 Soumettre</button>
                        </>
                    )}
                    {paiement.statut === 'A_VALIDER' && isDA && (
                        <>
                            <button onClick={handleRejeter} className="px-3 py-2 text-sm text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 border border-red-500/20">❌ Rejeter</button>
                            <button onClick={handleValider} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">✅ Valider</button>
                        </>
                    )}
                    {paiement.statut === 'VALIDE' && isDA && (
                        <button onClick={() => setShowPayModal(true)} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">💰 Marquer payé</button>
                    )}
                    {!isFinal && isDA && (
                        <button onClick={handleAnnuler} className="px-3 py-2 text-sm text-gray-400 bg-gray-700 rounded-lg hover:bg-gray-600">🚫 Annuler</button>
                    )}
                </div>
            </div>

            {/* Workflow progress */}
            {!['ANNULE', 'REJETE'].includes(paiement.statut) && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                        {WORKFLOW_STEPS.map((ws, i) => {
                            const isActive = ws.key === paiement.statut;
                            const isPast = i < currentStep;
                            return (
                                <div key={ws.key} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                                            isActive ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20' :
                                                isPast ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-500'
                                        }`}>{isPast ? '✓' : i + 1}</div>
                                        <span className={`text-[11px] mt-1.5 ${isActive ? 'font-bold text-indigo-400' : 'text-gray-500'}`}>{ws.label}</span>
                                    </div>
                                    {i < WORKFLOW_STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${isPast ? 'bg-emerald-500' : 'bg-gray-700'}`} />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Rejet/Annulation alert */}
            {paiement.statut === 'REJETE' && paiement.motifRejet && (
                <div className="flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300 mb-6">
                    <span>❌</span><div><p className="font-medium">Rejeté</p><p className="text-xs mt-0.5">{paiement.motifRejet} — par {paiement.rejeteParUsername}</p></div>
                </div>
            )}
            {paiement.statut === 'ANNULE' && paiement.motifAnnulation && (
                <div className="flex items-start gap-2.5 p-3 bg-gray-500/10 border border-gray-500/20 rounded-lg text-sm text-gray-300 mb-6">
                    <span>🚫</span><div><p className="font-medium">Annulé</p><p className="text-xs mt-0.5">{paiement.motifAnnulation}</p></div>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-700 mb-6">
                <nav className="flex gap-6">
                    {TABS.map((tab) => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === tab.key ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-300'
                                }`}>{tab.label}</button>
                    ))}
                </nav>
            </div>

            {/* TAB: Infos */}
            {activeTab === 'infos' && (
                <div className="space-y-6">
                    {/* Montants */}
                    <div className="grid grid-cols-4 gap-4">
                        {[
                            { label: 'Montant HT', value: formatDH(paiement.montantHt), color: 'text-white' },
                            { label: `TVA (${paiement.tauxTva}%)`, value: formatDH(paiement.montantTva), color: 'text-gray-300' },
                            { label: 'Montant TTC', value: formatDH(paiement.montantTtc), color: 'text-white' },
                            { label: 'Date prévue', value: paiement.datePrevue || '—', color: 'text-gray-300' },
                        ].map((c) => (
                            <div key={c.label} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">{c.label}</p>
                                <p className={`text-lg font-bold mt-1 ${c.color}`}>{c.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Détails */}
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {[
                                ['Référence', paiement.reference],
                                ['Prestataire', `${paiement.prestataireDisplayName} (${paiement.prestataireCode})`],
                                ['Catégorie', paiement.prestataireCategorie],
                                ['Objet', paiement.objet],
                                ['Mode paiement', paiement.modePaiementLabel],
                                ['Réf. paiement', paiement.referencePaiement],
                                ['Action', paiement.actionReference ? `${paiement.actionReference} — ${paiement.actionTitre}` : null],
                                ['Formateur', paiement.formateurNom],
                                ['Date paiement', paiement.datePaiement],
                                ['Soumis par', paiement.soumisPar],
                                ['Validé par', paiement.valideParUsername],
                                ['Payé par', paiement.payeParUsername],
                                ['Créé par', paiement.createdByUsername],
                            ].map(([label, value]) => (
                                <div key={label}>
                                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
                                    <dd className="mt-1 text-sm text-white">{value || '—'}</dd>
                                </div>
                            ))}
                        </div>
                        {paiement.notes && (
                            <div className="mt-6 pt-5 border-t border-gray-700">
                                <dt className="text-xs font-medium text-gray-500 uppercase mb-2">Notes</dt>
                                <dd className="text-sm text-gray-300 whitespace-pre-wrap">{paiement.notes}</dd>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB: Historique */}
            {activeTab === 'historique' && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h3 className="font-semibold text-white mb-5">Historique du workflow</h3>
                    {history.length === 0 ? <p className="text-sm text-gray-400">Aucun historique</p> : (
                        <div className="space-y-0">
                            {history.map((h, i) => (
                                <div key={h.id} className="flex items-start gap-4 pb-5 relative">
                                    {i < history.length - 1 && <div className="absolute left-[7px] top-6 bottom-0 w-px bg-gray-700" />}
                                    <div className="w-4 h-4 rounded-full bg-indigo-500/20 ring-2 ring-indigo-500 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {h.ancienStatutLabel && <><span className="text-sm text-gray-500">{h.ancienStatutLabel}</span><span className="text-gray-600">→</span></>}
                                            <StatusBadge statut={h.nouveauStatut} />
                                        </div>
                                        {h.commentaire && <p className="text-sm text-gray-400 mt-1">« {h.commentaire} »</p>}
                                        <p className="text-xs text-gray-500 mt-1.5">par <span className="text-gray-400">{h.effectueParUsername}</span> · {new Date(h.effectueLe).toLocaleString('fr-FR')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB: Documents */}
            {activeTab === 'documents' && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <DocumentsTab entityType="PAIEMENT_PRESTATAIRE" entityId={paiement.id} />
                </div>
            )}

            {/* PAY MODAL */}
            {showPayModal && <PayModal onSubmit={handlePayer} onClose={() => setShowPayModal(false)} />}
        </div>
    );
}

// ==================== PAY MODAL ====================
function PayModal({ onSubmit, onClose }) {
    const [mode, setMode] = useState('VIREMENT');
    const [ref, setRef] = useState('');
    const inputClass = "w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-sm w-full mx-4">
                <div className="flex items-center justify-between p-5 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Marquer comme payé</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Mode de paiement</label>
                        <select value={mode} onChange={(e) => setMode(e.target.value)} className={inputClass}>
                            {MODE_PAIEMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Référence paiement</label>
                        <input value={ref} onChange={(e) => setRef(e.target.value)} className={inputClass} placeholder="N° virement, chèque..." />
                    </div>
                    <div className="flex justify-end gap-3 pt-3 border-t border-gray-700">
                        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Annuler</button>
                        <button onClick={() => onSubmit(mode, ref)} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">💰 Confirmer</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
