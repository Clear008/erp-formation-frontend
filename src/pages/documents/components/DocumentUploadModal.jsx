// src/pages/documents/components/DocumentUploadModal.jsx
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';

const DOCUMENT_TYPE_OPTIONS = [
    { value: 'AUTRE',        label: 'Autre' },
    { value: 'CONTRAT',      label: 'Contrat' },
    { value: 'CONVENTION',   label: 'Convention' },
    { value: 'PROGRAMME',    label: 'Programme' },
    { value: 'FACTURE',      label: 'Facture' },
    { value: 'BON_COMMANDE', label: 'Bon de commande' },
    { value: 'ATTESTATION',  label: 'Attestation' },
    { value: 'RAPPORT',      label: 'Rapport' },
    { value: 'SUPPORT',      label: 'Support pédagogique' },
    { value: 'EMARGEMENT',   label: "Feuille d'émargement" },
    { value: 'PHOTO',        label: 'Photo' },
    { value: 'CHEQUE',       label: 'Chèque' },
    { value: 'DIPLOME',      label: 'Diplôme' },
    { value: 'CV',           label: 'CV' },
    { value: 'JUSTIFICATIF', label: 'Justificatif' },
];

export default function DocumentUploadModal({ onUpload, onClose, isNewVersion = false, documentName = '' }) {
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { register, handleSubmit } = useForm({
        defaultValues: { documentType: 'AUTRE', description: '' },
    });

    const inputClass = "w-full px-3 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none";

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const doSubmit = async (data) => {
        if (!file) return;
        setUploading(true);
        try {
            await onUpload(file, data.documentType, data.description);
        } finally {
            setUploading(false);
        }
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' o';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
        return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-lg w-full mx-4">
                <div className="flex items-center justify-between p-5 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">
                        {isNewVersion ? `Nouvelle version — ${documentName}` : 'Déposer un document'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>

                <form onSubmit={handleSubmit(doSubmit)} className="p-5 space-y-4">
                    {/* Drop zone */}
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                            dragActive
                                ? 'border-indigo-500 bg-indigo-500/10'
                                : file
                                    ? 'border-emerald-500/50 bg-emerald-500/5'
                                    : 'border-gray-700 hover:border-gray-600'
                        }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        {file ? (
                            <div>
                                <div className="text-3xl mb-2">✅</div>
                                <p className="text-sm text-white font-medium">{file.name}</p>
                                <p className="text-xs text-gray-400 mt-1">{formatSize(file.size)}</p>
                                <p className="text-xs text-indigo-400 mt-2 underline">Changer de fichier</p>
                            </div>
                        ) : (
                            <div>
                                <div className="text-3xl mb-2">📎</div>
                                <p className="text-sm text-gray-300">Glissez un fichier ici ou cliquez</p>
                                <p className="text-xs text-gray-500 mt-1">PDF, images, documents — Max 50 Mo</p>
                            </div>
                        )}
                    </div>

                    {/* Type de document (masqué si nouvelle version) */}
                    {!isNewVersion && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Type de document</label>
                            <select {...register('documentType')} className={inputClass}>
                                {DOCUMENT_TYPE_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Description */}
                    {!isNewVersion && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                            <textarea {...register('description')} rows={2} className={inputClass} placeholder="Description optionnelle..." />
                        </div>
                    )}

                    {/* Boutons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={!file || uploading}
                            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
                        >
                            {uploading ? 'Upload en cours...' : isNewVersion ? '🔄 Remplacer' : '📎 Déposer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}