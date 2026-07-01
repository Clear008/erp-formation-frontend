// src/api/encaissementApi.js
import axiosClient from './axiosClient';

export const getEncaissements = (factureId) =>
    axiosClient.get(`/api/factures/${factureId}/encaissements`);

export const createEncaissement = (factureId, data) =>
    axiosClient.post(`/api/factures/${factureId}/encaissements`, data);

export const deleteEncaissement = (id) =>
    axiosClient.delete(`/api/encaissements/${id}`);

export const getFactureFinance = (factureId) =>
    axiosClient.get(`/api/factures/${factureId}/finance`);