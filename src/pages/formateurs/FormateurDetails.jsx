// src/pages/formateurs/FormateurDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getFormateur, toggleFormateurStatus, getFormateurSessions } from '../../api/formateurApi';
import { SESSION_STATUS } from '../../utils/sessionConstants';

export default function FormateurDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formateur, setFormateur] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('infos');

    useEffect(() => { loadData(); }, [id]);

    const loadData = async () => {
        try {
            const [fRes, sRes] = await Promise.all([
                getFormateur(id),
                getFormateurSessions(id),
            ]);
            setFormateur(fRes.data);
            setSessions(sRes.data);
        } catch {
            toast.error('Formateur introuvable');
            navigate('/formateurs');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async () => {
        try {
            const { data } = await toggleFormateurStatus(id, !formateur.actif);
            setFormateur(data);
            toast.success(data.actif ? 'Formateur activé' : 'Formateur désactivé');
        } catch {
            toast.error('Erreur');
        }
    };

    if (loading) {
        return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin" /></div>;
    }
    if (!formateur) return null;

    const tabs = [
        { key: 'infos', label: 'Informations' },
        { key: 'sessions', label: `Interventions (${sessions.length})` },
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <button onClick={() => navigate('/formateurs')} className="text-sm text-gray-400 hover:text-indigo-400 transition-colors mb-1 inline-flex items-center gap-1">
                        ← Retour aux formateurs
                    </button>
                    <h1 className="text-2xl font-bold text-white">{formateur.prenom} {formateur.nom}</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-400 font-mono">{formateur.code}</span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            formateur.actif
                                ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
                        }`}>
              {formateur.actif ? 'Actif' : 'Inactif'}
            </span>
                    </div>
                </div>
                <button onClick={handleToggle} className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    formateur.actif
                        ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                        : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                }`}>
                    {formateur.actif ? 'Désactiver' : 'Activer'}
                </button>
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
                    <div className="grid grid-cols-2 gap-6">
                        {[
                            ['Nom', formateur.nom],
                            ['Prénom', formateur.prenom],
                            ['Email', formateur.email],
                            ['Téléphone', formateur.telephone],
                            ['Spécialité', formateur.specialite],
                            ['Tarif journalier', formateur.tarifJournalier ? `${Number(formateur.tarifJournalier).toLocaleString('fr-FR')} DH` : null],
                            ['Frais déplacement', formateur.fraisDeplacement ? `${Number(formateur.fraisDeplacement).toLocaleString('fr-FR')} DH` : null],
                            ['Nombre de sessions', formateur.sessionCount],
                            ['Créé le', formateur.createdAt ? new Date(formateur.createdAt).toLocaleDateString('fr-FR') : null],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
                                <dd className="mt-1 text-sm text-white">{value ?? '—'}</dd>
                            </div>
                        ))}
                    </div>
                    {formateur.notes && (
                        <div className="mt-6 pt-5 border-t border-gray-700">
                            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Notes</dt>
                            <dd className="text-sm text-gray-300 whitespace-pre-wrap">{formateur.notes}</dd>
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Sessions / Interventions */}
            {activeTab === 'sessions' && (
                <div>
                    {sessions.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">Aucune intervention enregistrée</div>
                    ) : (
                        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b border-gray-700">
                                    {['Date', 'Action', 'Statut', 'Tarif', 'Frais', 'Observations'].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/50">
                                {sessions.map((s) => {
                                    const st = SESSION_STATUS[s.statut] || { label: s.statut, color: 'bg-gray-700 text-gray-300' };
                                    return (
                                        <tr key={s.id} className="hover:bg-gray-700/30 transition-colors">
                                            <td className="px-4 py-3 text-sm text-white font-medium">{s.dateSession}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className="text-indigo-400 font-mono">{s.actionReference}</span>
                                                <span className="text-gray-400 ml-2">{s.actionTitre}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-white">
                                                {s.tarifJournalier ? `${Number(s.tarifJournalier).toLocaleString('fr-FR')} DH` : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-300">
                                                {s.fraisDeplacement ? `${Number(s.fraisDeplacement).toLocaleString('fr-FR')} DH` : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-400 max-w-[200px] truncate">{s.observations || '—'}</td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}