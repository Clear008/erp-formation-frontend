// src/pages/documents/components/DocumentList.jsx

const EXTENSION_ICONS = {
    pdf: '📕', doc: '📘', docx: '📘', xls: '📗', xlsx: '📗',
    ppt: '📙', pptx: '📙', jpg: '🖼️', jpeg: '🖼️', png: '🖼️',
};

function getIcon(ext) {
    return EXTENSION_ICONS[ext?.toLowerCase()] || '📎';
}

export default function DocumentList({ documents, onDownload, onPreview, onDelete, onNewVersion, canDelete }) {
    if (documents.length === 0) {
        return (
            <div className="text-center py-10 text-gray-400">
                <div className="text-3xl mb-2">📂</div>
                <p>Aucun document</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full">
                <thead>
                <tr className="border-b border-gray-700">
                    {['', 'Nom', 'Type', 'Taille', 'Version', 'Ajouté par', 'Date', 'Actions'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3 text-lg">{getIcon(doc.extension)}</td>
                        <td className="px-4 py-3">
                            <p className="text-sm text-white font-medium truncate max-w-[200px]" title={doc.nomOriginal}>
                                {doc.nomOriginal}
                            </p>
                            {doc.description && (
                                <p className="text-xs text-gray-500 truncate max-w-[200px]">{doc.description}</p>
                            )}
                        </td>
                        <td className="px-4 py-3">
                <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
                  {doc.documentTypeLabel}
                </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">{doc.tailleFormatee}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                            {doc.version > 1 ? (
                                <span className="text-amber-400">v{doc.version}</span>
                            ) : (
                                <span className="text-gray-500">v1</span>
                            )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">{doc.uploadedByUsername}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                            {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                                {onPreview && (
                                    <button onClick={() => onPreview(doc)} className="p-1 text-gray-400 hover:text-indigo-400 text-xs" title="Voir">👁️</button>
                                )}
                                {onDownload && (
                                    <button onClick={() => onDownload(doc)} className="p-1 text-gray-400 hover:text-emerald-400 text-xs" title="Télécharger">⬇️</button>
                                )}
                                {onNewVersion && (
                                    <button onClick={() => onNewVersion(doc)} className="p-1 text-gray-400 hover:text-amber-400 text-xs" title="Remplacer">🔄</button>
                                )}
                                {canDelete && onDelete && (
                                    <button onClick={() => onDelete(doc)} className="p-1 text-gray-400 hover:text-red-400 text-xs" title="Supprimer">🗑️</button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}