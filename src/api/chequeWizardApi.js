// src/api/chequeWizardApi.js
import axiosClient from './axiosClient';

// CRUD
export const getCheques = (params) =>
    axiosClient.get('/api/cheques', { params });

export const getCheque = (id) =>
    axiosClient.get(`/api/cheques/${id}`);

// Step-by-step
export const createCheque = (data) =>
    axiosClient.post('/api/cheques', data);

export const depotCheque = (id, data) =>
    axiosClient.patch(`/api/cheques/${id}/depot`, data);

export const encaissementCheque = (id, data) =>
    axiosClient.patch(`/api/cheques/${id}/encaissement`, data);

// Wizard complet (3 steps en 1 appel)
export const createChequeWizard = (data) =>
    axiosClient.post('/api/cheques/wizard', data);

// Factures pour dropdown
export const getFacturesForDropdown = () =>
    axiosClient.get('/api/factures');