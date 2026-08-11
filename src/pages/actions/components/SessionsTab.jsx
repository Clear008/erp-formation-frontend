import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { getFormateurs } from '../../../api/formateurApi';
import { changeActionStatus } from '../../../api/actionApi';

import {
    changeSessionStatus,
    checkConflict,
    createSession,
    getSessionsByAction,
    suggestActionStatus,
    updateSession,
} from '../../../api/sessionApi';

import {
    ACTION_STATUS,
    STATUS_TRANSITIONS,
} from '../../../utils/constants';

import {
    SESSION_STATUS_OPTIONS,
} from '../../../utils/sessionConstants';

const EMPTY_FORM = {
    dateSession: '',
    formateurId: '',
    tarifJournalier: '',
    fraisDeplacement: '',
    observations: '',
};

const inputClass = `
    w-full px-3 py-2.5
    bg-gray-900 border border-gray-600
    rounded-lg text-sm text-white
    focus:ring-2 focus:ring-indigo-500
    focus:border-transparent outline-none
`;

function formatAmount(value) {
    if (value === null || value === undefined) {
        return '—';
    }

    return `${Number(value).toLocaleString('fr-FR')} DH`;
}

function formatDate(value) {
    if (!value) {
        return '—';
    }

    return new Date(`${value}T00:00:00`)
        .toLocaleDateString('fr-FR');
}

