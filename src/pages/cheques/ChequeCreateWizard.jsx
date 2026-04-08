// src/pages/cheques/ChequeCreateWizard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createChequeWizard, getFacturesForDropdown } from '../../api/chequeWizardApi';

import ChequeStepReception from './components/ChequeStepReception';
import ChequeStepDepot from './components/ChequeStepDepot';
import ChequeStepEncaissement from './components/ChequeStepEncaissement';
import ChequeSummaryCard from './components/ChequeSummaryCard';

const STEPS = [
    { key: 'reception',    label: '1. Réception',    desc: 'Informations du chèque reçu' },
    { key: 'depot',        label: '2. Dépôt',        desc: 'Dépôt en banque' },
    { key: 'encaissement', label: '3. Encaissement', desc: 'Confirmation et finalisation' },
];

const INITIAL_DATA = {
    numero: '',
    banque: '',
    emetteur: '',
    montant: '',
    dateReception: new Date().toISOString().split('T')[0],
    factureId: null,
    notes: '',
    dateDepot: '',
    dateEncaissement: '',
};

export default function ChequeCreateWizard() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [data, setData] = useState({ ...INITIAL_DATA });
    const [factures, setFactures] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        getFacturesForDropdown()
            .then((r) => setFactures(r.data))
            .catch(() => {});
    }, []);

    // Validation par étape
    const canProceed = () => {
        switch (step) {
            case 0: // Réception
                return data.numero?.trim() && data.montant && data.dateReception;
            case 1: // Dépôt (optionnel)
                    // On peut passer même sans date de dépôt
                if (data.dateDepot && data.dateReception && data.dateDepot < data.dateReception) return false;
                return true;
            default:
                return true;
        }
    };

    // Statut cible actuel selon les données renseignées
    const getTargetStatut = () => {
        if (data.dateEncaissement && data.dateDepot) return 'ENCAISSE';
        if (data.dateDepot) return 'DEPOSE';
        return 'RECU';
    };

    // Soumission finale
    const handleSubmit = async (statutFinal) => {
        try {
            setSubmitting(true);

            const payload = {
                numero: data.numero,
                banque: data.banque || null,
                emetteur: data.emetteur || null,
                montant: Number(data.montant),
                dateReception: data.dateReception,
                factureId: data.factureId ? Number(data.factureId) : null,
                notes: data.notes || null,
                dateDepot: data.dateDepot || null,
                dateEncaissement: data.dateEncaissement || null,
                statutFinal,
            };

            const res = await createChequeWizard(payload);

            const labels = { RECU: 'reçu', DEPOSE: 'déposé', ENCAISSE: 'encaissé' };
            toast.success(`Chèque ${res.data.numero} enregistré — statut : ${labels[statutFinal] || statutFinal}`);

            navigate('/cheques');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur lors de la création');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <button
                onClick={() => navigate('/cheques')}
                className="text-sm text-gray-400 hover:text-indigo-400 transition-colors mb-4 inline-flex items-center gap-1"
            >
                ← Retour aux chèques
            </button>
            <h1 className="text-2xl font-bold text-white mb-6">Enregistrer un chèque</h1>

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

            {/* Content: main + sidebar */}
            <div className="grid grid-cols-12 gap-6">
                {/* Main */}
                <div className="col-span-8">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-1">{STEPS[step].label}</h2>
                        <p className="text-sm text-gray-400 mb-6">{STEPS[step].desc}</p>

                        {step === 0 && (
                            <ChequeStepReception
                                data={data}
                                onChange={setData}
                                factures={factures}
                            />
                        )}

                        {step === 1 && (
                            <ChequeStepDepot
                                data={data}
                                onChange={setData}
                            />
                        )}

                        {step === 2 && (
                            <ChequeStepEncaissement
                                data={data}
                                onChange={setData}
                                factures={factures}
                                onSubmit={handleSubmit}
                                submitting={submitting}
                            />
                        )}

                        {/* Navigation (masquée sur step 3 qui a ses propres boutons) */}
                        {step < 2 && (
                            <div className="flex justify-between mt-8 pt-5 border-t border-gray-700">
                                <button
                                    onClick={() => step > 0 ? setStep(step - 1) : navigate('/cheques')}
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

                        {/* Précédent sur step 3 */}
                        {step === 2 && (
                            <div className="mt-4">
                                <button
                                    onClick={() => setStep(1)}
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
                    <ChequeSummaryCard
                        data={data}
                        factures={factures}
                        targetStatut={getTargetStatut()}
                    />
                </div>
            </div>
        </div>
    );
}