// src/api/sessionApi.js
import axiosClient from './axiosClient';

// Sessions d'une action
export const getSessionsByAction = (actionId) =>
    axiosClient.get(`/api/actions/${actionId}/sessions`);

export const createSession = (actionId, data) =>
    axiosClient.post(`/api/actions/${actionId}/sessions`, data);

// CRUD session
export const updateSession = (id, data) =>
    axiosClient.put(`/api/sessions/${id}`, data);

export const changeSessionStatus = (id, data) =>
    axiosClient.patch(`/api/sessions/${id}/status`, data);

export const deleteSession = (id) =>
    axiosClient.delete(`/api/sessions/${id}`);

// Planning
export const getPlanningSessions = (params) =>
    axiosClient.get('/api/planning/sessions', { params });

export const checkConflict = (formateurId, date) =>
    axiosClient.get('/api/planning/conflicts', { params: { formateurId, date } });

// Suggestion d'avancement
export const suggestActionStatus = (actionId) =>
    axiosClient.get(`/api/actions/${actionId}/sessions/suggest-status`);