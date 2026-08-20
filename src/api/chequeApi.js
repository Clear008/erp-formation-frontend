// src/api/chequeApi.js
import axiosClient from './axiosClient';

export const getCheques = (params) =>
    axiosClient.get('/api/cheques', { params });

export const getCheque = (id) =>
    axiosClient.get(`/api/cheques/${id}`);

export const createCheque = (data) =>
    axiosClient.post('/api/cheques', data);

export const depositCheque = (id, dateDepot) =>
    axiosClient.patch(`/api/cheques/${id}/depot`, { dateDepot });

export const cashCheque = (id, dateEncaissement) =>
    axiosClient.patch(`/api/cheques/${id}/encaissement`, { dateEncaissement });

export const rejectCheque = (id, dateRejet, motifRejet) =>
    axiosClient.patch(`/api/cheques/${id}/rejet`, { dateRejet, motifRejet });

export const representCheque = (id, dateRepresentation) =>
    axiosClient.patch(`/api/cheques/${id}/representation`, { dateRepresentation });

export const changeChequeStatus = (id, data) => {
    if (data.statut === 'DEPOSE') {
        return depositCheque(id, data.dateDepot);
    }
    if (data.statut === 'ENCAISSE') {
        return cashCheque(id, data.dateEncaissement);
    }
    if (data.statut === 'IMPAYE') {
        return rejectCheque(id, data.dateRejet, data.motifRejet);
    }
    if (data.statut === 'REPRESENTE') {
        return representCheque(id, data.dateRepresentation);
    }
    return Promise.reject(new Error(`Transition de chèque non prise en charge : ${data.statut}`));
};