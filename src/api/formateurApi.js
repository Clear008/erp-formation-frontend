// src/api/formateurApi.js
import axiosClient from './axiosClient';

export const getFormateurs = (params) =>
    axiosClient.get('/api/formateurs', { params });

export const getFormateur = (id) =>
    axiosClient.get(`/api/formateurs/${id}`);

export const createFormateur = (data) =>
    axiosClient.post('/api/formateurs', data);

export const updateFormateur = (id, data) =>
    axiosClient.put(`/api/formateurs/${id}`, data);

export const toggleFormateurStatus = (id, actif) =>
    axiosClient.patch(`/api/formateurs/${id}/status?actif=${actif}`);

export const getFormateurSessions = (id) =>
    axiosClient.get(`/api/formateurs/${id}/sessions`);