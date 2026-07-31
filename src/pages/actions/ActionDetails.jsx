// src/pages/actions/ActionDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getAction, changeActionStatus, updateActionChecklist } from '../../api/actionApi';
import { useAuth } from '../../auth/AuthContext';
import { ACTION_STATUS, STATUS_TRANSITIONS, WORKFLOW_STEPS, RESTRICTED_ROLES } from '../../utils/constants';
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
    const [showStatusModal, setShowStatusModal] = useState(false);

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

    const transitions = STATUS_TRANSITIONS[action.statut] || [];
    const canRestrict = RESTRICTED_ROLES.includes(user?.role);
    const availableTransitions = transitions.filter((t) => {
        if (['CLOTUREE', 'ANNULEE'].includes(t) && !canRestrict) return false;
        return true;
    });

    const currentStepNum = ACTION_STATUS[action.statut]?.step || 0;

    const handleChangeStatus = async (newStatus, comment) => {
        try {
            await changeActionStatus(id, { newStatus, comment });
            toast.success('Statut mis à jour avec succès');
            setShowStatusModal(false);
            loadAction();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur lors du changement de statut');
        }
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
                {availableTransitions.length > 0 && (
                    <button
                        onClick={() => setShowStatusModal(true)}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Changer le statut
                    </button>
                )}
            </div>

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
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-semibold text-white">Checklist de suivi</h3>
                        <span className="text-sm text-gray-400">
              {action.checklist?.filter((i) => i.done).length}/{action.checklist?.length} complété(s)
            </span>
                    </div>
                    <div className="space-y-2">
                        {action.checklist?.map((item) => (
                            <label
                                key={item.id}
                                className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                                    item.done
                                        ? 'bg-emerald-500/5 border-emerald-500/20'
                                        : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={item.done}
                                    onChange={() => handleToggleChecklist(item.id, item.done)}
                                    className="w-4 h-4 rounded border-gray-600 text-indigo-500 bg-gray-900 focus:ring-indigo-500 focus:ring-offset-0"
                                />
                                <div className="flex-1 min-w-0">
                  <span className={`text-sm ${item.done ? 'line-through text-gray-500' : 'text-white'}`}>
                    {item.label}
                  </span>
                                    {item.required && (
                                        <span className="ml-2 text-[10px] text-red-400 font-semibold uppercase">obligatoire</span>
                                    )}
                                </div>
                                {item.done && item.doneByUsername && (
                                    <span className="text-xs text-gray-500 flex-shrink-0">
                    {item.doneByUsername} · {new Date(item.doneAt).toLocaleDateString('fr-FR')}
                  </span>
                                )}
                            </label>
                        ))}
                    </div>
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
            {showStatusModal && (
                <StatusChangeModal
                    currentStatut={action.statut}
                    transitions={availableTransitions}
                    onSubmit={handleChangeStatus}
                    onClose={() => setShowStatusModal(false)}
                />
            )}
        </div>
    );
}

// ==================== STATUS CHANGE MODAL ====================

function StatusChangeModal({ currentStatut, transitions, onSubmit, onClose }) {
    const { register, handleSubmit, watch } = useForm({
        defaultValues: { newStatus: '', comment: '' },
    });
    const selectedStatus = watch('newStatus');

    const doSubmit = (data) => {
        if (!data.newStatus) return toast.error('Sélectionnez un statut');
        onSubmit(data.newStatus, data.comment);
    };

    const inputClass = "w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-md w-full mx-4">
                <div className="flex items-center justify-between p-5 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Changer le statut</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit(doSubmit)} className="p-5 space-y-4">
                    <p className="text-sm text-gray-400">
                        Statut actuel : <span className="text-white font-medium">{ACTION_STATUS[currentStatut]?.label}</span>
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Nouveau statut</label>
                        <select {...register('newStatus')} className={inputClass}>
                            <option value="">— Choisir un statut —</option>
                            {transitions.map((t) => (
                                <option key={t} value={t}>{ACTION_STATUS[t]?.label || t}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Commentaire</label>
                        <textarea {...register('comment')} rows={3} className={inputClass} placeholder="Raison du changement..." />
                    </div>
                    {selectedStatus === 'ANNULEE' && (
                        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300">
                            <span>⚠️</span>
                            <span>L'annulation est irréversible. Ajoutez un commentaire explicatif.</span>
                        </div>
                    )}
                    <div className="flex justify-end gap-3 pt-3 border-t border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedStatus}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
                        >
                            Confirmer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}