export default function SessionsTab({
                                        action,
                                        onActionReload,
                                    }) {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [formateurs, setFormateurs] = useState([]);
    const [suggestion, setSuggestion] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingSession, setEditingSession] = useState(null);

    const [conflictMessage, setConflictMessage] = useState('');
    const [form, setForm] = useState(EMPTY_FORM);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);

            const [
                sessionsResult,
                formateursResult,
                suggestionResult,
            ] = await Promise.all([
                getSessionsByAction(action.id),
                getFormateurs({ actif: true }),
                suggestActionStatus(action.id),
            ]);

            setSessions(sessionsResult.data || []);
            setFormateurs(formateursResult.data || []);

            const suggestedStatus = suggestionResult.data;

            setSuggestion(
                suggestedStatus &&
                suggestedStatus !== 'AUCUNE_SUGGESTION'
                    ? suggestedStatus
                    : null
            );
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Erreur lors du chargement des sessions'
            );
        } finally {
            setLoading(false);
        }
    }, [action.id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const openCreateModal = () => {
        setEditingSession(null);
        setForm(EMPTY_FORM);
        setConflictMessage('');
        setShowModal(true);
    };

    const openEditModal = (session) => {
        setEditingSession(session);

        setForm({
            dateSession: session.dateSession || '',
            formateurId: session.formateurId
                ? String(session.formateurId)
                : '',
            tarifJournalier:
                session.tarifJournalier ?? '',
            fraisDeplacement:
                session.fraisDeplacement ?? '',
            observations: session.observations || '',
        });

        setConflictMessage('');
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) {
            return;
        }

        setShowModal(false);
        setEditingSession(null);
        setConflictMessage('');
    };

    const verifyConflict = async (nextForm) => {
        /*
         * L'API actuelle de vérification ne permet pas
         * d'exclure la session en cours de modification.
         * En modification, le backend effectue lui-même
         * le contrôle du conflit.
         */
        if (
            editingSession ||
            !nextForm.formateurId ||
            !nextForm.dateSession
        ) {
            setConflictMessage('');
            return;
        }

        try {
            const { data } = await checkConflict(
                nextForm.formateurId,
                nextForm.dateSession
            );

            setConflictMessage(
                data.hasConflict ? data.message : ''
            );
        } catch {
            setConflictMessage('');
        }
    };

    const handleFieldChange = (event) => {
        const { name, value } = event.target;

        const nextForm = {
            ...form,
            [name]: value,
        };

        /*
         * Quand on sélectionne un formateur,
         * récupérer automatiquement son tarif
         * et ses frais par défaut.
         */
        if (name === 'formateurId') {
            const selectedFormateur = formateurs.find(
                (item) => String(item.id) === String(value)
            );

            // Chaque changement de formateur remplace les deux valeurs.
            // Une donnée absente doit vider la case pour ne pas conserver
            // le montant du formateur précédemment sélectionné.
            nextForm.tarifJournalier =
                selectedFormateur?.tarifJournalier ?? '';
            nextForm.fraisDeplacement =
                selectedFormateur?.fraisDeplacement ?? '';
        }

        setForm(nextForm);

        if (
            name === 'formateurId' ||
            name === 'dateSession'
        ) {
            verifyConflict(nextForm);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.dateSession) {
            toast.error(
                'La date de session est obligatoire'
            );
            return;
        }

        if (conflictMessage) {
            toast.error(conflictMessage);
            return;
        }

        const payload = {
            dateSession: form.dateSession,

            formateurId: form.formateurId
                ? Number(form.formateurId)
                : null,

            tarifJournalier:
                form.tarifJournalier === ''
                    ? null
                    : Number(form.tarifJournalier),

            fraisDeplacement:
                form.fraisDeplacement === ''
                    ? null
                    : Number(form.fraisDeplacement),

            observations:
                form.observations.trim() || null,
        };

        try {
            setSaving(true);

            if (editingSession) {
                await updateSession(
                    editingSession.id,
                    payload
                );

                toast.success('Session modifiée');
            } else {
                await createSession(
                    action.id,
                    payload
                );

                toast.success('Session planifiée');
            }

            setShowModal(false);
            setEditingSession(null);
            setConflictMessage('');

            await loadData();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Erreur lors de l’enregistrement'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (
        session,
        statut
    ) => {
        try {
            await changeSessionStatus(
                session.id,
                {
                    statut,
                    observations:
                        session.observations || null,
                }
            );

            toast.success(
                'Statut de la session mis à jour'
            );

            await loadData();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Erreur lors du changement de statut'
            );
        }
    };

    const canApplySuggestion =
        suggestion &&
        STATUS_TRANSITIONS[action.statut]?.includes(
            suggestion
        );

    const applySuggestion = async () => {
        if (!canApplySuggestion) {
            return;
        }

        try {
            await changeActionStatus(
                action.id,
                {
                    newStatus: suggestion,
                    comment:
                        'Statut appliqué selon l’avancement des sessions',
                }
            );

            toast.success(
                'Statut de l’action mis à jour'
            );

            if (onActionReload) {
                await onActionReload();
            }

            await loadData();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Impossible d’appliquer la suggestion'
            );
        }
    };

    if (loading) {
        return (
            <div className="py-12 text-center text-sm text-gray-400">
                Chargement des sessions…
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* En-tête */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="font-semibold text-white">
                        Journées de formation
                    </h3>

                    <p className="text-sm text-gray-400 mt-1">
                        {sessions.length} session(s) planifiée(s)
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="
                        px-4 py-2 bg-indigo-600
                        text-white text-sm font-medium
                        rounded-lg hover:bg-indigo-700
                    "
                >
                    + Planifier une session
                </button>
            </div>

            {/* Suggestion du statut de l'action */}
            {suggestion &&
                suggestion !== action.statut && (
                    <div
                        className="
                            flex flex-wrap items-center
                            justify-between gap-3 p-3
                            bg-blue-500/10
                            border border-blue-500/20
                            rounded-lg
                        "
                    >
                        <div>
                            <p className="text-sm text-blue-300">
                                Statut suggéré selon les sessions :
                                {' '}
                                <strong>
                                    {ACTION_STATUS[suggestion]?.label ||
                                        suggestion}
                                </strong>
                            </p>

                            {!canApplySuggestion && (
                                <p className="text-xs text-blue-400/70 mt-1">
                                    L’action doit avancer par les étapes
                                    intermédiaires du workflow.
                                </p>
                            )}
                        </div>

                        {canApplySuggestion && (
                            <button
                                type="button"
                                onClick={applySuggestion}
                                className="
                                    text-sm font-medium
                                    text-blue-300
                                    hover:text-blue-200
                                "
                            >
                                Appliquer la suggestion
                            </button>
                        )}
                    </div>
                )}

            {/* Liste vide */}
            {sessions.length === 0 ? (
                <div
                    className="
                        py-12 text-center bg-gray-900/40
                        border border-dashed border-gray-700
                        rounded-xl
                    "
                >
                    <p className="text-white font-medium">
                        Aucune session planifiée
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                        Ajoutez la première journée de cette action.
                    </p>
                </div>
            ) : (
                /* Tableau */
                <div className="overflow-x-auto border border-gray-700 rounded-xl">
                    <table className="w-full">
                        <thead className="bg-gray-900/60 text-xs uppercase text-gray-500">
                        <tr>
                            <th className="px-4 py-3 text-left">
                                Date
                            </th>

                            <th className="px-4 py-3 text-left">
                                Formateur
                            </th>

                            <th className="px-4 py-3 text-left">
                                Prestataire payeur
                            </th>

                            <th className="px-4 py-3 text-left">
                                Tarif
                            </th>

                            <th className="px-4 py-3 text-left">
                                Frais
                            </th>

                            <th className="px-4 py-3 text-left">
                                Coût HT
                            </th>

                            <th className="px-4 py-3 text-left">
                                Règlement
                            </th>

                            <th className="px-4 py-3 text-left">
                                Statut
                            </th>

                            <th className="px-4 py-3 text-right">
                                Actions
                            </th>
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-700/60">
                        {sessions.map((session) => (
                            <tr
                                key={session.id}
                                className="bg-gray-800/40"
                            >
                                <td className="px-4 py-3 text-sm text-white">
                                    {formatDate(
                                        session.dateSession
                                    )}
                                </td>

                                <td className="px-4 py-3 text-sm text-gray-300">
                                    {session.formateurNom
                                        ? `${session.formateurPrenom || ''} ${session.formateurNom}`.trim()
                                        : 'Non affecté'}
                                </td>

                                <td className="px-4 py-3 text-sm text-gray-300">
                                    {session.prestataireNom ? (
                                        <div className="flex flex-col">
                                            <span className="text-white">
                                                {session.prestataireNom}
                                            </span>
                                            {session.prestataireCode && (
                                                <span className="text-xs text-gray-500">
                                                    {session.prestataireCode}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-gray-500">
                                            Interne
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-300">
                                    {formatAmount(
                                        session.tarifJournalier
                                    )}
                                </td>

                                <td className="px-4 py-3 text-sm text-gray-300">
                                    {formatAmount(
                                        session.fraisDeplacement
                                    )}
                                </td>

                                <td className="px-4 py-3 text-sm font-medium text-white">
                                    {formatAmount(session.coutHt)}
                                </td>

                                <td className="px-4 py-3 text-xs">
                                    <span className="rounded-full bg-gray-900 px-2 py-1 text-gray-300">
                                        {session.statutReglement === 'A_PAYER' ? 'À payer' : session.statutReglement === 'PAYE' ? 'Payé' : session.statutReglement === 'PAIEMENT_PREPARE' ? 'Paiement préparé' : session.statutReglement === 'MONTANT_A_COMPLETER' ? 'Montant à compléter' : 'Non préparé'}
                                    </span>
                                </td>

                                <td className="px-4 py-3">
                                    <select
                                        value={session.statut}
                                        onChange={(event) =>
                                            handleStatusChange(
                                                session,
                                                event.target.value
                                            )
                                        }
                                        className="
                                                px-2 py-1 rounded-lg
                                                text-xs text-gray-200
                                                bg-gray-900
                                                border border-gray-600
                                            "
                                    >
                                        {SESSION_STATUS_OPTIONS.map(
                                            (option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </td>

                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-3">
                                    {session.statutReglement === 'A_PAYER' && (
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/paiements-prestataires/nouveau?prestataireId=${session.prestataireId}&sessionId=${session.id}&montantHt=${session.coutHt || 0}&objet=${encodeURIComponent(`Session ${action.reference} du ${session.dateSession}`)}`)}
                                            className="text-sm text-emerald-400 hover:text-emerald-300"
                                        >
                                            Préparer le paiement
                                        </button>
                                    )}
                                    {session.paiementId && (
                                        <button type="button" onClick={() => navigate(`/paiements-prestataires/${session.paiementId}`)} className="text-sm text-amber-400 hover:text-amber-300">
                                            Voir le paiement
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            openEditModal(session)
                                        }
                                        className="
                                                text-sm text-indigo-400
                                                hover:text-indigo-300
                                            "
                                    >
                                        Modifier
                                    </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Fenêtre de création/modification */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={closeModal}
                    />

                    <div
                        className="
                            relative bg-gray-800
                            border border-gray-700
                            rounded-xl shadow-2xl
                            max-w-2xl w-full mx-4
                        "
                    >
                        <div className="flex items-center justify-between p-5 border-b border-gray-700">
                            <h2 className="text-lg font-semibold text-white">
                                {editingSession
                                    ? 'Modifier la session'
                                    : 'Planifier une session'}
                            </h2>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-gray-400 hover:text-white text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="p-5 space-y-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">
                                        Date *
                                    </label>

                                    <input
                                        type="date"
                                        name="dateSession"
                                        value={form.dateSession}
                                        min={action.dateDebut || undefined}
                                        max={action.dateFin || undefined}
                                        onChange={handleFieldChange}
                                        className={inputClass}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">
                                        Formateur
                                    </label>

                                    <select
                                        name="formateurId"
                                        value={form.formateurId}
                                        onChange={handleFieldChange}
                                        className={inputClass}
                                    >
                                        <option value="">
                                            — Choisir un formateur —
                                        </option>

                                        {formateurs.map((formateur) => (
                                            <option
                                                key={formateur.id}
                                                value={formateur.id}
                                            >
                                                {formateur.prenom}{' '}
                                                {formateur.nom}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">
                                        Tarif journalier (DH)
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        name="tarifJournalier"
                                        value={form.tarifJournalier}
                                        onChange={handleFieldChange}
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">
                                        Frais de déplacement (DH)
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        name="fraisDeplacement"
                                        value={form.fraisDeplacement}
                                        onChange={handleFieldChange}
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-1">
                                    Observations
                                </label>

                                <textarea
                                    name="observations"
                                    value={form.observations}
                                    onChange={handleFieldChange}
                                    rows={3}
                                    className={inputClass}
                                />
                            </div>

                            {conflictMessage && (
                                <div
                                    className="
                                        p-3 bg-red-500/10
                                        border border-red-500/20
                                        rounded-lg text-sm text-red-300
                                    "
                                >
                                    {conflictMessage}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="
                                        px-4 py-2 text-sm
                                        text-gray-300 bg-gray-700
                                        rounded-lg hover:bg-gray-600
                                    "
                                >
                                    Annuler
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        saving ||
                                        Boolean(conflictMessage)
                                    }
                                    className="
                                        px-4 py-2 text-sm font-medium
                                        text-white bg-indigo-600
                                        rounded-lg hover:bg-indigo-700
                                        disabled:opacity-40
                                    "
                                >
                                    {saving
                                        ? 'Enregistrement…'
                                        : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}