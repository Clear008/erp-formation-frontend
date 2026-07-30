// src/pages/prestataires/PrestataireDetailsPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/AuthContext';
import { getPrestataire, changePrestataireStatus, getBankDetails, updateBankDetails, linkFormateur, unlinkFormateur } from '../../api/prestataireApi';
import { getFormateurs } from '../../api/formateurApi';
import { PRESTATAIRE_STATUT, PRESTATAIRE_CATEGORIE } from '../../utils/prestataireConstants';
import DocumentsTab from '../documents/components/DocumentsTab';

function StatusBadge({ statut }) {
    const config = PRESTATAIRE_STATUT[statut] || { label: statut, color: 'bg-gray-700 text-gray-300' };
    return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
}

export default function PrestataireDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [prestataire, setPrestataire] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('infos');
    const [bankDetails, setBankDetails] = useState(null);
    const [bankLoading, setBankLoading] = useState(false);
    const [availableFormateurs, setAvailableFormateurs] = useState([]);
    const [selectedFormateurId, setSelectedFormateurId] = useState('');
    const [formateursLoading, setFormateursLoading] = useState(false);
    const [linkingFormateur, setLinkingFormateur] = useState(false);

    const canAccessBank = ['ADMIN', 'DG', 'DA'].includes(user?.role);
    const canBlock = ['ADMIN', 'DG'].includes(user?.role);

    const loadData = async () => {
        try {
            const { data } = await getPrestataire(id);
            setPrestataire(data);
        } catch { toast.error('Prestataire introuvable'); navigate('/prestataires'); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, [id]);

    // Charger les infos bancaires quand on clique sur l'onglet
    useEffect(() => {
        if (activeTab === 'bancaire' && canAccessBank && !bankDetails) {
            setBankLoading(true);
            getBankDetails(id).then(({ data }) => setBankDetails(data)).catch(() => toast.error('Accès refusé')).finally(() => setBankLoading(false));
        }
    }, [activeTab]);
    const loadAvailableFormateurs = async () => {
        try {
            setFormateursLoading(true);

            const { data } = await getFormateurs({
                actif: true
            });

            const linkedIds = new Set(
                (prestataire?.formateurs || []).map(
                    (formateur) => formateur.id
                )
            );

            setAvailableFormateurs(
                data.filter(
                    (formateur) => !linkedIds.has(formateur.id)
                )
            );
        } catch (err) {
            toast.error(
                err.response?.data?.message
                || 'Erreur lors du chargement des formateurs'
            );
        } finally {
            setFormateursLoading(false);
        }
    };

    useEffect(() => {
        if (
            activeTab === 'formateur'
            && prestataire?.categorie === 'FORMATION'
        ) {
            loadAvailableFormateurs();
        }
    }, [
        activeTab,
        prestataire?.id,
        prestataire?.formateurs?.length
    ]);


    const handleLinkFormateur = async () => {
        if (!selectedFormateurId) {
            toast.error('Sélectionnez un formateur');
            return;
        }

        try {
            setLinkingFormateur(true);

            await linkFormateur(
                id,
                selectedFormateurId
            );

            toast.success('Formateur rattaché');
            setSelectedFormateurId('');

            await loadData();
        } catch (err) {
            toast.error(
                err.response?.data?.message
                || 'Erreur lors du rattachement'
            );
        } finally {
            setLinkingFormateur(false);
        }
    };

    const handleStatusChange = async (statut, motif) => {
        try {
            await changePrestataireStatus(id, { statut, motif });
            toast.success('Statut mis à jour');
            loadData();
        } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    };

    if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin" /></div>;
    if (!prestataire) return null;

    const TABS = [
        { key: 'infos', label: 'Informations' },

        ...(canAccessBank
            ? [{
                key: 'bancaire',
                label: 'Coordonnées bancaires'
            }]
            : []),

        ...(prestataire.categorie === 'FORMATION'
            ? [{
                key: 'formateur',
                label: 'Formateurs liés'
            }]
            : []),

        { key: 'documents', label: 'Documents' },
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <button onClick={() => navigate('/prestataires')} className="text-sm text-gray-400 hover:text-indigo-400 mb-1 inline-flex items-center gap-1">← Retour</button>
                    <h1 className="text-2xl font-bold text-white">{prestataire.displayName}</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm font-mono text-indigo-400">{prestataire.code}</span>
                        <StatusBadge statut={prestataire.statut} />
                        {prestataire.categorieLabel && (
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${(PRESTATAIRE_CATEGORIE[prestataire.categorie] || {}).color || ''}`}>
                {prestataire.categorieLabel}
              </span>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => navigate(`/prestataires/${id}/modifier`)} className="px-3 py-2 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">
                        ✏️ Modifier
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/paiements-prestataires/nouveau?prestataireId=${prestataire.id}`
                            )
                        }
                        disabled={prestataire.statut === 'BLOQUE'}
                        title={
                            prestataire.statut === 'BLOQUE'
                                ? 'Impossible de payer un prestataire bloqué'
                                : 'Préparer un paiement'
                        }
                        className="px-3 py-2 text-sm text-emerald-400 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 border border-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        💸 Préparer un paiement
                    </button>

                    {prestataire.statut === 'ACTIF' && (
                        <button onClick={() => handleStatusChange('INACTIF')} className="px-3 py-2 text-sm text-amber-400 bg-amber-500/10 rounded-lg hover:bg-amber-500/20 border border-amber-500/20">
                            Désactiver
                        </button>
                    )}
                    {prestataire.statut === 'INACTIF' && (
                        <button onClick={() => handleStatusChange('ACTIF')} className="px-3 py-2 text-sm text-emerald-400 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 border border-emerald-500/20">
                            Activer
                        </button>
                    )}
                    {canBlock && prestataire.statut !== 'BLOQUE' && (
                        <button onClick={() => {
                            const motif = prompt('Motif du blocage :');
                            if (motif) handleStatusChange('BLOQUE', motif);
                        }} className="px-3 py-2 text-sm text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 border border-red-500/20">
                            🚫 Bloquer
                        </button>
                    )}
                </div>
            </div>

            {/* Blocage info */}
            {prestataire.statut === 'BLOQUE' && prestataire.motifBlocage && (
                <div className="flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300 mb-6">
                    <span>🚫</span>
                    <div>
                        <p className="font-medium">Prestataire bloqué</p>
                        <p className="text-xs mt-0.5">{prestataire.motifBlocage} — par {prestataire.bloqueParUsername}</p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-700 mb-6">
                <nav className="flex gap-6">
                    {TABS.map((tab) => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === tab.key ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-300'
                                }`}>{tab.label}</button>
                    ))}
                </nav>
            </div>

            {/* TAB: Infos */}
            {activeTab === 'infos' && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {[
                            ['Code', prestataire.code],
                            ['Catégorie', prestataire.categorieLabel],
                            ['Nature', prestataire.natureJuridiqueLabel],
                            ['Régime', prestataire.regimeLabel],
                            ['Activité', prestataire.activite],
                            ['Nom', prestataire.nom],
                            ['Prénom', prestataire.prenom],
                            ['Raison sociale', prestataire.raisonSociale],
                            ['ICE', prestataire.ice],
                            ['CIN', prestataire.cin],
                            ['Email', prestataire.email],
                            ['Téléphone', prestataire.telephone],
                            ['Ville', prestataire.ville],
                            ['Pays', prestataire.pays],
                            ['Banque', prestataire.banque],
                            ['IBAN', prestataire.ibanMasque || '—'],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
                                <dd className="mt-1 text-sm text-white">{value || '—'}</dd>
                            </div>
                        ))}
                    </div>
                    {prestataire.notes && (
                        <div className="mt-6 pt-5 border-t border-gray-700">
                            <dt className="text-xs font-medium text-gray-500 uppercase mb-2">Notes</dt>
                            <dd className="text-sm text-gray-300 whitespace-pre-wrap">{prestataire.notes}</dd>
                        </div>
                    )}
                </div>
            )}

            {/* TAB: Bancaire */}
            {activeTab === 'bancaire' && canAccessBank && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-white mb-4">Coordonnées bancaires</h3>
                    {bankLoading ? (
                        <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin" /></div>
                    ) : bankDetails ? (
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                ['RIB', bankDetails.rib],
                                ['IBAN', bankDetails.iban],
                                ['Banque', bankDetails.banque],
                                ['Agence', bankDetails.agenceBancaire],
                                ['Titulaire', bankDetails.titulaireCompte],
                            ].map(([label, value]) => (
                                <div key={label}>
                                    <dt className="text-xs font-medium text-gray-500 uppercase">{label}</dt>
                                    <dd className="mt-1 text-sm text-white font-mono">{value || '—'}</dd>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm">Aucune donnée bancaire</p>
                    )}
                </div>
            )}

            {/* TAB: Formateur */}
            {/* ONGLET : FORMATEURS */}

            {activeTab === 'formateur' && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-white">
                                Formateurs liés
                            </h3>

                            <p className="text-xs text-gray-500 mt-1">
                                {prestataire.formateurs?.length || 0} formateur(s)
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                        <select
                            value={selectedFormateurId}
                            onChange={(event) =>
                                setSelectedFormateurId(event.target.value)
                            }
                            disabled={
                                formateursLoading
                                || linkingFormateur
                            }
                            className="flex-1 px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                        >
                            <option value="">
                                {formateursLoading
                                    ? 'Chargement des formateurs...'
                                    : 'Sélectionner un formateur'}
                            </option>

                            {availableFormateurs.map((formateur) => (
                                <option
                                    key={formateur.id}
                                    value={formateur.id}
                                >
                                    {formateur.prenom} {formateur.nom}
                                    {formateur.specialite
                                        ? ` — ${formateur.specialite}`
                                        : ''}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={handleLinkFormateur}
                            disabled={
                                !selectedFormateurId
                                || linkingFormateur
                            }
                            className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {linkingFormateur
                                ? 'Rattachement...'
                                : 'Rattacher'}
                        </button>
                    </div>


                    {prestataire.formateurs?.length > 0 ? (
                        <div className="space-y-3">
                            {prestataire.formateurs.map((formateur) => (
                                <div
                                    key={formateur.id}
                                    className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-700 rounded-lg"
                                >
                                    <div>
                                        <p className="text-sm text-white font-medium">
                                            {formateur.displayName
                                                || `${formateur.prenom || ''} ${formateur.nom || ''}`.trim()}
                                        </p>

                                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                                            {formateur.code && (
                                                <span>{formateur.code}</span>
                                            )}

                                            {formateur.specialite && (
                                                <span>{formateur.specialite}</span>
                                            )}

                                            {formateur.email && (
                                                <span>{formateur.email}</span>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(`/formateurs/${formateur.id}`)
                                            }
                                            className="text-xs text-indigo-400 hover:text-indigo-300 mt-2"
                                        >
                                            Voir la fiche formateur →
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3">
                            <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                    formateur.actif
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'bg-gray-700 text-gray-400'
                                }`}
                            >
                                {formateur.actif ? 'Actif' : 'Inactif'}
                            </span>

                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const confirmed = window.confirm(
                                                    `Dissocier ${formateur.displayName || 'ce formateur'} ?`
                                                );

                                                if (!confirmed) return;

                                                try {
                                                    await unlinkFormateur(
                                                        id,
                                                        formateur.id
                                                    );

                                                    toast.success(
                                                        'Formateur dissocié'
                                                    );

                                                    await loadData();
                                                } catch (err) {
                                                    toast.error(
                                                        err.response?.data?.message
                                                        || 'Erreur lors de la dissociation'
                                                    );
                                                }
                                            }}
                                            className="text-xs text-red-400 hover:text-red-300"
                                        >
                                            Dissocier
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-400">
                            <p className="text-sm">
                                Aucun formateur lié
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                                Ce prestataire ne possède actuellement aucun formateur.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* TAB: Documents */}
            {activeTab === 'documents' && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <DocumentsTab entityType="PRESTATAIRE" entityId={prestataire.id} />
                </div>
            )}
        </div>
    );
}