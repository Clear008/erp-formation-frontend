// src/pages/clients/ClientsList.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getClients, createClient } from '../../api/clientApi';
import { compactValue, formatIce, formatPhone } from '../../utils/fieldFormatters';

function collectErrorMessages(errorObject) {
    return Object.values(errorObject || {}).flatMap((error) => {
        if (error?.message) return [error.message];
        if (error && typeof error === 'object') return collectErrorMessages(error);
        return [];
    });
}

export default function ClientsList() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const loadClients = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await getClients(search || undefined);
            setClients(data);
        } catch {
            toast.error('Erreur lors du chargement des clients');
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(loadClients, 300);
        return () => clearTimeout(timer);
    }, [loadClients]);

    const handleCreate = async (formData) => {
        try {
            await createClient(formData);
            toast.success('Client créé avec succès');
            setShowModal(false);
            loadClients();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur lors de la création');
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Clients</h1>
                    <p className="text-sm text-gray-400 mt-1">{clients.length} client(s) enregistré(s)</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    + Nouveau client
                </button>
            </div>

            {/* Search */}
            <div className="mb-5">
                <input
                    type="text"
                    placeholder="Rechercher par nom, code ou ville..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full max-w-md px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
                </div>
            ) : clients.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-5xl mb-4">🏢</div>
                    <p className="text-lg font-medium text-white">Aucun client trouvé</p>
                    <p className="text-sm text-gray-400 mt-1">Créez votre premier client pour commencer</p>
                </div>
            ) : (
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-700">
                            {[
                                'Raison sociale',
                                'Ville',
                                'Email',
                                'Contact principal',
                                'Tél.',
                                'Statut'
                            ].map((header) => (
                                <th
                                    key={header}
                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                        {clients.map((client) => (
                            <tr
                                key={client.id}
                                onClick={() => navigate(`/clients/${client.id}`)}
                                className="hover:bg-gray-700/50 cursor-pointer transition-colors"
                            >

                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M3 21h18M5 21V5a2 2 0 012-2h6a2 2 0 012 2v16m4 0V9a2 2 0 00-2-2h-2M9 7h2m-2 4h2m-2 4h2"
                                                />
                                            </svg>
                                        </div>

                                        <span className="text-sm font-medium text-white">
            {client.raisonSociale}
        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-300">{client.ville || '—'}</td>
                                <td className="px-4 py-3 text-sm text-gray-300">{client.email || '—'}</td>
                                <td className="px-4 py-3">
                                    {client.contactPrincipalNom ? (
                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                {client.contactPrincipalPrenom}{' '}
                                                {client.contactPrincipalNom}
                                            </p>

                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {client.contactPrincipalFonction || 'Fonction non renseignée'}
                                            </p>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-500">
            Aucun contact
        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-300">{client.telephone ? formatPhone(client.telephone) : '—'}</td>
                                <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        client.active
                            ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
                    }`}>
                      {client.active ? 'Actif' : 'Inactif'}
                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <ClientCreateModal
                    onSubmit={handleCreate}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}

// ==================== CREATE MODAL (react-hook-form) ====================

function ClientCreateModal({ onSubmit, onClose }) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Nouveau client</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
                    {/* Raison sociale */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Raison sociale <span className="text-red-400">*</span>
                        </label>
                        <input
                            {...register('raisonSociale', { required: 'La raison sociale est obligatoire' })}
                            className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            placeholder="Nom de l'entreprise"
                        />
                        {errors.raisonSociale && (
                            <p className="text-xs text-red-400 mt-1">{errors.raisonSociale.message}</p>
                        )}
                    </div>

                    {/* ICE + RC */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">ICE <span className="text-red-400">*</span></label>
                            <input
                                {...register('ice', { required: 'ICE obligatoire', setValueAs: compactValue, pattern: { value: /^\d{15}$/, message: 'ICE : exactement 15 chiffres' } })}
                                className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                onInput={(event) => { event.currentTarget.value = formatIce(event.currentTarget.value); }} placeholder="000 000 000 000 000"
                                maxLength={19} inputMode="numeric"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">RC <span className="text-red-400">*</span></label>
                            <input
                                {...register('rc', { required: 'RC obligatoire', pattern: { value: /^\d{1,20}$/, message: 'RC : chiffres uniquement' } })}
                                className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                placeholder="Registre de commerce"
                                inputMode="numeric"
                            />
                        </div>
                    </div>

                    {/* Adresse */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Adresse</label>
                        <input
                            {...register('adresse')}
                            className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        />
                    </div>

                    {/* Ville + Email */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Ville <span className="text-red-400">*</span></label>
                            <input
                                {...register('ville', { required: 'Ville obligatoire' })}
                                className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Email <span className="text-red-400">*</span></label>
                            <input
                                type="email"
                                {...register('email', { required: 'Email obligatoire', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Adresse email invalide' } })}
                                className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    {/* Téléphone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Téléphone <span className="text-red-400">*</span></label>
                        <input
                            {...register('telephone', { required: 'Telephone obligatoire', setValueAs: compactValue, pattern: { value: /^(?:\+212|0)[5-7]\d{8}$/, message: 'Numero marocain invalide' } })}
                            onInput={(event) => { event.currentTarget.value = formatPhone(event.currentTarget.value); }}
                            
                            className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-white">Contact principal</h3>
                            <p className="text-xs text-gray-400 mt-1">
                                Ce contact sera automatiquement défini comme interlocuteur principal du client.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Nom <span className="text-red-400">*</span></label>
                                <input
                                    {...register('contactPrincipal.nom', { required: 'Nom du contact obligatoire' })}
                                    className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Prénom <span className="text-red-400">*</span></label>
                                <input
                                    {...register('contactPrincipal.prenom', { required: 'Prénom du contact obligatoire' })}
                                    className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-1">Fonction <span className="text-red-400">*</span></label>
                            <input
                                {...register('contactPrincipal.fonction', { required: 'Fonction du contact obligatoire' })}
                                placeholder="Ex. Responsable formation, DRH..."
                                className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Email <span className="text-red-400">*</span></label>
                                <input
                                    type="email"
                                    {...register('contactPrincipal.email', {
                                        required: 'Email du contact obligatoire',
                                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email du contact invalide' }
                                    })}
                                    className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Téléphone <span className="text-red-400">*</span></label>
                                <input
                                    {...register('contactPrincipal.telephone', {
                                        required: 'Téléphone du contact obligatoire',
                                        setValueAs: compactValue,
                                        pattern: { value: /^(?:\+212|0)[5-7]\d{8}$/, message: 'Téléphone du contact invalide' }
                                    })}
                                    onInput={(event) => { event.currentTarget.value = formatPhone(event.currentTarget.value); }}
                                    
                                    className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                    {Object.keys(errors).length > 0 && (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
                            {collectErrorMessages(errors).map((message, index) => (
                                <p key={index} className="text-xs text-red-400">{message}</p>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                            {isSubmitting ? 'Création...' : 'Créer le client'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}