import axiosClient from './axiosClient';

export const getAlertes = (params) =>
    axiosClient.get('/api/alertes', { params });

export const getAlerteCount = () =>
    axiosClient.get('/api/alertes/count');

export const traiterAlerte = (cle) =>
    axiosClient.patch(`/api/alertes/${encodeURIComponent(cle)}/traiter`);

export const traiterToutesAlertes = () =>
    axiosClient.patch('/api/alertes/traiter-toutes');
