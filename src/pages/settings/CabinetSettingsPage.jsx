import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getCabinetSettings, updateCabinetSettings } from '../../api/cabinetSettingsApi';
import { compactValue, formatIce, formatPhone } from '../../utils/fieldFormatters';

const inputClass = 'w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

export default function CabinetSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        getCabinetSettings()
            .then(({ data }) => reset({
                ...data,
                ice: formatIce(data.ice || ''),
                telephone: formatPhone(data.telephone || ''),
            }))
            .catch(() => toast.error('Impossible de charger les paramètres du cabinet'))
            .finally(() => setLoading(false));
    }, [reset]);

    const onSubmit = async (values) => {
        try {
            setSaving(true);
            const payload = {
                ...values,
                ice: compactValue(values.ice),
                telephone: compactValue(values.telephone),
            };
            const { data } = await updateCabinetSettings(payload);
            reset({
                ...data,
                ice: formatIce(data.ice || ''),
                telephone: formatPhone(data.telephone || ''),
            });
            toast.success('Paramètres du cabinet enregistrés');
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="py-16 text-center text-sm text-gray-400">Chargement des paramètres...</div>;
    }

    const Field = ({ name, label, required = false, children, className = '' }) => (
        <div className={className}>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
                {label}{required && <span className="text-red-400"> *</span>}
            </label>
            {children || <input {...register(name, required ? { required: `${label} obligatoire` } : {})} className={inputClass} />}
            {errors[name] && <p className="mt-1 text-xs text-red-400">{errors[name].message}</p>}
        </div>
    );

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Paramètres du cabinet</h1>
                <p className="mt-1 text-sm text-gray-400">
                    Ces informations apparaîtront automatiquement sur les factures émises.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <section className="rounded-xl border border-gray-700 bg-gray-800 p-6">
                    <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-gray-300">Identité du cabinet</h2>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <Field name="raisonSociale" label="Raison sociale" required className="md:col-span-2" />
                        <Field name="ice" label="ICE" required>
                            <input
                                {...register('ice', {
                                    required: 'ICE obligatoire',
                                    setValueAs: compactValue,
                                    pattern: { value: /^\d{15}$/, message: 'ICE : exactement 15 chiffres' },
                                })}
                                onInput={(event) => { event.currentTarget.value = formatIce(event.currentTarget.value); }}
                                maxLength={19}
                                inputMode="numeric"
                                placeholder="000 000 000 000 000"
                                className={inputClass}
                            />
                        </Field>
                        <Field name="identifiantFiscal" label="Identifiant fiscal (IF)" />
                        <Field name="registreCommerce" label="Registre de commerce (RC)" />
                        <Field name="cnss" label="CNSS" />
                    </div>
                </section>

                <section className="rounded-xl border border-gray-700 bg-gray-800 p-6">
                    <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-gray-300">Adresse et contact</h2>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <Field name="adresse" label="Adresse" required className="md:col-span-2" />
                        <Field name="ville" label="Ville" required />
                        <Field name="codePostal" label="Code postal" required />
                        <Field name="pays" label="Pays" required />
                        <Field name="email" label="Email">
                            <input {...register('email', { pattern: { value: /^\S+@\S+\.\S+$/, message: 'Adresse email invalide' } })} type="email" className={inputClass} />
                        </Field>
                        <Field name="telephone" label="Téléphone">
                            <input {...register('telephone', { setValueAs: compactValue })} onInput={(event) => { event.currentTarget.value = formatPhone(event.currentTarget.value); }} inputMode="tel" className={inputClass} />
                        </Field>
                        <Field name="logoUrl" label="URL du logo" className="md:col-span-2" />
                    </div>
                </section>

                <div className="flex justify-end">
                    <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                        {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                    </button>
                </div>
            </form>
        </div>
    );
}