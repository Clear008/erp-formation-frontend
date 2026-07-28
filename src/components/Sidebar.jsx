import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { isAdmin, ROLE_COLORS, ROLE_LABELS } from '../utils/roles'

const NavItem = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                    ? 'bg-brand-600/15 text-brand-400 border border-brand-600/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
            }`
        }
    >
        <span className="w-4 h-4 flex-shrink-0">{icon}</span>
        {label}
    </NavLink>
)

export default function Sidebar() {
    const { user } = useAuth()

    return (
        <aside className="w-60 flex-shrink-0 bg-surface-card border-r border-surface-border flex flex-col h-screen sticky top-0">
            {/* Logo */}
            <div className="px-5 py-5 border-b border-surface-border">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-text-primary leading-tight">Cabinet</p>
                        <p className="text-xs text-text-secondary leading-tight">Formation ERP</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-3 mb-2">
                    Principal
                </p>

                <NavItem
                    to="/dashboard"
                    label="Tableau de bord"
                    icon={
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    }
                />

                <NavItem
                    to="/profile"
                    label="Mon Profil"
                    icon={
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    }
                />

                {/* ============ SECTION MÉTIER ============ */}
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-3 mt-4 mb-2">
                    Métier
                </p>

                <NavItem
                    to="/clients"
                    label="Clients"
                    icon={
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    }
                />

                <NavItem
                    to="/actions"
                    label="Actions de formation"
                    icon={
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    }
                />


                <NavItem
                    to="/formateurs"
                    label="Formateurs"
                    icon={
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                  d="M17 20h5v-1a4 4 0 00-3-3.87M9 20H4v-1a4 4 0 013-3.87m10-4.13a4 4 0 11-8 0 4 4 0 018 0zM3 7a4 4 0 118 0 4 4 0 01-8 0z"/>
                        </svg>
                    }
                />
                <NavItem
                    to="/prestataires"
                    label="Prestataires"
                    icon={
                        <svg
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M20 7h-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM10 7V5h4v2m-2 5v2m-10-3h20"
                            />
                        </svg>
                    }
                />

                <NavItem
                    to="/planning"
                    label="Planning"
                    icon={
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z"/>
                        </svg>
                    }
                />

                <NavItem
                    to="/factures"
                    label="Factures"
                    icon={
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"/>
                        </svg>
                    }
                />

                <NavItem
                    to="/cheques"
                    label="Chèques"
                    icon={
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                  d="M17 9V7a4 4 0 10-8 0v2M5 9h14l-1 10H6L5 9z"/>
                        </svg>
                    }
                />

                {/* ============ GED Center ============ */}
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-3 mt-4 mb-2">
                    Outils
                </p>

                <NavItem
                    to="/documents"
                    label="Documents"
                    icon={
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
                            />
                        </svg>
                    }
                />

                {/* ============ SECTION ADMIN ============ */}
                {user && isAdmin(user.role) && (
                    <>
                        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-3 mt-4 mb-2">
                            Administration
                        </p>
                        <NavItem
                            to="/users"
                            label="Utilisateurs"
                            icon={
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            }
                        />
                    </>
                )}
            </nav>

            {/* Profil utilisateur en bas */}
            {user && (
                <div className="px-3 py-4 border-t border-surface-border">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-muted">
                        <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-600/30 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-brand-400">
                {user.username?.[0]?.toUpperCase()}
              </span>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-medium text-text-primary truncate">{user.username}</p>
                            <span className={`badge border text-[10px] mt-0.5 ${ROLE_COLORS[user.role]}`}>
                {ROLE_LABELS[user.role] || user.role}
              </span>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    )
}