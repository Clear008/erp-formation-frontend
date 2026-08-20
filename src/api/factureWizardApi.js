// src/api/factureWizardApi.js
import axiosClient from './axiosClient';

export const getActionsFacturables = (clientId) =>
    axiosClient.get('/api/factures/actions-facturables', { params: { clientId } });

export const createFactureWizard = (data) =>
    axiosClient.post('/api/factures/wizard', data);

export const updateFactureWizard = (id, data) =>
    axiosClient.put(`/api/factures/${id}/wizard`, data);

export const getFactureDetail = (id) =>
    axiosClient.get(`/api/factures/${id}/detail`);