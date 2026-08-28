// src/pages/documents/components/DocumentPreviewModal.jsx
import { useEffect, useState } from 'react';
import { previewDocument } from '../../../api/documentApi';

export default function DocumentPreviewModal({ document, onClose, onDownload }) {
    const [blobUrl, setBlobUrl] = useState(null);
    const [loading, setLoading] = useState(true);


    const fileName = document?.nomOriginal || document?.nomFichier || document?.fileName || '';
    const mimeType = document?.mimeType || '';
    const extension = fileName.split('.').pop()?.toLowerCase();

    const isImage =
        mimeType.startsWith('image/') ||
        ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension);

    const isPdf =
        mimeType === 'application/pdf' ||
        extension === 'pdf';

    useEffect(() => {
        let objectUrl = null;

        const loadPreview = async () => {
            if (!document?.id || (!isImage && !isPdf)) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const response = await previewDocument(document.id);
                objectUrl = URL.createObjectURL(response.data);
                setBlobUrl(objectUrl);
            } catch (error) {
                console.error(error);
                setBlobUrl(null);
            } finally {
                setLoading(false);
            }
        };

        loadPreview();

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [document?.id, isImage, isPdf]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <h2 className="text-sm font-semibold text-white truncate">
                            {document.nomOriginal || document.nomFichier}
                        </h2>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                            {document.tailleFormatee}
                        </span>
                        {document.version > 1 && (
                            <span className="text-xs text-amber-400 flex-shrink-0">
                                v{document.version}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={() => onDownload(document)}
                            className="px-3 py-1.5 text-xs text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            ⬇️ Télécharger
                        </button>

                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white text-xl leading-none ml-2"
                        >
                            &times;
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden p-4">
                    {loading && (
                        <div className="flex items-center justify-center h-[40vh] text-gray-400">
                            Chargement de la prévisualisation...
                        </div>
                    )}

                    {!loading && isImage && blobUrl && (
                        <div className="flex items-center justify-center h-full">
                            <img
                                src={blobUrl}
                                alt={document.nomOriginal || document.nomFichier}
                                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                            />
                        </div>
                    )}

                    {!loading && isPdf && blobUrl && (
                        <iframe
                            src={blobUrl}
                            title={document.nomOriginal || document.nomFichier}
                            className="w-full h-[70vh] rounded-lg border border-gray-700"
                        />
                    )}

                    {!loading && (!blobUrl || (!isImage && !isPdf)) && (
                        <div className="flex flex-col items-center justify-center h-[40vh] text-gray-400">
                            <div className="text-5xl mb-4">📎</div>
                            <p className="text-sm">
                                Prévisualisation non disponible pour ce type de fichier
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {mimeType || extension}
                            </p>

                            <button
                                onClick={() => onDownload(document)}
                                className="mt-4 px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                ⬇️ Télécharger le fichier
                            </button>
                        </div>
                    )}
                </div>

                <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500 flex-shrink-0">
                    <span>
                        Déposé par {document.uploadedByUsername} le{' '}
                        {new Date(document.uploadedAt).toLocaleString('fr-FR')}
                    </span>

                    <span className="inline-flex px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20 text-[10px] font-medium">
                        {document.documentTypeLabel}
                    </span>
                </div>
            </div>
        </div>
    );
}