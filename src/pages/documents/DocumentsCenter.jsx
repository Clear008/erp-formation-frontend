import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import {
    deleteDocument,
    downloadDocument,
    getUploaders,
    searchDocumentsGlobal,
} from '../../api/documentApi';

import DocumentPreviewModal from './components/DocumentPreviewModal';

const ENTITY_TYPES = [
    { value: '', label: 'Toutes les entités' },
    { value: 'CLIENT', label: 'Client' },
    { value: 'ACTION', label: 'Action de formation' },
    { value: 'SESSION', label: 'Session' },
    { value: 'FACTURE', label: 'Facture' },
    { value: 'CHEQUE', label: 'Chèque' },
    { value: 'FORMATEUR', label: 'Formateur' },
    { value: 'FOURNISSEUR', label: 'Fournisseur' },
    { value: 'PAIEMENT', label: 'Paiement' },
    { value: 'CONVENTION', label: 'Convention' },
    { value: 'ENCAISSEMENT', label: 'Encaissement' },
];

const DOCUMENT_TYPES = [
    { value: '', label: 'Tous les types' },
    { value: 'AUTRE', label: 'Autre' },
    { value: 'CONTRAT', label: 'Contrat' },
    { value: 'CONVENTION', label: 'Convention' },
    { value: 'PROGRAMME', label: 'Programme' },
    { value: 'FACTURE', label: 'Facture' },
    { value: 'BON_COMMANDE', label: 'Bon de commande' },
    { value: 'ATTESTATION', label: 'Attestation' },
    { value: 'RAPPORT', label: 'Rapport' },
    { value: 'SUPPORT', label: 'Support pédagogique' },
    { value: 'EMARGEMENT', label: "Feuille d'émargement" },
    { value: 'PHOTO', label: 'Photo' },
    { value: 'CHEQUE', label: 'Chèque' },
    { value: 'DIPLOME', label: 'Diplôme' },
    { value: 'CV', label: 'CV' },
    { value: 'JUSTIFICATIF', label: 'Justificatif' },
];

const INITIAL_FILTERS = {
    q: '',
    entityType: '',
    documentType: '',
    uploadedBy: '',
    dateFrom: '',
    dateTo: '',
};

function getFileIcon(extension) {
    const ext = extension?.toLowerCase();

    if (ext === 'pdf') return 'PDF';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'IMG';
    if (['doc', 'docx'].includes(ext)) return 'DOC';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'XLS';
    if (['ppt', 'pptx'].includes(ext)) return 'PPT';

    return 'FILE';
}

