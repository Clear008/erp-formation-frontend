import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { usersApi } from '../../api/usersApi'
import { ROLES, ROLE_LABELS } from '../../utils/roles'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

/**
 * Formulaire de création / modification d'un utilisateur.
 * En mode édition (user != null), le mot de passe est optionnel.
 */
export default function UserForm({ user, onSuccess, onCancel }) {
  const isEdit = !!user

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      role: 'ASSISTANTE',
    },
  })

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (user) {
      // Mode édition : préremplir
      reset({
        username: user.username || '',
        email: user.email || '',
        password: '',
        role: user.role || 'ASSISTANTE',
      })
    } else {
      // ✅ Mode création : vider le formulaire
      reset({
        username: '',
        email: '',
        password: '',
        role: 'ASSISTANTE',
      })
    }
  }, [user, reset])

  const onSubmit = async (data) => {
    try {
      // En modification, on n'envoie pas le mot de passe s'il est vide
      const payload = { ...data }
      if (isEdit && !payload.password) {
        delete payload.password
      }

      if (isEdit) {
        await usersApi.update(user.id, payload)
        toast.success('Utilisateur modifié avec succès')
      } else {
        await usersApi.create(payload)
        toast.success('Utilisateur créé avec succès')
      }
      onSuccess()
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        `Erreur lors de ${isEdit ? 'la modification' : 'la création'}`
      toast.error(msg)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate autoComplete="off">
      <Input
        label="Nom d'utilisateur"
        placeholder="john.doe"
        error={errors.username?.message}
        {...register('username', {
          required: "Le nom d'utilisateur est requis",
          minLength: { value: 3, message: 'Minimum 3 caractères' },
        })}
      />

      <Input
        label="Adresse e-mail"
        type="email"
        placeholder="john@formation.com"
        error={errors.email?.message}
        {...register('email', {
          required: "L'adresse e-mail est requise",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'E-mail invalide',
          },
        })}
      />

      <Input
          label={isEdit ? 'Nouveau mot de passe (laisser vide pour conserver)' : 'Mot de passe'}
          type="password"
          autoComplete="new-password"
          placeholder=""
          error={errors.password?.message}
          {...register('password', {
            ...(isEdit
                ? {}
                : {
                  required: 'Le mot de passe est requis',
                  minLength: { value: 6, message: 'Minimum 6 caractères' },
                }),
          })}
      />

      {/* Sélecteur de rôle */}
      <div>
        <label className="label">Rôle</label>
        <select
          className="input"
          {...register('role', { required: 'Le rôle est requis' })}
        >
          {Object.keys(ROLES).map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        {errors.role && <p className="mt-1 text-xs text-red-400">{errors.role.message}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={isSubmitting} className="flex-1 justify-center">
          {isEdit ? 'Enregistrer' : 'Créer l\'utilisateur'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
