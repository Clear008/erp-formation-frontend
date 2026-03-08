import { forwardRef } from 'react'

/**
 * Champ de saisie réutilisable compatible avec react-hook-form (forwardRef).
 */
const Input = forwardRef(function Input({ label, error, className = '', ...props }, ref) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <input
        ref={ref}
        className={`input ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
})

export default Input
