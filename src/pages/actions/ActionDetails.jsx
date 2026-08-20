// src/pages/actions/ActionDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    getAction,
    updateActionChecklist,
    submitActionForValidation,
    validateTrainingAction,
    rejectTrainingAction,
    closeTrainingAction,
    cancelTrainingAction,
} from '../../api/actionApi';
import { useAuth } from '../../auth/AuthContext';
import { ACTION_STATUS, WORKFLOW_STEPS, RESTRICTED_ROLES } from '../../utils/constants';
import DocumentsTab from '../documents/components/DocumentsTab';
import SessionsTab from './components/SessionsTab';


function StatusBadge({ statut }) {
    const config = ACTION_STATUS[statut] || { label: statut, color: 'bg-gray-700 text-gray-300' };
    return (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
    );
}

export default function ActionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [action, setAction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Infos');
    const [workflowDialog, setWorkflowDialog] = useState(null);

    const loadAction = async () => {
        try {
            const { data } = await getAction(id);
            setAction(data);
        } catch {
            toast.error('Action introuvable');
            navigate('/actions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAction(); }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }
    if (!action) return null;

    const canMakeDecision = RESTRICTED_ROLES.includes(user?.role);
    const canCancel = canMakeDecision && !['CLOTUREE', 'ANNULEE'].includes(action.statut);

    const currentStepNum = ACTION_STATUS[action.statut]?.step || 0;

    const checklistPhaseOrder = [
        'QUALIFICATION',
        'CONCEPTION',
        'PREPARATION',
        'REALISATION',
        'CLOTURE',
    ];

    const checklistByPhase = checklistPhaseOrder.map((phase) => {
        const items = action.checklist?.filter(
            (item) => item.phase === phase
        ) || [];

        return {
            phase,
            label: items[0]?.phaseLabel || phase,
            items,
            done: items.filter((item) => item.done).length,
        };
    });

    const executeWorkflowAction = async (request, successMessage) => {
        try {
            await request();
            toast.success(successMessage);
            setWorkflowDialog(null);
            await loadAction();
        } catch (err) {
            toast.error(err.response?.data?.message || "L'action n'a pas pu être exécutée");
        }
    };

    const handleReasonSubmit = (comment) => {
        if (workflowDialog === 'reject') {
            return executeWorkflowAction(
                () => rejectTrainingAction(id, { comment }),
                'Action renvoyée en conception'
            );
        }
        return executeWorkflowAction(
            () => cancelTrainingAction(id, { comment }),
            'Action annulée'
        );
    };

    const handleToggleChecklist = async (itemId, currentDone) => {
        try {
            await updateActionChecklist(id, [{ id: itemId, done: !currentDone }]);
            loadAction();
        } catch {
            toast.error('Erreur');
        }
    };

    const TABS = [
        { key: 'Infos', label: 'Infos' },
        { key: 'Sessions', label: 'Sessions' },
        { key: 'Checklist', label: 'Checklist' },
        { key: 'Historique', label: 'Historique' },
        { key: 'Documents', label: 'Documents' },
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <button onClick={() => navigate('/actions')} className="text-sm text-gray-400 hover:text-indigo-400 transition-colors mb-1 inline-flex items-center gap-1">
                        ← Retour aux actions
                    </button>
                    <h1 className="text-2xl font-bold text-white">{action.reference}</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{action.titre}</p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                    {action.statut === 'EN_CONCEPTION' && (
                        <button
                            onClick={() => executeWorkflowAction(
                                () => submitActionForValidation(id),
                                'Action soumise pour validation'
                            )}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                        >
                            Soumettre pour validation
                        </button>
                    )}
                    {action.statut === 'SOUMISE_A_VALIDATION' && canMakeDecision && (
                        <>
                            <button
                                onClick={() => setWorkflowDialog('reject')}
                                className="px-4 py-2 bg-gray-700 text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-600"
                            >
                                Refuser
                            </button>
                            <button
                                onClick={() => executeWorkflowAction(
                                    () => validateTrainingAction(id),
                                    'Action validée'
                                )}
                                className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
                            >
                                Valider
                            </button>
                        </>
                    )}
                    {action.statut === 'REALISEE' && canMakeDecision && (
                        <button
                            onClick={() => executeWorkflowAction(
                                () => closeTrainingAction(id),
                                'Action clôturée'
                            )}
                            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
                        >
                            Clôturer
                        </button>
                    )}
                    {canCancel && (
                        <button
                            onClick={() => setWorkflowDialog('cancel')}
                            className="px-4 py-2 border border-red-500/40 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/10"
                        >
                            Annuler l'action
                        </button>
                    )}
                </div>            </div>

            {/* Workflow Progress */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                    {WORKFLOW_STEPS.map((ws, i) => {
                        const wsStep = ACTION_STATUS[ws.statut]?.step || 0;
                        const isActive = ws.statut === action.statut ||
                            (action.statut === 'PARTIELLEMENT_REALISEE' && ws.key === 'realisation');
                        const isPast = wsStep < currentStepNum;
                        const isCancelled = action.statut === 'ANNULEE';

                        return (
                            <div key={ws.key} className="flex items-center flex-1">
                                <div className="flex flex-col items-center">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                        isCancelled ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30' :
                                            isActive ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20' :
                                                isPast ? 'bg-emerald-500 text-white' :
                                                    'bg-gray-700 text-gray-500'
                                    }`}>
                                        {isPast && !isCancelled ? '✓' : i + 1}
                                    </div>
                                    <span className={`text-[11px] mt-1.5 text-center leading-tight ${
                                        isActive ? 'font-bold text-indigo-400' : 'text-gray-500'
                                    }`}>
                    {ws.label}
                  </span>
                                </div>
                                {i < WORKFLOW_STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-2 ${isPast && !isCancelled ? 'bg-emerald-500' : 'bg-gray-700'}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Warnings */}
            {action.warnings?.length > 0 && (
                <div className="space-y-2 mb-6">
                    {action.warnings.map((w, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-300">
                            <span className="mt-0.5">⚠️</span>
                            <span>{w}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Current status */}
            <div className="mb-6">
                <StatusBadge statut={action.statut} />
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-700 mb-6">
                <nav className="flex gap-6">
                    {TABS.map((tab) => (
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

            {/* ==================== TAB: INFOS ==================== */}
            {activeTab === 'Infos' && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {[
                            ['Client', action.clientRaisonSociale],
                            ['Contact', action.contactFullName],
                            ['Type', action.type],
                            ['Lieu', action.lieu],
                            ['Date début', action.dateDebut],
                            ['Date fin', action.dateFin],
                            ['Montant estimé', action.montantEstime ? `${Number(action.montantEstime).toLocaleString('fr-FR')} DH` : null],
                            ['Créé par', action.createdByUsername],
                            ['Créé le', action.createdAt ? new Date(action.createdAt).toLocaleString('fr-FR') : null],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
                                <dd className="mt-1 text-sm text-white">{value || '—'}</dd>
                            </div>
                        ))}
                    </div>
                    {action.description && (
                        <div className="mt-6 pt-5 border-t border-gray-700">
                            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Description</h3>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{action.description}</p>
                        </div>
                    )}
                </div>
            )}

            {/* ==================== TAB: SESSIONS ==================== */}
            {activeTab === 'Sessions' && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <SessionsTab
                        action={action}
                        onActionReload={loadAction}
                    />
                </div>
            )}

            {/* ==================== TAB: CHECKLIST ==================== */}
            {activeTab === 'Checklist' && (
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="font-semibold text-white">
                                Checklist guidée par phase
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">
                                Les éléments futurs restent visibles, mais ne génèrent
                                pas encore d’alerte.
                            </p>
                        </div>

                        <div className="px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                            <p className="text-xs text-indigo-300">
                                Phase actuelle
                            </p>
                            <p className="text-sm font-semibold text-indigo-200">
                                {action.currentChecklistPhaseLabel || '—'}
                            </p>
                        </div>
                    </div>

                    {checklistByPhase.map((group) => {
                        const currentPhaseIndex = checklistPhaseOrder.indexOf(
                            action.currentChecklistPhase
                        );
                        const groupIndex = checklistPhaseOrder.indexOf(
                            group.phase
                        );
                        const isCurrent =
                            group.phase === action.currentChecklistPhase;
                        const isFuture =
                            currentPhaseIndex >= 0 &&
                            groupIndex > currentPhaseIndex;

                        return (
                            <section
                                key={group.phase}
                                className={
                                    'border rounded-xl overflow-hidden ' +
                                    (isCurrent
                                        ? 'border-indigo-500/50 bg-indigo-500/5 '
                                        : 'border-gray-700 bg-gray-800 ') +
                                    (isFuture ? 'opacity-65' : '')
                                }
                            >
                                <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-700/70">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-white">
                                            {group.label}
                                        </h4>

                                        {isCurrent && (
                                            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full bg-indigo-500/20 text-indigo-300">
                                                Phase actuelle
                                            </span>
                                        )}

                                        {isFuture && (
                                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-gray-700 text-gray-400">
                                                À venir
                                            </span>
                                        )}
                                    </div>

                                    <span className="text-xs text-gray-400">
                                        {group.done}/{group.items.length}
                                    </span>
                                </div>

                                <div className="p-4 space-y-2">
                                    {group.items.map((item) => (
                                        <label
                                            key={item.id}
                                            className={
                                                'flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ' +
                                                (item.done
                                                    ? 'bg-emerald-500/5 border-emerald-500/20'
                                                    : 'bg-gray-900/50 border-gray-700 hover:border-gray-600')
                                            }
                                        >
                                            <input
                                                type="checkbox"
                                                checked={item.done}
                                                onChange={() =>
                                                    handleToggleChecklist(
                                                        item.id,
                                                        item.done
                                                    )
                                                }
                                                className="w-4 h-4 rounded border-gray-600 text-indigo-500 bg-gray-900 focus:ring-indigo-500 focus:ring-offset-0"
                                            />

                                            <div className="flex-1 min-w-0">
                                                <span
                                                    className={
                                                        'text-sm ' +
                                                        (item.done
                                                            ? 'line-through text-gray-500'
                                                            : 'text-white')
                                                    }
                                                >
                                                    {item.label}
                                                </span>

                                                {item.required && (
                                                    <span className="ml-2 text-[10px] text-red-400 font-semibold uppercase">
                                                        obligatoire
                                                    </span>
                                                )}
                                            </div>

                                            {item.done &&
                                                item.doneByUsername && (
                                                    <span className="text-xs text-gray-500 flex-shrink-0">
                                                        {item.doneByUsername}
                                                        {' · '}
                                                        {new Date(
                                                            item.doneAt
                                                        ).toLocaleDateString(
                                                            'fr-FR'
                                                        )}
                                                    </span>
                                                )}
                                        </label>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            )}
            {/* ==================== TAB: HISTORIQUE ==================== */}
            {activeTab === 'Historique' && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h3 className="font-semibold text-white mb-5">Historique des changements de statut</h3>
                    {(!action.history || action.history.length === 0) ? (
                        <p className="text-sm text-gray-400">Aucun historique</p>
                    ) : (
                        <div className="space-y-0">
                            {action.history.map((h, i) => (
                                <div key={h.id} className="flex items-start gap-4 pb-5 relative">
                                    {/* Timeline line */}
                                    {i < action.history.length - 1 && (
                                        <div className="absolute left-[7px] top-6 bottom-0 w-px bg-gray-700" />
                                    )}
                                    {/* Dot */}
                                    <div className="w-4 h-4 rounded-full bg-indigo-500/20 ring-2 ring-indigo-500 flex-shrink-0 mt-0.5" />
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {h.oldStatusLabel && (
                                                <>
                                                    <span className="text-sm text-gray-500">{h.oldStatusLabel}</span>
                                                    <span className="text-gray-600">→</span>
                                                </>
                                            )}
                                            <StatusBadge statut={h.newStatus} />
                                        </div>
                                        {h.comment && (
                                            <p className="text-sm text-gray-400 mt-1">« {h.comment} »</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1.5">
                                            par <span className="text-gray-400">{h.changedByUsername}</span> · {new Date(h.changedAt).toLocaleString('fr-FR')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {activeTab === 'Documents' && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <DocumentsTab
                        entityType="ACTION"
                        entityId={action.id}
                    />
                </div>
            )}

            {/* ==================== STATUS CHANGE MODAL ==================== */}
            {workflowDialog && (
                <WorkflowReasonModal
                    type={workflowDialog}
                    onSubmit={handleReasonSubmit}
                    onClose={() => setWorkflowDialog(null)}
                />
            )}        </div>
    );
}

// ==================== WORKFLOW REASON MODAL ====================

function WorkflowReasonModal({ type, onSubmit, onClose }) {
    const [comment, setComment] = useState('');
    const isCancellation = type === 'cancel';
    const title = isCancellation ? "Annuler l'action" : 'Refuser la validation';
    const label = isCancellation ? "Motif d'annulation" : 'Motif du refus';

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!comment.trim()) {
            toast.error(`${label} obligatoire`);
            return;
        }
        onSubmit(comment.trim());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-md w-full mx-4">
                <div className="flex items-center justify-between p-5 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            {label} *
                        </label>
                        <textarea
                            value={comment}
                            onChange={(event) => setComment(event.target.value)}
                            rows={4}
                            required
                            className="w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Expliquez la décision..."
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-3 border-t border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">
                            Retour
                        </button>
                        <button type="submit" className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${isCancellation ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                            Confirmer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}