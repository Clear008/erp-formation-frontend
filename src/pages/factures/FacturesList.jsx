// src/pages/factures/FacturesList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast';
import { getFactures } from '../../api/factureApi';
import { FACTURE_STATUS, FACTURE_STATUS_OPTIONS } from '../../utils/financeConstants';

function StatusBadge({ statut }) {
    const config = FACTURE_STATUS[statut] || { label: statut, color: 'bg-gray-700 text-gray-300' };
    return (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
    );
}

function formatDH(val) {
    if (!val && val !== 0) return '—';
    return Number(val).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' DH';
}

export default function FacturesList() {
    const [factures, setFactures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const navigate = useNavigate();

    useEffect(() => { load(); }, [statusFilter]);

    const load = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter) params.statut = statusFilter;
            const { data } = await getFactures(params);
            setFactures(data);
        } catch {
            toast.error('Erreur chargement factures');
        } finally {
            setLoading(false);
        }
    };

    // Stats rapides
    const totalTtc = factures.reduce((s, f) => s + Number(f.montantTtc || 0), 0);
    const totalEncaisse = factures.reduce((s, f) => s + Number(f.totalEncaisse || 0), 0);
    const totalReste = factures.reduce((s, f) => s + Number(f.resteAPayer || 0), 0);

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Factures</h1>
                    <p className="text-sm text-gray-400 mt-1">{factures.length} facture(s)</p>
                </div>

                <Link
                    to="/factures/nouvelle"
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition"
                >
                    + Créer une facture
                </Link>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Total TTC', value: formatDH(totalTtc), color: 'text-white' },
                    { label: 'Total encaissé', value: formatDH(totalEncaisse), color: 'text-emerald-400' },
                    { label: 'Reste à payer', value: formatDH(totalReste), color: 'text-amber-400' },
                ].map((card) => (
                    <div key={card.label} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">{card.label}</p>
                        <p className={`text-xl font-bold mt-1 ${card.color}`}>{card.value}</p>
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
                    {FACTURE_STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
                </div>
            ) : factures.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-5xl mb-4">📄</div>
                    <p className="text-lg font-medium text-white">Aucune facture</p>
                    <p className="text-sm text-gray-400 mt-1">Les factures sont générées depuis les actions de formation réalisées</p>
                </div>
            ) : (
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-700">
                            {['N° Facture', 'Action', 'Client', 'Montant TTC', 'Encaissé', 'Reste', 'Date', 'Échéance', 'Statut'].map((h) => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                        {factures.map((f) => (
                            <tr
                                key={f.id}
                                onClick={() => navigate(`/factures/${f.id}`)}
                                className="hover:bg-gray-700/50 cursor-pointer transition-colors"
                            >
                                <td className="px-4 py-3 text-sm font-mono text-indigo-400 font-medium">{f.numero}</td>
                                <td className="px-4 py-3 text-sm text-gray-300">{f.actionReference}</td>
                                <td className="px-4 py-3 text-sm text-gray-300">{f.clientRaisonSociale}</td>
                                <td className="px-4 py-3 text-sm text-white font-medium">{formatDH(f.montantTtc)}</td>
                                <td className="px-4 py-3 text-sm text-emerald-400">{formatDH(f.totalEncaisse)}</td>
                                <td className="px-4 py-3 text-sm text-amber-400">{formatDH(f.resteAPayer)}</td>
                                <td className="px-4 py-3 text-sm text-gray-300">{f.dateFacture}</td>
                                <td className="px-4 py-3 text-sm text-gray-300">{f.dateEcheance || '—'}</td>
                                <td className="px-4 py-3"><StatusBadge statut={f.statut} /></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}