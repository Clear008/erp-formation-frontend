// src/api/documentApi.js
import axiosClient from './axiosClient';

// Upload un document
export const uploadDocument = (file, entityType, entityId, documentType, description) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);
    if (documentType) formData.append('documentType', documentType);
    if (description) formData.append('description', description);
    return axiosClient.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// Upload nouvelle version
export const uploadNewVersion = (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post(`/api/documents/${id}/version`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// Télécharger
export const downloadDocument = (id) =>
    axiosClient.get(`/api/documents/${id}/download`, { responseType: 'blob' });

// Preview URL (pour iframe / img)
export const getPreviewUrl = (id) =>
    `${axiosClient.defaults.baseURL}/api/documents/${id}/preview`;

// Détail
export const getDocument = (id) =>
    axiosClient.get(`/api/documents/${id}`);

// Liste par entité
export const getDocumentsByEntity = (entityType, entityId) =>
    axiosClient.get(`/api/documents/entity/${entityType}/${entityId}`);

// Count par entité
export const countDocumentsByEntity = (entityType, entityId) =>
    axiosClient.get(`/api/documents/entity/${entityType}/${entityId}/count`);

// Recherche globale
export const searchDocuments = (params) =>
    axiosClient.get('/api/documents/search', { params });

// Versions
export const getDocumentVersions = (id) =>
    axiosClient.get(`/api/documents/${id}/versions`);

// Mettre à jour métadonnées
export const updateDocument = (id, data) =>
    axiosClient.put(`/api/documents/${id}`, data);

// Supprimer (soft)
export const deleteDocument = (id) =>
    axiosClient.delete(`/api/documents/${id}`);

// Supprimer définitivement (DA/DG/ADMIN)
export const hardDeleteDocument = (id) =>
    axiosClient.delete(`/api/documents/${id}/permanent`);