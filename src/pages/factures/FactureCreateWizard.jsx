// src/pages/factures/FactureCreateWizard.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getClients } from '../../api/clientApi';
import {
    getActionsFacturables,
    createFactureWizard,
    getFactureDetail,
    updateFactureWizard,
} from '../../api/factureWizardApi';
import { getCabinetSettings } from '../../api/cabinetSettingsApi';

import FactureStepSource from './components/FactureStepSource';
import FactureStepLines from './components/FactureStepLines';
import FactureStepParams from './components/FactureStepParams';
import FactureStepConfirmation from './components/FactureStepConfirmation';
import FactureSummaryCard from './components/FactureSummaryCard';

const STEPS = [
    { key: 'source',       label: '1. Source',       desc: 'Mode de facturation et client' },
    { key: 'lignes',       label: '2. Lignes',       desc: 'Détail des prestations' },
    { key: 'params',       label: '3. Paramètres',   desc: 'Dates et informations' },
    { key: 'confirmation', label: '4. Confirmation', desc: 'Vérification et émission' },
];

const dateToInput = (date) => {
    const local = new Date(date);
    local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
    return local.toISOString().split('T')[0];
};

const today = new Date();
const defaultDueDate = new Date(today);
defaultDueDate.setDate(defaultDueDate.getDate() + 60);

const INITIAL_DATA = {
    mode: 'ACTION',
    clientId: '',
    actionId: null,
    lignes: [],
    dateFacture: dateToInput(today),
    dateEcheance: dateToInput(defaultDueDate),
    modePaiementAttendu: '',
    referenceInterne: '',
    commentaires: '',
};

export default function FactureCreateWizard() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);
    const [searchParams] = useSearchParams();
    const initialClientId = searchParams.get('clientId') || '';
    const [step, setStep] = useState(0);
    const [data, setData] = useState({
        ...INITIAL_DATA,
        clientId: initialClientId,
    });
    const [clients, setClients] = useState([]);
    const [actions, setActions] = useState([]);
    const [cabinetSettings, setCabinetSettings] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Charger les clients
    useEffect(() => {
        getClients().then((r) => setClients(r.data)).catch(() => {});
    }, []);

    // En modification, recharger toutes les données du brouillon.
    useEffect(() => {
        if (!isEditing) return;

        getFactureDetail(id)
            .then((response) => {
                const facture = response.data;
                if (facture.statut !== 'BROUILLON') {
                    toast.error('Seule une facture brouillon peut être modifiée');
                    navigate(`/factures/${id}`);
                    return;
                }
                setData({
                    mode: facture.mode || (facture.actionId ? 'ACTION' : 'PRESTATION'),
                    clientId: String(facture.clientId),
                    actionId: facture.actionId,
                    lignes: (facture.lignes || []).map((ligne) => ({
                        description: ligne.description,
                        quantite: ligne.quantite,
                        prixUnitaire: ligne.prixUnitaire,
                        tauxTva: ligne.tauxTva,
                    })),
                    dateFacture: facture.dateFacture || '',
                    dateEcheance: facture.dateEcheance || '',
                    modePaiementAttendu: facture.modePaiementAttendu || '',
                    referenceInterne: facture.referenceInterne || '',
                    commentaires: facture.commentaires || '',
                });
            })
            .catch(() => {
                toast.error('Impossible de charger le brouillon');
                navigate('/factures');
            });
    }, [id, isEditing, navigate]);

        useEffect(() => {
        getCabinetSettings()
            .then((response) => setCabinetSettings(response.data))
            .catch(() => setCabinetSettings(null));
    }, []);
