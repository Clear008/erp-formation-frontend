// src/api/paiementPrestataireApi.js
import axiosClient from './axiosClient';

export const getPaiements = (params) =>
    axiosClient.get('/api/paiements-prestataires', { params });

export const getPaiement = (id) =>
    axiosClient.get(`/api/paiements-prestataires/${id}`);

export const createPaiement = (data) =>
    axiosClient.post('/api/paiements-prestataires', data);

export const updatePaiement = (id, data) =>
    axiosClient.put(`/api/paiements-prestataires/${id}`, data);

export const soumettrePaiement = (id, data) =>
    axiosClient.post(`/api/paiements-prestataires/${id}/soumettre`, data || {});

export const validerPaiement = (id, data) =>
    axiosClient.post(`/api/paiements-prestataires/${id}/valider`, data || {});

export const rejeterPaiement = (id, data) =>
    axiosClient.post(`/api/paiements-prestataires/${id}/rejeter`, data);

export const payerPaiement = (id, data) =>
    axiosClient.post(`/api/paiements-prestataires/${id}/payer`, data);

export const annulerPaiement = (id, data) =>
    axiosClient.post(`/api/paiements-prestataires/${id}/annuler`, data);

export const getHistorique = (id) =>
    axiosClient.get(`/api/paiements-prestataires/${id}/historique`);

export const getPaiementsByPrestataire = (prestataireId) =>
    axiosClient.get(`/api/paiements-prestataires/prestataire/${prestataireId}`);