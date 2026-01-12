import { Capacitor } from '@capacitor/core';

// Automatically points to the WiFi IP
const SERVER_IP = '192.168.1.7';
const SERVER_PORT = '3001';

export const getApiUrl = (endpoint) => {
    if (Capacitor.isNativePlatform()) {
        if (endpoint.startsWith('/')) {
            return `http://${SERVER_IP}:${SERVER_PORT}${endpoint}`;
        }
        return `http://${SERVER_IP}:${SERVER_PORT}/${endpoint}`;
    }
    return endpoint;
};
