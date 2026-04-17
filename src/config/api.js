/**
 * Configurazione API Backend
 * Centralizza l'URL del backend per facilitare modifiche
 */

export const API_BASE_URL = 'http://localhost:3456';

/**
 * Helper per costruire URL completi delle API
 * @param {string} endpoint - Endpoint dell'API (es. '/api/properties')
 * @returns {string} URL completo
 */
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Helper per chiamate API con header base
 * @param {string} endpoint - Endpoint dell'API
 * @param {Object} options - Opzioni fetch
 * @returns {Promise<Response>} Response fetch
 */
export const apiCall = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint);
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  return fetch(url, { ...defaultOptions, ...options });
};

/**
 * Helper per chiamate API autenticate
 * @param {string} endpoint - Endpoint dell'API
 * @param {string} token - JWT token
 * @param {Object} options - Opzioni fetch
 * @returns {Promise<Response>} Response fetch
 */
export const authenticatedApiCall = async (endpoint, token, options = {}) => {
  return apiCall(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
};

export default {
  API_BASE_URL,
  buildApiUrl,
  apiCall,
  authenticatedApiCall
};
