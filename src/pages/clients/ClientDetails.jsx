// src/pages/clients/ClientDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DocumentsTab from '../documents/components/DocumentsTab';
import { getActions } from '../../api/actionApi';
import { getFacturesByClient } from '../../api/factureApi';
import { countDocumentsByEntity } from '../../api/documentApi';
import {
    getClient, updateClient, toggleClientStatus,
    getContacts, createContact, updateContact, deleteContact
} from '../../api/clientApi';

export default function ClientDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('infos');
    const [showContactModal, setShowContactModal] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [actions, setActions] = useState([]);
    const [factureCount, setFactureCount] = useState(0);
    const [documentCount, setDocumentCount] = useState(0);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const [clientRes, contactsRes] = await Promise.all([
                getClient(id),
                getContacts(id),
            ]);

            setClient(clientRes.data);
            setContacts(contactsRes.data || []);

            // Une erreur d'indicateur ne doit pas bloquer la fiche client.
            const [actionsResult, facturesResult, documentsResult] =
                await Promise.allSettled([
                    getActions({ clientId: id }),
                    getFacturesByClient(id),
                    countDocumentsByEntity('CLIENT', id),
                ]);

            setActions(
                actionsResult.status === 'fulfilled'
                    ? actionsResult.value.data || []
                    : []
            );

            setFactureCount(
                facturesResult.status === 'fulfilled'
                    ? (facturesResult.value.data || []).length
                    : 0
            );

            setDocumentCount(
                documentsResult.status === 'fulfilled'
                    ? Number(documentsResult.value.data) || 0
                    : 0
            );
        } catch {
            toast.error('Client introuvable');
            navigate('/clients');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateClient = async (formData) => {
        try {
            const { data } = await updateClient(id, formData);
            setClient(data);
            setShowEditModal(false);
            toast.success('Client modifié avec succès');
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Erreur lors de la modification du client'
            );
        }
    };

    const handleToggleStatus = async () => {
        try {
            const { data } = await toggleClientStatus(id, !client.active);
            setClient(data);
            toast.success(data.active ? 'Client activé' : 'Client désactivé');
        } catch {
            toast.error('Erreur lors du changement de statut');
        }
    };

    const handleCreateContact = async (formData) => {
        try {
            await createContact(id, formData);
            toast.success('Contact créé avec succès');
            setShowContactModal(false);
            const { data } = await getContacts(id);
            setContacts(data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur');
        }
    };

    const handleUpdateContact = async (formData) => {
        try {
            await updateContact(editingContact.id, formData);
            toast.success('Contact modifié');
            setEditingContact(null);
            const { data } = await getContacts(id);
            setContacts(data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur');
        }
    };

    const handleDeleteContact = async (contactId) => {
        if (!window.confirm('Supprimer ce contact ?')) return;
        try {
            await deleteContact(contactId);
            toast.success('Contact supprimé');
            setContacts((prev) => prev.filter((c) => c.id !== contactId));
        } catch {
            toast.error('Erreur lors de la suppression');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!client) return null;

    const principalContact =
        contacts.find((contact) => contact.principal) ||
        contacts[0];

    const tabs = [
        { key: 'infos', label: 'Informations' },
        { key: 'contacts', label: 'Contacts (' + contacts.length + ')' },
        { key: 'formations', label: 'Formations (' + actions.length + ')' },
        { key: 'documents', label: 'Documents (' + documentCount + ')' },
    ];

    const indicators = [
        { key: 'formations', label: 'Formations', value: actions.length, icon: 'F' },
        { key: null, label: 'Factures', value: factureCount, icon: 'DH' },
        { key: 'contacts', label: 'Contacts', value: contacts.length, icon: 'C' },
        { key: 'documents', label: 'Documents', value: documentCount, icon: 'D' },
    ];
    return (
        <div>
            {/* Header enrichi */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/clients')}
                    className="text-sm text-gray-400 hover:text-indigo-400 transition-colors mb-4 inline-flex items-center gap-1"
                >
                    ← Retour aux clients
                </button>

                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 flex items-center justify-center text-2xl font-bold">
                            ▦
                        </div>

                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-bold text-white">
                                    {client.raisonSociale}
                                </h1>

                                <span
                                    className={
                                        'inline-flex px-2 py-0.5 rounded-full text-xs font-medium ' +
                                        (client.active
                                            ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                                            : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20')
                                    }
                                >
                                    {client.active ? 'Actif' : 'Inactif'}
                                </span>
                            </div>

                            <p className="text-sm text-gray-400 mt-1">
                                <span className="font-mono">{client.code}</span>
                                {client.ville ? ' · ' + client.ville : ''}
                                {client.ice ? ' · ICE : ' + client.ice : ''}
                            </p>

                            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm text-gray-400">
                                {principalContact && (
                                    <span>
                                        Contact principal :{' '}
                                        <span className="text-gray-200">
                                            {principalContact.prenom}{' '}
                                            {principalContact.nom}
                                        </span>
                                    </span>
                                )}
                                {client.email && <span>{client.email}</span>}
                                {client.telephone && <span>{client.telephone}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowEditModal(true)}
                            className="px-3.5 py-2 text-sm text-gray-200 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600"
                        >
                            Modifier
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate('/actions/new?clientId=' + client.id)
                            }
                            className="px-3.5 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                        >
                            Créer une formation
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate('/factures/nouvelle?clientId=' + client.id)
                            }
                            className="px-3.5 py-2 text-sm text-gray-200 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600"
                        >
                            Créer une facture
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('documents')}
                            className="px-3.5 py-2 text-sm text-gray-200 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600"
                        >
                            Ajouter un document
                        </button>

                        <button
                            type="button"
                            onClick={handleToggleStatus}
                            className={
                                'px-3.5 py-2 text-sm font-medium rounded-lg border transition-colors ' +
                                (client.active
                                    ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                                    : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10')
                            }
                        >
                            {client.active ? 'Désactiver' : 'Activer'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Indicateurs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {indicators.map((indicator) => (
                    <button
                        type="button"
                        key={indicator.label}
                        onClick={() =>
                            indicator.key && setActiveTab(indicator.key)
                        }
                        className="text-left bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">
                                {indicator.label}
                            </span>
                            <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-300 flex items-center justify-center text-xs font-bold">
                                {indicator.icon}
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-white mt-2">
                            {indicator.value}
                        </p>
                    </button>
                ))}
            </div>
            {/* Tabs */}
            <div className="border-b border-gray-700 mb-6">
                <nav className="flex gap-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tab.key
                                    ? 'border-indigo-500 text-indigo-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab: Infos */}
            {activeTab === 'infos' && (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <div className="grid grid-cols-2 gap-6">
                        {[
                            ['Raison sociale', client.raisonSociale],
                            ['Code', client.code],
                            ['ICE', client.ice],
                            ['RC', client.rc],
                            ['Adresse', client.adresse],
                            ['Ville', client.ville],
                            ['Email', client.email],
                            ['Téléphone', client.telephone],
                            ['Créé le', client.createdAt ? new Date(client.createdAt).toLocaleDateString('fr-FR') : null],
                            ['Modifié le', client.updatedAt ? new Date(client.updatedAt).toLocaleDateString('fr-FR') : null],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
                                <dd className="mt-1 text-sm text-white">{value || '—'}</dd>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tab: Contacts */}
            {activeTab === 'contacts' && (
                <div>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setShowContactModal(true)}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            + Nouveau contact
                        </button>
                    </div>

                    {contacts.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-3">👤</div>
                            <p className="text-gray-400">Aucun contact pour ce client</p>
                        </div>
                    ) : (
                        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b border-gray-700">
                                    {['Nom', 'Prénom', 'Fonction', 'Email', 'Téléphone', 'Actions'].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/50">
                                {contacts.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium text-white">{c.nom}</td>
                                        <td className="px-4 py-3 text-sm text-gray-300">{c.prenom || '—'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-300">{c.fonction || '—'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-300">{c.email || '—'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-300">{c.telephone || '—'}</td>
                                        <td className="px-4 py-3 text-right space-x-2">
                                            <button
                                                onClick={() => setEditingContact(c)}
                                                className="text-indigo-400 hover:text-indigo-300 text-sm"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDeleteContact(c.id)}
                                                className="text-red-400 hover:text-red-300 text-sm"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}


                    {/* Create Contact Modal */}
                    {showContactModal && (
                        <ContactFormModal
                            title="Nouveau contact"
                            onSubmit={handleCreateContact}
                            onClose={() => setShowContactModal(false)}
                        />
                    )}

                    {/* Edit Contact Modal */}
                    {editingContact && (
                        <ContactFormModal
                            title="Modifier le contact"
                            defaultValues={editingContact}
                            onSubmit={handleUpdateContact}
                            onClose={() => setEditingContact(null)}
                        />
                    )}
                </div>
            )}

            {/* Tab: Formations */}
            {activeTab === 'formations' && (
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    {actions.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-white font-medium">
                                Aucune formation pour ce client
                            </p>
                            <button
                                type="button"
                                onClick={() =>
                                    navigate('/actions/new?clientId=' + client.id)
                                }
                                className="mt-3 text-sm text-indigo-400 hover:text-indigo-300"
                            >
                                Créer la première formation
                            </button>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    {['Référence', 'Formation', 'Statut', 'Début', 'Fin'].map(
                                        (header) => (
                                            <th
                                                key={header}
                                                className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                                            >
                                                {header}
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/50">
                                {actions.map((trainingAction) => (
                                    <tr
                                        key={trainingAction.id}
                                        onClick={() =>
                                            navigate('/actions/' + trainingAction.id)
                                        }
                                        className="hover:bg-gray-700/30 cursor-pointer transition-colors"
                                    >
                                        <td className="px-4 py-3 text-sm font-mono text-indigo-400">
                                            {trainingAction.reference}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-white">
                                            {trainingAction.titre}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-300">
                                            {trainingAction.statutLabel ||
                                                trainingAction.statut}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-300">
                                            {trainingAction.dateDebut || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-300">
                                            {trainingAction.dateFin || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Tab: Documents */}
            {activeTab === 'documents' && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <DocumentsTab entityType="CLIENT" entityId={client.id} />
                </div>
            )}

            {showEditModal && (
                <ClientEditModal
                    client={client}
                    onSubmit={handleUpdateClient}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </div>
    );
}

// ==================== CLIENT EDIT MODAL ====================

function ClientEditModal({ client, onSubmit, onClose }) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            raisonSociale: client.raisonSociale || '',
            ice: client.ice || '',
            rc: client.rc || '',
            adresse: client.adresse || '',
            ville: client.ville || '',
            email: client.email || '',
            telephone: client.telephone || '',
        },
    });

    const inputClass =
        'w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-2xl w-full mx-4">
                <div className="flex items-center justify-between p-5 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">
                        Modifier le client
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">
                            Raison sociale *
                        </label>
                        <input
                            {...register('raisonSociale', {
                                required: 'La raison sociale est obligatoire',
                            })}
                            className={inputClass}
                        />
                        {errors.raisonSociale && (
                            <p className="text-xs text-red-400 mt-1">
                                {errors.raisonSociale.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            ['ice', 'ICE'],
                            ['rc', 'RC'],
                            ['ville', 'Ville'],
                            ['telephone', 'Téléphone'],
                        ].map(([name, label]) => (
                            <div key={name}>
                                <label className="block text-sm text-gray-300 mb-1">
                                    {label}
                                </label>
                                <input {...register(name)} className={inputClass} />
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="block text-sm text-gray-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            {...register('email')}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-300 mb-1">
                            Adresse
                        </label>
                        <textarea
                            {...register('adresse')}
                            rows={2}
                            className={inputClass}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ==================== CONTACT FORM MODAL (react-hook-form) ====================

function ContactFormModal({ title, defaultValues = {}, onSubmit, onClose }) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            nom: defaultValues.nom || '',
            prenom: defaultValues.prenom || '',
            email: defaultValues.email || '',
            telephone: defaultValues.telephone || '',
            fonction: defaultValues.fonction || '',
        },
    });

    const inputClass = "w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-md w-full mx-4">
                <div className="flex items-center justify-between p-5 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Nom <span className="text-red-400">*</span>
                        </label>
                        <input {...register('nom', { required: 'Le nom est obligatoire' })} className={inputClass} />
                        {errors.nom && <p className="text-xs text-red-400 mt-1">{errors.nom.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Prénom</label>
                        <input {...register('prenom')} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Fonction</label>
                        <input {...register('fonction')} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                        <input type="email" {...register('email')} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Téléphone</label>
                        <input {...register('telephone')} className={inputClass} />
                    </div>
                    <div className="flex justify-end gap-3 pt-3 border-t border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">
                            Annuler
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {isSubmitting ? 'En cours...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}