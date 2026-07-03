// src/pages/documents/components/DocumentsTab.jsx
//
// Usage:
//   <DocumentsTab entityType="ACTION" entityId={action.id} />
//   <DocumentsTab entityType="FACTURE" entityId={facture.id} />
//   <DocumentsTab entityType="FORMATEUR" entityId={formateur.id} />
//   <DocumentsTab entityType="CLIENT" entityId={client.id} />

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../auth/AuthContext';
import {
    getDocumentsByEntity,
    uploadDocument,
    uploadNewVersion,
    downloadDocument,
    deleteDocument,
    hardDeleteDocument,
} from '../../../api/documentApi';
import DocumentCard from './DocumentCard';
import DocumentList from './DocumentList';
import DocumentUploadModal from './DocumentUploadModal';
import DocumentPreviewModal from './DocumentPreviewModal';

export default function DocumentsTab({ entityType, entityId }) {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'cards'
    const [showUpload, setShowUpload] = useState(false);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [versionDoc, setVersionDoc] = useState(null);

    const canDelete = ['ADMIN', 'DG', 'DA'].includes(user?.role);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await getDocumentsByEntity(entityType, entityId);
            setDocuments(data);
        } catch {
            toast.error('Erreur chargement documents');
        } finally {
            setLoading(false);
        }
    }, [entityType, entityId]);

    useEffect(() => { load(); }, [load]);

    // ─── Upload ───
    const handleUpload = async (file, documentType, description) => {
        try {
            await uploadDocument(file, entityType, entityId, documentType, description);
            toast.success(`Document "${file.name}" déposé`);
            setShowUpload(false);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur lors de l\'upload');
        }
    };

    // ─── Nouvelle version ───
    const handleNewVersion = async (file) => {
        if (!versionDoc) return;
        try {
            await uploadNewVersion(versionDoc.id, file);
            toast.success(`Nouvelle version de "${versionDoc.nomOriginal}" déposée`);
            setVersionDoc(null);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur');
        }
    };

    // ─── Download ───
    const handleDownload = async (doc) => {
        try {
            const response = await downloadDocument(doc.id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.nomOriginal);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            toast.error('Erreur téléchargement');
        }
    };

    // ─── Delete ───
    const handleDelete = async (doc) => {
        const msg = canDelete
            ? 'Supprimer définitivement ce document ?'
            : 'Supprimer ce document ?';
        if (!window.confirm(msg)) return;
        try {
            if (canDelete) {
                await hardDeleteDocument(doc.id);
            } else {
                await deleteDocument(doc.id);
            }
            toast.success('Document supprimé');
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur suppression');
        }
    };

    // ─── Render ───
    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                    Documents ({documents.length})
                </h3>
                <div className="flex items-center gap-2">
                    {/* View mode toggle */}
                    <div className="flex bg-gray-900 rounded-lg p-0.5 border border-gray-700">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                                viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'
                            }`}
                        >
                            ☰
                        </button>
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                                viewMode === 'cards' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'
                            }`}
                        >
                            ▦
                        </button>
                    </div>
                    <button
                        onClick={() => setShowUpload(true)}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        + Déposer
                    </button>
                </div>
            </div>

            {/* Documents */}
            {documents.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <div className="text-3xl mb-2">📂</div>
                    <p>Aucun document associé</p>
                    <button
                        onClick={() => setShowUpload(true)}
                        className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 underline transition-colors"
                    >
                        Déposer un premier document
                    </button>
                </div>
            ) : viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {documents.map((doc) => (
                        <DocumentCard
                            key={doc.id}
                            document={doc}
                            onDownload={handleDownload}
                            onPreview={setPreviewDoc}
                            onDelete={handleDelete}
                            onNewVersion={setVersionDoc}
                            canDelete={canDelete}
                        />
                    ))}
                </div>
            ) : (
                <DocumentList
                    documents={documents}
                    onDownload={handleDownload}
                    onPreview={setPreviewDoc}
                    onDelete={handleDelete}
                    onNewVersion={setVersionDoc}
                    canDelete={canDelete}
                />
            )}

            {/* Upload Modal */}
            {showUpload && (
                <DocumentUploadModal
                    onUpload={handleUpload}
                    onClose={() => setShowUpload(false)}
                />
            )}

            {/* New Version Modal */}
            {versionDoc && (
                <DocumentUploadModal
                    isNewVersion
                    documentName={versionDoc.nomOriginal}
                    onUpload={(file) => handleNewVersion(file)}
                    onClose={() => setVersionDoc(null)}
                />
            )}

            {/* Preview Modal */}
            {previewDoc && (
                <DocumentPreviewModal
                    document={previewDoc}
                    onClose={() => setPreviewDoc(null)}
                    onDownload={handleDownload}
                />
            )}
        </div>
    );
}