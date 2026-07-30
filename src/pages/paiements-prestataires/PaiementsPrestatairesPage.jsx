// src/pages/paiements-prestataires/PaiementsPrestatairesPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getPaiements } from '../../api/paiementPrestataireApi';
import { PAIEMENT_STATUT, PAIEMENT_STATUT_OPTIONS } from '../../utils/paiementPrestataireConstants';

function formatDH(val) {
    if (!val && val !== 0) return '—';
    return Number(val).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' DH';
}

export default function PaiementsPrestatairesPage() {
    const navigate = useNavigate();
    const [paiements, setPaiements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statut, setStatut] = useState('');

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (statut) params.statut = statut;
            const { data } = await getPaiements(params);
            setPaiements(data);
        } catch { toast.error('Erreur chargement'); }
        finally { setLoading(false); }
    }, [search, statut]);

    useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

    const selectClass = "px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none";

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Paiements prestataires</h1>
                    <p className="text-sm text-gray-400 mt-1">{paiements.length} paiement(s)</p>
                </div>
                <button onClick={() => navigate('/paiements-prestataires/nouveau')}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    + Nouveau paiement
                </button>
            </div>

            <div className="flex flex-wrap items-end gap-3 mb-6">
                <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)}
                       className="w-64 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none" />
                <select value={statut} onChange={(e) => setStatut(e.target.value)} className={selectClass}>
                    {PAIEMENT_STATUT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin" /></div>
            ) : paiements.length === 0 ? (
                <div className="text-center py-16"><div className="text-5xl mb-4">💸</div><p className="text-gray-400">Aucun paiement trouvé</p></div>
            ) : (
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-700">
                            {['Référence', 'Prestataire', 'Objet', 'Montant TTC', 'Date prévue', 'Mode', 'Statut', ''].map((h) => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                        {paiements.map((p) => {
                            const sStyle = PAIEMENT_STATUT[p.statut] || {};
                            return (
                                <tr key={p.id} onClick={() => navigate(`/paiements-prestataires/${p.id}`)} className="hover:bg-gray-700/30 cursor-pointer transition-colors">
                                    <td className="px-4 py-3 text-sm font-mono text-indigo-400">{p.reference}</td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-white font-medium">{p.prestataireDisplayName}</p>
                                        <p className="text-xs text-gray-500">{p.prestataireCode}</p>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-300 max-w-[200px] truncate">{p.objet}</td>
                                    <td className="px-4 py-3 text-sm text-white font-medium">{formatDH(p.montantTtc)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-300">{p.datePrevue || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-300">{p.modePaiementLabel || '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${sStyle.color || ''}`}>{p.statutLabel}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right"><span className="text-gray-500 text-xs">→</span></td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}