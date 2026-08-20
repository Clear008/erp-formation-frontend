import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../auth/AuthContext';
import { getActions } from '../api/actionApi';
import { getClients } from '../api/clientApi';
import { getFormateurs } from '../api/formateurApi';
import { getPlanningSessions } from '../api/sessionApi';
import { getFactures } from '../api/factureApi';
import { getAlertes, getAlerteCount } from '../api/alerteApi';
import { getPaiements } from '../api/paiementPrestataireApi';

const CLOSED_ACTIONS = ['CLOTUREE', 'ANNULEE'];
const CLOSED_FACTURES = ['PAYEE'];

function localIso(date) {
  const copy = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return copy.toISOString().slice(0, 10);
}

function formatDate(value) {
  return value
    ? new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : '—';
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString('fr-FR', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  })} DH`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    actions: [], clients: [], formateurs: [], sessions: [],
    factures: [], paiements: [], alertes: [], alertCount: {},
  });

  useEffect(() => {
    const load = async () => {
      const today = new Date();
      const future = new Date();
      future.setDate(future.getDate() + 30);

      const results = await Promise.allSettled([
        getActions({}),
        getClients(),
        getFormateurs({ actif: true }),
        getPlanningSessions({ dateFrom: localIso(today), dateTo: localIso(future) }),
        getFactures({}),
        getPaiements({ statut: 'A_VALIDER' }),
        getAlertes({ priorite: 'HAUTE', traitee: false }),
        getAlerteCount(),
      ]);

      const value = (index, fallback) =>
        results[index].status === 'fulfilled' ? results[index].value.data : fallback;

      setData({
        actions: value(0, []),
        clients: value(1, []),
        formateurs: value(2, []),
        sessions: value(3, []),
        factures: value(4, []),
        paiements: value(5, []),
        alertes: value(6, []),
        alertCount: value(7, {}),
      });

      if (results.every((result) => result.status === 'rejected')) {
        toast.error('Impossible de charger les données du tableau de bord');
      }
      setLoading(false);
    };
    load();
  }, []);

  const now = new Date();
  const today = localIso(now);
  const greeting = now.getHours() < 12 ? 'Bonjour' : now.getHours() < 18 ? 'Bon après-midi' : 'Bonsoir';

  const activeActions = data.actions.filter((item) => !CLOSED_ACTIONS.includes(item.statut));
  const pendingActionValidations = data.actions.filter(
    (item) => item.statut === 'SOUMISE_A_VALIDATION'
  );
  const pendingPaymentValidations = data.paiements.filter(
    (item) => item.statut === 'A_VALIDER'
  );
  const validationRequests = [
    ...pendingActionValidations.map((item) => ({
      key: `action-${item.id}`,
      type: 'Action de formation',
      reference: item.reference,
      title: item.titre,
      subtitle: item.clientRaisonSociale || 'Client non renseigné',
      detail: item.dateDebut ? `${formatDate(item.dateDebut)}${item.dateFin ? ` → ${formatDate(item.dateFin)}` : ''}` : null,
      route: `/actions/${item.id}`,
    })),
    ...pendingPaymentValidations.map((item) => ({
      key: `paiement-${item.id}`,
      type: 'Paiement prestataire',
      reference: item.reference,
      title: item.objet || 'Paiement à valider',
      subtitle: item.prestataireDisplayName || item.prestataireCode || 'Prestataire',
      detail: formatMoney(item.montantTtc),
      route: `/paiements-prestataires/${item.id}`,
    })),
  ];
  const canValidateActions = ['DA', 'DG', 'ADMIN'].includes(user?.role);
  const upcomingSessions = [...data.sessions]
    .filter((item) => item.dateSession >= today && item.statut !== 'ANNULEE')
    .sort((a, b) => a.dateSession.localeCompare(b.dateSession))
    .slice(0, 5);
  const overdueInvoices = data.factures.filter((item) =>
    item.dateEcheance && item.dateEcheance < today && !CLOSED_FACTURES.includes(item.statut)
  );
  const invoiceDeadlines = [...data.factures]
    .filter((item) => item.dateEcheance && !CLOSED_FACTURES.includes(item.statut))
    .sort((a, b) => a.dateEcheance.localeCompare(b.dateEcheance))
    .slice(0, 5);
  const highAlerts = data.alertes.slice(0, 5);

  if (loading) {
    return <div className="py-20 text-center text-sm text-gray-400">Chargement du tableau de bord...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {greeting}, <span className="text-indigo-400">{user?.username}</span>
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Vue d’ensemble de l’activité du cabinet — {now.toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
        <button onClick={() => navigate('/actions/new')}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
          + Nouvelle action
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-7">
        <Kpi label="Actions actives" value={activeActions.length} icon="🎓" onClick={() => navigate('/actions')} />
        <Kpi label="À valider" value={validationRequests.length} icon="✓" tone="violet" onClick={() => navigate('/actions?statut=SOUMISE_A_VALIDATION')} />
        <Kpi label="Sessions à venir" value={data.sessions.length} icon="📅" onClick={() => navigate('/planning')} />
        <Kpi label="Factures en retard" value={overdueInvoices.length} icon="⚠" tone="red" onClick={() => navigate('/factures')} />
        <Kpi label="Alertes" value={data.alertCount.nonTraitees || 0} icon="🔔" tone="amber" onClick={() => navigate('/alertes')} />
        <Kpi label="Clients" value={data.clients.length} icon="🏢" onClick={() => navigate('/clients')} />
        <Kpi label="Formateurs actifs" value={data.formateurs.length} icon="👤" onClick={() => navigate('/formateurs')} />
      </div>

      <section className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-5">
        <SectionHeader
          title={canValidateActions ? 'Demandes à valider' : 'Demandes soumises pour validation'}
          action="Voir les alertes"
          onClick={() => navigate('/alertes')}
        />
        {validationRequests.length === 0 ? (
          <Empty text={canValidateActions
            ? 'Aucune demande en attente de validation.'
            : 'Aucune demande soumise pour validation.'}
          />
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {validationRequests.slice(0, 6).map((item) => (
              <button
                key={item.key}
                onClick={() => navigate(item.route)}
                className="rounded-lg border border-violet-500/20 bg-gray-900/50 p-4 text-left hover:border-violet-400/60 hover:bg-violet-500/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-400">{item.type}</p>
                    <p className="mt-1 text-xs font-medium text-gray-400">{item.reference}</p>
                    <p className="mt-1 text-sm font-semibold text-white">{item.title}</p>
                  </div>
                  <span className="rounded-full bg-violet-500/15 px-2 py-1 text-[10px] font-medium text-violet-300">
                    En attente
                  </span>
                </div>
                <p className="mt-3 text-xs text-gray-400">{item.subtitle}</p>
                {item.detail && <p className="mt-1 text-xs text-gray-500">{item.detail}</p>}
                <p className="mt-3 text-xs font-medium text-violet-400">
                  {canValidateActions ? 'Ouvrir pour décider →' : 'Consulter la demande →'}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-gray-700 bg-gray-800 p-5 xl:col-span-2">
          <SectionHeader title="Prochaines sessions" action="Voir le planning" onClick={() => navigate('/planning')} />
          {upcomingSessions.length === 0 ? (
            <Empty text="Aucune session prévue dans les 30 prochains jours." />
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {upcomingSessions.map((session) => (
                <button key={session.id} onClick={() => navigate(`/actions/${session.actionId}`)}
                        className="rounded-lg border border-gray-700 bg-gray-900/50 p-4 text-left hover:border-indigo-500/40 hover:bg-gray-900">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{session.actionTitre || session.actionReference}</p>
                    <span className="rounded-full bg-indigo-500/10 px-2 py-1 text-[10px] text-indigo-400">{session.statutLabel}</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">{session.actionReference}</p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                    <span>📅 {formatDate(session.dateSession)}</span>
                    <span>👤 {session.formateurNom ? `${session.formateurPrenom || ''} ${session.formateurNom}`.trim() : 'Non affecté'}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-gray-700 bg-gray-800 p-5">
          <SectionHeader title="Alertes prioritaires" action="Voir tout" onClick={() => navigate('/alertes')} />
          {highAlerts.length === 0 ? (
            <Empty text="Aucune alerte prioritaire." />
          ) : (
            <div className="mt-4 space-y-3">
              {highAlerts.map((alert) => (
                <button key={alert.cle} onClick={() => navigate(alert.resourceUrl)}
                        className="w-full rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-left hover:bg-red-500/10">
                  <p className="text-sm font-medium text-white">{alert.titre}</p>
                  <p className="mt-1 truncate text-xs text-gray-400">{alert.description}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-wide text-red-400">{alert.moduleLabel}</p>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-gray-700 bg-gray-800 p-5">
          <SectionHeader title="Échéances factures" action="Voir les factures" onClick={() => navigate('/factures')} />
          {invoiceDeadlines.length === 0 ? (
            <Empty text="Aucune échéance de facture." />
          ) : (
            <div className="mt-4 divide-y divide-gray-700">
              {invoiceDeadlines.map((facture) => (
                <button key={facture.id} onClick={() => navigate(`/factures/${facture.id}`)}
                        className="flex w-full items-center justify-between gap-4 py-3 text-left hover:bg-gray-700/20">
                  <div>
                    <p className="text-sm font-medium text-white">{facture.numero}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{facture.clientRaisonSociale || 'Client'} · échéance {formatDate(facture.dateEcheance)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{formatMoney(facture.montantTtc)}</p>
                    <span className={`text-xs ${facture.dateEcheance < today ? 'text-red-400' : 'text-indigo-400'}`}>{facture.statutLabel || facture.statut}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-gray-700 bg-gray-800 p-5">
          <h2 className="text-sm font-semibold text-white">Actions rapides</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Quick label="Nouvelle action" icon="🎓" onClick={() => navigate('/actions/new')} />
            <Quick label="Nouveau client" icon="🏢" onClick={() => navigate('/clients?nouveau=1')} />
            <Quick label="Créer une facture" icon="📄" onClick={() => navigate('/factures/nouvelle')} />
            <Quick label="Préparer un paiement" icon="💳" onClick={() => navigate('/paiements-prestataires/nouveau')} />
          </div>
        </section>
      </div>
    </div>
  );
}

function Kpi({ label, value, icon, tone = 'indigo', onClick }) {
  const tones = {
    indigo: 'border-gray-700 text-indigo-400',
    red: 'border-red-500/30 text-red-400',
    amber: 'border-amber-500/30 text-amber-400',
    violet: 'border-violet-500/30 text-violet-400',
  };
  return (
    <button onClick={onClick} className={`rounded-xl border bg-gray-800 p-4 text-left hover:bg-gray-700/70 ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <span className="text-lg">{icon}</span>
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <p className="mt-3 text-xs text-gray-400">{label}</p>
    </button>
  );
}

function SectionHeader({ title, action, onClick }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <button onClick={onClick} className="text-xs font-medium text-indigo-400 hover:text-indigo-300">{action} →</button>
    </div>
  );
}

function Quick({ label, icon, onClick }) {
  return (
    <button onClick={onClick} className="rounded-lg border border-gray-700 bg-gray-900/50 p-5 text-center hover:border-indigo-500/40 hover:bg-gray-900">
      <span className="text-xl">{icon}</span>
      <p className="mt-2 text-xs font-medium text-gray-200">{label}</p>
    </button>
  );
}

function Empty({ text }) {
  return <div className="py-10 text-center text-sm text-gray-500">{text}</div>;
}
