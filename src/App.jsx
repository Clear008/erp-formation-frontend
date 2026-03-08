import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import ProtectedRoute from './auth/ProtectedRoute'
import RoleGuard from './auth/RoleGuard'

import AuthLayout from './layouts/AuthLayout'
import AppLayout from './layouts/AppLayout'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import UsersList from './pages/users/UsersList'
import ClientsList from './pages/clients/ClientsList';
import ClientDetails from './pages/clients/ClientDetails';
import ActionsList from './pages/actions/ActionsList';
import ActionCreateWizard from './pages/actions/ActionCreateWizard';
import ActionDetails from './pages/actions/ActionDetails';

export default function App() {
  return (
    <>
      {/* Notifications toast */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#161b27',
            color: '#e8ecf4',
            border: '1px solid #1e2535',
            fontSize: '13px',
            fontFamily: 'Sora, sans-serif',
          },
          success: { iconTheme: { primary: '#34d399', secondary: '#161b27' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#161b27' } },
        }}
      />

      <Routes>
        {/* ─── Routes publiques ────────────────────────────────────── */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* ─── Routes privées (token requis) ──────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
              <Route path="/clients" element={<ClientsList />} />
              <Route path="/clients/:id" element={<ClientDetails />} />
              <Route path="/actions" element={<ActionsList />} />
              <Route path="/actions/new" element={<ActionCreateWizard />} />
              <Route path="/actions/:id" element={<ActionDetails />} />

            {/* Route ADMIN uniquement */}
            <Route
              path="/users"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <UsersList />
                </RoleGuard>
              }
            />
          </Route>
        </Route>

        {/* ─── Redirections par défaut ─────────────────────────────── */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}
