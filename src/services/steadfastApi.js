import { apiCall } from './api';

/**
 * Dedicated Steadfast Courier API service client
 */
export const steadfastAPI = {
    // Check credentials & connection status
    checkConnection: (token) => {
        return apiCall('/steadfast/check-connection', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    },

    // Get live merchant account balance
    getBalance: (token) => {
        return apiCall('/steadfast/balance', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    },

    // Check fraud score and courier history by phone (with optional force cache refresh)
    getFraudScore: (phone, token, forceRefresh = false) => {
        const query = forceRefresh ? '?refresh=true' : '';
        return apiCall(`/steadfast/fraud-check/${phone}${query}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    },

    // Get parcel tracking history for an invoice
    getTrackingHistory: (invoiceId, token) => {
        return apiCall(`/steadfast/tracking/${invoiceId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    },

    // Live step-by-step courier tracking & financial settlement
    getLiveTracking: (invoice, token) => {
        return apiCall(`/steadfast/live-tracking/${encodeURIComponent(invoice)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    },

    // Book single order in Steadfast
    addOrderToSteadfast: (orderId, token) => {
        return apiCall(`/order/${orderId}/add-to-steadfast`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
    },

    // Get Steadfast error logs
    getLogs: (token) => {
        return apiCall('/steadfast/logs', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    },

    // Update / Edit Steadfast error logs
    updateLogs: (content, token) => {
        return apiCall('/steadfast/logs', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        });
    },

    // Clear Steadfast error logs
    clearLogs: (token) => {
        return apiCall('/steadfast/logs', {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }
};

export default steadfastAPI;
