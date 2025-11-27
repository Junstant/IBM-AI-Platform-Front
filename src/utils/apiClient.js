/**
 * Cliente API unificado para IBM AI Platform
 * Usa rutas de proxy de nginx automáticamente
 * 
 * Uso:
 *   import { ragAPI, statsAPI, textoSQLAPI, fraudeAPI } from './utils/apiClient';
 *   const docs = await ragAPI.get('/documents');
 *   const result = await ragAPI.post('/query', { query: 'test' });
 *   await ragAPI.uploadFile('/upload', file);
 * 
 * @version 2.0.0
 * @date 2025-11-27
 */

import config from '../config/environment';

/**
 * Error personalizado para requests API
 */
export class APIError extends Error {
  constructor(status, statusText, data) {
    super(`HTTP ${status}: ${statusText}`);
    this.name = 'APIError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }

  /**
   * Verifica si el error es de tipo cliente (4xx)
   */
  isClientError() {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Verifica si el error es de tipo servidor (5xx)
   */
  isServerError() {
    return this.status >= 500;
  }
}

/**
 * Cliente API base con métodos comunes
 */
class APIClient {
  constructor(baseRoute) {
    this.baseRoute = baseRoute; // ej: '/api/rag'
  }

  /**
   * Request genérico
   * @param {string} endpoint - Ruta relativa (ej: '/health')
   * @param {object} options - Opciones de fetch
   * @returns {Promise<any>} - Respuesta JSON
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseRoute}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
        }
      });

      if (!response.ok) {
        let errorData = null;
        try {
          errorData = await response.json();
        } catch {
          // Si no hay JSON, usar statusText
        }
        throw new APIError(response.status, response.statusText, errorData);
      }

      // Algunas respuestas pueden ser vacías (204 No Content)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return null;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      // Error de red o fetch
      throw new Error(`Network error: ${error.message}`);
    }
  }

  /**
   * GET request
   * @param {string} endpoint - Ruta relativa
   * @param {object} params - Query parameters
   * @returns {Promise<any>}
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  /**
   * POST request con JSON
   * @param {string} endpoint - Ruta relativa
   * @param {object} data - Datos a enviar
   * @returns {Promise<any>}
   */
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  }

  /**
   * PUT request con JSON
   * @param {string} endpoint - Ruta relativa
   * @param {object} data - Datos a enviar
   * @returns {Promise<any>}
   */
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  }

  /**
   * DELETE request
   * @param {string} endpoint - Ruta relativa
   * @returns {Promise<any>}
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  /**
   * Upload de archivo con FormData
   * @param {string} endpoint - Ruta relativa
   * @param {File} file - Archivo a subir
   * @param {object} additionalData - Datos adicionales (metadata, etc.)
   * @returns {Promise<any>}
   */
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Añadir datos adicionales
    Object.entries(additionalData).forEach(([key, value]) => {
      if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    return this.request(endpoint, {
      method: 'POST',
      body: formData
      // NO incluir Content-Type, el browser lo añade automáticamente con boundary
    });
  }

  /**
   * Streaming request (Server-Sent Events)
   * @param {string} endpoint - Ruta relativa
   * @param {object} data - Datos a enviar
   * @param {function} onChunk - Callback para cada chunk
   * @returns {Promise<void>}
   */
  async stream(endpoint, data, onChunk) {
    const url = `${this.baseRoute}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new APIError(response.status, response.statusText);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              onChunk(data);
            } catch {
              console.warn('Failed to parse SSE data:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Health check del servicio
   * @returns {Promise<boolean>} - true si está healthy
   */
  async checkHealth() {
    try {
      const result = await this.get('/health');
      return result?.status === 'healthy';
    } catch (error) {
      console.warn(`Health check failed for ${this.baseRoute}:`, error.message);
      return false;
    }
  }
}

// Instancias exportables para cada servicio
export const ragAPI = new APIClient('/api/rag');
export const statsAPI = new APIClient('/api/stats');
export const textoSQLAPI = new APIClient('/api/textosql');
export const fraudeAPI = new APIClient('/api/fraude');
export const adminAPI = new APIClient('/api/admin');
export const metricsAPI = new APIClient('/api/metrics');

/**
 * Utility: Health check de todos los servicios
 * @returns {Promise<object>} - Estado de cada servicio
 */
export const checkAllServicesHealth = async () => {
  const [rag, stats, textosql, fraude] = await Promise.allSettled([
    ragAPI.checkHealth(),
    statsAPI.checkHealth(),
    textoSQLAPI.checkHealth(),
    fraudeAPI.checkHealth()
  ]);

  return {
    rag: rag.status === 'fulfilled' && rag.value,
    stats: stats.status === 'fulfilled' && stats.value,
    textosql: textosql.status === 'fulfilled' && textosql.value,
    fraude: fraude.status === 'fulfilled' && fraude.value
  };
};

/**
 * Utility: Retry con exponential backoff
 * @param {function} fn - Función async a reintentar
 * @param {number} maxRetries - Número máximo de reintentos (default desde config)
 * @param {number} baseDelay - Delay inicial en ms (default desde config)
 * @returns {Promise<any>}
 */
export const retryWithBackoff = async (fn, maxRetries = config.timeouts.maxRetries, baseDelay = config.timeouts.retryBaseDelay) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // No reintentar errores de cliente (4xx)
      if (error instanceof APIError && error.isClientError()) {
        throw error;
      }
      
      // Exponential backoff con límite desde config
      const delay = Math.min(baseDelay * Math.pow(2, i), config.timeouts.retryMaxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Utility: Timeout para requests
 * @param {Promise} promise - Promise a ejecutar
 * @param {number} timeoutMs - Timeout en milisegundos (default desde config)
 * @returns {Promise<any>}
 */
export const withTimeout = (promise, timeoutMs = config.timeouts.default) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
};
