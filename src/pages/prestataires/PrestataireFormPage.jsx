// src/pages/prestataires/PrestataireFormPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getPrestataire, createPrestataire, updatePrestataire } from '../../api/prestataireApi';
import { CATEGORIE_OPTIONS, NATURE_OPTIONS, REGIME_OPTIONS } from '../../utils/prestataireConstants';

export default function PrestataireFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const [loading, setLoading] = useState(isEdit);

    const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            categorie: 'SERVICE', natureJuridique: 'PERSONNE_PHYSIQUE', regimePrestataire: 'PARTICULIER',
            activite: '', nom: '', prenom: '', cin: '', raisonSociale: '', nomCommercial: '',
            ice: '', identifiantFiscal: '', registreCommerce: '',
            email: '', telephone: '', adresse: '', ville: '', pays: 'Maroc', notes: '',
        },
    });

    const nature = watch('natureJuridique');
    const isPhysique = nature === 'PERSONNE_PHYSIQUE';

    useEffect(() => {
        if (isEdit) {
            getPrestataire(id).then(({ data }) => {
                reset({
                    categorie: data.categorie, natureJuridique: data.natureJuridique,
                    regimePrestataire: data.regimePrestataire, activite: data.activite || '',
                    nom: data.nom || '', prenom: data.prenom || '', cin: data.cin || '',
                    raisonSociale: data.raisonSociale || '', nomCommercial: data.nomCommercial || '',
                    ice: data.ice || '', identifiantFiscal: data.identifiantFiscal || '',
                    registreCommerce: data.registreCommerce || '',
                    email: data.email || '', telephone: data.telephone || '',
                    adresse: data.adresse || '', ville: data.ville || '',
                    pays: data.pays || 'Maroc', notes: data.notes || '',
                });
                setLoading(false);
            }).catch(() => { toast.error('Prestataire introuvable'); navigate('/prestataires'); });
        }
    }, [id]);

    const onSubmit = async (data) => {
        try {
            if (isEdit) {
                await updatePrestataire(id, data);
                toast.success('Prestataire mis à jour');
            } else {
                const res = await createPrestataire(data);
                toast.success(`Prestataire ${res.data.code} créé`);
            }
            navigate('/prestataires');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur');
        }
    };

    if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin" /></div>;

    const inputClass = "w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none";
    const labelClass = "block text-sm font-medium text-gray-300 mb-1";

    return (
        <div>
            <button onClick={() => navigate('/prestataires')} className="text-sm text-gray-400 hover:text-indigo-400 mb-4 inline-flex items-center gap-1">← Retour</button>
            <h1 className="text-2xl font-bold text-white mb-6">{isEdit ? 'Modifier le prestataire' : 'Nouveau prestataire'}</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-6 max-w-3xl">
                {/* Classification */}
                <div>
                    <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">Classification</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className={labelClass}>Catégorie <span className="text-red-400">*</span></label>
                            <select {...register('categorie', { required: true })} className={inputClass}>
                                {CATEGORIE_OPTIONS.filter((o) => o.value).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Nature juridique <span className="text-red-400">*</span></label>
                            <select {...register('natureJuridique', { required: true })} className={inputClass}>
                                {NATURE_OPTIONS.filter((o) => o.value).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Régime</label>
                            <select {...register('regimePrestataire')} className={inputClass}>
                                {REGIME_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="mt-3">
                        <label className={labelClass}>Activité</label>
                        <input {...register('activite')} className={inputClass} placeholder="Ex: Formation Management, Comptabilité..." />
                    </div>
                </div>

                {/* Identité */}
                <div>
                    <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                        {isPhysique ? 'Identité' : 'Société'}
                    </h2>
                    {isPhysique ? (
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Nom <span className="text-red-400">*</span></label>
                                <input {...register('nom', { required: isPhysique ? 'Obligatoire' : false })} className={inputClass} />
                                {errors.nom && <p className="text-xs text-red-400 mt-1">{errors.nom.message}</p>}
                            </div>
                            <div><label className={labelClass}>Prénom</label><input {...register('prenom')} className={inputClass} /></div>
                            <div><label className={labelClass}>CIN</label><input {...register('cin')} className={inputClass} /></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Raison sociale <span className="text-red-400">*</span></label>
                                <input {...register('raisonSociale', { required: !isPhysique ? 'Obligatoire' : false })} className={inputClass} />
                                {errors.raisonSociale && <p className="text-xs text-red-400 mt-1">{errors.raisonSociale.message}</p>}
                            </div>
                            <div><label className={labelClass}>Nom commercial</label><input {...register('nomCommercial')} className={inputClass} /></div>
                            <div><label className={labelClass}>ICE</label><input {...register('ice')} className={inputClass} /></div>
                            <div><label className={labelClass}>IF</label><input {...register('identifiantFiscal')} className={inputClass} /></div>
                            <div><label className={labelClass}>RC</label><input {...register('registreCommerce')} className={inputClass} /></div>
                        </div>
                    )}
                </div>

                {/* Contact */}
                <div>
                    <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">Contact</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelClass}>Email</label><input type="email" {...register('email')} className={inputClass} /></div>
                        <div><label className={labelClass}>Téléphone</label><input {...register('telephone')} className={inputClass} /></div>
                        <div className="col-span-2"><label className={labelClass}>Adresse</label><textarea {...register('adresse')} rows={2} className={inputClass} /></div>
                        <div><label className={labelClass}>Ville</label><input {...register('ville')} className={inputClass} /></div>
                        <div><label className={labelClass}>Pays</label><input {...register('pays')} className={inputClass} /></div>
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className={labelClass}>Notes</label>
                    <textarea {...register('notes')} rows={3} className={inputClass} placeholder="Observations..." />
                </div>

                {/* Boutons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                    <button type="button" onClick={() => navigate('/prestataires')} className="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Annuler</button>
                    <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                        {isSubmitting ? 'En cours...' : isEdit ? 'Enregistrer' : 'Créer le prestataire'}
                    </button>
                </div>
            </form>
        </div>
    );
}