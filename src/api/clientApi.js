// src/api/clientApi.js
// Utilise le axiosClient existant (avec JWT interceptors)
import axiosClient from './axiosClient';

export const getClients = (search) =>
    axiosClient.get('/api/clients', { params: { search } });

export const getClient = (id) =>
    axiosClient.get(`/api/clients/${id}`);

export const createClient = (data) =>
    axiosClient.post('/api/clients', data);

export const updateClient = (id, data) =>
    axiosClient.put(`/api/clients/${id}`, data);

export const toggleClientStatus = (id, active) =>
    axiosClient.patch(`/api/clients/${id}/status?active=${active}`);

export const getContacts = (clientId) =>
    axiosClient.get(`/api/clients/${clientId}/contacts`);

export const createContact = (clientId, data) =>
    axiosClient.post(`/api/clients/${clientId}/contacts`, data);

export const updateContact = (id, data) =>
    axiosClient.put(`/api/clients/contacts/${id}`, data);

export const deleteContact = (id) =>
    axiosClient.delete(`/api/clients/contacts/${id}`);