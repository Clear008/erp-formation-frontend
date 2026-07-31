// src/pages/actions/ActionCreateWizard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createAction } from '../../api/actionApi';
import { getClients, getContacts } from '../../api/clientApi';
import { ACTION_TYPE_OPTIONS } from '../../utils/constants';

const STEPS = [
    { key: 'qualification', label: '1. Qualification', desc: 'Client et titre de la formation' },
    { key: 'conception',    label: '2. Conception',    desc: 'Description, type et lieu' },
    { key: 'preparation',   label: '3. Préparation',   desc: 'Dates et montant estimé' },
    { key: 'validation',    label: '4. Validation',    desc: 'Vérification et création' },
];

export default function ActionCreateWizard() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [clients, setClients] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        titre: '', description: '', clientId: '', contactId: '',
        type: 'INTRA', lieu: '', dateDebut: '', dateFin: '', montantEstime: '',
    });

    useEffect(() => {
        getClients().then(({ data }) => setClients(data)).catch(() => {});
    }, []);

    useEffect(() => {
        if (form.clientId) {
            getContacts(form.clientId).then(({ data }) => setContacts(data)).catch(() => setContacts([]));
        } else {
            setContacts([]);
            setForm((f) => ({ ...f, contactId: '' }));
        }
    }, [form.clientId]);

    const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    const inputClass = "w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none";
    const labelClass = "block text-sm font-medium text-gray-300 mb-1";

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const payload = {
                ...form,
                clientId: form.clientId ? Number(form.clientId) : null,
                contactId: form.contactId ? Number(form.contactId) : null,
                montantEstime: form.montantEstime ? Number(form.montantEstime) : null,
                dateDebut: form.dateDebut || null,
                dateFin: form.dateFin || null,
            };
            const { data } = await createAction(payload);
            toast.success(`Action ${data.reference} crée avec succès !`);
            navigate(`/actions/${data.id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur lors de la création');
        } finally {
            setSubmitting(false);
        }
    };

    const canNext = step === 0 ? form.titre.trim().length > 0 : true;

    return (
        <div className="max-w-3xl mx-auto">
            <button onClick={() => navigate('/actions')} className="text-sm text-gray-400 hover:text-indigo-400 transition-colors mb-4 inline-flex items-center gap-1">
                ← Retour aux actions
            </button>
            <h1 className="text-2xl font-bold text-white mb-8">Créer une action de formation</h1>

            {/* Step indicator */}
            <div className="flex items-center mb-8">
                {STEPS.map((s, i) => (
                    <div key={s.key} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                                i < step ? 'bg-emerald-500 text-white' :
                                    i === step ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20' :
                                        'bg-gray-700 text-gray-400'
                            }`}>
                                {i < step ? '✓' : i + 1}
                            </div>
                            <span className={`text-xs mt-1.5 text-center ${
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

            {/* Step content */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-1">{STEPS[step].label}</h2>
                <p className="text-sm text-gray-400 mb-6">{STEPS[step].desc}</p>

                {/* Step 1: Qualification */}
                {step === 0 && (
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Titre de la formation <span className="text-red-400">*</span></label>
                            <input value={form.titre} onChange={set('titre')} className={inputClass} placeholder="Ex: Formation Management d'équipe" />
                        </div>
                        <div>
                            <label className={labelClass}>Client</label>
                            <select value={form.clientId} onChange={set('clientId')} className={inputClass}>
                                <option value="">— Sélectionner un client —</option>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>{c.raisonSociale} ({c.code})</option>
                                ))}
                            </select>
                        </div>
                        {contacts.length > 0 && (
                            <div>
                                <label className={labelClass}>Contact</label>
                                <select value={form.contactId} onChange={set('contactId')} className={inputClass}>
                                    <option value="">— Sélectionner un contact —</option>
                                    {contacts.map((c) => (
                                        <option key={c.id} value={c.id}>{c.prenom} {c.nom} — {c.fonction || ''}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Conception */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Description / Objectifs</label>
                            <textarea value={form.description} onChange={set('description')} rows={4} className={inputClass} placeholder="Objectifs et contenu de la formation..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Type</label>
                                <select value={form.type} onChange={set('type')} className={inputClass}>
                                    {ACTION_TYPE_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Lieu</label>
                                <input value={form.lieu} onChange={set('lieu')} className={inputClass} placeholder="Ville ou adresse" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Préparation */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Date de début</label>
                                <input type="date" value={form.dateDebut} onChange={set('dateDebut')} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Date de fin</label>
                                <input type="date" value={form.dateFin} onChange={set('dateFin')} className={inputClass} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Montant estimé (DH)</label>
                            <input type="number" value={form.montantEstime} onChange={set('montantEstime')} className={inputClass} placeholder="0.00" />
                        </div>
                    </div>
                )}

                {/* Step 4: Validation */}
                {step === 3 && (
                    <div className="space-y-4">
                        <div className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                            <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">Récapitulatif</h3>
                            <dl className="grid grid-cols-2 gap-4 text-sm">
                                {[
                                    ['Titre', form.titre],
                                    ['Client', clients.find((c) => String(c.id) === form.clientId)?.raisonSociale || '—'],
                                    ['Type', form.type],
                                    ['Lieu', form.lieu || '—'],
                                    ['Date début', form.dateDebut || '—'],
                                    ['Date fin', form.dateFin || '—'],
                                    ['Montant', form.montantEstime ? `${Number(form.montantEstime).toLocaleString('fr-FR')} DH` : '—'],
                                ].map(([label, value]) => (
                                    <div key={label}>
                                        <dt className="text-gray-500">{label}</dt>
                                        <dd className="font-medium text-white mt-0.5">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                            {form.description && (
                                <div className="mt-4 pt-4 border-t border-gray-700">
                                    <dt className="text-gray-500 text-sm">Description</dt>
                                    <dd className="text-sm text-gray-300 mt-1 whitespace-pre-wrap">{form.description}</dd>
                                </div>
                            )}
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-sm text-indigo-300">
                            <span>ℹ️</span>
                            <span>L'action sera crée avec le statut <strong>« En qualification »</strong>. Une checklist de 15 éléments sera auto-générée.</span>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-5 border-t border-gray-700">
                    <button
                        onClick={() => step > 0 ? setStep(step - 1) : navigate('/actions')}
                        className="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        {step === 0 ? 'Annuler' : '← Précédent'}
                    </button>
                    {step < STEPS.length - 1 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={!canNext}
                            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
                        >
                            Suivant →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                        >
                            {submitting ? 'Création en cours...' : '✓ Créer l\'action'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}