// src/api/factureApi.js
import axiosClient from './axiosClient';

export const getFactures = (params) =>
    axiosClient.get('/api/factures', { params });

export const getFacture = (id) =>
    axiosClient.get(`/api/factures/${id}`);

export const getFacturesByClient = (clientId) =>
    axiosClient.get(`/api/factures/client/${clientId}`);

export const getFacturesByAction = (actionId) =>
    axiosClient.get(`/api/factures/action/${actionId}`);

export const generateFacture = (data) =>
    axiosClient.post('/api/factures', data);

export const updateFacture = (id, data) =>
    axiosClient.put(`/api/factures/${id}`, data);

export const changeFactureStatus = (id, data) =>
    axiosClient.patch(`/api/factures/${id}/status`, data);

// Encaissements
export const getEncaissements = (factureId) =>
    axiosClient.get(`/api/factures/${factureId}/encaissements`);

export const addEncaissement = (factureId, data) =>
    axiosClient.post(`/api/factures/${factureId}/encaissements`, data);