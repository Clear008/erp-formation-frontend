// src/pages/factures/components/FactureStepLines.jsx
import { useEffect } from 'react';

const EMPTY_LINE = { description: '', quantite: 1, prixUnitaire: '', tauxTva: 20 };

function formatDH(val) {
    if (!val && val !== 0) return '0,00';
    return Number(val).toLocaleString('fr-FR', { minimumFractionDigits: 2 });
}

export default function FactureStepLines({ data, onChange, selectedAction }) {
    const lignes = data.lignes || [];

    // Auto-remplir si action sélectionnée et pas de lignes
    useEffect(() => {
        if (selectedAction && lignes.length === 0) {
            const autoLine = {
                description: `Formation : ${selectedAction.titre} (${selectedAction.reference})`,
                quantite: 1,
                prixUnitaire: selectedAction.montantEstime != null
                    ? Number(selectedAction.montantEstime).toFixed(2)
                    : '',
                tauxTva: 20,
            };
            onChange({ ...data, lignes: [autoLine] });
        }
    }, [selectedAction]);

    const setLignes = (newLignes) => onChange({ ...data, lignes: newLignes });

    const updateLine = (index, field, value) => {
        const updated = [...lignes];
        updated[index] = { ...updated[index], [field]: value };
        setLignes(updated);
    };

    const addLine = () => setLignes([...lignes, { ...EMPTY_LINE }]);

    const removeLine = (index) => {
        if (lignes.length <= 1) return;
        setLignes(lignes.filter((_, i) => i !== index));
    };

    // Totaux
    let totalHt = 0, totalTva = 0;
    lignes.forEach((l) => {
        const ht = (Number(l.quantite) || 1) * (Number(l.prixUnitaire) || 0);
        totalHt += ht;
        totalTva += ht * (Number(l.tauxTva) || 20) / 100;
    });

    const inputClass = "w-full px-2.5 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none";

    return (
        <div className="space-y-4">
            {/* Lines */}
            <div className="space-y-3">
                {lignes.map((line, i) => {
                    const ht = (Number(line.quantite) || 1) * (Number(line.prixUnitaire) || 0);
                    return (
                        <div key={i} className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
                            <div className="flex items-start justify-between mb-3">
                                <span className="text-xs font-semibold text-gray-500 uppercase">Ligne {i + 1}</span>
                                {lignes.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeLine(i)}
                                        className="text-red-400 hover:text-red-300 text-xs transition-colors"
                                    >
                                        ✕ Supprimer
                                    </button>
                                )}
                            </div>

                            {/* Description */}
                            <div className="mb-3">
                                <label className="block text-xs text-gray-400 mb-1">Description <span className="text-red-400">*</span></label>
                                <input
                                    value={line.description}
                                    onChange={(e) => updateLine(i, 'description', e.target.value)}
                                    className={inputClass}
                                    placeholder="Description de la prestation"
                                />
                            </div>

                            {/* Quantité / Prix / TVA / Total */}
                            <div className="grid grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Quantité</label>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={line.quantite}
                                        onChange={(e) => updateLine(i, 'quantite', e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Prix unit. HT <span className="text-red-400">*</span></label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={line.prixUnitaire}
                                        onChange={(e) => updateLine(i, 'prixUnitaire', e.target.value)}
                                        className={inputClass}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">TVA %</label>
                                    <select
                                        value={line.tauxTva}
                                        onChange={(e) => updateLine(i, 'tauxTva', e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="0">0%</option>
                                        <option value="7">7%</option>
                                        <option value="10">10%</option>
                                        <option value="14">14%</option>
                                        <option value="20">20%</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Total HT</label>
                                    <div className="px-2.5 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white font-medium">
                                        {formatDH(ht)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add line button */}
            <button
                type="button"
                onClick={addLine}
                className="w-full py-3 border-2 border-dashed border-gray-700 rounded-xl text-sm text-gray-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-colors"
            >
                + Ajouter une ligne
            </button>

            {/* Totaux */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total HT</span>
                    <span className="text-white font-medium">{formatDH(totalHt)} DH</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">TVA</span>
                    <span className="text-gray-300">{formatDH(totalTva)} DH</span>
                </div>
                <div className="flex justify-between text-base border-t border-gray-700 pt-2">
                    <span className="text-white font-semibold">Total TTC</span>
                    <span className="text-white font-bold">{formatDH(totalHt + totalTva)} DH</span>
                </div>
            </div>
        </div>
    );
}