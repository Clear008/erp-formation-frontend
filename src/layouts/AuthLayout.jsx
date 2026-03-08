import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
      {/* Décoration de fond */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #3d5eff 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        <Outlet />
      </div>
    </div>
  )
}