// Charger les actions facturables quand le client change
    useEffect(() => {
        if (data.clientId) {
            getActionsFacturables(data.clientId)
                .then((r) => setActions(r.data))
                .catch(() => setActions([]));
        } else {
            setActions([]);
        }
    }, [data.clientId]);

    // Validation par étape
    const canProceed = () => {
        switch (step) {
            case 0: // Source
                if (!data.mode || !data.clientId) return false;
                if (data.mode === 'ACTION' && !data.actionId) return false;
                return true;
            case 1: // Lignes
                if (!data.lignes || data.lignes.length === 0) return false;
                return data.lignes.every((l) => l.description && l.prixUnitaire);
            case 2: // Params
                return true; // tout optionnel
            default:
                return true;
        }
    };

    // Soumission finale
    const handleSubmit = async (actionFinale) => {
        try {
            setSubmitting(true);

            const payload = {
                mode: data.mode,
                clientId: Number(data.clientId),
                actionId: data.actionId ? Number(data.actionId) : null,
                lignes: data.lignes.map((l) => ({
                    description: l.description,
                    quantite: Number(l.quantite) || 1,
                    prixUnitaire: Number(l.prixUnitaire),
                    tauxTva: Number(l.tauxTva) || 20,
                })),
                dateFacture: data.dateFacture || null,
                dateEcheance: data.dateEcheance || null,
                modePaiementAttendu: data.modePaiementAttendu || null,
                referenceInterne: data.referenceInterne || null,
                commentaires: data.commentaires || null,
                actionFinale,
            };

            const res = isEditing
                ? await updateFactureWizard(id, payload)
                : await createFactureWizard(payload);

            const msg = actionFinale === 'BROUILLON'
                ? `Brouillon ${res.data.numero} ${isEditing ? 'modifié' : 'enregistré'}`
                : `Facture ${res.data.numero} émise avec succès !`;
            toast.success(msg);

            navigate(`/factures/${res.data.id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || `Erreur lors de ${isEditing ? 'la modification' : 'la création'}`);
        } finally {
            setSubmitting(false);
        }
    };

    const selectedAction = actions.find((a) => String(a.id) === String(data.actionId));

    return (
        <div>
            {/* Header */}
            <button
                onClick={() => navigate('/factures')}
                className="text-sm text-gray-400 hover:text-indigo-400 transition-colors mb-4 inline-flex items-center gap-1"
            >
                ← Retour aux factures
            </button>
            <h1 className="text-2xl font-bold text-white mb-6">
                {isEditing ? 'Modifier la facture brouillon' : 'Créer une facture'}
            </h1>

            {/* Step indicator */}
            <div className="flex items-center mb-8">
                {STEPS.map((s, i) => (
                    <div key={s.key} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                                i < step ? 'bg-emerald-500 text-white' :
                                    i === step ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20' :
                                        'bg-gray-700 text-gray-400'
                            }`}>
                                {i < step ? '✓' : i + 1}
                            </div>
                            <span className={`text-xs mt-1.5 text-center whitespace-nowrap ${
                                i === step ? 'font-semibold text-indigo-400' : 'text-gray-500'
                            }`}>
                {s.label}
              </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-emerald-500' : 'bg-gray-700'}`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Content: main area + sidebar */}
            <div className="grid grid-cols-12 gap-6">
                {/* Main content */}
                <div className="col-span-8">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-1">{STEPS[step].label}</h2>
                        <p className="text-sm text-gray-400 mb-6">{STEPS[step].desc}</p>

                        {step === 0 && (
                            <FactureStepSource
                                data={data}
                                onChange={setData}
                                clients={clients}
                                actions={actions}
                            />
                        )}

                        {step === 1 && (
                            <FactureStepLines
                                data={data}
                                onChange={setData}
                                selectedAction={selectedAction}
                            />
                        )}

                        {step === 2 && (
                            <FactureStepParams
                                data={data}
                                onChange={setData}
                            />
                        )}

                        {step === 3 && (
                            <FactureStepConfirmation
                                data={data}
                                clients={clients}
                                actions={actions}
                                cabinetSettings={cabinetSettings}
                                onSubmit={handleSubmit}
                                submitting={submitting}
                            />
                        )}

                        {/* Navigation (masquée sur step 4 qui a ses propres boutons) */}
                        {step < 3 && (
                            <div className="flex justify-between mt-8 pt-5 border-t border-gray-700">
                                <button
                                    onClick={() => step > 0 ? setStep(step - 1) : navigate('/factures')}
                                    className="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    {step === 0 ? 'Annuler' : '← Précédent'}
                                </button>
                                <button
                                    onClick={() => setStep(step + 1)}
                                    disabled={!canProceed()}
                                    className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
                                >
                                    Suivant →
                                </button>
                            </div>
                        )}

                        {/* Précédent sur step 4 */}
                        {step === 3 && (
                            <div className="mt-4">
                                <button
                                    onClick={() => setStep(2)}
                                    className="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    ← Précédent
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary sidebar */}
                <div className="col-span-4">
                    <FactureSummaryCard
                        wizardData={data}
                        clients={clients}
                        actions={actions}
                    />
                </div>
            </div>
        </div>
    );
}