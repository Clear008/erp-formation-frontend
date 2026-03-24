// src/pages/planning/PlanningPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getPlanningSessions } from '../../api/sessionApi.js';
import { getFormateurs } from '../../api/formateurApi.js';
import { SESSION_STATUS } from '../../utils/sessionConstants.js';

export default function PlanningPage() {
    const [sessions, setSessions] = useState([]);
    const [formateurs, setFormateurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Default: current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const [dateFrom, setDateFrom] = useState(firstDay);
    const [dateTo, setDateTo] = useState(lastDay);
    const [formateurId, setFormateurId] = useState('');

    useEffect(() => {
        getFormateurs({ actif: true }).then(({ data }) => setFormateurs(data)).catch(() => {});
    }, []);

    useEffect(() => {
        loadPlanning();
    }, [dateFrom, dateTo, formateurId]);

    const loadPlanning = async () => {
        try {
            setLoading(true);
            const params = {};
            if (dateFrom) params.dateFrom = dateFrom;
            if (dateTo) params.dateTo = dateTo;
            if (formateurId) params.formateurId = formateurId;
            const { data } = await getPlanningSessions(params);
            setSessions(data);
        } catch {
            toast.error('Erreur chargement planning');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none";

    // Group sessions by date
    const grouped = sessions.reduce((acc, s) => {
        const date = s.dateSession;
        if (!acc[date]) acc[date] = [];
        acc[date].push(s);
        return acc;
    }, {});

    const sortedDates = Object.keys(grouped).sort();

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Planning des sessions</h1>
                    <p className="text-sm text-gray-400 mt-1">{sessions.length} session(s) sur la période</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Du</label>
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputClass} />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Au</label>
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputClass} />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Formateur</label>
                    <select value={formateurId} onChange={(e) => setFormateurId(e.target.value)} className={inputClass}>
                        <option value="">Tous</option>
                        {formateurs.map((f) => (
                            <option key={f.id} value={f.id}>{f.prenom} {f.nom}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
                </div>
            ) : sessions.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-5xl mb-4">📅</div>
                    <p className="text-lg font-medium text-white">Aucune session sur cette période</p>
                    <p className="text-sm text-gray-400 mt-1">Ajustez les filtres ou créez des sessions depuis les actions</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedDates.map((date) => {
                        const daySessions = grouped[date];
                        const dateObj = new Date(date + 'T00:00:00');
                        const dayLabel = dateObj.toLocaleDateString('fr-FR', {
                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                        });

                        return (
                            <div key={date} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                                <div className="px-5 py-3 border-b border-gray-700 bg-gray-800/80">
                                    <h3 className="text-sm font-semibold text-white capitalize">{dayLabel}</h3>
                                    <p className="text-xs text-gray-500">{daySessions.length} session(s)</p>
                                </div>
                                <div className="divide-y divide-gray-700/50">
                                    {daySessions.map((s) => {
                                        const st = SESSION_STATUS[s.statut] || { label: s.statut, color: 'bg-gray-700 text-gray-300' };
                                        return (
                                            <div key={s.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-700/30 transition-colors">
                                                <div className="flex items-center gap-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
                            {st.label}
                          </span>
                                                    <div>
                                                        <p
                                                            className="text-sm text-white cursor-pointer hover:text-indigo-400 transition-colors"
                                                            onClick={() => navigate(`/actions/${s.actionId}`)}
                                                        >
                                                            <span className="font-mono text-indigo-400">{s.actionReference}</span>
                                                            <span className="text-gray-300 ml-2">{s.actionTitre}</span>
                                                        </p>
                                                        {s.formateurNom && (
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                Formateur : <span className="text-gray-400">{s.formateurPrenom} {s.formateurNom}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {s.tarifJournalier && (
                                                        <p className="text-sm text-white font-medium">{Number(s.tarifJournalier).toLocaleString('fr-FR')} DH</p>
                                                    )}
                                                    {s.observations && (
                                                        <p className="text-xs text-gray-500 max-w-[200px] truncate">{s.observations}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}