export default function DocumentsCenter() {
    const [documents, setDocuments] = useState([]);
    const [uploaders, setUploaders] = useState([]);
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [loading, setLoading] = useState(true);
    const [previewDocument, setPreviewDocument] = useState(null);

    const loadDocuments = useCallback(async (activeFilters = filters) => {
        try {
            setLoading(true);

            const params = Object.fromEntries(
                Object.entries(activeFilters).filter(
                    ([, value]) => value !== '' && value !== null
                )
            );

            const response = await searchDocumentsGlobal(params);
            setDocuments(response.data);
        } catch (error) {
            console.error(error);
            toast.error(
                error.response?.data?.message ||
                'Impossible de charger les documents'
            );
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadDocuments(INITIAL_FILTERS);
    }, []); // Chargement initial

    useEffect(() => {
        const loadUploaders = async () => {
            try {
                const response = await getUploaders();
                setUploaders(response.data);
            } catch (error) {
                console.error(
                    'Impossible de charger la liste des déposants',
                    error
                );
            }
        };

        loadUploaders();
    }, []);

    const handleFilterChange = (event) => {
        const { name, value } = event.target;

        setFilters((currentFilters) => ({
            ...currentFilters,
            [name]: value,
        }));
    };

    const handleSearch = (event) => {
        event.preventDefault();
        loadDocuments(filters);
    };

    const handleReset = () => {
        setFilters(INITIAL_FILTERS);
        loadDocuments(INITIAL_FILTERS);
    };

    const handleDownload = async (document) => {
        try {
            const response = await downloadDocument(document.id);
            const blobUrl = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = window.document.createElement('a');
            link.href = blobUrl;
            link.download = document.nomOriginal;
            window.document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error(error);
            toast.error('Impossible de télécharger le document');
        }
    };

    const handleDelete = async (document) => {
        const confirmed = window.confirm(
            `Supprimer le document "${document.nomOriginal}" ?`
        );

        if (!confirmed) return;

        try {
            await deleteDocument(document.id);
            toast.success('Document supprimé');
            setPreviewDocument(null);
            await loadDocuments(filters);
        } catch (error) {
            console.error(error);
            toast.error(
                error.response?.data?.message ||
                'Impossible de supprimer le document'
            );
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* En-tête */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">
                    Outils
                </p>

                <div className="mt-1 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-text-primary">
                            Centre documentaire
                        </h1>

                        <p className="mt-1 text-sm text-text-secondary">
                            Recherchez et consultez tous les documents du cabinet.
                        </p>
                    </div>

                    <div className="rounded-lg border border-surface-border bg-surface-card px-4 py-2">
                        <span className="text-2xl font-semibold text-text-primary">
                            {documents.length}
                        </span>

                        <span className="ml-2 text-xs text-text-secondary">
                            document{documents.length > 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            </div>

            {/* Filtres */}
            <form
                onSubmit={handleSearch}
                className="rounded-xl border border-surface-border bg-surface-card p-4"
            >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <input
                        type="search"
                        name="q"
                        value={filters.q}
                        onChange={handleFilterChange}
                        placeholder="Rechercher un nom ou une description..."
                        className="rounded-lg border border-surface-border bg-surface-muted px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-500"
                    />

                    <select
                        name="entityType"
                        value={filters.entityType}
                        onChange={handleFilterChange}
                        className="rounded-lg border border-surface-border bg-surface-muted px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-500"
                    >
                        {ENTITY_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>

                    <select
                        name="documentType"
                        value={filters.documentType}
                        onChange={handleFilterChange}
                        className="rounded-lg border border-surface-border bg-surface-muted px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-500"
                    >
                        {DOCUMENT_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>

                    <select
                        name="uploadedBy"
                        value={filters.uploadedBy}
                        onChange={handleFilterChange}
                        className="rounded-lg border border-surface-border bg-surface-muted px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-500"
                    >
                        <option value="">Tous les déposants</option>

                        {uploaders.map((username) => (
                            <option key={username} value={username}>
                                {username}
                            </option>
                        ))}
                    </select>

                    <div>
                        <label className="mb-1 block text-xs text-text-secondary">
                            Du
                        </label>

                        <input
                            type="date"
                            name="dateFrom"
                            value={filters.dateFrom}
                            onChange={handleFilterChange}
                            className="w-full rounded-lg border border-surface-border bg-surface-muted px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs text-text-secondary">
                            Au
                        </label>

                        <input
                            type="date"
                            name="dateTo"
                            value={filters.dateTo}
                            onChange={handleFilterChange}
                            className="w-full rounded-lg border border-surface-border bg-surface-muted px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-500"
                        />
                    </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="rounded-lg border border-surface-border px-4 py-2 text-sm text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                    >
                        Réinitialiser
                    </button>

                    <button
                        type="submit"
                        className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-500"
                    >
                        Rechercher
                    </button>
                </div>
            </form>

            {/* Liste */}
            {loading ? (
                <div className="rounded-xl border border-surface-border bg-surface-card py-16 text-center text-sm text-text-secondary">
                    Chargement des documents...
                </div>
            ) : documents.length === 0 ? (
                <div className="rounded-xl border border-surface-border bg-surface-card py-16 text-center">
                    <p className="text-lg text-text-primary">
                        Aucun document trouvé
                    </p>

                    <p className="mt-1 text-sm text-text-secondary">
                        Modifiez les filtres pour élargir la recherche.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-surface-border bg-surface-card">
                    <table className="w-full min-w-[900px]">
                        <thead className="border-b border-surface-border bg-surface-muted">
                        <tr>
                            {[
                                'Fichier',
                                'Rattachement',
                                'Type',
                                'Taille',
                                'Déposé par',
                                'Date',
                                'Actions',
                            ].map((heading) => (
                                <th
                                    key={heading}
                                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
                                >
                                    {heading}
                                </th>
                            ))}
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-surface-border">
                        {documents.map((document) => (
                            <tr
                                key={document.id}
                                className="transition-colors hover:bg-surface-muted"
                            >
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600/10 text-[10px] font-bold text-brand-400">
                                            {getFileIcon(document.extension)}
                                        </div>

                                        <div className="min-w-0">
                                            <p
                                                className="max-w-[260px] truncate text-sm font-medium text-text-primary"
                                                title={document.nomOriginal}
                                            >
                                                {document.nomOriginal}
                                            </p>

                                            {document.description && (
                                                <p className="max-w-[260px] truncate text-xs text-text-muted">
                                                    {document.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                <td className="px-4 py-3">
                                    <p className="text-sm text-text-primary">
                                        {document.entityTypeLabel ||
                                            document.entityType}
                                    </p>

                                    <p className="text-xs text-text-muted">
                                        Référence #{document.entityId}
                                    </p>
                                </td>

                                <td className="px-4 py-3">
                                        <span className="rounded bg-brand-600/10 px-2 py-1 text-xs text-brand-400">
                                            {document.documentTypeLabel ||
                                                document.documentType}
                                        </span>
                                </td>

                                <td className="px-4 py-3 text-sm text-text-secondary">
                                    {document.tailleFormatee}
                                </td>

                                <td className="px-4 py-3 text-sm text-text-secondary">
                                    {document.uploadedByUsername}
                                </td>

                                <td className="px-4 py-3 text-sm text-text-secondary">
                                    {new Date(
                                        document.uploadedAt
                                    ).toLocaleDateString('fr-FR')}
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPreviewDocument(document)
                                            }
                                            className="text-xs font-medium text-brand-400 hover:text-brand-300"
                                        >
                                            Voir
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDownload(document)
                                            }
                                            className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                                        >
                                            Télécharger
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(document)
                                            }
                                            className="text-xs font-medium text-red-400 hover:text-red-300"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {previewDocument && (
                <DocumentPreviewModal
                    document={previewDocument}
                    onClose={() => setPreviewDocument(null)}
                    onDownload={handleDownload}
                />
            )}
        </div>
    );
}