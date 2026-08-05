// src/pages/formateurs/FormateursList.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getFormateurs, createFormateur } from '../../api/formateurApi';
import { getPrestataires } from '../../api/prestataireApi';
import { compactValue, formatPhone } from '../../utils/fieldFormatters';

export default function FormateursList() {
    const [formateurs, setFormateurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterActif, setFilterActif] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [prestatairesFormation, setPrestatairesFormation] = useState([]);
    const navigate = useNavigate();

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (filterActif !== null) params.actif = filterActif;
            const { data } = await getFormateurs(params);
            setFormateurs(data);
        } catch {
            toast.error('Erreur chargement formateurs');
        } finally {
            setLoading(false);
        }
    }, [search, filterActif]);

    useEffect(() => {
        const t = setTimeout(load, 300);
        return () => clearTimeout(t);
    }, [load]);

    useEffect(() => {
        const loadPrestataires = async () => {
            try {
                const { data } = await getPrestataires({ categorie: 'FORMATION', statut: 'ACTIF' });
                setPrestatairesFormation(data);
            } catch {
                toast.error('Erreur lors du chargement des prestataires de formation');
            }
        };
        loadPrestataires();
    }, []);

    const handleCreate = async (data) => {
        try {
            const payload = {
                ...data,
                telephone: compactValue(data.telephone),
                tarifJournalier: data.tarifJournalier === '' ? null : Number(data.tarifJournalier),
                fraisDeplacement: data.fraisDeplacement === '' ? null : Number(data.fraisDeplacement),
                prestataireId: data.modeCollaboration === 'RATTACHE' ? Number(data.prestataireId) : null,
            };
            delete payload.modeCollaboration;
            const res = await createFormateur(payload);
            toast.success(`Formateur ${res.data.code} créé`);
            setShowModal(false);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Formateurs</h1>
                    <p className="text-sm text-gray-400 mt-1">{formateurs.length} formateur(s)</p>
                </div>
                <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    + Nouveau formateur
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-5">
                <input
                    type="text"
                    placeholder="Rechercher nom, prénom, spécialité..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 max-w-md px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <select
                    value={filterActif === null ? '' : String(filterActif)}
                    onChange={(e) => setFilterActif(e.target.value === '' ? null : e.target.value === 'true')}
                    className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                    <option value="">Tous</option>
                    <option value="true">Actifs</option>
                    <option value="false">Inactifs</option>
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
                </div>
            ) : formateurs.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-5xl mb-4">👨‍🏫</div>
                    <p className="text-lg font-medium text-white">Aucun formateur trouvé</p>
                </div>
            ) : (
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-700">
                            {['Code', 'Nom', 'Prénom', 'Spécialité', 'Tarif/jour', 'Sessions', 'Statut'].map((h) => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                        {formateurs.map((f) => (
                            <tr key={f.id} onClick={() => navigate(`/formateurs/${f.id}`)} className="hover:bg-gray-700/50 cursor-pointer transition-colors">
                                <td className="px-4 py-3 text-sm font-mono text-indigo-400 font-medium">{f.code}</td>
                                <td className="px-4 py-3 text-sm font-medium text-white">{f.nom}</td>
                                <td className="px-4 py-3 text-sm text-gray-300">{f.prenom}</td>
                                <td className="px-4 py-3 text-sm text-gray-300">{f.specialite || '—'}</td>
                                <td className="px-4 py-3 text-sm text-white font-medium">
                                    {f.tarifJournalier ? `${Number(f.tarifJournalier).toLocaleString('fr-FR')} DH` : '—'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-300">{f.sessionCount}</td>
                                <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        f.actif
                            ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
                    }`}>
                      {f.actif ? 'Actif' : 'Inactif'}
                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <FormateurCreateModal
                    onSubmit={handleCreate}
                    onClose={() => setShowModal(false)}
                    prestataires={prestatairesFormation}
                />
            )}
        </div>
    );
}

function FormateurCreateModal({ onSubmit, onClose, prestataires }) {
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
        defaultValues: { modeCollaboration: 'INDEPENDANT' },
    });
    const modeCollaboration = watch('modeCollaboration');
    const inputClass = "w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Nouveau formateur</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Nom <span className="text-red-400">*</span></label>
                            <input {...register('nom', { required: 'Obligatoire' })} className={inputClass} />
                            {errors.nom && <p className="text-xs text-red-400 mt-1">{errors.nom.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Prénom <span className="text-red-400">*</span></label>
                            <input {...register('prenom', { required: 'Obligatoire' })} className={inputClass} />
                            {errors.prenom && <p className="text-xs text-red-400 mt-1">{errors.prenom.message}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                            <input type="email" {...register('email')} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Téléphone <span className="text-red-400">*</span></label>
                            <input {...register('telephone', { required: 'Le téléphone est obligatoire', setValueAs: compactValue })} onInput={(event) => { event.currentTarget.value = formatPhone(event.currentTarget.value); }} placeholder="06 12 34 56 78" className={inputClass} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Spécialité <span className="text-red-400">*</span></label>
                        <input {...register('specialite', { required: 'La spécialité est obligatoire' })} className={inputClass} placeholder="Ex: Management, Excel..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Tarif journalier (DH)</label>
                            <input type="number" step="0.01" {...register('tarifJournalier', { min: { value: 0, message: 'Le montant doit être positif' } })} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Frais déplacement (DH)</label>
                            <input type="number" step="0.01" {...register('fraisDeplacement', { min: { value: 0, message: 'Le montant doit être positif' } })} className={inputClass} />
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-700 bg-gray-900/40 p-4 space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Mode de collaboration</label>
                            <select {...register('modeCollaboration')} className={inputClass}>
                                <option value="INDEPENDANT">Formateur indépendant</option>
                                <option value="RATTACHE">Rattaché à un prestataire</option>
                            </select>
                        </div>
                        {modeCollaboration === 'RATTACHE' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Prestataire de formation <span className="text-red-400">*</span></label>
                                <select {...register('prestataireId', { required: 'Sélectionnez un prestataire' })} className={inputClass}>
                                    <option value="">— Choisir un prestataire —</option>
                                    {prestataires.map((p) => (
                                        <option key={p.id} value={p.id}>{p.code} — {p.displayName}</option>
                                    ))}
                                </select>
                                {errors.prestataireId && <p className="text-xs text-red-400 mt-1">{errors.prestataireId.message}</p>}
                                {prestataires.length === 0 && <p className="text-xs text-amber-400 mt-1">Aucun prestataire Formation actif disponible.</p>}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                        <textarea {...register('notes')} rows={2} className={inputClass} />
                    </div>
                    {Object.keys(errors).length > 0 && (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
                            {Object.values(errors).map((error, index) => (
                                <p key={index} className="text-xs text-red-400">{error.message}</p>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Annuler</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {isSubmitting ? 'Création...' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}