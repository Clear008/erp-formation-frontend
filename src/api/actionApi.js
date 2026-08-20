import axiosClient from './axiosClient';

export const getActions = (params) =>
    axiosClient.get('/api/actions', { params });

export const getAction = (id) =>
    axiosClient.get(`/api/actions/${id}`);

export const createAction = (data) =>
    axiosClient.post('/api/actions', data);

export const updateAction = (id, data) =>
    axiosClient.put(`/api/actions/${id}`, data);

export const changeActionStatus = (id, data) =>
    axiosClient.patch(`/api/actions/${id}/status`, data);

export const getActionHistory = (id) =>
    axiosClient.get(`/api/actions/${id}/history`);

export const getActionChecklist = (id) =>
    axiosClient.get(`/api/actions/${id}/checklist`);

export const updateActionChecklist = (id, items) =>
    axiosClient.put(`/api/actions/${id}/checklist`, { items });

export const submitActionForValidation = (id) =>
    axiosClient.post(`/api/actions/${id}/submit-validation`);

export const validateTrainingAction = (id, data = {}) =>
    axiosClient.post(`/api/actions/${id}/validate`, data);

export const rejectTrainingAction = (id, data) =>
    axiosClient.post(`/api/actions/${id}/reject`, data);

export const closeTrainingAction = (id, data = {}) =>
    axiosClient.post(`/api/actions/${id}/close`, data);

export const cancelTrainingAction = (id, data) =>
    axiosClient.post(`/api/actions/${id}/cancel`, data);