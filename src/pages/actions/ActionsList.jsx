// src/pages/actions/ActionsList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getActions } from '../../api/actionApi';
import { ACTION_STATUS } from '../../utils/constants';

const STATUS_OPTIONS = [
    { value: '', label: 'Tous les statuts' },
    ...Object.entries(ACTION_STATUS).map(([value, { label }]) => ({ value, label })),
];

function StatusBadge({ statut }) {
    const config = ACTION_STATUS[statut] || { label: statut, color: 'bg-gray-700 text-gray-300' };
    return (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
    );
}

export default function ActionsList() {
    const [actions, setActions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadActions();
    }, [statusFilter]);

    const loadActions = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter) params.statut = statusFilter;
            const { data } = await getActions(params);
            setActions(data);
        } catch {
            toast.error('Erreur lors du chargement des actions');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Actions de formation</h1>
                    <p className="text-sm text-gray-400 mt-1">{actions.length} action(s)</p>
                </div>
                <button
                    onClick={() => navigate('/actions/new')}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    + Nouvelle action
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-5">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                    {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
                </div>
            ) : actions.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-5xl mb-4">🎓</div>
                    <p className="text-lg font-medium text-white">Aucune action de formation</p>
                    <p className="text-sm text-gray-400 mt-1 mb-5">Créez votre première action pour commencer</p>
                    <button
                        onClick={() => navigate('/actions/new')}
                        className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Créer une action
                    </button>
                </div>
            ) : (
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-700">
                            {['Référence', 'Titre', 'Client', 'Statut', 'Type', 'Dates', 'Montant', 'Checklist'].map((h) => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                        {actions.map((action) => (
                            <tr
                                key={action.id}
                                onClick={() => navigate(`/actions/${action.id}`)}
                                className="hover:bg-gray-700/50 cursor-pointer transition-colors"
                            >
                                <td className="px-4 py-3 text-sm font-mono text-indigo-400 font-medium">{action.reference}</td>
                                <td className="px-4 py-3 text-sm font-medium text-white max-w-[200px] truncate">{action.titre}</td>
                                <td className="px-4 py-3 text-sm text-gray-300">{action.clientRaisonSociale || '—'}</td>
                                <td className="px-4 py-3"><StatusBadge statut={action.statut} /></td>
                                <td className="px-4 py-3 text-sm text-gray-300">{action.type || '—'}</td>
                                <td className="px-4 py-3 text-sm text-gray-300">
                                    {action.dateDebut || '—'}
                                </td>
                                <td className="px-4 py-3 text-sm text-white font-medium">
                                    {action.montantEstime
                                        ? `${Number(action.montantEstime).toLocaleString('fr-FR')} DH`
                                        : '—'}
                                </td>
                                <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${
                        action.checklistDone === action.checklistTotal
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                    }`}>
                      {action.checklistDone}/{action.checklistTotal}
                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}