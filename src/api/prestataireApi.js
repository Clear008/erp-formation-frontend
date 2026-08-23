// src/api/prestataireApi.js
import axiosClient from './axiosClient';

// Liste + recherche
export const getPrestataires = (params) =>
    axiosClient.get('/api/prestataires', { params });

// Détail
export const getPrestataire = (id) =>
    axiosClient.get(`/api/prestataires/${id}`);

// Créer
export const createPrestataire = (data) =>
    axiosClient.post('/api/prestataires', data);

// Modifier
export const updatePrestataire = (id, data) =>
    axiosClient.put(`/api/prestataires/${id}`, data);

// Changer statut
export const changePrestataireStatus = (id, data) =>
    axiosClient.patch(`/api/prestataires/${id}/statut`, data);

// Coordonnées bancaires — GET (DA/DG/ADMIN)
export const getBankDetails = (id) =>
    axiosClient.get(`/api/prestataires/${id}/coordonnees-bancaires`);

// Coordonnées bancaires — UPDATE (DA/DG/ADMIN)
export const updateBankDetails = (id, data) =>
    axiosClient.patch(`/api/prestataires/${id}/coordonnees-bancaires`, data);
// Journal des accès bancaires — ADMIN uniquement
export const getBankAudit = (id) =>
    axiosClient.get(`/api/prestataires/${id}/coordonnees-bancaires/audit`);

// Lier un formateur
export const linkFormateur = (id, formateurId) =>
    axiosClient.post(`/api/prestataires/${id}/formateurs/${formateurId}`);

// Dissocier un formateur
export const unlinkFormateur = (id, formateurId) =>
    axiosClient.delete(`/api/prestataires/${id}/formateurs/${formateurId}`);

// Créer depuis un formateur existant
export const createFromFormateur = (formateurId) =>
    axiosClient.post(`/api/prestataires/from-formateur/${formateurId}`);