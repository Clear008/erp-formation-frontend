// src/api/chequeApi.js
import axiosClient from './axiosClient';

export const getCheques = (params) =>
    axiosClient.get('/api/cheques', { params });

export const getCheque = (id) =>
    axiosClient.get(`/api/cheques/${id}`);

export const createCheque = (data) =>
    axiosClient.post('/api/cheques', data);

export const changeChequeStatus = (id, data) =>
    axiosClient.patch(`/api/cheques/${id}/status`, data);