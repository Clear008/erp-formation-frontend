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
