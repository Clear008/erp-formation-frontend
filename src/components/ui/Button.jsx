/**
 * Composant Button réutilisable.
 * variant: 'primary' | 'secondary' | 'danger' | 'ghost'
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  ...props
}) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-muted px-4 py-2 rounded-lg transition-all',
  }

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm',
    lg: 'text-base px-6 py-3',
  }

  return (
    <button
      className={`inline-flex items-center gap-2 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
