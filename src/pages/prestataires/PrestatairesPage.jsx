// src/pages/prestataires/PrestatairesPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getPrestataires } from '../../api/prestataireApi';
import { PRESTATAIRE_STATUT, PRESTATAIRE_CATEGORIE, CATEGORIE_OPTIONS, STATUT_OPTIONS, NATURE_OPTIONS } from '../../utils/prestataireConstants';
import { formatPhone } from '../../utils/fieldFormatters';

export default function PrestatairesPage() {
    const navigate = useNavigate();
    const [prestataires, setPrestataires] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categorie, setCategorie] = useState('');
    const [statut, setStatut] = useState('');
    const [natureJuridique, setNatureJuridique] = useState('');

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (categorie) params.categorie = categorie;
            if (statut) params.statut = statut;
            if (natureJuridique) params.natureJuridique = natureJuridique;
            const { data } = await getPrestataires(params);
            setPrestataires(data);
        } catch { toast.error('Erreur chargement'); }
        finally { setLoading(false); }
    }, [search, categorie, statut, natureJuridique]);

    useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

    const selectClass = "px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none";

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Prestataires</h1>
                    <p className="text-sm text-gray-400 mt-1">{prestataires.length} prestataire(s)</p>
                </div>
                <button onClick={() => navigate('/prestataires/nouveau')} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    + Nouveau prestataire
                </button>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-wrap items-end gap-3 mb-6">
                <input
                    type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)}
                    className="w-64 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <select value={categorie} onChange={(e) => setCategorie(e.target.value)} className={selectClass}>
                    {CATEGORIE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select value={statut} onChange={(e) => setStatut(e.target.value)} className={selectClass}>
                    {STATUT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select value={natureJuridique} onChange={(e) => setNatureJuridique(e.target.value)} className={selectClass}>
                    {NATURE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin" /></div>
            ) : prestataires.length === 0 ? (
                <div className="text-center py-16"><div className="text-5xl mb-4">👤</div><p className="text-gray-400">Aucun prestataire trouvé</p></div>
            ) : (
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-700">
                            {['Code', 'Nom / Raison sociale', 'Catégorie', 'Activité', 'Ville', 'Contact', 'Statut', ''].map((h) => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                        {prestataires.map((p) => {
                            const statutStyle = PRESTATAIRE_STATUT[p.statut] || {};
                            const catStyle = PRESTATAIRE_CATEGORIE[p.categorie] || {};
                            return (
                                <tr key={p.id} onClick={() => navigate(`/prestataires/${p.id}`)} className="hover:bg-gray-700/30 cursor-pointer transition-colors">
                                    <td className="px-4 py-3 text-sm font-mono text-indigo-400">{p.code}</td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-white font-medium">{p.displayName}</p>
                                        <p className="text-xs text-gray-500">{p.natureJuridiqueLabel}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${catStyle.color || ''}`}>{p.categorieLabel}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-300">{p.activite || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-300">{p.ville || '—'}</td>
                                    <td className="px-4 py-3">
                                        {p.email && <p className="text-xs text-gray-400">{p.email}</p>}
                                        {p.telephone && <p className="text-xs text-gray-500">{formatPhone(p.telephone)}</p>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statutStyle.color || ''}`}>{p.statutLabel}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="text-gray-500 text-xs">→</span>
                                    </td>
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