import axiosClient from './axiosClient';

export const getCabinetSettings = () =>
    axiosClient.get('/api/cabinet-settings');

export const updateCabinetSettings = (data) =>
    axiosClient.put('/api/cabinet-settings', data);