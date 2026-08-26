import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../auth/AuthContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await login(data)
      toast.success('Connexion réussie !')
      navigate('/dashboard')
    } catch (err) {
      const msg =
        err.response?.status === 401 || err.response?.status === 403
          ? 'Identifiants incorrects. Vérifiez votre nom d\'utilisateur et mot de passe.'
          : 'Erreur de connexion. Le serveur est peut-être indisponible.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Cabinet Formation</h1>
        <p className="text-text-secondary text-sm mt-1">Connectez-vous </p>
      </div>

      {/* Formulaire */}
      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate autoComplete="off">
          <Input
            placeholder="Nom d'utilisateur"
            error={errors.username?.message}
            {...register('username', { required: 'Le nom d\'utilisateur est requis' })}
          />

          {/* Password avec eye icon */}
          <div className="relative">
            <Input

                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Le mot de passe est requis',
                })}
            />

            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                  // Eye OFF
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3l18 18M10.584 10.587A2 2 0 0012 14a2 2 0 001.414-3.414M9.88 9.88A3 3 0 0114.12 14.12M2.458 12C3.732 7.943 7.523 5 12 5c1.54 0 3.02.29 4.39.82M21.542 12c-1.274 4.057-5.065 7-9.542 7-1.54 0-3.02-.29-4.39-.82"
                    />
                  </svg>
              ) : (
                  // Eye ON
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
              )}
            </button>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full justify-center mt-2"
          >
            Se connecter
          </Button>
        </form>
      </div>

    </div>
  )
}
