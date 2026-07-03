// src/pages/documents/components/DocumentCard.jsx

const EXTENSION_ICONS = {
    pdf: '📕', doc: '📘', docx: '📘', xls: '📗', xlsx: '📗',
    ppt: '📙', pptx: '📙', jpg: '🖼️', jpeg: '🖼️', png: '🖼️',
    gif: '🖼️', zip: '📦', rar: '📦', txt: '📄', csv: '📊',
};

function getIcon(ext) {
    return EXTENSION_ICONS[ext?.toLowerCase()] || '📎';
}

export default function DocumentCard({ document, onDownload, onPreview, onDelete, onNewVersion, canDelete }) {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-colors group">
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="text-2xl flex-shrink-0 mt-0.5">
                    {getIcon(document.extension)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate" title={document.nomOriginal}>
                        {document.nomOriginal}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[11px] text-gray-500">{document.tailleFormatee}</span>
                        <span className="text-gray-700">·</span>
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
              {document.documentTypeLabel}
            </span>
                        {document.version > 1 && (
                            <>
                                <span className="text-gray-700">·</span>
                                <span className="text-[11px] text-amber-400">v{document.version}</span>
                            </>
                        )}
                    </div>
                    {document.description && (
                        <p className="text-xs text-gray-400 mt-1 truncate">{document.description}</p>
                    )}
                    <p className="text-[11px] text-gray-500 mt-1.5">
                        par {document.uploadedByUsername} · {new Date(document.uploadedAt).toLocaleDateString('fr-FR')}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {onPreview && (
                        <button onClick={() => onPreview(document)} className="p-1.5 text-gray-400 hover:text-indigo-400 transition-colors" title="Prévisualiser">
                            👁️
                        </button>
                    )}
                    {onDownload && (
                        <button onClick={() => onDownload(document)} className="p-1.5 text-gray-400 hover:text-emerald-400 transition-colors" title="Télécharger">
                            ⬇️
                        </button>
                    )}
                    {onNewVersion && (
                        <button onClick={() => onNewVersion(document)} className="p-1.5 text-gray-400 hover:text-amber-400 transition-colors" title="Nouvelle version">
                            🔄
                        </button>
                    )}
                    {canDelete && onDelete && (
                        <button onClick={() => onDelete(document)} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors" title="Supprimer">
                            🗑️
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}