import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    getAlertes,
    getAlerteCount,
    traiterAlerte,
    traiterToutesAlertes,
} from '../../api/alerteApi';

const MODULES = [
    ['ACTIONS', 'Actions de formation'],
    ['SESSIONS', 'Sessions'],
    ['FACTURATION', 'Facturation'],
    ['CHEQUES', 'Chèques'],
    ['PAIEMENTS', 'Paiements prestataires'],
    ['PRESTATAIRES', 'Prestataires'],
];

const priorityStyles = {
    HAUTE: 'border-red-500/30 bg-red-500/5 text-red-400',
    MOYENNE: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
    BASSE: 'border-slate-600 bg-slate-800/50 text-slate-400',
};

const moduleIcons = {
    ACTIONS: '🎓', SESSIONS: '📅', FACTURATION: '📄',
    CHEQUES: '🏦', PAIEMENTS: '💳', PRESTATAIRES: '🏢',
};

export default function AlertesPage() {
    const navigate = useNavigate();
    const [alertes, setAlertes] = useState([]);
    const [stats, setStats] = useState({ nonTraitees: 0, prioriteHaute: 0, prioriteMoyenne: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [module, setModule] = useState('');
    const [priorite, setPriorite] = useState('');
    const [statut, setStatut] = useState('false');

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (search.trim()) params.search = search.trim();
            if (module) params.module = module;
            if (priorite) params.priorite = priorite;
            if (statut !== '') params.traitee = statut;
            const [listResult, countResult] = await Promise.all([
                getAlertes(params),
                getAlerteCount(),
            ]);
            setAlertes(listResult.data || []);
            setStats(countResult.data || {});
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors du chargement des alertes');
        } finally {
            setLoading(false);
        }
    }, [search, module, priorite, statut]);

    useEffect(() => {
        const timer = setTimeout(load, 250);
        return () => clearTimeout(timer);
    }, [load]);

    const markOne = async (cle) => {
        try {
            await traiterAlerte(cle);
            window.dispatchEvent(new Event('alerts-updated'));
            await load();
            toast.success('Alerte marquée comme traitée');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Impossible de traiter cette alerte');
        }
    };

    const markAll = async () => {
        try {
            await traiterToutesAlertes();
            window.dispatchEvent(new Event('alerts-updated'));
            await load();
            toast.success('Toutes les alertes ont été traitées');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Impossible de traiter les alertes');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Outils</p>
                    <h1 className="mt-1 text-2xl font-bold text-white">Centre d’alertes</h1>
                    <p className="mt-1 text-sm text-gray-400">{stats.nonTraitees || 0} alerte(s) non traitée(s)</p>
                </div>
                <button
                    onClick={markAll}
                    disabled={!stats.nonTraitees}
                    className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-700 disabled:opacity-40"
                >
                    Tout marquer comme traité
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard label="Non traitées" value={stats.nonTraitees} color="text-white" />
                <StatCard label="Priorité haute" value={stats.prioriteHaute} color="text-red-400" />
                <StatCard label="Priorité moyenne" value={stats.prioriteMoyenne} color="text-amber-400" />
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-700 bg-gray-800 p-4 md:grid-cols-4">
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                       placeholder="Rechercher dans les alertes..."
                       className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                <select value={module} onChange={(e) => setModule(e.target.value)} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2.5 text-sm text-white">
                    <option value="">Tous les modules</option>
                    {MODULES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <select value={priorite} onChange={(e) => setPriorite(e.target.value)} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2.5 text-sm text-white">
                    <option value="">Toutes les priorités</option>
                    <option value="HAUTE">Haute</option>
                    <option value="MOYENNE">Moyenne</option>
                    <option value="BASSE">Basse</option>
                </select>
                <select value={statut} onChange={(e) => setStatut(e.target.value)} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2.5 text-sm text-white">
                    <option value="false">Non traitées</option>
                    <option value="">Toutes</option>
                    <option value="true">Traitées</option>
                </select>
            </div>

            {loading ? (
                <div className="py-16 text-center text-sm text-gray-400">Chargement des alertes...</div>
            ) : alertes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-700 py-16 text-center">
                    <p className="text-lg font-medium text-white">Aucune alerte trouvée</p>
                    <p className="mt-1 text-sm text-gray-400">Aucune anomalie ne correspond aux filtres sélectionnés.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {alertes.map((alerte) => (
                        <div key={alerte.cle} className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 transition-opacity ${priorityStyles[alerte.priorite]} ${alerte.traitee ? 'opacity-45' : ''}`}>
                            <div className="flex min-w-0 items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-900/60 text-lg">
                                    {moduleIcons[alerte.module] || '🔔'}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-sm font-semibold text-white">{alerte.titre}</h3>
                                        {alerte.traitee && <span className="rounded-full bg-gray-700 px-2 py-0.5 text-[10px] text-gray-300">Traitée</span>}
                                    </div>
                                    <p className="mt-1 text-sm text-gray-300">{alerte.description}</p>
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                                        <span>{alerte.moduleLabel}</span>
                                        {alerte.dateReference && <><span>•</span><span>{new Date(`${alerte.dateReference}T00:00:00`).toLocaleDateString('fr-FR')}</span></>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <span className="rounded-full bg-gray-900/60 px-2.5 py-1 text-xs font-medium">{alerte.prioriteLabel}</span>
                                <button onClick={() => navigate(alerte.resourceUrl)} className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-xs font-medium text-white hover:bg-gray-700">Voir</button>
                                {!alerte.traitee && (
                                    <button onClick={() => markOne(alerte.cle)} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700">Marquer traitée</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
            <p className={`mt-2 text-3xl font-bold ${color}`}>{value || 0}</p>
        </div>
    );
}
